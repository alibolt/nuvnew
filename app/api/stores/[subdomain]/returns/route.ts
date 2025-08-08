import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for return item
const returnItemSchema = z.object({
  lineItemId: z.string(),
  quantity: z.number().min(1),
  reason: z.enum(['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged_shipping', 'other']),
  condition: z.enum(['new', 'used', 'damaged', 'defective']),
  note: z.string().optional()
});

// Schema for creating return
const createReturnSchema = z.object({
  orderId: z.string(),
  returnItems: z.array(returnItemSchema).min(1),
  returnReason: z.string().optional(),
  customerNote: z.string().optional(),
  returnType: z.enum(['refund', 'exchange', 'store_credit']).default('refund'),
  restockItems: z.boolean().default(true),
  refundShipping: z.boolean().default(false),
  refundAmount: z.number().optional(), // If different from calculated amount
  returnShippingAddress: z.object({
    name: z.string(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
    phone: z.string().optional()
  }).optional()
});

// Schema for updating return
const updateReturnSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'received', 'processed', 'completed']).optional(),
  adminNote: z.string().optional(),
  refundAmount: z.number().optional(),
  restockItems: z.boolean().optional(),
  trackingNumber: z.string().optional(),
  receivedItems: z.array(z.object({
    returnItemId: z.string(),
    receivedQuantity: z.number().min(0),
    condition: z.enum(['new', 'used', 'damaged', 'defective']),
    note: z.string().optional()
  })).optional()
});

// GET - List returns
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
    const returnType = searchParams.get('returnType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');
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

    // Get returns from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let returns = (storeSettings?.returns as any[]) || [];

    // Apply filters
    if (status) {
      returns = returns.filter(r => r.status === status);
    }
    if (returnType) {
      returns = returns.filter(r => r.returnType === returnType);
    }
    if (dateFrom) {
      returns = returns.filter(r => new Date(r.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      returns = returns.filter(r => new Date(r.createdAt) <= new Date(dateTo));
    }
    if (customerId) {
      returns = returns.filter(r => r.customerId === customerId);
    }
    if (orderId) {
      returns = returns.filter(r => r.orderId === orderId);
    }

    // Sort by creation date (newest first)
    returns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = returns.length;
    const startIndex = (page - 1) * limit;
    const paginatedReturns = returns.slice(startIndex, startIndex + limit);

    // Enrich with order and customer data
    const enrichedReturns = await Promise.all(
      paginatedReturns.map(async (returnItem) => {
        const order = await prisma.order.findUnique({
          where: { id: returnItem.orderId },
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            lineItems: true
          }
        });

        return {
          ...returnItem,
          order: order ? {
            orderNumber: order.orderNumber,
            totalPrice: order.totalPrice,
            createdAt: order.createdAt
          } : null,
          customer: order?.customer
        };
      })
    );

    return NextResponse.json({
      returns: enrichedReturns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[RETURNS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create return
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
    const validation = createReturnSchema.safeParse(body);
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
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get order with line items
    const order = await prisma.order.findFirst({
      where: {
        id: validation.data.orderId,
        storeId: store.id
      },
      include: {
        lineItems: true,
        customer: true
      }
    });

    if (!order) {
      return apiResponse.notFound('Order ');
    }

    // Validate return items
    let totalRefundAmount = 0;
    const validatedReturnItems = [];

    for (const returnItem of validation.data.returnItems) {
      const lineItem = order.lineItems.find(li => li.id === returnItem.lineItemId);
      if (!lineItem) {
        return apiResponse.badRequest('Line item ${returnItem.lineItemId} not found');
      }

      if (returnItem.quantity > lineItem.quantity) {
        return apiResponse.badRequest('Cannot return ${returnItem.quantity} of ${lineItem.title}. Only ${lineItem.quantity} purchased.');
      }

      const itemRefundAmount = (lineItem.price * returnItem.quantity);
      totalRefundAmount += itemRefundAmount;

      validatedReturnItems.push({
        ...returnItem,
        lineItem: {
          id: lineItem.id,
          title: lineItem.title,
          price: lineItem.price,
          sku: lineItem.sku,
          image: lineItem.image
        },
        refundAmount: itemRefundAmount
      });
    }

    // Add shipping refund if applicable
    if (validation.data.refundShipping) {
      totalRefundAmount += order.totalShipping || 0;
    }

    // Use custom refund amount if provided
    const finalRefundAmount = validation.data.refundAmount || totalRefundAmount;

    // Create return
    const newReturn = {
      id: `return_${Date.now()}`,
      orderId: validation.data.orderId,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      returnItems: validatedReturnItems,
      returnReason: validation.data.returnReason,
      customerNote: validation.data.customerNote,
      returnType: validation.data.returnType,
      status: 'pending',
      refundAmount: finalRefundAmount,
      refundShipping: validation.data.refundShipping,
      restockItems: validation.data.restockItems,
      returnShippingAddress: validation.data.returnShippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Get current returns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const returns = (storeSettings?.returns as any[]) || [];
    returns.push(newReturn);

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { returns },
      create: {
        storeId: store.id,
        returns
      }
    });

    // TODO: Send return confirmation email to customer
    // TODO: Generate return label if needed

    return NextResponse.json({ 
      message: 'Return created successfully',
      return: newReturn
    });
  } catch (error) {
    console.error('[RETURNS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update return
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
    const { returnId, ...updateData } = await request.json();
    
    if (!returnId) {
      return apiResponse.badRequest('Return ID is required');
    }

    // Validate input
    const validation = updateReturnSchema.safeParse(updateData);
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
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current returns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const returns = (storeSettings?.returns as any[]) || [];
    const returnIndex = returns.findIndex(r => r.id === returnId);

    if (returnIndex === -1) {
      return apiResponse.notFound('Return ');
    }

    // Update return
    const updatedReturn = {
      ...returns[returnIndex],
      ...validation.data,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    };

    // Handle status changes
    if (validation.data.status) {
      updatedReturn.statusHistory = updatedReturn.statusHistory || [];
      updatedReturn.statusHistory.push({
        status: validation.data.status,
        timestamp: new Date().toISOString(),
        updatedBy: session.user.email,
        note: validation.data.adminNote
      });

      // Process refund if approved and type is refund
      if (validation.data.status === 'approved' && updatedReturn.returnType === 'refund') {
        // TODO: Process actual refund through payment gateway
        updatedReturn.refundProcessed = true;
        updatedReturn.refundProcessedAt = new Date().toISOString();
      }

      // Restock items if received and restockItems is true
      if (validation.data.status === 'received' && updatedReturn.restockItems) {
        // TODO: Update inventory
      }
    }

    returns[returnIndex] = updatedReturn;

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { returns }
    });

    return NextResponse.json({ 
      message: 'Return updated successfully',
      return: updatedReturn
    });
  } catch (error) {
    console.error('[RETURNS API] PUT Error:', error);
    return apiResponse.serverError();
  }
}