import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { triggerSearchIndexUpdate } from '@/lib/services/search-index-trigger';

// GET - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; categoryId: string }> }
) {
  try {
    const { subdomain, categoryId } = await params;
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    
    // For public access, don't require authentication
    const session = await getServerSession(authOptions);
    if (!isPublic && !session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Get store for both public and admin access
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        ...(!isPublic && session?.user?.id ? { userId: session.user.id } : {})
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }
    
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        storeId: store.id
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
        // Include products for manual collections when not public (admin editing)
        products: !isPublic && store ? {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            variants: {
              take: 1,
              select: { price: true }
            }
          }
        } : false,
      }
    });

    if (!category) {
      return apiResponse.notFound('Category ');
    }

    // Transform the response to match what the category block expects
    const response = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products,
      template: category.template,
      type: category.type,
      sortOrder: category.sortOrder,
      conditions: category.conditions,
      isActive: category.isActive,
      // Include products for manual collections during admin editing
      products: !isPublic && category.products ? category.products : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    const { subdomain, categoryId } = await params;
    console.error('[CATEGORIES API] GET Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      subdomain,
      categoryId
    });
    return apiResponse.serverError();
  }
}

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, categoryId } = await params;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, image, templateId, type, sortOrder, conditions, productIds, isActive, slug: providedSlug } = body;

    if (!name) {
      return apiResponse.badRequest('Name is required');
    }

    // Validate collection type if provided
    if (type && !['manual', 'automatic'].includes(type)) {
      return apiResponse.badRequest('Invalid collection type');
    }

    // Use provided slug or generate from name
    const slug = providedSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists for this store (excluding current category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId: store.id,
        slug,
        id: { not: categoryId }
      }
    });

    if (existingCategory) {
      return apiResponse.badRequest('Category with this name already exists');
    }

    // Prepare update data
    const updateData: any = {
      name,
      slug,
      description,
      image,
      templateId,
    };
    
    // Update isActive if provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Only update type and sortOrder if provided
    if (type !== undefined) {
      updateData.type = type;
    }
    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder;
    }

    // Prepare conditions data for automatic collections
    if (type === 'automatic' && conditions !== undefined) {
      updateData.conditions = conditions && conditions.length > 0 ? { groups: conditions } : null;
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        template: true,
        _count: {
          select: { products: true }
        }
      }
    });

    // Handle product assignments for manual collections
    if (type === 'manual' && productIds !== undefined) {
      // First, remove all products from this category
      await prisma.product.updateMany({
        where: { categoryId },
        data: { categoryId: null }
      });

      // Then assign the selected products
      if (productIds.length > 0) {
        await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            storeId: store.id
          },
          data: { categoryId }
        });
      }
    }

    // Return category with updated product info
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        template: true,
        products: type === 'manual' ? {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true
          }
        } : false,
        _count: {
          select: { products: true }
        }
      }
    });

    // Trigger search index update
    try {
      await triggerSearchIndexUpdate(store.id, 'collection', categoryId, 'update');
    } catch (error) {
      console.error('[CATEGORIES API] Search index update error:', error);
      // Don't fail the request if search indexing fails
    }

    return NextResponse.json(categoryWithProducts);
  } catch (error) {
    console.error('[CATEGORIES API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, categoryId } = await params;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    // Check if category has products
    const category = await prisma.category.findFirst({
      where: { id: categoryId, storeId: store.id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return apiResponse.notFound('Category ');
    }

    if (category._count.products > 0) {
      return apiResponse.badRequest('Cannot delete category with products. Remove all products first.');
    }

    // Trigger search index removal before deleting
    try {
      await triggerSearchIndexUpdate(store.id, 'collection', categoryId, 'delete');
    } catch (error) {
      console.error('[CATEGORIES API] Search index removal error:', error);
      // Don't fail the request if search indexing fails
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('[CATEGORIES API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}