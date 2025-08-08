import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/menus
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const session = await requireAuth();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get all menus with items (3 levels deep)
    const menus = await prisma.menu.findMany({
      where: { storeId: store.id },
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
            parentId: null // Only get top-level items
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return apiResponse.success(menus);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch menus');
  }
}

// POST /api/stores/[subdomain]/menus
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const session = await requireAuth();
    const data = await request.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Create menu and items in a transaction
    const menu = await prisma.$transaction(async (tx) => {
      // Create menu first
      const newMenu = await tx.menu.create({
        data: {
          name: data.name,
          handle: data.handle,
          storeId: store.id
        }
      });

      // Create menu items with parent-child relationships
      const createMenuItems = async (items: any[], parentId: string | null = null) => {
        for (const [index, item] of items.entries()) {
          const createdItem = await tx.menuItem.create({
            data: {
              label: item.label,
              link: item.link,
              target: item.target || '_self',
              position: index,
              menuId: newMenu.id,
              parentId: parentId
            }
          });

          // Recursively create children if they exist
          if (item.children && item.children.length > 0) {
            await createMenuItems(item.children, createdItem.id);
          }
        }
      };

      // Create all menu items
      if (data.items && data.items.length > 0) {
        await createMenuItems(data.items);
      }

      return newMenu;
    });

    // Return menu with items (3 levels deep)
    const menuWithItems = await prisma.menu.findUnique({
      where: { id: menu.id },
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

    return apiResponse.success(menuWithItems);
  } catch (error) {
    return handleApiError(error, 'Failed to create menu');
  }
}