import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/menus/by-handle/[handle]
// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string; handle: string }> }
) {
  try {
    const { subdomain, handle } = await context.params;
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });
    
    if (!store) {
      return apiResponse.notFound('Store not found');
    }
    
    // Get menu by handle
    const menu = await prisma.menu.findUnique({
      where: {
        storeId_handle: {
          storeId: store.id,
          handle
        }
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            children: {
              orderBy: { position: 'asc' },
              include: {
                children: {
                  orderBy: { position: 'asc' }
                }
              }
            }
          },
          where: {
            parentId: null
          }
        }
      }
    });

    if (!menu) {
      return apiResponse.notFound('Menu not found');
    }

    return apiResponse.success(menu);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch menu');
  }
}