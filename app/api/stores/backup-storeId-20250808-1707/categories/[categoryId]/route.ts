import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  try {
    const { storeId, categoryId } = await params;
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
    
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        storeId 
      },
      include: {
        _count: {
          select: { 
            products: {
              where: isPublic ? { isActive: true } : undefined
            }
          }
        },
        template: true,
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, categoryId } = await params;
    
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

    // Check if slug already exists for this store (excluding current category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId,
        slug,
        id: { not: categoryId }
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description,
        image,
        templateId,
      },
      include: {
        template: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, categoryId } = await params;
    
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

    // Check if category has products
    const category = await prisma.category.findFirst({
      where: { id: categoryId, storeId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with products. Remove all products first.' 
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CATEGORIES API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}