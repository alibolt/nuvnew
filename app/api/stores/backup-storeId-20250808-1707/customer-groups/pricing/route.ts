import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for group pricing calculation request
const pricingCalculationSchema = z.object({
  groupId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    basePrice: z.number().min(0)
  })).min(1),
  customerId: z.string().optional()
});

// Schema for setting group-specific pricing
const setGroupPricingSchema = z.object({
  groupId: z.string(),
  pricingRules: z.object({
    productPricing: z.array(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      customPrice: z.number().min(0).optional(),
      discountPercentage: z.number().min(0).max(100).optional(),
      minimumQuantity: z.number().min(1).optional()
    })).optional(),
    categoryPricing: z.array(z.object({
      categoryId: z.string(),
      discountPercentage: z.number().min(0).max(100),
      minimumQuantity: z.number().min(1).optional()
    })).optional(),
    tierPricing: z.array(z.object({
      minQuantity: z.number().min(1),
      maxQuantity: z.number().optional(),
      discountPercentage: z.number().min(0).max(100).optional(),
      fixedPrice: z.number().min(0).optional()
    })).optional()
  })
});

// Helper function to calculate tiered pricing
function calculateTierPricing(quantity: number, basePrice: number, tiers: any[]): any {
  if (!tiers?.length) return null;

  // Sort tiers by minimum quantity
  const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
  
  // Find applicable tier
  let applicableTier = null;
  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity) {
      if (!tier.maxQuantity || quantity <= tier.maxQuantity) {
        applicableTier = tier;
      }
    }
  }

  if (!applicableTier) return null;

  let tierPrice = basePrice;
  if (applicableTier.fixedPrice) {
    tierPrice = applicableTier.fixedPrice;
  } else if (applicableTier.discountPercentage) {
    tierPrice = basePrice * (1 - applicableTier.discountPercentage / 100);
  }

  return {
    tier: applicableTier,
    originalPrice: basePrice,
    tierPrice: Math.round(tierPrice * 100) / 100,
    savings: Math.round((basePrice - tierPrice) * 100) / 100,
    savingsPercentage: Math.round(((basePrice - tierPrice) / basePrice) * 100)
  };
}

// Helper function to calculate group pricing for items
function calculateGroupPricing(group: any, items: any[]): any[] {
  return items.map(item => {
    const { productId, variantId, quantity, basePrice } = item;
    let finalPrice = basePrice;
    let discount = null;
    let appliedRules = [];

    // Check for product-specific pricing
    const productPricing = group.pricingRules?.productPricing?.find(
      (p: any) => p.productId === productId && (!p.variantId || p.variantId === variantId)
    );

    if (productPricing) {
      // Check minimum quantity requirement
      if (!productPricing.minimumQuantity || quantity >= productPricing.minimumQuantity) {
        if (productPricing.customPrice) {
          finalPrice = productPricing.customPrice;
          discount = {
            type: 'custom_price',
            originalPrice: basePrice,
            customPrice: productPricing.customPrice,
            savings: Math.max(0, basePrice - productPricing.customPrice)
          };
          appliedRules.push('Product-specific custom price');
        } else if (productPricing.discountPercentage) {
          finalPrice = basePrice * (1 - productPricing.discountPercentage / 100);
          discount = {
            type: 'product_percentage',
            percentage: productPricing.discountPercentage,
            originalPrice: basePrice,
            discountedPrice: finalPrice,
            savings: basePrice - finalPrice
          };
          appliedRules.push(`Product-specific ${productPricing.discountPercentage}% discount`);
        }
      }
    }

    // Check for tiered pricing if no product-specific pricing applied
    if (!discount && group.pricingRules?.tierPricing?.length) {
      const tierResult = calculateTierPricing(quantity, basePrice, group.pricingRules.tierPricing);
      if (tierResult) {
        finalPrice = tierResult.tierPrice;
        discount = {
          type: 'tier_pricing',
          tier: tierResult.tier,
          originalPrice: basePrice,
          tierPrice: tierResult.tierPrice,
          savings: tierResult.savings
        };
        appliedRules.push(`Tier pricing: ${tierResult.tier.minQuantity}+ units`);
      }
    }

    // Check for category-specific pricing if no other discounts applied
    if (!discount && item.categoryId) {
      const categoryPricing = group.pricingRules?.categoryPricing?.find(
        (c: any) => c.categoryId === item.categoryId
      );
      
      if (categoryPricing) {
        // Check minimum quantity requirement
        if (!categoryPricing.minimumQuantity || quantity >= categoryPricing.minimumQuantity) {
          finalPrice = basePrice * (1 - categoryPricing.discountPercentage / 100);
          discount = {
            type: 'category_percentage',
            percentage: categoryPricing.discountPercentage,
            originalPrice: basePrice,
            discountedPrice: finalPrice,
            savings: basePrice - finalPrice
          };
          appliedRules.push(`Category discount: ${categoryPricing.discountPercentage}%`);
        }
      }
    }

    // Apply general group discount if no specific rules applied
    if (!discount && group.pricingRules?.discountType === 'percentage') {
      finalPrice = basePrice * (1 - group.pricingRules.discountValue / 100);
      discount = {
        type: 'group_percentage',
        percentage: group.pricingRules.discountValue,
        originalPrice: basePrice,
        discountedPrice: finalPrice,
        savings: basePrice - finalPrice
      };
      appliedRules.push(`Group discount: ${group.pricingRules.discountValue}%`);
    }

    if (!discount && group.pricingRules?.discountType === 'fixed_amount') {
      finalPrice = Math.max(0, basePrice - group.pricingRules.discountValue);
      discount = {
        type: 'fixed_amount',
        fixedDiscount: group.pricingRules.discountValue,
        originalPrice: basePrice,
        discountedPrice: finalPrice,
        savings: basePrice - finalPrice
      };
      appliedRules.push(`Fixed discount: $${group.pricingRules.discountValue}`);
    }

    return {
      ...item,
      finalPrice: Math.round(finalPrice * 100) / 100,
      originalPrice: basePrice,
      totalPrice: Math.round(finalPrice * quantity * 100) / 100,
      originalTotalPrice: Math.round(basePrice * quantity * 100) / 100,
      totalSavings: Math.round((basePrice - finalPrice) * quantity * 100) / 100,
      discount,
      appliedRules,
      hasGroupPricing: !!discount
    };
  });
}

