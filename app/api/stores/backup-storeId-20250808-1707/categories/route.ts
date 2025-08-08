import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - List categories for a store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    
    // For public access, don't require authentication
    const session = await getServerSession(authOptions);
    if (!isPublic && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For admin access, verify store ownership
    if (!isPublic && session?.user?.id) {
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.user.id,
        },
      });

      if (!store) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 });
      }
    }
    
    const categories = await prisma.category.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { 
            products: {
              where: isPublic ? { isActive: true } : undefined
            }
          }
        },
        template: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create a new category
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
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, image, templateId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists for this store
    const existingCategory = await prisma.category.findUnique({
      where: {
        storeId_slug: {
          storeId,
          slug
        }
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        storeId,
        templateId,
      },
      include: {
        template: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('[CATEGORIES API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}