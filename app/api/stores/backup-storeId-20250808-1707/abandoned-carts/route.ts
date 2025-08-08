import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for abandoned cart
const abandonedCartSchema = z.object({
  sessionId: z.string(),
  customerId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  cartToken: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    title: z.string(),
    variantTitle: z.string().optional(),
    image: z.string().optional(),
    sku: z.string().optional()
  })).min(1),
  subtotal: z.number().min(0),
  estimatedTax: z.number().min(0).optional(),
  estimatedShipping: z.number().min(0).optional(),
  estimatedTotal: z.number().min(0),
  currency: z.string().default('USD'),
  billingAddress: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional()
  }).optional(),
  shippingAddress: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional()
  }).optional(),
  customerNote: z.string().optional(),
  source: z.enum(['web', 'mobile', 'pos']).default('web'),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    platform: z.string().optional()
  }).optional()
});

// Schema for recovery campaign
const recoveryCampaignSchema = z.object({
  enabled: z.boolean().default(true),
  triggers: z.array(z.object({
    delayMinutes: z.number().min(15), // Minimum 15 minutes
    emailTemplate: z.string(),
    subject: z.string(),
    includeDiscount: z.boolean().default(false),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    discountValue: z.number().min(0).optional(),
    discountCode: z.string().optional()
  })).min(1).max(3) // Up to 3 follow-up emails
});

// GET - List abandoned carts
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
    
    // Filters
    const status = searchParams.get('status'); // active, recovered, ignored
    const hasEmail = searchParams.get('hasEmail') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minValue = searchParams.get('minValue');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
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

    // Get abandoned carts from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let abandonedCarts = (storeSettings?.abandonedCarts as any[]) || [];

    // Apply filters
    if (status) {
      abandonedCarts = abandonedCarts.filter(cart => cart.status === status);
    }
    
    if (hasEmail) {
      abandonedCarts = abandonedCarts.filter(cart => cart.email);
    }
    
    if (dateFrom) {
      abandonedCarts = abandonedCarts.filter(cart => 
        new Date(cart.createdAt) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      abandonedCarts = abandonedCarts.filter(cart => 
        new Date(cart.createdAt) <= new Date(dateTo)
      );
    }
    
    if (minValue) {
      const minValueNum = parseFloat(minValue);
      abandonedCarts = abandonedCarts.filter(cart => cart.estimatedTotal >= minValueNum);
    }

    // Calculate metrics
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = {
      total: abandonedCarts.length,
      totalValue: abandonedCarts.reduce((sum, cart) => sum + cart.estimatedTotal, 0),
      recoverable: abandonedCarts.filter(cart => cart.email && cart.status === 'active').length,
      recovered: abandonedCarts.filter(cart => cart.status === 'recovered').length,
      recoveryRate: abandonedCarts.length > 0 
        ? (abandonedCarts.filter(cart => cart.status === 'recovered').length / abandonedCarts.length) * 100 
        : 0,
      averageCartValue: abandonedCarts.length > 0 
        ? abandonedCarts.reduce((sum, cart) => sum + cart.estimatedTotal, 0) / abandonedCarts.length 
        : 0,
      last24Hours: abandonedCarts.filter(cart => new Date(cart.createdAt) >= last24Hours).length,
      last7Days: abandonedCarts.filter(cart => new Date(cart.createdAt) >= last7Days).length,
      last30Days: abandonedCarts.filter(cart => new Date(cart.createdAt) >= last30Days).length
    };

    // Sort by creation date (newest first)
    abandonedCarts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = abandonedCarts.length;
    const startIndex = (page - 1) * limit;
    const paginatedCarts = abandonedCarts.slice(startIndex, startIndex + limit);

    // Get recovery campaign settings
    const recoveryCampaign = storeSettings?.abandonedCartRecovery || {
      enabled: false,
      triggers: []
    };

    return NextResponse.json({
      carts: paginatedCarts,
      metrics,
      recoveryCampaign,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[ABANDONED CARTS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create/Update abandoned cart
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = abandonedCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Get store (no auth required for cart tracking)
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

    // Get current abandoned carts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const abandonedCarts = (storeSettings?.abandonedCarts as any[]) || [];
    
    // Check if cart already exists
    const existingCartIndex = abandonedCarts.findIndex(
      cart => cart.cartToken === validation.data.cartToken
    );

    const now = new Date();
    
    if (existingCartIndex !== -1) {
      // Update existing cart
      abandonedCarts[existingCartIndex] = {
        ...abandonedCarts[existingCartIndex],
        ...validation.data,
        updatedAt: now.toISOString(),
        lastActivityAt: now.toISOString()
      };
    } else {
      // Create new abandoned cart
      const newCart = {
        id: `cart_${Date.now()}`,
        ...validation.data,
        status: 'active',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        lastActivityAt: now.toISOString(),
        abandonedAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // Consider abandoned after 30 minutes
        recoveryAttempts: [],
        recovered: false,
        recoveredAt: null,
        orderId: null
      };
      
      abandonedCarts.push(newCart);
    }

    // Clean up old abandoned carts (older than 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const filteredCarts = abandonedCarts.filter(
      cart => new Date(cart.createdAt) > ninetyDaysAgo
    );

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { abandonedCarts: filteredCarts },
      create: {
        storeId: store.id,
        abandonedCarts: filteredCarts
      }
    });

    return NextResponse.json({ 
      message: 'Cart tracked successfully',
      cartToken: validation.data.cartToken
    });
  } catch (error) {
    console.error('[ABANDONED CARTS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update recovery campaign settings
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
    const validation = recoveryCampaignSchema.safeParse(body);
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

    // Update recovery campaign settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        abandonedCartRecovery: validation.data
      },
      create: {
        storeId: store.id,
        abandonedCartRecovery: validation.data
      }
    });

    return NextResponse.json({ 
      message: 'Recovery campaign settings updated successfully',
      recoveryCampaign: validation.data
    });
  } catch (error) {
    console.error('[ABANDONED CARTS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Mark cart as recovered or ignored
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
    const cartId = searchParams.get('cartId');
    const action = searchParams.get('action') || 'ignore'; // recover or ignore
    
    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
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

    // Get current abandoned carts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const abandonedCarts = (storeSettings?.abandonedCarts as any[]) || [];
    const cartIndex = abandonedCarts.findIndex(cart => cart.id === cartId);

    if (cartIndex === -1) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // Update cart status
    abandonedCarts[cartIndex] = {
      ...abandonedCarts[cartIndex],
      status: action === 'recover' ? 'recovered' : 'ignored',
      recoveredAt: action === 'recover' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { abandonedCarts }
    });

    return NextResponse.json({ 
      message: `Cart marked as ${action === 'recover' ? 'recovered' : 'ignored'}`
    });
  } catch (error) {
    console.error('[ABANDONED CARTS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}