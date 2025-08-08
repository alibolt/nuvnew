import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { LogoSyncService } from '@/lib/services/logo-sync-service';
import { prisma } from '@/lib/prisma';

// GET - Debug logo storage and sync status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Find the store
    const store = await prisma.store.findFirst({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get logo status
    const logoStatus = await LogoSyncService.getLogoStatus(store.id);

    return NextResponse.json({
      message: 'Logo debug information',
      subdomain,
      logoStatus,
      debugInfo: {
        timestamp: new Date().toISOString(),
        storeId: store.id,
        storeName: store.name
      }
    });

  } catch (error) {
    console.error('Error in logo debug:', error);
    return apiResponse.serverError();
  }
}

// POST - Auto-fix logo inconsistencies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { action } = await request.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    let result;
    switch (action) {
      case 'auto-fix':
        result = await LogoSyncService.autoFixLogo(store.id);
        break;
      
      case 'sync':
        const { logoUrl } = await request.json();
        if (!logoUrl) {
          return apiResponse.badRequest('logoUrl is required for sync action');
        }
        result = await LogoSyncService.syncLogo(store.id, logoUrl);
        break;
      
      default:
        return apiResponse.badRequest('Invalid action');
    }

    return NextResponse.json({
      message: 'Logo debug action completed',
      action,
      result
    });

  } catch (error) {
    console.error('Error in logo debug action:', error);
    return apiResponse.serverError();
  }
}