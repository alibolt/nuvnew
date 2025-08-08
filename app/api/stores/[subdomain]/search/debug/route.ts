import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    
    // Get store
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Test basic search
    const searchConditions = {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } }
      ]
    };

    let productWhere: any = {
      storeId: store.id,
      isActive: true,
      ...searchConditions
    };

    // Try to find products
    const products = await prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        isActive: true,
        description: true
      },
      take: 10
    });

    // Also try without search conditions
    const allActiveProducts = await prisma.product.findMany({
      where: {
        storeId: store.id,
        isActive: true
      },
      select: {
        id: true,
        name: true
      },
      take: 5
    });

    // Test direct name search
    const directSearch = await prisma.product.findMany({
      where: {
        storeId: store.id,
        isActive: true,
        name: {
          contains: query
        }
      },
      select: {
        id: true,
        name: true
      },
      take: 5
    });

    return NextResponse.json({
      debug: {
        query,
        storeId: store.id,
        searchConditions,
        productWhere,
        foundProducts: products.length,
        products: products,
        allActiveProductsSample: allActiveProducts,
        directSearchResults: directSearch
      }
    });
  } catch (error: any) {
    console.error('Debug search error:', error);
    return NextResponse.json(
      { 
        error: 'Debug search failed',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}