// POST - Calculate group pricing for items
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();

    // Validate input
    const validation = pricingCalculationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid pricing calculation request',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId },
          { subdomain: storeId }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { groupId, items, customerId } = validation.data;

    // Get store settings for customer groups
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const customerGroups = (storeSettings?.customerGroups as any[]) || [];
    const group = customerGroups.find(g => g.id === groupId);

    if (!group) {
      return NextResponse.json({ error: 'Customer group not found' }, { status: 404 });
    }

    if (!group.isActive) {
      return NextResponse.json({ error: 'Customer group is not active' }, { status: 400 });
    }

    // Get product and category information for items
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        variants: {
          select: {
            id: true,
            price: true
          }
        }
      }
    });

    // Enrich items with product information
    const enrichedItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;

      return {
        ...item,
        productName: product.name,
        categoryId: product.categoryId,
        // Use variant price if specified, otherwise use base price
        basePrice: item.variantId ? 
          product.variants.find(v => v.id === item.variantId)?.price || item.basePrice :
          item.basePrice
      };
    }).filter(Boolean);

    // Calculate group pricing
    const pricedItems = calculateGroupPricing(group, enrichedItems);

    // Calculate totals
    const originalTotal = pricedItems.reduce((sum, item) => sum + item.originalTotalPrice, 0);
    const groupTotal = pricedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalSavings = originalTotal - groupTotal;
    const savingsPercentage = originalTotal > 0 ? (totalSavings / originalTotal) * 100 : 0;

    // Check if minimum order requirement is met
    const minimumOrderMet = !group.pricingRules?.minimumOrder || groupTotal >= group.pricingRules.minimumOrder;

    // Calculate additional benefits
    const benefits = [];
    if (group.benefits?.freeShipping) {
      if (!group.benefits.freeShippingThreshold || groupTotal >= group.benefits.freeShippingThreshold) {
        benefits.push({
          type: 'free_shipping',
          description: 'Free shipping included',
          value: 0 // Would calculate actual shipping cost
        });
      }
    }

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        type: group.type
      },
      items: pricedItems,
      pricing: {
        originalTotal: Math.round(originalTotal * 100) / 100,
        groupTotal: Math.round(groupTotal * 100) / 100,
        totalSavings: Math.round(totalSavings * 100) / 100,
        savingsPercentage: Math.round(savingsPercentage * 10) / 10,
        currency: store.currency || 'USD'
      },
      requirements: {
        minimumOrderMet,
        minimumOrder: group.pricingRules?.minimumOrder || 0
      },
      benefits,
      calculatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[GROUP PRICING API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET - Get pricing rules and available tiers for a group
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
    const groupId = searchParams.get('groupId');

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

    if (!groupId) {
      // Return pricing overview for all groups
      const storeSettings = await prisma.storeSettings.findUnique({
        where: { storeId: store.id }
      });

      const customerGroups = (storeSettings?.customerGroups as any[]) || [];
      
      const pricingOverview = customerGroups.map(group => ({
        id: group.id,
        name: group.name,
        type: group.type,
        isActive: group.isActive,
        hasPricingRules: !!(
          group.pricingRules?.productPricing?.length ||
          group.pricingRules?.categoryPricing?.length ||
          group.pricingRules?.tierPricing?.length ||
          group.pricingRules?.discountType
        ),
        generalDiscount: group.pricingRules?.discountType === 'percentage' ? 
          `${group.pricingRules.discountValue}%` : 
          group.pricingRules?.discountType === 'fixed_amount' ?
          `$${group.pricingRules.discountValue}` : null,
        minimumOrder: group.pricingRules?.minimumOrder || 0,
        customerCount: group.customerCount || 0
      }));

      return NextResponse.json({
        pricingOverview,
        summary: {
          totalGroups: customerGroups.length,
          groupsWithPricing: pricingOverview.filter(g => g.hasPricingRules).length,
          activeGroups: pricingOverview.filter(g => g.isActive).length
        }
      });
    }

    // Get specific group pricing details
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const customerGroups = (storeSettings?.customerGroups as any[]) || [];
    const group = customerGroups.find(g => g.id === groupId);

    if (!group) {
      return NextResponse.json({ error: 'Customer group not found' }, { status: 404 });
    }

    // Get products and categories referenced in pricing rules
    const productIds = group.pricingRules?.productPricing?.map((p: any) => p.productId) || [];
    const categoryIds = group.pricingRules?.categoryPricing?.map((c: any) => c.categoryId) || [];

    const [products, categories] = await Promise.all([
      productIds.length > 0 ? prisma.product.findMany({
        where: {
          id: { in: productIds },
          storeId: store.id
        },
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          variants: {
            select: {
              id: true,
              name: true,
              price: true,
              sku: true
            }
          }
        }
      }) : [],
      categoryIds.length > 0 ? prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          storeId: store.id
        },
        select: {
          id: true,
          name: true,
          slug: true
        }
      }) : []
    ]);

    // Enrich pricing rules with product/category details
    const enrichedPricingRules = {
      ...group.pricingRules,
      productPricing: group.pricingRules?.productPricing?.map((rule: any) => {
        const product = products.find((p: any) => p.id === rule.productId);
        const variant = rule.variantId ? 
          product?.variants.find((v: any) => v.id === rule.variantId) : null;
        
        return {
          ...rule,
          productName: product?.name,
          variantName: variant?.name,
          originalPrice: variant?.price || product?.variants[0]?.price || 0
        };
      }) || [],
      categoryPricing: group.pricingRules?.categoryPricing?.map((rule: any) => {
        const category = categories.find((c: any) => c.id === rule.categoryId);
        return {
          ...rule,
          categoryName: category?.name
        };
      }) || []
    };

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        type: group.type,
        description: group.description,
        isActive: group.isActive
      },
      pricingRules: enrichedPricingRules,
      benefits: group.benefits || {},
      customerCount: group.customerCount || 0,
      lastUpdated: group.updatedAt
    });
  } catch (error) {
    console.error('[GROUP PRICING API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update group pricing rules
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
    const body = await request.json();

    // Validate input
    const validation = setGroupPricingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid pricing rules data',
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

    const { groupId, pricingRules } = validation.data;

    // Get current customer groups
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const customerGroups = (storeSettings?.customerGroups as any[]) || [];
    const groupIndex = customerGroups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) {
      return NextResponse.json({ error: 'Customer group not found' }, { status: 404 });
    }

    // Update the group's pricing rules
    customerGroups[groupIndex] = {
      ...customerGroups[groupIndex],
      pricingRules: {
        ...customerGroups[groupIndex].pricingRules,
        ...pricingRules
      },
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    };

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { customerGroups }
    });

    return NextResponse.json({
      message: 'Group pricing rules updated successfully',
      group: customerGroups[groupIndex]
    });
  } catch (error) {
    console.error('[GROUP PRICING API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}