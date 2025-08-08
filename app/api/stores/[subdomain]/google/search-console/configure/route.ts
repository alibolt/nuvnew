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
    const { searchConsoleUrl, enableSearchConsole } = body;

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
        searchConsoleUrl: searchConsoleUrl || `https://${store.subdomain}.nuvi.store`,
        enableSearchConsole
      }
    });

    return apiResponse.success({ success: true, googleIntegration });
  } catch (error) {
    console.error('Search Console configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to save Search Console configuration' },
      { status: 500 }
    );
  }
}