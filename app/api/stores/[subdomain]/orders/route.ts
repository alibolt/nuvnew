import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import Stripe from 'stripe';

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
  const prefix = settings.orderNumberPrefix || '';
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
        // Extract number from last order (remove any non-numeric prefix)
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

// Handle order creation from embedded checkout
async function handleEmbeddedCheckoutOrder(subdomain: string, data: any) {
  const {
    paymentIntentId,
    email,
    name,
    phone,
    shippingAddress,
    billingAddressSame,
    billingAddress,
    cartItems,
    paymentMethod,
    total,
    discountCode,
  } = data;

  // Get store
  const store = await prisma.store.findUnique({
    where: { subdomain },
    include: { storeSettings: true }
  });

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  // Verify payment intent if provided
  let paymentVerified = false;
  let stripePaymentIntent = null;

  if (paymentIntentId && (paymentMethod === 'stripe' || paymentMethod === 'nuvi')) {
    try {
      // Use appropriate Stripe instance
      const stripeKey = paymentMethod === 'nuvi' 
        ? process.env.PLATFORM_STRIPE_SECRET_KEY 
        : (store.storeSettings as any)?.paymentMethods?.stripe?.settings?.secretKey;

      if (!stripeKey) {
        throw new Error('Stripe key not configured');
      }

      const stripe = new Stripe(stripeKey, {
        apiVersion: '2024-11-20.acacia',
      });

      stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentVerified = stripePaymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  }

  // Get last order number
  const lastOrder = await prisma.order.findFirst({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true }
  });

  // Generate order number
  const orderNumber = generateOrderNumber(store.storeSettings, lastOrder?.orderNumber);

  // Calculate totals
  let subtotal = 0;
  const orderLineItems = [];

  for (const item of cartItems) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });

    if (!variant) continue;

    subtotal += variant.price * item.quantity;
    
    orderLineItems.push({
      productId: variant.productId,
      variantId: variant.id,
      title: variant.product.name,
      variantTitle: variant.name,
      price: variant.price,
      quantity: item.quantity,
      totalPrice: variant.price * item.quantity,
      position: orderLineItems.length + 1,
    });
  }

  // Calculate fees if Nuvi payment
  let platformFee = 0;
  let merchantPayout = total;

  if (paymentMethod === 'nuvi') {
    const nuviSettings = (store.storeSettings as any)?.paymentMethods?.nuvi?.settings;
    const commission = nuviSettings?.commission || 5.9;
    const fixedFee = nuviSettings?.fixedFee || 0.50;
    platformFee = (total * commission / 100) + fixedFee;
    merchantPayout = total - platformFee;
  }

  // Format addresses
  const formattedShippingAddress = {
    firstName: name.split(' ')[0] || '',
    lastName: name.split(' ').slice(1).join(' ') || '',
    company: data.company || '',
    address1: shippingAddress.line1,
    address2: shippingAddress.line2 || '',
    city: shippingAddress.city,
    province: shippingAddress.state,
    country: shippingAddress.country,
    zip: shippingAddress.postalCode,
    phone: phone || '',
  };

  const formattedBillingAddress = billingAddressSame ? formattedShippingAddress : {
    firstName: name.split(' ')[0] || '',
    lastName: name.split(' ').slice(1).join(' ') || '',
    company: data.company || '',
    address1: billingAddress.line1,
    address2: billingAddress.line2 || '',
    city: billingAddress.city,
    province: billingAddress.state,
    country: billingAddress.country,
    zip: billingAddress.postalCode,
    phone: phone || '',
  };

  // Create order
  const order = await prisma.order.create({
    data: {
      storeId: store.id,
      orderNumber,
      customerEmail: email,
      customerName: name,
      customerPhone: phone || '',
      status: paymentVerified ? 'open' : 'pending',
      financialStatus: paymentVerified ? 'paid' : 'pending',
      paymentStatus: paymentVerified ? 'paid' : 'pending',
      paymentProvider: paymentMethod,
      currency: store.currency || 'USD',
      subtotalPrice: subtotal,
      totalDiscount: 0, // Calculate if discount applied
      totalTax: subtotal * 0.08, // 8% tax
      totalShipping: 10, // Flat rate
      totalPrice: total,
      shippingAddress: formattedShippingAddress,
      billingAddress: formattedBillingAddress,
      note: data.specialInstructions || (paymentIntentId ? `Payment Intent: ${paymentIntentId}` : ''),
      lineItems: {
        create: orderLineItems,
      },
      noteAttributes: {
        paymentIntentId,
        platformFee: platformFee.toFixed(2),
        merchantPayout: merchantPayout.toFixed(2),
        newsletterSignup: data.newsletterSignup ? 'true' : 'false',
        customFields: data.customFields || {},
      },
    },
    include: {
      lineItems: true,
    },
  });

  // Create platform transaction if Nuvi payment
  if (paymentMethod === 'nuvi' && paymentVerified) {
    await prisma.platformTransaction.create({
      data: {
        storeId: store.id,
        orderId: order.id,
        type: 'commission',
        amount: platformFee,
        currency: store.currency || 'USD',
        status: 'completed',
        description: `Commission for order ${order.orderNumber}`,
        metadata: {
          orderNumber: order.orderNumber,
          paymentIntentId,
          commission: `${(store.storeSettings as any)?.paymentMethods?.nuvi?.settings?.commission || 5.9}%`,
          fixedFee: `$${(store.storeSettings as any)?.paymentMethods?.nuvi?.settings?.fixedFee || 0.50}`,
        } as any,
      },
    });
  }

  return NextResponse.json({
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.totalPrice,
      currency: order.currency,
    },
    redirectUrl: `/s/${subdomain}/orders/${order.orderNumber}/confirmation`,
  });
}

// GET - List orders
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Build where clause
    const where: any = { storeId: store.id };
    
    if (status) where.status = status;
    if (financialStatus) where.financialStatus = financialStatus;
    if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus;
    if (customerId) where.customerId = customerId;
    if (email) where.customerEmail = email;
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
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
    return apiResponse.serverError();
  }
}

// POST - Create order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    
    // Check if this is from embedded checkout (has paymentIntentId)
    if (body.paymentIntentId) {
      return handleEmbeddedCheckoutOrder(subdomain, body);
    }
    
    // Otherwise, handle as admin order creation
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }
    
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
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
    const { lineItems, shippingAddress, billingAddress, shippingLines, email, ...orderData } = validation.data;

    // Create order with line items
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          ...orderData,
          storeId: store.id,
          orderNumber,
          currency: orderData.currency || store.currency || 'USD',
          customerEmail: email,
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
      if ((store.storeSettings as any)?.stockSettings?.trackInventory) {
        const inventory = (store.storeSettings as any)?.inventory || [];
        
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
    return apiResponse.serverError();
  }
}

// PUT - Update order
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
    const { orderId, ...updateData } = await request.json();
    
    if (!orderId) {
      return apiResponse.badRequest('Order ID is required');
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      }
    });

    if (!order) {
      return apiResponse.notFound('Order ');
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
    return apiResponse.serverError();
  }
}

// DELETE - Cancel order
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
    const orderId = searchParams.get('orderId');
    const reason = searchParams.get('reason') || 'other';
    
    if (!orderId) {
      return apiResponse.badRequest('Order ID is required');
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
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
      return apiResponse.notFound('Order ');
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
      if ((store.storeSettings as any)?.stockSettings?.trackInventory) {
        const inventory = (store.storeSettings as any)?.inventory || [];
        
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
    return apiResponse.serverError();
  }
}