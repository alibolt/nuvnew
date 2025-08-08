import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for customer group creation
const customerGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['wholesale', 'vip', 'loyalty', 'regional', 'custom']),
  
  // Pricing rules
  pricingRules: z.object({
    discountType: z.enum(['percentage', 'fixed_amount', 'tiered', 'custom_prices']),
    discountValue: z.number().min(0).optional(),
    minimumOrder: z.number().min(0).optional(),
    
    // Tiered pricing
    tiers: z.array(z.object({
      minQuantity: z.number().min(1),
      maxQuantity: z.number().optional(),
      discountPercentage: z.number().min(0).max(100).optional(),
      fixedPrice: z.number().min(0).optional()
    })).optional(),
    
    // Product-specific pricing
    productPricing: z.array(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      customPrice: z.number().min(0).optional(),
      discountPercentage: z.number().min(0).max(100).optional()
    })).optional(),
    
    // Category-specific pricing
    categoryPricing: z.array(z.object({
      categoryId: z.string(),
      discountPercentage: z.number().min(0).max(100).optional(),
      minimumQuantity: z.number().min(1).optional()
    })).optional()
  }),
  
  // Access and restrictions
  access: z.object({
    requiresApproval: z.boolean().default(false),
    autoAssign: z.boolean().default(false),
    autoAssignRules: z.object({
      minimumOrderCount: z.number().min(0).optional(),
      minimumOrderValue: z.number().min(0).optional(),
      registrationAge: z.number().min(0).optional(), // days
      locationCriteria: z.array(z.string()).optional()
    }).optional(),
    allowedRegions: z.array(z.string()).optional(),
    blockedRegions: z.array(z.string()).optional()
  }).optional(),
  
  // Benefits and features
  benefits: z.object({
    freeShipping: z.boolean().default(false),
    freeShippingThreshold: z.number().min(0).optional(),
    prioritySupport: z.boolean().default(false),
    exclusiveProducts: z.array(z.string()).optional(),
    earlyAccess: z.boolean().default(false),
    customPaymentTerms: z.object({
      enabled: z.boolean().default(false),
      netDays: z.number().min(0).optional(),
      creditLimit: z.number().min(0).optional()
    }).optional()
  }).optional(),
  
  // Settings
  isActive: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  priority: z.number().min(0).default(0)
});

// Schema for assigning customers to groups
const assignCustomersSchema = z.object({
  customerIds: z.array(z.string()).min(1),
  groupId: z.string(),
  sendNotification: z.boolean().default(true),
  notificationMessage: z.string().optional()
});

// Helper function to calculate group pricing for products
function calculateGroupPricing(group: any, products: any[]): any[] {
  return products.map(product => {
    let groupPrice = null;
    let discount = null;
    const originalPrice = product.variants?.[0]?.price || product.price || 0;
    
    // Check for product-specific pricing
    const productPricing = group.pricingRules?.productPricing?.find(
      (p: any) => p.productId === product.id
    );
    
    if (productPricing) {
      if (productPricing.customPrice) {
        groupPrice = productPricing.customPrice;
        discount = {
          type: 'custom_price',
          originalPrice,
          groupPrice,
          savings: Math.max(0, originalPrice - productPricing.customPrice)
        };
      } else if (productPricing.discountPercentage) {
        groupPrice = originalPrice * (1 - productPricing.discountPercentage / 100);
        discount = {
          type: 'percentage',
          percentage: productPricing.discountPercentage,
          originalPrice,
          groupPrice,
          savings: originalPrice - groupPrice
        };
      }
    }
    
    // Check for category-specific pricing
    if (!groupPrice && product.categoryId) {
      const categoryPricing = group.pricingRules?.categoryPricing?.find(
        (c: any) => c.categoryId === product.categoryId
      );
      
      if (categoryPricing?.discountPercentage) {
        groupPrice = originalPrice * (1 - categoryPricing.discountPercentage / 100);
        discount = {
          type: 'category_percentage',
          percentage: categoryPricing.discountPercentage,
          originalPrice,
          groupPrice,
          savings: originalPrice - groupPrice,
          minimumQuantity: categoryPricing.minimumQuantity || 1
        };
      }
    }
    
    // Apply general group discount
    if (!groupPrice && group.pricingRules?.discountType === 'percentage') {
      groupPrice = originalPrice * (1 - group.pricingRules.discountValue / 100);
      discount = {
        type: 'group_percentage',
        percentage: group.pricingRules.discountValue,
        originalPrice,
        groupPrice,
        savings: originalPrice - groupPrice
      };
    }
    
    if (!groupPrice && group.pricingRules?.discountType === 'fixed_amount') {
      groupPrice = Math.max(0, originalPrice - group.pricingRules.discountValue);
      discount = {
        type: 'fixed_amount',
        fixedDiscount: group.pricingRules.discountValue,
        originalPrice,
        groupPrice,
        savings: originalPrice - groupPrice
      };
    }
    
    return {
      ...product,
      groupPricing: groupPrice ? {
        originalPrice,
        groupPrice: Math.round(groupPrice * 100) / 100,
        discount,
        savingsPercentage: originalPrice > 0 ? 
          Math.round(((originalPrice - groupPrice) / originalPrice) * 100) : 0
      } : null
    };
  });
}

