import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    startDate.setHours(0, 0, 0, 0);

    // Get customers with their order data
    const customers = await prisma.customer.findMany({
      where: { storeId },
      include: {
        orders: {
          select: {
            totalPrice: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });

    // Calculate customer metrics
    const customerMetrics = customers.map((customer) => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const orderCount = customer.orders.length;
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
      const lastOrderDate = customer.orders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt || null;

      // Calculate if customer is new (created in current period)
      const isNewCustomer = customer.createdAt >= startDate;

      return {
        id: customer.id,
        email: customer.email,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'No name',
        totalSpent,
        orderCount,
        averageOrderValue,
        lastOrderDate,
        isNewCustomer,
        createdAt: customer.createdAt,
        status: customer.status,
        acceptsMarketing: customer.acceptsMarketing,
      };
    });

    // Top customers by revenue
    const topCustomers = customerMetrics
      .filter(c => c.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // New customers in period
    const newCustomers = customerMetrics.filter(c => c.isNewCustomer);

    // Customer segments
    const segments = {
      vip: customerMetrics.filter(c => c.totalSpent >= 1000),
      regular: customerMetrics.filter(c => c.totalSpent >= 100 && c.totalSpent < 1000),
      occasional: customerMetrics.filter(c => c.totalSpent > 0 && c.totalSpent < 100),
      inactive: customerMetrics.filter(c => c.totalSpent === 0),
    };

    // Customer growth chart data
    const customersByDate = customers.reduce((acc, customer) => {
      const date = customer.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate cumulative customer count
    let cumulativeCount = 0;
    const customerGrowthData = Object.entries(customersByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => {
        cumulativeCount += count;
        return { date, newCustomers: count, totalCustomers: cumulativeCount };
      })
      .filter(item => new Date(item.date) >= startDate);

    // Marketing consent stats
    const acceptsMarketingCount = customers.filter(c => c.acceptsMarketing).length;
    const marketingConsentRate = customers.length > 0 
      ? (acceptsMarketingCount / customers.length) * 100 
      : 0;

    // Geographic distribution (if address data exists)
    const geographicDistribution = customers.reduce((acc, customer) => {
      const addresses = customer.addresses as any[] || [];
      const location = addresses.length > 0 ? addresses[0]?.country || 'Unknown' : 'Unknown';
      if (!acc[location]) {
        acc[location] = { location, count: 0, revenue: 0 };
      }
      acc[location].count += 1;
      acc[location].revenue += customerMetrics.find(m => m.id === customer.id)?.totalSpent || 0;
      return acc;
    }, {} as Record<string, any>);

    // Customer lifetime value distribution
    const lifetimeValueRanges = {
      '$0-$50': customerMetrics.filter(c => c.totalSpent >= 0 && c.totalSpent < 50).length,
      '$50-$100': customerMetrics.filter(c => c.totalSpent >= 50 && c.totalSpent < 100).length,
      '$100-$500': customerMetrics.filter(c => c.totalSpent >= 100 && c.totalSpent < 500).length,
      '$500-$1000': customerMetrics.filter(c => c.totalSpent >= 500 && c.totalSpent < 1000).length,
      '$1000+': customerMetrics.filter(c => c.totalSpent >= 1000).length,
    };

    return NextResponse.json({
      summary: {
        totalCustomers: customers.length,
        newCustomersInPeriod: newCustomers.length,
        acceptsMarketingCount,
        marketingConsentRate,
        averageLifetimeValue: customerMetrics.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0,
      },
      segments: {
        vip: { count: segments.vip.length, percentage: (segments.vip.length / customers.length) * 100 || 0 },
        regular: { count: segments.regular.length, percentage: (segments.regular.length / customers.length) * 100 || 0 },
        occasional: { count: segments.occasional.length, percentage: (segments.occasional.length / customers.length) * 100 || 0 },
        inactive: { count: segments.inactive.length, percentage: (segments.inactive.length / customers.length) * 100 || 0 },
      },
      topCustomers,
      customerGrowthData,
      geographicDistribution: Object.values(geographicDistribution).sort(
        (a: any, b: any) => b.count - a.count
      ),
      lifetimeValueRanges,
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}