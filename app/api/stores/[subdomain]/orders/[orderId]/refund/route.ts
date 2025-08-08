import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for refund
const refundSchema = z.object({
  amount: z.number().positive(),
  reason: z.enum(['customer_request', 'damaged', 'not_as_described', 'wrong_item', 'other']),
  note: z.string().optional(),
  restock: z.boolean().default(true),
  notifyCustomer: z.boolean().default(true),
  lineItems: z.array(z.object({
    lineItemId: z.string(),
    quantity: z.number().min(1),
    amount: z.number().min(0)
  })).optional()
});

// POST - Refund order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, orderId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = refundSchema.safeParse(body);
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
      return apiResponse.notFound('Order ');
    }

    // Validate refund amount
    const maxRefundable = order.totalPrice - (order.totalDiscount || 0);
    if (validation.data.amount > maxRefundable) {
      return apiResponse.badRequest('Cannot refund ${validation.data.amount}. Maximum refundable: ${maxRefundable}');
    }

    // Validate line items if provided
    if (validation.data.lineItems) {
      for (const refundItem of validation.data.lineItems) {
        const lineItem = order.lineItems.find(li => li.id === refundItem.lineItemId);
        if (!lineItem) {
          return apiResponse.badRequest('Line item ${refundItem.lineItemId} not found');
        }
        if (refundItem.quantity > lineItem.quantity) {
          return apiResponse.badRequest('Cannot refund ${refundItem.quantity} of ${lineItem.title}. Only ${lineItem.quantity} purchased.');
        }
      }
    }

    // Process refund
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restock inventory if enabled
      if (validation.data.restock && (store.storeSettings as any)?.stockSettings?.trackInventory) {
        const inventory = (store.storeSettings as any)?.inventory || [];
        
        const itemsToRestock = validation.data.lineItems || order.lineItems.map(li => ({
          lineItemId: li.id,
          quantity: li.quantity,
          amount: li.totalPrice
        }));
        
        for (const refundItem of itemsToRestock) {
          const lineItem = order.lineItems.find(li => li.id === refundItem.lineItemId)!;
          if (lineItem.sku) {
            const invItem = inventory.find((i: any) => i.sku === lineItem.sku);
            if (invItem && invItem.trackQuantity) {
              invItem.quantity += refundItem.quantity;
            }
          }
        }

        await tx.storeSettings.update({
          where: { storeId: store.id },
          data: { inventory }
        });
      }

      // Calculate new financial status
      const totalRefunded = validation.data.amount;
      let financialStatus = order.financialStatus;
      
      if (totalRefunded >= order.totalPrice) {
        financialStatus = 'refunded';
      } else if (totalRefunded > 0) {
        financialStatus = 'partially_refunded';
      }

      // Update order
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          financialStatus,
          paymentStatus: financialStatus === 'refunded' ? 'refunded' : 'partially_refunded',
          updatedAt: new Date()
        },
        include: {
          lineItems: true,
          customer: true
        }
      });

      return updated;
    });

    // TODO: Process actual refund through payment gateway
    // TODO: Send refund notification email if enabled

    return NextResponse.json({ 
      message: 'Refund processed successfully',
      order: updatedOrder,
      refund: {
        amount: validation.data.amount,
        reason: validation.data.reason,
        note: validation.data.note,
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[ORDER REFUND API] POST Error:', error);
    return apiResponse.serverError();
  }
}