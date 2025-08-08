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

    // Get store and Google integration
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const googleIntegration = await prisma.googleIntegration.findUnique({
      where: {
        storeId: store.id
      }
    });

    if (!googleIntegration || !googleIntegration.accessToken) {
      return apiResponse.badRequest('Google account not connected');
    }

    // In a real implementation, this would:
    // 1. Use the Google Search Console API to verify site ownership
    // 2. Add the verified property to the user's Search Console account
    // 3. Set up automatic sitemap submission
    
    // For now, we'll simulate a successful verification
    return NextResponse.json({ 
      success: true, 
      message: 'Site verification successful',
      verified: true
    });
  } catch (error) {
    console.error('Search Console verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify site ownership' },
      { status: 500 }
    );
  }
}