import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { apiResponse } from '@/lib/api/response';

// GET - List categories for a store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Check if request is from public (storefront) or authenticated
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
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
    return apiResponse.serverError();
  }
}

// POST - Create a new category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }
    
    // Get store and verify ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id
      }
    });
    
    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    const body = await request.json();
    console.log('[CATEGORIES API] POST body:', body);
    const { name, description, image, templateId, type = 'manual', sortOrder = 'manual', conditions, productIds, isActive = true } = body;

    if (!name) {
      return apiResponse.error('Name is required', 400);
    }

    // Validate collection type
    if (!['manual', 'automatic'].includes(type)) {
      return apiResponse.error('Invalid collection type', 400);
    }

    // Generate slug from name
    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists for this store
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId: store.id,
        slug
      }
    });

    if (existingCategory) {
      return apiResponse.error('Category with this name already exists', 400);
    }

    // Prepare conditions data for automatic collections
    let conditionsData = null;
    if (type === 'automatic' && conditions && conditions.length > 0) {
      conditionsData = { groups: conditions };
    }

    // Create category without templateId if not provided
    const categoryData: any = {
      name,
      slug,
      description: description || null,
      image: image || null,
      storeId: store.id,
      type,
      sortOrder,
      conditions: conditionsData,
      isActive,
    };

    // Only add templateId if it's provided and not empty
    if (templateId && templateId.trim() !== '') {
      categoryData.templateId = templateId;
    }

    const category = await prisma.category.create({
      data: categoryData,
      include: {
        template: true,
        _count: {
          select: { products: true }
        }
      }
    });

    // If manual collection and products are provided, update products
    if (type === 'manual' && productIds && productIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          storeId: store.id
        },
        data: {
          categoryId: category.id
        }
      });
    }

    // Return category with updated product count
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id: category.id },
      include: {
        template: true,
        _count: {
          select: { products: true }
        }
      }
    });

    // TODO: Trigger search index update when search service is ready

    return NextResponse.json(categoryWithProducts, { status: 201 });
  } catch (error) {
    console.error('[CATEGORIES API] POST Error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      return apiResponse.error(error.message, 500);
    }
    return apiResponse.serverError();
  }
}