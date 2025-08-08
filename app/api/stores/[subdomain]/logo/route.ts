import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Get current store logo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Find the store
    const store = await prisma.store.findFirst({
      where: { subdomain },
      include: { storeSettings: true }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get logo from multiple sources
    const logoSources = {
      // 1. Direct store logo field
      storeLogo: store.logo,
      
      // 2. Media library logos
      mediaLibraryLogos: [] as any[],
      
      // 3. Header section logo settings
      headerLogos: [] as any[]
    };

    // Get media library logos
    if ((store.storeSettings as any)?.mediaLibrary) {
      let mediaLibrary: any[] = [];
      const storeSettingsMediaLibrary = (store.storeSettings as any).mediaLibrary;
      
      // Parse mediaLibrary - it's stored as JSON string
      try {
        if (typeof storeSettingsMediaLibrary === 'string') {
          mediaLibrary = JSON.parse(storeSettingsMediaLibrary) || [];
        } else if (Array.isArray(storeSettingsMediaLibrary)) {
          mediaLibrary = storeSettingsMediaLibrary;
        }
      } catch (error) {
        console.error('Failed to parse mediaLibrary:', error);
        mediaLibrary = [];
      }
      
      logoSources.mediaLibraryLogos = mediaLibrary.filter(file => 
        file.metadata?.folder === 'logos' || 
        file.fileName?.toLowerCase().includes('logo') ||
        file.context === 'theme'
      );
    }

    // Get header section logos
    const headerSections = await prisma.storeSectionInstance.findMany({
      where: {
        template: {
          storeId: store.id
        },
        sectionType: 'header'
      }
    });

    logoSources.headerLogos = headerSections
      .map(section => section.settings)
      .filter(settings => (settings as any)?.logo_image || (settings as any)?.src);

    // Priority: Most recent media library logo > header settings > store logo
    let primaryLogo = null;
    if (logoSources.mediaLibraryLogos.length > 0) {
      // Get most recent logo from media library
      const sortedLogos = logoSources.mediaLibraryLogos.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      primaryLogo = sortedLogos[0];
    } else if (logoSources.headerLogos.length > 0) {
      // Get logo from header settings
      const headerLogo = logoSources.headerLogos[0];
      primaryLogo = {
        fileUrl: headerLogo.logo_image || headerLogo.src,
        source: 'header'
      };
    } else if (logoSources.storeLogo) {
      // Fallback to store logo
      primaryLogo = {
        fileUrl: logoSources.storeLogo,
        source: 'store'
      };
    }

    return NextResponse.json({
      primaryLogo,
      logoSources,
      store: {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain
      }
    });

  } catch (error) {
    console.error('Error getting store logo:', error);
    return apiResponse.serverError();
  }
}

// POST - Set store logo
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
    const { logoUrl, source = 'upload' } = await request.json();

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

    // Update store logo
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: { logo: logoUrl }
    });

    // Also update all header sections to use this logo
    const headerSections = await prisma.storeSectionInstance.findMany({
      where: {
        template: {
          storeId: store.id
        },
        sectionType: 'header'
      }
    });

    // Update each header section with the new logo
    for (const section of headerSections) {
      const currentSettings = section.settings as any || {};
      await prisma.storeSectionInstance.update({
        where: { id: section.id },
        data: {
          settings: {
            ...currentSettings,
            logo_image: logoUrl
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        logo: updatedStore.logo
      }
    });

  } catch (error) {
    console.error('Error setting store logo:', error);
    return apiResponse.serverError();
  }
}