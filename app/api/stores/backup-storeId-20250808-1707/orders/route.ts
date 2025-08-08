import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for order line item
const lineItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  sku: z.string().optional(),
  title: z.string(),
  variantTitle: z.string().optional(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  taxable: z.boolean().default(true),
  requiresShipping: z.boolean().default(true),
  weight: z.number().optional(),
  image: z.string().url().optional(),
  customAttributes: z.record(z.string()).optional()
});

// Schema for address
const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  province: z.string().optional(),
  country: z.string().min(2).max(2), // ISO 3166-1 alpha-2
  zip: z.string().min(1),
  phone: z.string().optional(),
  provinceCode: z.string().optional(),
  countryName: z.string().optional()
});

// Schema for creating order
const createOrderSchema = z.object({
  customerId: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  
  lineItems: z.array(lineItemSchema).min(1),
  
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  
  shippingLines: z.array(z.object({
    title: z.string(),
    price: z.number().min(0),
    code: z.string().optional(),
    source: z.string().optional()
  })).optional(),
  
  discountCodes: z.array(z.string()).optional(),
  
  subtotalPrice: z.number().min(0),
  totalTax: z.number().min(0).default(0),
  totalShipping: z.number().min(0).default(0),
  totalDiscount: z.number().min(0).default(0),
  totalPrice: z.number().min(0),
  
  currency: z.string().min(3).max(3).optional(),
  
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid', 'refunded', 'partially_refunded']).default('pending'),
  financialStatus: z.enum(['pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'voided']).default('pending'),
  fulfillmentStatus: z.enum(['unfulfilled', 'partial', 'fulfilled', 'restocked']).optional(),
  
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  noteAttributes: z.record(z.string()).optional(),
  
  sendReceiptEmail: z.boolean().default(true),
  sendFulfillmentReceipt: z.boolean().default(true)
});

// Schema for updating order
const updateOrderSchema = createOrderSchema.partial().extend({
  cancelReason: z.enum(['customer', 'fraud', 'inventory', 'declined', 'other']).optional(),
  cancelledAt: z.string().datetime().optional()
});

// Generate order number
function generateOrderNumber(storeSettings: any, lastOrderNumber?: string): string {
  const settings = storeSettings?.orderSettings || {};
  const prefix = settings.orderNumberPrefix || '#';
  const suffix = settings.orderNumberSuffix || '';
  const format = settings.orderNumberFormat || 'sequential';
  
  let number: string;
  
  switch (format) {
    case 'date-based':
      const date = new Date();
      number = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(Date.now()).slice(-4)}`;
      break;
      
    case 'random':
      number = Math.random().toString(36).substring(2, 10).toUpperCase();
      break;
      
    case 'sequential':
    default:
      if (lastOrderNumber) {
        // Extract number from last order
        const match = lastOrderNumber.match(/\d+/);
        const lastNum = match ? parseInt(match[0], 10) : 0;
        number = String(lastNum + 1).padStart(5, '0');
      } else {
        const startValue = settings.orderNumberStartValue || 1000;
        number = String(startValue).padStart(5, '0');
      }
      break;
  }
  
  return `${prefix}${number}${suffix}`;
}

// GET - List orders
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
    const status = searchParams.get('status');
    const financialStatus = searchParams.get('financialStatus');
    const fulfillmentStatus = searchParams.get('fulfillmentStatus');
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
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

    // Build where clause
    const where: any = { storeId: store.id };
    
    if (status) where.status = status;
    if (financialStatus) where.financialStatus = financialStatus;
    if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus;
    if (customerId) where.customerId = customerId;
    if (email) where.email = email;
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { email: { contains: search } },
        { customerName: { contains: search } }
      ];
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Get orders with pagination
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lineItems: true,
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[ORDERS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create order
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
    const validation = createOrderSchema.safeParse(body);
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
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get last order number
    const lastOrder = await prisma.order.findFirst({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true }
    });

    // Generate order number
    const orderNumber = generateOrderNumber(store.storeSettings, lastOrder?.orderNumber);

    // Prepare order data
    const { lineItems, shippingAddress, billingAddress, shippingLines, ...orderData } = validation.data;

    // Create order with line items
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          ...orderData,
          storeId: store.id,
          orderNumber,
          currency: orderData.currency || store.currency || 'USD',
          customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          shippingAddress: shippingAddress as any,
          billingAddress: (billingAddress || shippingAddress) as any,
          shippingLines: shippingLines || [],
          status: 'open',
          lineItems: {
            create: lineItems.map((item, index) => ({
              ...item,
              position: index + 1,
              totalPrice: item.price * item.quantity
            }))
          }
        },
        include: {
          lineItems: true,
          customer: true
        }
      });

      // Update inventory if enabled
      if (store.storeSettings?.stockSettings?.trackInventory) {
        const inventory = store.storeSettings?.inventory || [];
        
        for (const lineItem of lineItems) {
          if (lineItem.sku) {
            const invItem = inventory.find((i: any) => i.sku === lineItem.sku);
            if (invItem && invItem.trackQuantity) {
              invItem.quantity -= lineItem.quantity;
              invItem.reservedQuantity = (invItem.reservedQuantity || 0) + lineItem.quantity;
            }
          }
        }

        await tx.storeSettings.update({
          where: { storeId: store.id },
          data: { inventory }
        });
      }

      // TODO: Send order confirmation email if enabled

      return newOrder;
    });

    return NextResponse.json({ 
      message: 'Order created successfully',
      order 
    });
  } catch (error) {
    console.error('[ORDERS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update order
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
    const { orderId, ...updateData } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Validate input
    const validation = updateOrderSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership and order exists
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

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order
    const { lineItems, shippingAddress, billingAddress, ...orderUpdateData } = validation.data;
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...orderUpdateData,
        ...(shippingAddress && { shippingAddress: shippingAddress as any }),
        ...(billingAddress && { billingAddress: billingAddress as any }),
        updatedAt: new Date()
      },
      include: {
        lineItems: true,
        customer: true
      }
    });

    return NextResponse.json({ 
      message: 'Order updated successfully',
      order: updatedOrder 
    });
  } catch (error) {
    console.error('[ORDERS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Cancel order
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
    const orderId = searchParams.get('orderId');
    const reason = searchParams.get('reason') || 'other';
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      },
      include: {
        lineItems: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cancel order
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled',
          cancelReason: reason as any,
          cancelledAt: new Date()
        }
      });

      // Restore inventory if tracking is enabled
      if (store.storeSettings?.stockSettings?.trackInventory) {
        const inventory = store.storeSettings?.inventory || [];
        
        for (const lineItem of order.lineItems) {
          if (lineItem.sku) {
            const invItem = inventory.find((i: any) => i.sku === lineItem.sku);
            if (invItem && invItem.trackQuantity) {
              invItem.quantity += lineItem.quantity;
              invItem.reservedQuantity = Math.max(0, (invItem.reservedQuantity || 0) - lineItem.quantity);
            }
          }
        }

        await tx.storeSettings.update({
          where: { storeId: store.id },
          data: { inventory }
        });
      }

      return updated;
    });

    return NextResponse.json({ 
      message: 'Order cancelled successfully',
      order: cancelledOrder
    });
  } catch (error) {
    console.error('[ORDERS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}