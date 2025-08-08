import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Get store
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get all products
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true
      }
    });

    // Get search index entries
    const searchIndexEntries = await prisma.searchIndex.findMany({
      where: {
        storeId: store.id,
        entityType: 'product'
      },
      select: {
        entityId: true,
        title: true,
        isActive: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      store: {
        id: store.id,
        subdomain: store.subdomain,
        name: store.name
      },
      products: {
        count: products.length,
        items: products
      },
      searchIndex: {
        count: searchIndexEntries.length,
        items: searchIndexEntries
      },
      summary: {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        indexedProducts: searchIndexEntries.length,
        needsIndexing: products.length - searchIndexEntries.length
      }
    });
  } catch (error) {
    console.error('Search test error:', error);
    return NextResponse.json(
      { error: 'Failed to run search test' },
      { status: 500 }
    );
  }
}