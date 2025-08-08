import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Enhanced schema for discount/coupon creation
const discountSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/i, 'Code can only contain letters, numbers, hyphens, and underscores'),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']),
  
  // Discount value
  value: z.number().min(0),
  maxDiscountAmount: z.number().min(0).optional(), // For percentage discounts
  
  // Buy X Get Y specific fields
  buyQuantity: z.number().min(1).optional(),
  getQuantity: z.number().min(1).optional(),
  getDiscountType: z.enum(['percentage', 'fixed_amount', 'free']).optional(),
  getDiscountValue: z.number().min(0).optional(),
  
  // Usage limits
  usageLimit: z.number().min(1).optional(), // Total usage limit
  usageLimitPerCustomer: z.number().min(1).optional(),
  minimumRequirement: z.object({
    type: z.enum(['none', 'minimum_amount', 'minimum_quantity']),
    value: z.number().min(0).optional()
  }).default({ type: 'none' }),
  
  // Validity period
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  
  // Target conditions
  appliesTo: z.enum(['all', 'specific_products', 'specific_categories', 'specific_customers']),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  customerIds: z.array(z.string()).optional(),
  customerGroups: z.array(z.string()).optional(),
  
  // Additional conditions
  conditions: z.object({
    excludeDiscountedItems: z.boolean().default(false),
    firstTimeCustomersOnly: z.boolean().default(false),
    combinableWithOtherDiscounts: z.boolean().default(true),
    requiresShipping: z.boolean().default(false)
  }).optional(),
  
  // Status and settings
  status: z.enum(['active', 'inactive', 'scheduled', 'expired']).default('active'),
  isAutomatic: z.boolean().default(false), // Automatic discount (no code needed)
  priority: z.number().min(0).default(0)
});

// Schema for discount validation/application
const applyDiscountSchema = z.object({
  code: z.string().min(1),
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    categoryId: z.string().optional()
  })).min(1),
  subtotal: z.number().min(0),
  shippingRequired: z.boolean().default(true)
});

// Helper function to generate unique discount code
function generateDiscountCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
  if (discount.minimumRequirement.type === 'minimum_amount') {
    if (application.subtotal < discount.minimumRequirement.value) {
      return { valid: false, reason: `Minimum order amount of $${discount.minimumRequirement.value} required` };
    }
  }
  
  if (discount.minimumRequirement.type === 'minimum_quantity') {
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
  
  return { valid: true };
}

// Helper function to calculate discount amount
function calculateDiscountAmount(discount: any, application: any): { discountAmount: number; details: any } {
  let discountAmount = 0;
  const details: any = {
    type: discount.type,
    appliedTo: [],
    freeShipping: false
  };
  
  switch (discount.type) {
    case 'percentage':
      if (discount.appliesTo === 'all') {
        discountAmount = application.subtotal * (discount.value / 100);
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
              quantity: item.quantity,
              itemTotal,
              discount: itemTotal * (discount.value / 100)
            });
          }
        });
        discountAmount = applicableAmount * (discount.value / 100);
      }
      
      // Apply maximum discount limit
      if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
        discountAmount = discount.maxDiscountAmount;
      }
      break;
      
    case 'fixed_amount':
      discountAmount = Math.min(discount.value, application.subtotal);
      break;
      
    case 'free_shipping':
      discountAmount = 0; // Shipping discount is handled separately
      details.freeShipping = true;
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
            quantity: discountQuantity,
            originalPrice: item.price,
            discount: itemDiscount
          });
          
          remainingGetQuantity -= discountQuantity;
        }
      }
      break;
  }
  
  return { discountAmount: Math.round(discountAmount * 100) / 100, details };
}

