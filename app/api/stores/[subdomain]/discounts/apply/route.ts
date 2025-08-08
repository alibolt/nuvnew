import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for discount application
const applyDiscountSchema = z.object({
  code: z.string().min(1),
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    categoryId: z.string().optional(),
    title: z.string().optional()
  })).min(1),
  subtotal: z.number().min(0),
  shippingRequired: z.boolean().default(true),
  currency: z.string().default('USD')
});

// Helper function to validate discount conditions
function validateDiscountConditions(discount: any, application: any): { valid: boolean; reason?: string } {
  const now = new Date();
  
  // Check if discount is active
  if (discount.status !== 'active') {
    return { valid: false, reason: 'Discount is not active' };
  }
  
  // Check validity period
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    return { valid: false, reason: 'Discount is not yet valid' };
  }
  
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    return { valid: false, reason: 'Discount has expired' };
  }
  
  // Check usage limits
  if (discount.usageLimit && discount.currentUsage >= discount.usageLimit) {
    return { valid: false, reason: 'Discount usage limit reached' };
  }
  
  // Check customer-specific usage limit
  if (discount.usageLimitPerCustomer && application.customerId) {
    const customerUsage = discount.customerUsage?.[application.customerId] || 0;
    if (customerUsage >= discount.usageLimitPerCustomer) {
      return { valid: false, reason: 'Customer usage limit reached' };
    }
  }
  
  // Check minimum requirements
  if (discount.minimumRequirement?.type === 'minimum_amount') {
    if (application.subtotal < discount.minimumRequirement.value) {
      return { valid: false, reason: `Minimum order amount of $${discount.minimumRequirement.value} required` };
    }
  }
  
  if (discount.minimumRequirement?.type === 'minimum_quantity') {
    const totalQuantity = application.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    if (totalQuantity < discount.minimumRequirement.value) {
      return { valid: false, reason: `Minimum ${discount.minimumRequirement.value} items required` };
    }
  }
  
  // Check product/category restrictions
  if (discount.appliesTo === 'specific_products' && discount.productIds?.length) {
    const hasValidProducts = application.items.some((item: any) => 
      discount.productIds.includes(item.productId)
    );
    if (!hasValidProducts) {
      return { valid: false, reason: 'No qualifying products in cart' };
    }
  }
  
  if (discount.appliesTo === 'specific_categories' && discount.categoryIds?.length) {
    const hasValidCategories = application.items.some((item: any) => 
      item.categoryId && discount.categoryIds.includes(item.categoryId)
    );
    if (!hasValidCategories) {
      return { valid: false, reason: 'No qualifying products in cart' };
    }
  }
  
  // Check customer restrictions
  if (discount.appliesTo === 'specific_customers' && discount.customerIds?.length) {
    if (!application.customerId || !discount.customerIds.includes(application.customerId)) {
      return { valid: false, reason: 'Discount not available for this customer' };
    }
  }
  
  // Check first-time customer requirement
  if (discount.conditions?.firstTimeCustomersOnly && application.customerId) {
    // In a real implementation, you would check if the customer has previous orders
    // For now, we'll assume it's valid
  }
  
  return { valid: true };
}

