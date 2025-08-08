import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for discount validation
const validateDiscountSchema = z.object({
  code: z.string().min(1),
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    categoryId: z.string().optional(),
  })).min(1),
  subtotal: z.number().min(0),
  shippingCost: z.number().min(0).default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = validateDiscountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { code, customerId, items, subtotal, shippingCost } = validation.data;

    // Get store
    const store = await prisma.store.findFirst({
      where: { subdomain: subdomain },
      include: { storeSettings: true }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get discounts from store settings
    const discounts = store.storeSettings?.discounts as any[] || [];
    
    // Find the discount code
    const discount = discounts.find(d => 
      d.code.toLowerCase() === code.toLowerCase() && d.isActive !== false
    );

    if (!discount) {
      return NextResponse.json({ 
        error: 'Invalid discount code',
        valid: false 
      }, { status: 400 });
    }

    // Check if discount is active and within date range
    const now = new Date();
    
    if (discount.status !== 'active') {
      return NextResponse.json({ 
        error: 'Discount is not active',
        valid: false 
      }, { status: 400 });
    }

    if (discount.startsAt && new Date(discount.startsAt) > now) {
      return NextResponse.json({ 
        error: 'Discount is not yet valid',
        valid: false 
      }, { status: 400 });
    }

    if (discount.endsAt && new Date(discount.endsAt) < now) {
      return NextResponse.json({ 
        error: 'Discount has expired',
        valid: false 
      }, { status: 400 });
    }

    // Check usage limits
    if (discount.usageLimit && discount.currentUsage >= discount.usageLimit) {
      return NextResponse.json({ 
        error: 'Discount usage limit reached',
        valid: false 
      }, { status: 400 });
    }

    // Check customer-specific usage limit
    if (customerId && discount.usageLimitPerCustomer) {
      const customerUsage = discount.customerUsage?.[customerId] || 0;
      if (customerUsage >= discount.usageLimitPerCustomer) {
        return NextResponse.json({ 
          error: 'You have already used this discount the maximum number of times',
          valid: false 
        }, { status: 400 });
      }
    }

    // Check minimum requirements
    if (discount.minimumRequirement?.type === 'minimum_amount') {
      if (subtotal < discount.minimumRequirement.value) {
        return NextResponse.json({ 
          error: `Minimum order amount of $${discount.minimumRequirement.value} required`,
          valid: false 
        }, { status: 400 });
      }
    }

    if (discount.minimumRequirement?.type === 'minimum_quantity') {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity < discount.minimumRequirement.value) {
        return NextResponse.json({ 
          error: `Minimum ${discount.minimumRequirement.value} items required`,
          valid: false 
        }, { status: 400 });
      }
    }

    // Check product/category restrictions
    if (discount.appliesTo === 'specific_products' && discount.productIds?.length) {
      const hasValidProducts = items.some(item => 
        discount.productIds.includes(item.productId)
      );
      if (!hasValidProducts) {
        return NextResponse.json({ 
          error: 'No qualifying products in cart',
          valid: false 
        }, { status: 400 });
      }
    }

    if (discount.appliesTo === 'specific_categories' && discount.categoryIds?.length) {
      const hasValidCategories = items.some(item => 
        item.categoryId && discount.categoryIds.includes(item.categoryId)
      );
      if (!hasValidCategories) {
        return NextResponse.json({ 
          error: 'No qualifying products in cart',
          valid: false 
        }, { status: 400 });
      }
    }

    // Check customer restrictions
    if (discount.appliesTo === 'specific_customers' && discount.customerIds?.length) {
      if (!customerId || !discount.customerIds.includes(customerId)) {
        return NextResponse.json({ 
          error: 'This discount is not available for you',
          valid: false 
        }, { status: 400 });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    let applicableItems: any[] = [];

    switch (discount.type) {
      case 'percentage':
        if (discount.appliesTo === 'all') {
          discountAmount = subtotal * (discount.value / 100);
          applicableItems = items;
        } else {
          // Calculate for specific products/categories
          items.forEach(item => {
            let applies = false;
            
            if (discount.appliesTo === 'specific_products' && discount.productIds?.includes(item.productId)) {
              applies = true;
            } else if (discount.appliesTo === 'specific_categories' && item.categoryId && discount.categoryIds?.includes(item.categoryId)) {
              applies = true;
            }
            
            if (applies) {
              const itemTotal = item.price * item.quantity;
              discountAmount += itemTotal * (discount.value / 100);
              applicableItems.push(item);
            }
          });
        }
        
        // Apply maximum discount limit
        if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
          discountAmount = discount.maxDiscountAmount;
        }
        break;
        
      case 'fixed_amount':
        discountAmount = Math.min(discount.value, subtotal);
        applicableItems = items;
        break;
        
      case 'free_shipping':
        discountAmount = shippingCost;
        applicableItems = [];
        break;
        
      case 'buy_x_get_y':
        // Complex calculation for BOGO deals
        const qualifyingItems = items.filter(item => {
          if (discount.appliesTo === 'specific_products') {
            return discount.productIds?.includes(item.productId);
          } else if (discount.appliesTo === 'specific_categories') {
            return item.categoryId && discount.categoryIds?.includes(item.categoryId);
          }
          return true;
        });
        
        const totalBuyQuantity = qualifyingItems.reduce((sum, item) => sum + item.quantity, 0);
        const applications = Math.floor(totalBuyQuantity / (discount.buyQuantity || 1));
        
        if (applications > 0) {
          const getQuantity = applications * (discount.getQuantity || 1);
          const sortedItems = [...qualifyingItems].sort((a, b) => a.price - b.price);
          
          let remainingGetQuantity = getQuantity;
          for (const item of sortedItems) {
            if (remainingGetQuantity <= 0) break;
            
            const discountQuantity = Math.min(remainingGetQuantity, item.quantity);
            
            if (discount.getDiscountType === 'percentage') {
              discountAmount += item.price * discountQuantity * ((discount.getDiscountValue || 100) / 100);
            } else if (discount.getDiscountType === 'free') {
              discountAmount += item.price * discountQuantity;
            }
            
            applicableItems.push({
              ...item,
              discountQuantity
            });
            
            remainingGetQuantity -= discountQuantity;
          }
        }
        break;
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    // Track discount view
    const discountIndex = discounts.findIndex(d => d.id === discount.id);
    if (discountIndex !== -1) {
      discounts[discountIndex].views = (discounts[discountIndex].views || 0) + 1;
      
      // Update store settings with view count
      await prisma.storeSettings.update({
        where: { storeId: store.id },
        data: { discounts }
      });
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        discountAmount,
        appliesTo: discount.appliesTo,
        applicableItems: applicableItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.discountQuantity || item.quantity,
        })),
        freeShipping: discount.type === 'free_shipping',
      }
    });

  } catch (error) {
    console.error('Error validating discount:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      valid: false 
    }, { status: 500 });
  }
}