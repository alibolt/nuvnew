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
    const { businessProfileId, enableBusinessProfile, autoSyncInfo, autoPostUpdates, businessInfo } = body;

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
        businessProfileId,
        enableBusinessProfile
      }
    });

    // Update store info if provided
    if (businessInfo) {
      await prisma.store.update({
        where: { id: store.id },
        data: {
          name: businessInfo.name || store.name,
          description: businessInfo.description || store.description,
          phone: businessInfo.phone || store.phone,
          address: businessInfo.address || store.address
        }
      });
    }

    // Store additional settings in app install
    const googleApp = await prisma.app.findUnique({
      where: { code: 'google-integration' }
    });

    if (googleApp) {
      const appInstall = await prisma.appInstall.findUnique({
        where: {
          storeId_appId: {
            storeId: store.id,
            appId: googleApp.id
          }
        }
      });

      if (appInstall) {
        const currentSettings = (appInstall.settings as any) || {};
        await prisma.appInstall.update({
          where: { id: appInstall.id },
          data: {
            settings: {
              ...currentSettings,
              businessProfile: {
                autoSyncInfo,
                autoPostUpdates
              }
            }
          }
        });
      }
    }

    return apiResponse.success({ success: true, googleIntegration });
  } catch (error) {
    console.error('Business Profile configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to save Business Profile configuration' },
      { status: 500 }
    );
  }
}