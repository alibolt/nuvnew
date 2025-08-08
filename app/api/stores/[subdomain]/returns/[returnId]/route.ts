import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Get single return
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; returnId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, returnId } = await params;

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

    // Get return
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const returns = (storeSettings?.returns as any[]) || [];
    const returnItem = returns.find(r => r.id === returnId);

    if (!returnItem) {
      return apiResponse.notFound('Return ');
    }

    // Get related order data
    const order = await prisma.order.findUnique({
      where: { id: returnItem.orderId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        lineItems: true
      }
    });

    return NextResponse.json({
      return: {
        ...returnItem,
        order: order ? {
          id: order.id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress
        } : null,
        customer: order?.customer
      }
    });
  } catch (error) {
    console.error('[RETURN API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Cancel/delete return
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; returnId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, returnId } = await params;

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

    const returnItem = returns[returnIndex];

    // Only allow deletion/cancellation if return is pending or rejected
    if (!['pending', 'rejected'].includes(returnItem.status)) {
      return apiResponse.badRequest('Cannot delete return in current status');
    }

    // Remove return from array
    returns.splice(returnIndex, 1);

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { returns }
    });

    return apiResponse.success({ message: 'Return deleted successfully' });
  } catch (error) {
    console.error('[RETURN API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}