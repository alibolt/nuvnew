import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { subDays, format } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7days';

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();

    switch (timeRange) {
      case '30days':
        startDate = subDays(endDate, 30);
        break;
      case '90days':
        startDate = subDays(endDate, 90);
        break;
      case '12months':
        startDate = subDays(endDate, 365);
        break;
      default: // 7days
        startDate = subDays(endDate, 7);
    }

    // Get sales data over time
    const orders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        totalPrice: true,
        createdAt: true,
        status: true
      }
    });

    // Create an array of all dates in the range
    const allDates: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      allDates.push(format(currentDate, 'MMM dd'));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group sales by date
    const salesByDate = orders.reduce((acc: any, order) => {
      const date = format(order.createdAt, 'MMM dd');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.totalPrice / 100; // Convert from cents to dollars
      return acc;
    }, {});

    // Create sales data with all dates (including zero sales days)
    const salesData = allDates.map(date => ({
      date,
      revenue: salesByDate[date] || 0
    }));

    // Get top products
    const orderItems = await prisma.orderLineItem.findMany({
      where: {
        order: {
          storeId: store.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    // Group by product and count sales
    const productSales = orderItems.reduce((acc: any, item) => {
      const productName = item.product?.name || 'Unknown Product';
      if (!acc[productName]) {
        acc[productName] = 0;
      }
      acc[productName] += item.quantity;
      return acc;
    }, {});

    // Convert to array and sort by sales
    const topProducts = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a: any, b: any) => b.sales - a.sales)
      .slice(0, 5);

    // Get orders by status
    const ordersByStatusData = orders.reduce((acc: any, order) => {
      const status = order.status.charAt(0).toUpperCase() + order.status.slice(1);
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});

    const ordersByStatus = Object.entries(ordersByStatusData).map(([name, value]) => ({
      name,
      value
    }));

    return NextResponse.json({
      salesData,
      topProducts,
      ordersByStatus
    });

  } catch (error) {
    console.error('[ANALYTICS API] Error:', error);
    return apiResponse.serverError();
  }
}