// GET - List discounts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, expired, scheduled
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get discounts from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let discounts = storeSettings?.discounts as any[] || [];

    // Update expired statuses
    const now = new Date();
    discounts = discounts.map(discount => {
      if (discount.endsAt && new Date(discount.endsAt) < now && discount.status === 'active') {
        return { ...discount, status: 'expired' };
      }
      if (discount.startsAt && new Date(discount.startsAt) <= now && discount.status === 'scheduled') {
        return { ...discount, status: 'active' };
      }
      return discount;
    });

    // Filter by status if requested
    if (status && status !== 'all') {
      discounts = discounts.filter(discount => discount.status === status);
    }

    // Add enhanced usage statistics
    const discountsWithStats = discounts.map(discount => {
      const currentUsage = discount.currentUsage || 0;
      const customerUsageCount = discount.customerUsage 
        ? Object.keys(discount.customerUsage).length 
        : 0;
      
      return {
        ...discount,
        usageCount: currentUsage,
        uniqueCustomers: customerUsageCount,
        remainingUses: discount.usageLimit 
          ? Math.max(0, discount.usageLimit - currentUsage)
          : null,
        performance: {
          totalSavings: discount.totalSavings || 0,
          averageOrderValue: currentUsage > 0 ? (discount.totalOrderValue || 0) / currentUsage : 0,
          conversionRate: discount.views ? (currentUsage / discount.views * 100) : 0
        }
      };
    });

    // Calculate analytics
    const analytics = {
      total: discounts.length,
      active: discounts.filter(d => d.status === 'active').length,
      expired: discounts.filter(d => d.status === 'expired').length,
      scheduled: discounts.filter(d => d.status === 'scheduled').length,
      totalUsage: discounts.reduce((sum, d) => sum + (d.currentUsage || 0), 0),
      totalSavings: discounts.reduce((sum, d) => sum + (d.totalSavings || 0), 0),
      topPerforming: discounts
        .filter(d => d.currentUsage > 0)
        .sort((a, b) => (b.currentUsage || 0) - (a.currentUsage || 0))
        .slice(0, 5)
        .map(d => ({
          code: d.code,
          name: d.name,
          usage: d.currentUsage,
          type: d.type,
          savings: d.totalSavings || 0
        }))
    };

    return NextResponse.json({
      discounts: discountsWithStats,
      analytics
    });
  } catch (error) {
    console.error('[DISCOUNTS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create discount
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = discountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current discounts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const discounts = storeSettings?.discounts as any[] || [];

    // Auto-generate code if not provided
    if (!body.code) {
      let attempts = 0;
      let generatedCode;
      
      do {
        generatedCode = generateDiscountCode();
        attempts++;
      } while (attempts < 10); // Prevent infinite loop
      
      body.code = generatedCode;
      // Re-validate with generated code
      const revalidation = discountSchema.safeParse(body);
      if (!revalidation.success) {
        return NextResponse.json({ 
          error: 'Invalid input with generated code', 
          details: revalidation.error.format() 
        }, { status: 400 });
      }
      validation.data = revalidation.data;
    }

    // Check for duplicate code
    const existingDiscount = discounts.find(
      d => d.code.toLowerCase() === validation.data.code.toLowerCase()
    );

    if (existingDiscount) {
      return NextResponse.json({ 
        error: 'A discount with this code already exists' 
      }, { status: 400 });
    }

    // Create new discount with enhanced tracking
    const newDiscount = {
      id: `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validation.data,
      code: validation.data.code.toUpperCase(),
      currentUsage: 0,
      customerUsage: {},
      totalSavings: 0,
      totalOrderValue: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Add to discounts
    discounts.push(newDiscount);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        discounts
      },
      create: {
        storeId: store.id,
        discounts
      }
    });

    return NextResponse.json({ 
      message: 'Discount created successfully',
      discount: newDiscount 
    });
  } catch (error) {
    console.error('[DISCOUNTS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update discount
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { discountId, ...updateData } = await request.json();
    
    if (!discountId) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current discounts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const discounts = storeSettings?.discounts as any[] || [];
    const discountIndex = discounts.findIndex(d => d.id === discountId);

    if (discountIndex === -1) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
    }

    // Check for duplicate code if code is being changed
    if (updateData.code && updateData.code !== discounts[discountIndex].code) {
      const duplicateCode = discounts.find(
        d => d.code.toLowerCase() === updateData.code.toLowerCase() && d.id !== discountId
      );
      
      if (duplicateCode) {
        return NextResponse.json({ 
          error: 'A discount with this code already exists' 
        }, { status: 400 });
      }
    }

    // Update discount
    discounts[discountIndex] = {
      ...discounts[discountIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        discounts
      }
    });

    return NextResponse.json({ 
      message: 'Discount updated successfully',
      discount: discounts[discountIndex]
    });
  } catch (error) {
    console.error('[DISCOUNTS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete discount
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const discountId = searchParams.get('discountId');
    
    if (!discountId) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current discounts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const discounts = storeSettings?.discounts as any[] || [];
    const filteredDiscounts = discounts.filter(d => d.id !== discountId);

    if (filteredDiscounts.length === discounts.length) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        discounts: filteredDiscounts
      }
    });

    return NextResponse.json({ 
      message: 'Discount deleted successfully'
    });
  } catch (error) {
    console.error('[DISCOUNTS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}