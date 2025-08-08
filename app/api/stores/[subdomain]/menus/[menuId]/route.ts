import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/menus/[menuId]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string; menuId: string }> }
) {
  try {
    const { subdomain, menuId } = await context.params;
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });
    
    if (!store) {
      return apiResponse.notFound('Store ');
    }
    
    // Get menu with items (3 levels deep)
    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        storeId: store.id
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
      return apiResponse.notFound('Menu ');
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return handleApiError(error, 'MENU_FETCH');
  }
}

// PUT /api/stores/[subdomain]/menus/[menuId]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string; menuId: string }> }
) {
  try {
    const { subdomain, menuId } = await context.params;
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
      return apiResponse.notFound('Store ');
    }

    // Update menu and recreate items
    await prisma.$transaction(async (tx) => {
      // Delete existing menu items
      await tx.menuItem.deleteMany({
        where: { menuId }
      });

      // Update menu
      await tx.menu.update({
        where: { id: menuId },
        data: {
          name: data.name
        }
      });

      // Create new items with parent-child relationships
      const createMenuItems = async (items: any[], parentId: string | null = null) => {
        for (const [index, item] of items.entries()) {
          const createdItem = await tx.menuItem.create({
            data: {
              label: item.label,
              link: item.link,
              target: item.target || '_self',
              position: index,
              menuId: menuId,
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
    });

    // Return updated menu (3 levels deep)
    const updatedMenu = await prisma.menu.findUnique({
      where: { id: menuId },
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

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error('Error updating menu:', error);
    return handleApiError(error, 'MENU_UPDATE');
  }
}

// DELETE /api/stores/[subdomain]/menus/[menuId]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string; menuId: string }> }
) {
  try {
    const { subdomain, menuId } = await context.params;
    const session = await requireAuth();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Delete menu (cascade will delete items)
    await prisma.menu.delete({
      where: { id: menuId }
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return handleApiError(error, 'MENU_DELETE');
  }
}