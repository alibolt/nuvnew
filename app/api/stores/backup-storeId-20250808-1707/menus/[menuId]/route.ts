import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[storeId]/menus/[menuId]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeId: string; menuId: string }> }
) {
  try {
    const { storeId, menuId } = await context.params;
    
    // Get menu with items (no auth required for public menus)
    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        storeId
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            children: {
              orderBy: { position: 'asc' }
            }
          },
          where: {
            parentId: null
          }
        }
      }
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[storeId]/menus/[menuId]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ storeId: string; menuId: string }> }
) {
  try {
    const { storeId, menuId } = await context.params;
    const session = await requireAuth();
    const data = await request.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Update menu and recreate items
    await prisma.$transaction(async (tx) => {
      // Delete existing menu items
      await tx.menuItem.deleteMany({
        where: { menuId }
      });

      // Update menu and create new items
      await tx.menu.update({
        where: { id: menuId },
        data: {
          name: data.name,
          items: {
            create: data.items?.map((item: any, index: number) => ({
              label: item.label,
              link: item.link,
              position: index,
              children: item.children ? {
                create: item.children.map((child: any, childIndex: number) => ({
                  label: child.label,
                  link: child.link,
                  position: childIndex
                }))
              } : undefined
            })) || []
          }
        }
      });
    });

    // Return updated menu
    const updatedMenu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            children: {
              orderBy: { position: 'asc' }
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
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[storeId]/menus/[menuId]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ storeId: string; menuId: string }> }
) {
  try {
    const { storeId, menuId } = await context.params;
    const session = await requireAuth();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Delete menu (cascade will delete items)
    await prisma.menu.delete({
      where: { id: menuId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}