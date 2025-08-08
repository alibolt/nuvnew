import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[storeId]/menus/by-handle/[handle]
// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeId: string; handle: string }> }
) {
  try {
    const { storeId, handle } = await context.params;
    
    // Get menu by handle
    const menu = await prisma.menu.findUnique({
      where: {
        storeId_handle: {
          storeId,
          handle
        }
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
    console.error('Error fetching menu by handle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}