import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, orderId } = await params;
    
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

    // Get order with all related data
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      },
      include: {
        lineItems: {
          orderBy: { position: 'asc' }
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            acceptsMarketing: true,
            ordersCount: true,
            totalSpent: true,
            createdAt: true
          }
        }
      }
    });

    if (!order) {
      return apiResponse.notFound('Order ');
    }

    return apiResponse.success(order);
  } catch (error) {
    console.error('[ORDER DETAIL API] GET Error:', error);
    return apiResponse.serverError();
  }
}