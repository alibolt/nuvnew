import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  type: z.enum(['status', 'financialStatus', 'fulfillmentStatus']),
  status: z.string(),
});

export async function PATCH(
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
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { type, status } = validation.data;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Verify order exists and belongs to store
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      }
    });

    if (!order) {
      return apiResponse.notFound('Order ');
    }

    // Update order status
    const updateData: any = {};
    updateData[type] = status;

    // Add additional fields based on status changes
    if (type === 'status' && status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = 'Manual cancellation';
    }

    if (type === 'financialStatus' && status === 'paid') {
      updateData.paidAt = updateData.paidAt || new Date();
      updateData.paymentStatus = 'paid';
    }

    if (type === 'fulfillmentStatus' && status === 'fulfilled') {
      updateData.fulfilledAt = updateData.fulfilledAt || new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        lineItems: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        },
        customer: true,
      }
    });

    // If order is cancelled, restore inventory
    if (type === 'status' && status === 'cancelled' && order.status !== 'cancelled') {
      for (const lineItem of updatedOrder.lineItems) {
        if (lineItem.variantId) {
          await prisma.productVariant.update({
            where: { id: lineItem.variantId },
            data: {
              stock: {
                increment: lineItem.quantity
              }
            }
          });
        }
      }
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return apiResponse.serverError();
  }
}