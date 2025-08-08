import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[storeId]/menus
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;
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

    // Get all menus with items
    const menus = await prisma.menu.findMany({
      where: { storeId },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            children: {
              orderBy: { position: 'asc' }
            }
          },
          where: {
            parentId: null // Only get top-level items
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[storeId]/menus
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;
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

    // Create menu
    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        handle: data.handle,
        storeId,
        items: {
          create: data.items?.map((item: any, index: number) => ({
            label: item.label,
            link: item.link,
            position: index
          })) || []
        }
      },
      include: {
        items: {
          orderBy: { position: 'asc' }
        }
      }
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}