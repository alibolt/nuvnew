import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for analytics query
const analyticsQuerySchema = z.object({
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  metrics: z.array(z.enum([
    'revenue', 'orders', 'customers', 'products', 'sessions', 'conversion_rate',
    'average_order_value', 'returning_customers', 'top_products', 'traffic_sources'
  ])).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  compare: z.object({
    enabled: z.boolean(),
    period: z.enum(['previous_period', 'previous_year'])
  }).optional()
});

// GET - Get analytics data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const dateRange = {
      start: searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: searchParams.get('end') || new Date().toISOString()
    };
    const metrics = searchParams.get('metrics')?.split(',') || ['revenue', 'orders', 'customers'];
    const granularity = searchParams.get('granularity') || 'day';

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Initialize response data
    const analyticsData: any = {
      dateRange: { start: startDate, end: endDate },
      granularity,
      metrics: {}
    };

    // Calculate revenue metrics
    if (metrics.includes('revenue')) {
      const revenueData = await prisma.order.aggregate({
        where: {
          storeId: store.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: { not: 'cancelled' }
        },
        _sum: {
          totalPrice: true
        },
        _count: {
          id: true
        }
      });

      analyticsData.metrics.revenue = {
        total: revenueData._sum.totalPrice || 0,
        orderCount: revenueData._count.id
      };
    }

    // Calculate order metrics
    if (metrics.includes('orders')) {
      const orderStats = await prisma.order.groupBy({
        by: ['status'],
        where: {
          storeId: store.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        _sum: {
          totalPrice: true
        }
      });

      analyticsData.metrics.orders = {
        total: orderStats.reduce((sum, stat) => sum + stat._count.id, 0),
        byStatus: orderStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count.id,
            revenue: stat._sum.totalPrice || 0
          };
          return acc;
        }, {} as any)
      };
    }

    // Calculate customer metrics
    if (metrics.includes('customers')) {
      const [totalCustomers, newCustomers, returningCustomers] = await Promise.all([
        prisma.customer.count({
          where: { storeId: store.id }
        }),
        prisma.customer.count({
          where: {
            storeId: store.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.customer.count({
          where: {
            storeId: store.id,
            ordersCount: { gt: 1 },
            lastOrderAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      analyticsData.metrics.customers = {
        total: totalCustomers,
        new: newCustomers,
        returning: returningCustomers,
        returnRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0
      };
    }

    // Calculate average order value
    if (metrics.includes('average_order_value')) {
      const aovData = await prisma.order.aggregate({
        where: {
          storeId: store.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: { not: 'cancelled' }
        },
        _avg: {
          totalPrice: true
        }
      });

      analyticsData.metrics.average_order_value = aovData._avg.totalPrice || 0;
    }

    // Get top products
    if (metrics.includes('top_products')) {
      const topProducts = await prisma.orderLineItem.groupBy({
        by: ['productId', 'title'],
        where: {
          order: {
            storeId: store.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            },
            status: { not: 'cancelled' }
          }
        },
        _sum: {
          quantity: true,
          totalPrice: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            totalPrice: 'desc'
          }
        },
        take: 10
      });

      analyticsData.metrics.top_products = topProducts.map(product => ({
        productId: product.productId,
        title: product.title,
        totalQuantity: product._sum.quantity || 0,
        totalRevenue: product._sum.totalPrice || 0,
        orderCount: product._count.id
      }));
    }

    // Time series data based on granularity
    if (granularity !== 'total') {
      const timeSeriesData = await getTimeSeriesData(store.id, startDate, endDate, granularity);
      analyticsData.timeSeries = timeSeriesData;
    }

    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    console.error('[ANALYTICS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Generate custom report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = analyticsQuerySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { dateRange, metrics = ['revenue', 'orders'], granularity, compare } = validation.data;
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Generate comprehensive report
    const report = await generateCustomReport(store.id, startDate, endDate, metrics, granularity);

    // Add comparison data if requested
    if (compare?.enabled) {
      const comparisonPeriod = getComparisonPeriod(startDate, endDate, compare.period);
      const comparisonData = await generateCustomReport(
        store.id, 
        comparisonPeriod.start, 
        comparisonPeriod.end, 
        metrics, 
        granularity
      );
      
      report.comparison = comparisonData;
      report.changes = calculateChanges(report.data, comparisonData.data);
    }

    return NextResponse.json({ 
      message: 'Report generated successfully',
      report 
    });
  } catch (error) {
    console.error('[ANALYTICS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to get time series data
async function getTimeSeriesData(storeId: string, startDate: Date, endDate: Date, granularity: string) {
  // This would generate time-based data points
  // For now, return a simplified structure
  const timePoints = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const nextPoint = new Date(current);
    
    switch (granularity) {
      case 'hour':
        nextPoint.setHours(nextPoint.getHours() + 1);
        break;
      case 'day':
        nextPoint.setDate(nextPoint.getDate() + 1);
        break;
      case 'week':
        nextPoint.setDate(nextPoint.getDate() + 7);
        break;
      case 'month':
        nextPoint.setMonth(nextPoint.getMonth() + 1);
        break;
    }

    // Get data for this time period
    const periodData = await prisma.order.aggregate({
      where: {
        storeId,
        createdAt: {
          gte: current,
          lt: nextPoint
        },
        status: { not: 'cancelled' }
      },
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    timePoints.push({
      timestamp: current.toISOString(),
      revenue: periodData._sum.totalPrice || 0,
      orders: periodData._count.id
    });

    current.setTime(nextPoint.getTime());
  }

  return timePoints;
}

// Helper function to generate custom report
async function generateCustomReport(storeId: string, startDate: Date, endDate: Date, metrics: string[], granularity: string) {
  const reportData: any = {
    period: { start: startDate, end: endDate },
    granularity,
    data: {}
  };

  // Implementation would include all requested metrics
  // This is a simplified version
  for (const metric of metrics) {
    switch (metric) {
      case 'revenue':
        const revenue = await prisma.order.aggregate({
          where: {
            storeId,
            createdAt: { gte: startDate, lte: endDate },
            status: { not: 'cancelled' }
          },
          _sum: { totalPrice: true }
        });
        reportData.data.revenue = revenue._sum.totalPrice || 0;
        break;
        
      case 'orders':
        const orders = await prisma.order.count({
          where: {
            storeId,
            createdAt: { gte: startDate, lte: endDate }
          }
        });
        reportData.data.orders = orders;
        break;
    }
  }

  return reportData;
}

// Helper function to get comparison period
function getComparisonPeriod(startDate: Date, endDate: Date, period: string) {
  const duration = endDate.getTime() - startDate.getTime();
  
  if (period === 'previous_period') {
    return {
      start: new Date(startDate.getTime() - duration),
      end: new Date(startDate.getTime())
    };
  } else { // previous_year
    return {
      start: new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate()),
      end: new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate())
    };
  }
}

// Helper function to calculate changes
function calculateChanges(current: any, previous: any) {
  const changes: any = {};
  
  for (const key in current) {
    if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
      const change = current[key] - previous[key];
      const percentChange = previous[key] !== 0 ? (change / previous[key]) * 100 : 0;
      
      changes[key] = {
        absolute: change,
        percentage: percentChange
      };
    }
  }
  
  return changes;
}