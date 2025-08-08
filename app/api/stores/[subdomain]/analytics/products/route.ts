import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    startDate.setHours(0, 0, 0, 0);

    // Get all products with their order data
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: {
        variants: {
          include: {
            orderLineItems: {
              where: {
                order: {
                  createdAt: {
                    gte: startDate,
                  },
                },
              },
              include: {
                order: true,
              },
            },
          },
        },
        category: true,
      },
    });

    // Calculate product performance metrics
    const productMetrics = products.map((product) => {
      const orderLineItems = product.variants.flatMap(v => v.orderLineItems);
      const totalQuantity = orderLineItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = orderLineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const uniqueOrders = new Set(orderLineItems.map(item => item.order.id)).size;

      // Calculate stock levels
      const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const stockValue = product.variants.reduce((sum, v) => sum + ((v.stock || 0) * v.price), 0);

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        imageUrl: Array.isArray(product.images) && product.images.length > 0 ? (product.images as string[])[0] : null,
        totalQuantitySold: totalQuantity,
        totalRevenue,
        uniqueOrders,
        averageOrderValue: uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0,
        currentStock: totalStock,
        stockValue,
        lowStock: totalStock < 10,
        outOfStock: totalStock === 0,
        variants: product.variants.length,
      };
    });

    // Sort by revenue (best sellers)
    const bestSellers = productMetrics
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Low stock products
    const lowStockProducts = productMetrics
      .filter(p => p.lowStock && !p.outOfStock)
      .sort((a, b) => a.currentStock - b.currentStock);

    // Out of stock products
    const outOfStockProducts = productMetrics.filter(p => p.outOfStock);

    // Category performance
    const categoryPerformance = productMetrics.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          category: product.category,
          products: 0,
          revenue: 0,
          quantitySold: 0,
        };
      }
      acc[product.category].products += 1;
      acc[product.category].revenue += product.totalRevenue;
      acc[product.category].quantitySold += product.totalQuantitySold;
      return acc;
    }, {} as Record<string, any>);

    // Inventory value
    const totalInventoryValue = productMetrics.reduce((sum, p) => sum + p.stockValue, 0);
    const totalStockUnits = productMetrics.reduce((sum, p) => sum + p.currentStock, 0);

    // Products added in period
    const newProducts = await prisma.product.count({
      where: {
        storeId: store.id,
        createdAt: {
          gte: startDate,
        },
      },
    });

    return NextResponse.json({
      summary: {
        totalProducts: products.length,
        totalInventoryValue,
        totalStockUnits,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        newProductsInPeriod: newProducts,
      },
      bestSellers,
      lowStockProducts,
      outOfStockProducts,
      categoryPerformance: Object.values(categoryPerformance).sort(
        (a: any, b: any) => b.revenue - a.revenue
      ),
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return apiResponse.serverError();
  }
}