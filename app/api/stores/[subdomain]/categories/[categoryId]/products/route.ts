import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { CollectionMatcher } from '@/lib/services/collection-matcher';
import { CollectionRules } from '@/types/collection';

// GET - Get products in a category/collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; categoryId: string }> }
) {
  try {
    const { subdomain, categoryId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const exclude = searchParams.get('exclude'); // Product ID to exclude
    
    // Get store
    const store = await prisma.store.findFirst({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get category with type and conditions
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        storeId: store.id 
      }
    });

    if (!category) {
      return apiResponse.notFound('Category ');
    }

    let products;
    let total;

    if (category.type === 'automatic' && category.conditions) {
      // For automatic collections, get all products and filter by conditions
      const allProducts = await prisma.product.findMany({
        where: { 
          storeId: store.id,
          isActive: true,
          ...(exclude && { id: { not: exclude } })
        },
        include: {
          variants: true
        }
      });

      // Filter products based on conditions
      const rules = category.conditions as CollectionRules;
      const matchedProducts = allProducts.filter(product => 
        CollectionMatcher.matchesRules(product as any, rules)
      );

      // Sort products
      const sortedProducts = CollectionMatcher.sortProducts(
        matchedProducts as any, 
        category.sortOrder || 'manual'
      );

      // Paginate
      total = sortedProducts.length;
      products = sortedProducts.slice(skip, skip + limit);

    } else {
      // For manual collections, get products directly
      const result = await prisma.product.findMany({
        where: { 
          categoryId,
          storeId: store.id,
          isActive: true,
          ...(exclude && { id: { not: exclude } })
        },
        include: {
          variants: true
        },
        skip,
        take: limit,
        orderBy: getOrderBy(category.sortOrder || 'manual')
      });

      const totalResult = await prisma.product.count({
        where: { 
          categoryId,
          storeId: store.id,
          isActive: true,
          ...(exclude && { id: { not: exclude } })
        }
      });

      products = result;
      total = totalResult;
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('[CATEGORY PRODUCTS API] Error:', error);
    console.error('[CATEGORY PRODUCTS API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch category products',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      }, 
      { status: 500 }
    );
  }
}

// Helper function to get Prisma orderBy clause
function getOrderBy(sortOrder: string) {
  switch (sortOrder) {
    case 'title-asc':
      return { name: 'asc' };
    case 'title-desc':
      return { name: 'desc' };
    case 'created-desc':
      return { createdAt: 'desc' };
    case 'created-asc':
      return { createdAt: 'asc' };
    default:
      return { createdAt: 'desc' };
  }
}