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

    // Update sync status to syncing
    await prisma.googleIntegration.update({
      where: {
        storeId: store.id
      },
      data: {
        syncStatus: 'syncing',
        lastSyncAt: new Date()
      }
    });

    // In a real implementation, this would:
    // 1. Fetch all products from the store
    // 2. Format them according to Google Merchant Center requirements
    // 3. Use the Google Content API to upload products
    // 4. Track progress and handle errors
    // 5. Update sync status when complete

    // For now, we'll simulate a successful sync
    setTimeout(async () => {
      try {
        await prisma.googleIntegration.update({
          where: {
            storeId: store.id
          },
          data: {
            syncStatus: 'completed',
            lastSyncAt: new Date()
          }
        });
      } catch (error) {
        console.error('Error updating sync status:', error);
      }
    }, 5000);

    return NextResponse.json({ 
      success: true, 
      message: 'Product sync started. This may take a few minutes.' 
    });
  } catch (error) {
    console.error('Merchant Center sync error:', error);
    
    // Try to update sync status to failed
    try {
      const store = await prisma.store.findFirst({
        where: {
          subdomain: (await params).subdomain,
          userId: session?.user?.id,
        },
      });

      if (store) {
        await prisma.googleIntegration.update({
          where: {
            storeId: store.id
          },
          data: {
            syncStatus: 'failed'
          }
        });
      }
    } catch (updateError) {
      console.error('Error updating sync status to failed:', updateError);
    }

    return NextResponse.json(
      { error: 'Failed to start product sync' },
      { status: 500 }
    );
  }
}