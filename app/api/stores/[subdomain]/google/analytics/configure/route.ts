import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const body = await req.json();
    const { analyticsPropertyId, analyticsStreamId, enableAnalytics } = body;

    // Get store
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Update Google integration
    const googleIntegration = await prisma.googleIntegration.update({
      where: {
        storeId: store.id
      },
      data: {
        analyticsPropertyId,
        analyticsStreamId,
        enableAnalytics
      }
    });

    return apiResponse.success({ success: true, googleIntegration });
  } catch (error) {
    console.error('Google Analytics configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to save Google Analytics configuration' },
      { status: 500 }
    );
  }
}