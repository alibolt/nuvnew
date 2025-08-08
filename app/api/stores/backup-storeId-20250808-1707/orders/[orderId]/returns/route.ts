import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a return
const createReturnSchema = z.object({
  type: z.enum(['return', 'exchange']),
  reason: z.enum([
    'defective',
    'wrong_item',
    'not_as_described',
    'size_issue',
    'damaged_shipping',
    'changed_mind',
    'quality_issue',
    'other'
  ]),
  reasonNote: z.string().optional(),
  items: z.array(z.object({
    lineItemId: z.string(),
    quantity: z.number().min(1),
    condition: z.enum(['new', 'used', 'damaged']).default('used'),
    photos: z.array(z.string()).optional()
  })).min(1),
  
  // Exchange specific fields
  exchangeItems: z.array(z.object({
    productId: z.string(),
    variantId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
  
  requestedAction: z.enum(['refund', 'store_credit', 'exchange']),
  customerNote: z.string().optional(),
  returnShipping: z.object({
    method: z.enum(['customer_ships', 'prepaid_label', 'pickup']).default('customer_ships'),
    address: z.object({
      name: z.string(),
      address1: z.string(),
      address2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      country: z.string().default('US')
    }).optional()
  }).optional()
});

// Schema for updating return status
const updateReturnSchema = z.object({
  status: z.enum([
    'pending',
    'approved',
    'rejected',
    'return_shipped',
    'received',
    'inspected',
    'processed',
    'completed',
    'cancelled'
  ]),
  adminNote: z.string().optional(),
  refundAmount: z.number().min(0).optional(),
  restockQuantity: z.number().min(0).optional(),
  shippingLabel: z.object({
    trackingNumber: z.string(),
    carrier: z.string(),
    labelUrl: z.string().optional()
  }).optional(),
  inspectionResult: z.object({
    condition: z.enum(['acceptable', 'damaged', 'unsellable']),
    notes: z.string().optional(),
    photos: z.array(z.string()).optional()
  }).optional()
});

// Helper function to calculate return refund amount
function calculateRefundAmount(returnItems: any[], originalOrder: any): number {
  let refundAmount = 0;
  
  returnItems.forEach(returnItem => {
    const originalLineItem = originalOrder.lineItems.find(
      (item: any) => item.id === returnItem.lineItemId
    );
    
    if (originalLineItem) {
      const itemRefund = (originalLineItem.price * returnItem.quantity);
      refundAmount += itemRefund;
    }
  });
  
  return refundAmount;
}

// Helper function to generate return number
function generateReturnNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RET${timestamp.slice(-6)}${random}`;
}

// GET - Get return requests for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, orderId } = await params;

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

    // Get order and verify it exists
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get store settings for returns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const returns = (storeSettings?.returns as any[]) || [];
    const orderReturns = returns.filter(returnItem => returnItem.orderId === orderId);

    return NextResponse.json({
      returns: orderReturns,
      total: orderReturns.length
    });
  } catch (error) {
    console.error('[RETURNS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create new return request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, orderId } = await params;
    const body = await request.json();

    // Validate input
    const validation = createReturnSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid return request data',
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

    // Get order details
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

    const {
      type,
      reason,
      reasonNote,
      items,
      exchangeItems,
      requestedAction,
      customerNote,
      returnShipping
    } = validation.data;

    // Validate return items exist in order
    const invalidItems = items.filter(item => 
      !order.lineItems.some(lineItem => lineItem.id === item.lineItemId)
    );

    if (invalidItems.length > 0) {
      return NextResponse.json({
        error: 'Some items are not found in the order'
      }, { status: 400 });
    }

    // Calculate refund amount
    const refundAmount = requestedAction === 'refund' 
      ? calculateRefundAmount(items, order)
      : 0;

    // Create return object
    const returnRequest = {
      id: `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      returnNumber: generateReturnNumber(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      
      type,
      reason,
      reasonNote,
      items,
      exchangeItems: exchangeItems || [],
      requestedAction,
      customerNote,
      returnShipping,
      
      // Calculated fields
      estimatedRefund: refundAmount,
      actualRefund: 0,
      
      // Status tracking
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date().toISOString(),
        note: 'Return request created',
        updatedBy: session.user.email
      }],
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email,
      
      // Additional tracking
      adminNotes: [],
      shippingLabel: null,
      inspectionResult: null
    };

    // Get current returns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentReturns = (storeSettings?.returns as any[]) || [];
    const updatedReturns = [...currentReturns, returnRequest];

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { 
        returns: updatedReturns,
        updatedAt: new Date()
      },
      create: { 
        storeId: store.id, 
        returns: updatedReturns 
      }
    });

    return NextResponse.json({
      message: 'Return request created successfully',
      return: {
        id: returnRequest.id,
        returnNumber: returnRequest.returnNumber,
        status: returnRequest.status,
        estimatedRefund: returnRequest.estimatedRefund
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[RETURNS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update return status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, orderId } = await params;
    const body = await request.json();
    const { returnId, ...updateData } = body;

    if (!returnId) {
      return NextResponse.json({ error: 'Return ID is required' }, { status: 400 });
    }

    // Validate update data
    const validation = updateReturnSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid return update data',
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

    // Get current returns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentReturns = (storeSettings?.returns as any[]) || [];
    const returnIndex = currentReturns.findIndex(r => r.id === returnId);

    if (returnIndex === -1) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    const existingReturn = currentReturns[returnIndex];

    // Update return with new data
    const updatedReturn = {
      ...existingReturn,
      ...validation.data,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email,
      
      // Update status history
      statusHistory: [
        ...existingReturn.statusHistory,
        {
          status: validation.data.status || existingReturn.status,
          timestamp: new Date().toISOString(),
          note: validation.data.adminNote || `Status updated to ${validation.data.status}`,
          updatedBy: session.user.email
        }
      ],
      
      // Update admin notes if provided
      adminNotes: validation.data.adminNote 
        ? [
            ...existingReturn.adminNotes,
            {
              note: validation.data.adminNote,
              timestamp: new Date().toISOString(),
              author: session.user.email
            }
          ]
        : existingReturn.adminNotes
    };

    // Handle specific status changes
    if (validation.data.status === 'processed' && validation.data.refundAmount) {
      updatedReturn.actualRefund = validation.data.refundAmount;
      updatedReturn.processedAt = new Date().toISOString();
    }

    if (validation.data.status === 'received' && validation.data.restockQuantity) {
      // In a real app, you would update product inventory here
      updatedReturn.restockedQuantity = validation.data.restockQuantity;
      updatedReturn.receivedAt = new Date().toISOString();
    }

    // Update the returns array
    currentReturns[returnIndex] = updatedReturn;

    // Save to database
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { 
        returns: currentReturns,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Return updated successfully',
      return: updatedReturn
    });
  } catch (error) {
    console.error('[RETURNS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}