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
    const { adsAccountId, enableAds, conversionSettings } = body;

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
        adsAccountId,
        enableAds
      }
    });

    // Store conversion settings in the app install data
    if (conversionSettings) {
      const googleApp = await prisma.app.findUnique({
        where: { code: 'google-integration' }
      });

      if (googleApp) {
        await prisma.appInstall.update({
          where: {
            storeId_appId: {
              storeId: store.id,
              appId: googleApp.id
            }
          },
          data: {
            settings: {
              conversionSettings
            }
          }
        });
      }
    }

    return apiResponse.success({ success: true, googleIntegration });
  } catch (error) {
    console.error('Google Ads configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to save Google Ads configuration' },
      { status: 500 }
    );
  }
}