import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/newsletter/subscribers/count
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await context.params;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
      select: { id: true }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get customers who accept marketing (newsletter subscribers)
    const count = await prisma.customer.count({
      where: {
        storeId: store.id,
        acceptsMarketing: true
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching subscribers count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers count' },
      { status: 500 }
    );
  }
}