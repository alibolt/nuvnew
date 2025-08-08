import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/products/bestsellers
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');
    const period = searchParams.get('period') || '30'; // days
    
    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get bestselling products based on order items
    const bestsellers = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.images,
        p.productType,
        p.isActive,
        p.tags,
        p.metaTitle,
        p.metaDescription,
        p.categoryId,
        p.createdAt,
        p.updatedAt,
        SUM(oi.quantity) as totalSold,
        COUNT(DISTINCT oi.orderId) as orderCount
      FROM "Product" p
      INNER JOIN "ProductVariant" pv ON pv.productId = p.id
      INNER JOIN "OrderItem" oi ON oi.variantId = pv.id
      INNER JOIN "Order" o ON o.id = oi.orderId
      WHERE p.storeId = ${store.id}
        AND p.isActive = true
        AND o.createdAt >= ${startDate}
        AND o.status NOT IN ('cancelled', 'refunded')
      GROUP BY p.id
      ORDER BY totalSold DESC
      LIMIT ${limit}
    `;

    // If no bestsellers found, get featured products as fallback
    if (!bestsellers || (bestsellers as any[]).length === 0) {
      const featuredProducts = await prisma.product.findMany({
        where: {
          storeId: store.id,
          isActive: true
        },
        include: {
          category: true,
          variants: {
            include: {
              images: true
            },
            orderBy: {
              price: 'asc'
            }
          },
          reviews: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return NextResponse.json({
        products: featuredProducts,
        isFallback: true
      });
    }

    // Get full product data for bestsellers
    const productIds = (bestsellers as any[]).map(p => p.id);
    const fullProducts = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      include: {
        category: true,
        variants: {
          include: {
            images: true
          },
          orderBy: {
            price: 'asc'
          }
        },
        reviews: true
      }
    });

    // Sort by bestseller order and add sales data
    const sortedProducts = productIds.map(id => {
      const product = fullProducts.find(p => p.id === id);
      const salesData = (bestsellers as any[]).find(b => b.id === id);
      return {
        ...product,
        totalSold: salesData?.totalSold || 0,
        orderCount: salesData?.orderCount || 0
      };
    });

    return NextResponse.json({
      products: sortedProducts,
      period: period,
      isFallback: false
    });
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bestsellers' },
      { status: 500 }
    );
  }
}