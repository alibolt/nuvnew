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

    // Delete Google integration
    await prisma.googleIntegration.delete({
      where: {
        storeId: store.id
      }
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Google disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google account' },
      { status: 500 }
    );
  }
}