// GET - Get all customer groups
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    
    const includeCustomers = searchParams.get('includeCustomers') === 'true';
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get store settings for customer groups
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const customerGroups = (storeSettings?.customerGroups as any[]) || [];

    // Enhanced groups with customer counts and analytics
    const enhancedGroups = await Promise.all(
      customerGroups.map(async (group) => {
        const customerCount = await prisma.customer.count({
          where: {
            storeId: store.id,
            customerGroup: group.id
          }
        });

        let analytics = null;
        if (includeAnalytics) {
          // Get customer analytics for this group
          const customers = await prisma.customer.findMany({
            where: {
              storeId: store.id,
              customerGroup: group.id
            },
            select: {
              id: true,
              totalSpent: true,
              ordersCount: true,
              createdAt: true
            }
          });

          analytics = {
            customerCount,
            totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
            averageOrderValue: customers.length > 0 ? 
              customers.reduce((sum, c) => sum + c.totalSpent, 0) / 
              customers.reduce((sum, c) => sum + c.ordersCount, 0) : 0,
            totalOrders: customers.reduce((sum, c) => sum + c.ordersCount, 0),
            newCustomersThisMonth: customers.filter(c => 
              new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length
          };
        }

        let groupCustomers = null;
        if (includeCustomers) {
          groupCustomers = await prisma.customer.findMany({
            where: {
              storeId: store.id,
              customerGroup: group.id
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              totalSpent: true,
              ordersCount: true,
              createdAt: true
            },
            take: 50 // Limit to avoid large responses
          });
        }

        return {
          ...group,
          customerCount,
          analytics,
          customers: groupCustomers
        };
      })
    );

    // Calculate overall analytics
    const overallAnalytics = {
      totalGroups: customerGroups.length,
      activeGroups: customerGroups.filter(g => g.isActive).length,
      totalGroupCustomers: await prisma.customer.count({
        where: {
          storeId: store.id,
          customerGroup: { not: null }
        }
      }),
      ungroupedCustomers: await prisma.customer.count({
        where: {
          storeId: store.id,
          customerGroup: null
        }
      })
    };

    return NextResponse.json({
      groups: enhancedGroups,
      analytics: overallAnalytics
    });
  } catch (error) {
    console.error('[CUSTOMER GROUPS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create new customer group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();

    // Validate input
    const validation = customerGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid customer group data',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current customer groups
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentGroups = (storeSettings?.customerGroups as any[]) || [];

    // Check for duplicate name
    const existingGroup = currentGroups.find(g => 
      g.name.toLowerCase() === validation.data.name.toLowerCase()
    );

    if (existingGroup) {
      return apiResponse.badRequest('Customer group with this name already exists');
    }

    // Create new customer group
    const newGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validation.data,
      customerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Update store settings
    const updatedGroups = [...currentGroups, newGroup];
    
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { customerGroups: updatedGroups },
      create: { storeId: store.id, customerGroups: updatedGroups }
    });

    return NextResponse.json({
      message: 'Customer group created successfully',
      group: newGroup
    }, { status: 201 });
  } catch (error) {
    console.error('[CUSTOMER GROUPS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update customer group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { groupId, ...updateData } = body;

    if (!groupId) {
      return apiResponse.badRequest('Group ID is required');
    }

    // Validate update data
    const validation = customerGroupSchema.partial().safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid customer group data',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current customer groups
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentGroups = (storeSettings?.customerGroups as any[]) || [];
    const groupIndex = currentGroups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) {
      return apiResponse.notFound('Customer group ');
    }

    // Check for duplicate name if name is being changed
    if (validation.data.name && validation.data.name.toLowerCase() !== currentGroups[groupIndex].name.toLowerCase()) {
      const existingGroup = currentGroups.find((g, index) => 
        index !== groupIndex && g.name.toLowerCase() === validation.data.name?.toLowerCase()
      );

      if (existingGroup) {
        return apiResponse.badRequest('Customer group with this name already exists');
      }
    }

    // Update customer group
    const updatedGroup = {
      ...currentGroups[groupIndex],
      ...validation.data,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    };

    currentGroups[groupIndex] = updatedGroup;

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { customerGroups: currentGroups }
    });

    return NextResponse.json({
      message: 'Customer group updated successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('[CUSTOMER GROUPS API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete customer group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return apiResponse.badRequest('Group ID is required');
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current customer groups
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentGroups = (storeSettings?.customerGroups as any[]) || [];
    const updatedGroups = currentGroups.filter(g => g.id !== groupId);

    if (currentGroups.length === updatedGroups.length) {
      return apiResponse.notFound('Customer group ');
    }

    // Remove group assignment from customers
    await prisma.customer.updateMany({
      where: {
        storeId: store.id,
        customerGroup: groupId
      },
      data: {
        customerGroup: null
      }
    });

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { customerGroups: updatedGroups }
    });

    return apiResponse.success({ message: 'Customer group deleted successfully' });
  } catch (error) {
    console.error('[CUSTOMER GROUPS API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}