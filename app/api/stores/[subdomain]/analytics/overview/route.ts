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

    // Get overall stats
    const [totalOrders, totalCustomers, totalProducts, ordersInPeriod] = await Promise.all([
      prisma.order.count({
        where: { storeId: store.id },
      }),
      prisma.customer.count({
        where: { storeId: store.id },
      }),
      prisma.product.count({
        where: { storeId: store.id },
      }),
      prisma.order.findMany({
        where: {
          storeId: store.id,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          totalPrice: true,
          createdAt: true,
          status: true,
        },
      }),
    ]);

    // Calculate revenue and stats for the period
    const totalRevenue = ordersInPeriod.reduce((sum, order) => sum + order.totalPrice, 0);
    const averageOrderValue = ordersInPeriod.length > 0 ? totalRevenue / ordersInPeriod.length : 0;

    // Get previous period data for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - parseInt(period));

    const previousOrders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const orderCountChange = previousOrders.length > 0
      ? ((ordersInPeriod.length - previousOrders.length) / previousOrders.length) * 100
      : 0;

    // Order status breakdown
    const orderStatusBreakdown = ordersInPeriod.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group orders by date for chart data
    const salesByDate = ordersInPeriod.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.totalPrice;
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; orders: number }>);

    // Fill in missing dates with zero values
    const salesChartData = [];
    const currentDate = new Date(startDate);
    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0];
      salesChartData.push(
        salesByDate[dateStr] || { date: dateStr, revenue: 0, orders: 0 }
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Recent orders for activity feed
    const recentOrders = await prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalPrice: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      overview: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        averageOrderValue,
        revenueChange,
        orderCountChange,
        ordersInPeriod: ordersInPeriod.length,
      },
      charts: {
        salesOverTime: salesChartData,
        orderStatusBreakdown: Object.entries(orderStatusBreakdown).map(([status, count]) => ({
          status,
          count,
          percentage: ((count / ordersInPeriod.length) * 100).toFixed(1),
        })),
      },
      recentActivity: {
        orders: recentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return apiResponse.serverError();
  }
}