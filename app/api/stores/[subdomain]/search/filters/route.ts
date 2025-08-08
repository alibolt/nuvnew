import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Get filter configuration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if Smart Search app is installed
    const smartSearchApp = await prisma.app.findUnique({
      where: { code: 'smart-search' }
    });

    if (!smartSearchApp) {
      return NextResponse.json({ 
        error: 'Smart Search app not found',
        filters: [],
        enabled: false 
      }, { status: 200 });
    }

    const appInstall = await prisma.appInstall.findUnique({
      where: {
        storeId_appId: {
          storeId: store.id,
          appId: smartSearchApp.id
        }
      }
    });

    if (!appInstall || appInstall.status !== 'active') {
      return NextResponse.json({ 
        error: 'Smart Search app not installed or inactive',
        filters: [],
        enabled: false 
      }, { status: 200 });
    }

    // Get search settings
    const searchSettings = await prisma.searchSettings.findUnique({
      where: {
        storeId: store.id
      }
    });

    const filterConfig = (searchSettings as any)?.filterConfiguration || {
      filters: [
        {
          id: 'price',
          name: 'Price Range',
          type: 'range',
          field: 'price',
          enabled: true,
          min: 0,
          max: 1000,
          step: 10
        },
        {
          id: 'category',
          name: 'Category',
          type: 'multiselect',
          field: 'category',
          enabled: true
        },
        {
          id: 'availability',
          name: 'In Stock',
          type: 'boolean',
          field: 'inStock',
          enabled: true
        }
      ],
      filterLayout: 'sidebar',
      filterPosition: 'left',
      showFilterCount: true,
      collapsibleFilters: true,
      stickyFilters: true
    };

    return NextResponse.json({
      ...filterConfig,
      enabled: searchSettings?.enableFacetedSearch ?? true,
      appInstalled: true
    });
  } catch (error) {
    console.error('Error fetching filter configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update filter configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if Smart Search app is installed
    const smartSearchApp = await prisma.app.findUnique({
      where: { code: 'smart-search' }
    });

    if (!smartSearchApp) {
      return apiResponse.badRequest('Smart Search app not found');
    }

    const appInstall = await prisma.appInstall.findUnique({
      where: {
        storeId_appId: {
          storeId: store.id,
          appId: smartSearchApp.id
        }
      }
    });

    if (!appInstall || appInstall.status !== 'active') {
      return apiResponse.badRequest('Smart Search app not installed or inactive');
    }

    // Update search settings with filter configuration
    const searchSettings = await prisma.searchSettings.upsert({
      where: {
        storeId: store.id
      },
      update: {
        filterConfiguration: body,
        updatedAt: new Date()
      },
      create: {
        storeId: store.id,
        filterConfiguration: body
      }
    });

    return NextResponse.json({ 
      message: 'Filter configuration updated successfully',
      filterConfiguration: body
    });
  } catch (error) {
    console.error('Error updating filter configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update filter configuration' },
      { status: 500 }
    );
  }
}