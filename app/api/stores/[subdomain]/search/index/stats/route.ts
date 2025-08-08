import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Get store
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get index statistics
    const [products, collections, pages, blogPosts, totalDocuments] = await Promise.all([
      prisma.searchIndex.count({
        where: {
          storeId: store.id,
          entityType: 'product'
        }
      }),
      prisma.searchIndex.count({
        where: {
          storeId: store.id,
          entityType: 'collection'
        }
      }),
      prisma.searchIndex.count({
        where: {
          storeId: store.id,
          entityType: 'page'
        }
      }),
      prisma.searchIndex.count({
        where: {
          storeId: store.id,
          entityType: 'blog_post'
        }
      }),
      prisma.searchIndex.count({
        where: {
          storeId: store.id
        }
      })
    ]);

    // Get last indexed date
    const lastIndexedDoc = await prisma.searchIndex.findFirst({
      where: {
        storeId: store.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        updatedAt: true
      }
    });

    // Calculate approximate index size
    const indexSize = totalDocuments > 0 
      ? `${Math.round(totalDocuments * 2.5)} KB` // Rough estimate
      : '0 KB';

    return NextResponse.json({
      products,
      collections,
      pages,
      blogPosts,
      totalDocuments,
      lastIndexed: lastIndexedDoc?.updatedAt || null,
      indexSize
    });
  } catch (error) {
    console.error('Error fetching index stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch index statistics' },
      { status: 500 }
    );
  }
}