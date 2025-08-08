import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/stores/[storeId]/collections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Get store and verify access
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        categories: {
          include: includeProducts ? {
            products: {
              include: {
                variants: {
                  include: {
                    images: true
                  }
                },
              },
              take: limit || 20,
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: { products: true }
            }
          } : {
            _count: {
              select: { products: true }
            }
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Format collections for API response
    const collections = store.categories.map(category => ({
      id: category.id,
      name: category.name,
      handle: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products,
      products: includeProducts ? (category as any).products : undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json(collections);

  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[storeId]/collections
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    const { name, handle, description, image } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Create collection
    const collection = await prisma.category.create({
      data: {
        name,
        slug: handle || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        image,
        storeId,
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    const formattedCollection = {
      id: collection.id,
      name: collection.name,
      handle: collection.slug,
      description: collection.description,
      image: collection.image,
      productCount: collection._count.products,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };

    return NextResponse.json(formattedCollection, { status: 201 });

  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}