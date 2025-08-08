import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for fulfillment
const fulfillmentSchema = z.object({
  lineItems: z.array(z.object({
    lineItemId: z.string(),
    quantity: z.number().min(1)
  })).optional(), // If not provided, fulfill all items
  trackingNumber: z.string().optional(),
  trackingCompany: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  notifyCustomer: z.boolean().default(true),
  note: z.string().optional()
});

// POST - Fulfill order
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
    const validation = fulfillmentSchema.safeParse(body);
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

    // Get order with line items
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

    // Check if order can be fulfilled
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot fulfill cancelled order' }, { status: 400 });
    }

    if (order.fulfillmentStatus === 'fulfilled') {
      return NextResponse.json({ error: 'Order is already fulfilled' }, { status: 400 });
    }

    // Determine items to fulfill
    let itemsToFulfill = order.lineItems;
    if (validation.data.lineItems) {
      // Validate requested line items
      for (const requestedItem of validation.data.lineItems) {
        const lineItem = order.lineItems.find(li => li.id === requestedItem.lineItemId);
        if (!lineItem) {
          return NextResponse.json({ 
            error: `Line item ${requestedItem.lineItemId} not found` 
          }, { status: 400 });
        }
        if (requestedItem.quantity > lineItem.quantity) {
          return NextResponse.json({ 
            error: `Cannot fulfill ${requestedItem.quantity} of ${lineItem.title}. Only ${lineItem.quantity} ordered.` 
          }, { status: 400 });
        }
      }
    }

    // Update order fulfillment status
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update inventory if tracking is enabled
      if (store.storeSettings?.stockSettings?.trackInventory) {
        const inventory = store.storeSettings?.inventory || [];
        
        const itemsToProcess = validation.data.lineItems 
          ? validation.data.lineItems.map(item => {
              const lineItem = order.lineItems.find(li => li.id === item.lineItemId)!;
              return { ...lineItem, quantity: item.quantity };
            })
          : itemsToFulfill;
        
        for (const lineItem of itemsToProcess) {
          if (lineItem.sku) {
            const invItem = inventory.find((i: any) => i.sku === lineItem.sku);
            if (invItem) {
              // Move from reserved to fulfilled
              invItem.reservedQuantity = Math.max(0, (invItem.reservedQuantity || 0) - lineItem.quantity);
            }
          }
        }

        await tx.storeSettings.update({
          where: { storeId: store.id },
          data: { inventory }
        });
      }

      // Update order
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          fulfillmentStatus: validation.data.lineItems ? 'partial' : 'fulfilled',
          updatedAt: new Date()
        },
        include: {
          lineItems: true,
          customer: true
        }
      });

      return updated;
    });

    // TODO: Send shipping notification email if enabled

    return NextResponse.json({ 
      message: 'Order fulfilled successfully',
      order: updatedOrder,
      fulfillment: {
        trackingNumber: validation.data.trackingNumber,
        trackingCompany: validation.data.trackingCompany,
        trackingUrl: validation.data.trackingUrl,
        fulfilledAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[ORDER FULFILLMENT API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}