// Helper function to calculate discount amount
function calculateDiscountAmount(discount: any, application: any): { discountAmount: number; details: any } {
  let discountAmount = 0;
  const details: any = {
    type: discount.type,
    appliedTo: [],
    freeShipping: false,
    calculation: {}
  };
  
  switch (discount.type) {
    case 'percentage':
      if (discount.appliesTo === 'all') {
        discountAmount = application.subtotal * (discount.value / 100);
        details.calculation = {
          subtotal: application.subtotal,
          percentage: discount.value,
          beforeLimit: discountAmount
        };
      } else {
        // Calculate for specific products/categories
        let applicableAmount = 0;
        application.items.forEach((item: any) => {
          let applies = false;
          
          if (discount.appliesTo === 'specific_products' && discount.productIds?.includes(item.productId)) {
            applies = true;
          } else if (discount.appliesTo === 'specific_categories' && item.categoryId && discount.categoryIds?.includes(item.categoryId)) {
            applies = true;
          }
          
          if (applies) {
            const itemTotal = item.price * item.quantity;
            applicableAmount += itemTotal;
            details.appliedTo.push({
              productId: item.productId,
              title: item.title,
              quantity: item.quantity,
              itemTotal,
              discount: itemTotal * (discount.value / 100)
            });
          }
        });
        discountAmount = applicableAmount * (discount.value / 100);
        details.calculation = {
          applicableAmount,
          percentage: discount.value,
          beforeLimit: discountAmount
        };
      }
      
      // Apply maximum discount limit
      if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
        details.calculation.limitApplied = true;
        details.calculation.originalAmount = discountAmount;
        discountAmount = discount.maxDiscountAmount;
      }
      break;
      
    case 'fixed_amount':
      discountAmount = Math.min(discount.value, application.subtotal);
      details.calculation = {
        requestedAmount: discount.value,
        subtotal: application.subtotal,
        actualAmount: discountAmount,
        limitedBySubtotal: discount.value > application.subtotal
      };
      break;
      
    case 'free_shipping':
      discountAmount = 0; // Shipping discount is handled separately
      details.freeShipping = true;
      details.calculation = {
        note: 'Free shipping applied - shipping cost will be $0'
      };
      break;
      
    case 'buy_x_get_y':
      // Find qualifying products
      const qualifyingItems = application.items.filter((item: any) => {
        if (discount.appliesTo === 'specific_products') {
          return discount.productIds?.includes(item.productId);
        } else if (discount.appliesTo === 'specific_categories') {
          return item.categoryId && discount.categoryIds?.includes(item.categoryId);
        }
        return true;
      });
      
      // Calculate how many times the buy X get Y applies
      let totalBuyQuantity = qualifyingItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const applications = Math.floor(totalBuyQuantity / discount.buyQuantity);
      
      details.calculation = {
        buyQuantity: discount.buyQuantity,
        getQuantity: discount.getQuantity || 1,
        totalQualifyingItems: totalBuyQuantity,
        applicationsCount: applications
      };
      
      if (applications > 0) {
        const getQuantity = applications * (discount.getQuantity || 1);
        
        // Sort items by price (ascending) to give discount on cheapest items
        const sortedItems = [...qualifyingItems].sort((a, b) => a.price - b.price);
        
        let remainingGetQuantity = getQuantity;
        for (const item of sortedItems) {
          if (remainingGetQuantity <= 0) break;
          
          const discountQuantity = Math.min(remainingGetQuantity, item.quantity);
          let itemDiscount = 0;
          
          if (discount.getDiscountType === 'percentage') {
            itemDiscount = item.price * discountQuantity * (discount.getDiscountValue / 100);
          } else if (discount.getDiscountType === 'fixed_amount') {
            itemDiscount = Math.min(discount.getDiscountValue * discountQuantity, item.price * discountQuantity);
          } else if (discount.getDiscountType === 'free') {
            itemDiscount = item.price * discountQuantity;
          }
          
          discountAmount += itemDiscount;
          details.appliedTo.push({
            productId: item.productId,
            title: item.title,
            quantity: discountQuantity,
            originalPrice: item.price,
            discount: itemDiscount,
            discountType: discount.getDiscountType
          });
          
          remainingGetQuantity -= discountQuantity;
        }
      }
      break;
  }
  
  return { discountAmount: Math.round(discountAmount * 100) / 100, details };
}

