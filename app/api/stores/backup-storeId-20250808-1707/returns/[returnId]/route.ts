import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Get single return
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; returnId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, returnId } = await params;

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

    // Get return
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const returns = (storeSettings?.returns as any[]) || [];
    const returnItem = returns.find(r => r.id === returnId);

    if (!returnItem) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Cancel/delete return
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; returnId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, returnId } = await params;

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

    const returns = (storeSettings?.returns as any[]) || [];
    const returnIndex = returns.findIndex(r => r.id === returnId);

    if (returnIndex === -1) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    const returnItem = returns[returnIndex];

    // Only allow deletion/cancellation if return is pending or rejected
    if (!['pending', 'rejected'].includes(returnItem.status)) {
      return NextResponse.json({ 
        error: 'Cannot delete return in current status' 
      }, { status: 400 });
    }

    // Remove return from array
    returns.splice(returnIndex, 1);

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { returns }
    });

    return NextResponse.json({ 
      message: 'Return deleted successfully'
    });
  } catch (error) {
    console.error('[RETURN API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}