// POST - Apply/validate discount code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();

    // Validate input
    const validation = applyDiscountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid application data',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain },
          { subdomain: subdomain }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const { code, customerId, items, subtotal, shippingRequired, currency } = validation.data;

    // Get store settings for discounts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const discounts = (storeSettings?.discounts as any[]) || [];
    
    // Find discount by code (case-insensitive)
    const discount = discounts.find(d => 
      d.code.toLowerCase() === code.toLowerCase()
    );

    if (!discount) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid discount code'
      }, { status: 404 });
    }

    // Validate discount conditions
    const validation_result = validateDiscountConditions(discount, validation.data);
    
    if (!validation_result.valid) {
      return NextResponse.json({
        valid: false,
        error: validation_result.reason,
        discount: {
          code: discount.code,
          name: discount.name,
          type: discount.type
        }
      }, { status: 400 });
    }

    // Calculate discount amount
    const { discountAmount, details } = calculateDiscountAmount(discount, validation.data);

    // Calculate final totals
    const newSubtotal = Math.max(0, subtotal - discountAmount);
    const savings = discountAmount;
    
    // Update discount view count (for analytics)
    const discountIndex = discounts.findIndex(d => d.code === discount.code);
    if (discountIndex !== -1) {
      discounts[discountIndex] = {
        ...discounts[discountIndex],
        views: (discounts[discountIndex].views || 0) + 1,
        lastViewed: new Date().toISOString()
      };
      
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
        description: discount.description,
        type: discount.type,
        value: discount.value
      },
      application: {
        originalSubtotal: subtotal,
        discountAmount: savings,
        newSubtotal,
        currency,
        freeShipping: details.freeShipping,
        details: details,
        appliedAt: new Date().toISOString()
      },
      usage: {
        currentUsage: discount.currentUsage || 0,
        usageLimit: discount.usageLimit,
        remainingUses: discount.usageLimit ? 
          Math.max(0, discount.usageLimit - (discount.currentUsage || 0)) : null,
        customerUsage: customerId ? (discount.customerUsage?.[customerId] || 0) : null,
        customerLimit: discount.usageLimitPerCustomer
      }
    });
  } catch (error) {
    console.error('[DISCOUNT APPLY API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// GET - Get automatic discounts for cart
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters for cart data
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');
    const customerId = searchParams.get('customerId');
    const itemsJson = searchParams.get('items');

    if (!itemsJson) {
      return NextResponse.json({
        automaticDiscounts: [],
        message: 'No cart items provided'
      });
    }

    let items;
    try {
      items = JSON.parse(itemsJson);
    } catch {
      return apiResponse.badRequest('Invalid items format');
    }

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain },
          { subdomain: subdomain }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get store settings for discounts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const discounts = (storeSettings?.discounts as any[]) || [];
    
    // Find automatic discounts
    const automaticDiscounts = discounts.filter(d => 
      d.isAutomatic && d.status === 'active'
    );

    const applicableDiscounts = [];
    
    for (const discount of automaticDiscounts) {
      const mockApplication = {
        customerId,
        items,
        subtotal,
        shippingRequired: true
      };
      
      const validation_result = validateDiscountConditions(discount, mockApplication);
      
      if (validation_result.valid) {
        const { discountAmount, details } = calculateDiscountAmount(discount, mockApplication);
        
        if (discountAmount > 0 || details.freeShipping) {
          applicableDiscounts.push({
            id: discount.id,
            code: discount.code,
            name: discount.name,
            description: discount.description,
            type: discount.type,
            discountAmount,
            freeShipping: details.freeShipping,
            priority: discount.priority || 0,
            automatic: true
          });
        }
      }
    }

    // Sort by priority (higher priority first)
    applicableDiscounts.sort((a, b) => b.priority - a.priority);

    return NextResponse.json({
      automaticDiscounts: applicableDiscounts,
      totalAutomaticSavings: applicableDiscounts.reduce(
        (sum, d) => sum + d.discountAmount, 0
      ),
      freeShippingAvailable: applicableDiscounts.some(d => d.freeShipping)
    });
  } catch (error) {
    console.error('[AUTOMATIC DISCOUNTS API] GET Error:', error);
    return apiResponse.serverError();
  }
}