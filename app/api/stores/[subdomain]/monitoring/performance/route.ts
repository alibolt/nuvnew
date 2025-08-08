import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for performance metrics configuration
const performanceConfigSchema = z.object({
  enabledMetrics: z.array(z.enum([
    'page_load_times',
    'api_response_times',
    'database_query_times',
    'conversion_rates',
    'bounce_rates',
    'user_engagement',
    'revenue_tracking'
  ])).default(['page_load_times', 'api_response_times', 'conversion_rates']),
  trackingInterval: z.enum(['realtime', 'minute', 'hour', 'day']).default('hour'),
  retentionPeriod: z.number().min(1).max(365).default(30), // days
  alertThresholds: z.object({
    pageLoadTime: z.number().min(0).default(3000), // ms
    apiResponseTime: z.number().min(0).default(1000), // ms
    conversionRate: z.number().min(0).max(100).default(2), // %
    bounceRate: z.number().min(0).max(100).default(70) // %
  }).optional()
});

// Schema for recording performance metrics
const recordMetricSchema = z.object({
  type: z.enum(['page_load', 'api_call', 'conversion', 'user_action']),
  value: z.number(),
  metadata: z.object({
    url: z.string().optional(),
    endpoint: z.string().optional(),
    userAgent: z.string().optional(),
    referrer: z.string().optional(),
    sessionId: z.string().optional(),
    customerId: z.string().optional(),
    duration: z.number().optional(),
    success: z.boolean().optional(),
    errorCode: z.string().optional()
  }).optional(),
  timestamp: z.string().optional()
});

// Helper function to calculate performance metrics
function calculatePerformanceMetrics(metrics: any[]): any {
  if (!metrics.length) {
    return {
      averagePageLoad: 0,
      averageApiResponse: 0,
      conversionRate: 0,
      bounceRate: 0,
      totalRequests: 0,
      errorRate: 0
    };
  }

  const pageLoadMetrics = metrics.filter(m => m.type === 'page_load');
  const apiMetrics = metrics.filter(m => m.type === 'api_call');
  const conversionMetrics = metrics.filter(m => m.type === 'conversion');
  const userActionMetrics = metrics.filter(m => m.type === 'user_action');

  // Calculate averages
  const averagePageLoad = pageLoadMetrics.length > 0 ?
    pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length : 0;

  const averageApiResponse = apiMetrics.length > 0 ?
    apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length : 0;

  // Calculate conversion rate
  const totalSessions = new Set(metrics.map(m => m.metadata?.sessionId).filter(Boolean)).size;
  const conversions = conversionMetrics.length;
  const conversionRate = totalSessions > 0 ? (conversions / totalSessions) * 100 : 0;

  // Calculate bounce rate (simplified - single page sessions)
  const singlePageSessions = userActionMetrics.filter(m => 
    m.metadata?.url && !userActionMetrics.some(other => 
      other.metadata?.sessionId === m.metadata?.sessionId && 
      other.metadata?.url !== m.metadata?.url
    )
  ).length;
  const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;

  // Calculate error rate
  const errorRequests = metrics.filter(m => m.metadata?.success === false).length;
  const errorRate = metrics.length > 0 ? (errorRequests / metrics.length) * 100 : 0;

  return {
    averagePageLoad: Math.round(averagePageLoad),
    averageApiResponse: Math.round(averageApiResponse),
    conversionRate: Math.round(conversionRate * 100) / 100,
    bounceRate: Math.round(bounceRate * 100) / 100,
    totalRequests: metrics.length,
    errorRate: Math.round(errorRate * 100) / 100,
    totalSessions: totalSessions,
    conversions
  };
}

// Helper function to generate performance trends
function calculatePerformanceTrends(currentMetrics: any, historicalData: any[]): any {
  if (historicalData.length < 2) {
    return {
      pageLoadTrend: 'stable',
      conversionTrend: 'stable',
      errorRateTrend: 'stable',
      overallTrend: 'stable'
    };
  }

  const previous = historicalData[historicalData.length - 2];
  const current = currentMetrics;

  // Calculate percentage changes
  const pageLoadChange = previous.averagePageLoad > 0 ?
    ((current.averagePageLoad - previous.averagePageLoad) / previous.averagePageLoad) * 100 : 0;
  
  const conversionChange = previous.conversionRate > 0 ?
    ((current.conversionRate - previous.conversionRate) / previous.conversionRate) * 100 : 0;
  
  const errorRateChange = previous.errorRate > 0 ?
    ((current.errorRate - previous.errorRate) / previous.errorRate) * 100 : 0;

  // Determine trends
  const pageLoadTrend = pageLoadChange > 10 ? 'degrading' : pageLoadChange < -10 ? 'improving' : 'stable';
  const conversionTrend = conversionChange > 5 ? 'improving' : conversionChange < -5 ? 'degrading' : 'stable';
  const errorRateTrend = errorRateChange > 5 ? 'degrading' : errorRateChange < -5 ? 'improving' : 'stable';

  // Overall trend based on key metrics
  let overallTrend = 'stable';
  if ((pageLoadTrend === 'improving' || conversionTrend === 'improving') && errorRateTrend !== 'degrading') {
    overallTrend = 'improving';
  } else if (pageLoadTrend === 'degrading' || conversionTrend === 'degrading' || errorRateTrend === 'degrading') {
    overallTrend = 'degrading';
  }

  return {
    pageLoadTrend,
    conversionTrend,
    errorRateTrend,
    overallTrend,
    changes: {
      pageLoad: Math.round(pageLoadChange * 100) / 100,
      conversion: Math.round(conversionChange * 100) / 100,
      errorRate: Math.round(errorRateChange * 100) / 100
    }
  };
}

// GET - Get performance metrics and analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h'; // 1h, 24h, 7d, 30d
    const metrics = searchParams.get('metrics')?.split(',') || ['all'];

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Calculate time range
    const now = new Date();
    let startTime: Date;
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get store settings for performance data
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const performanceHistory = (storeSettings?.performanceHistory as any[]) || [];
    const recentMetrics = performanceHistory.filter(entry => 
      new Date(entry.timestamp) >= startTime
    );

    // Get real-time metrics from orders and other data
    const [recentOrders, totalProducts, totalCustomers] = await Promise.all([
      prisma.order.findMany({
        where: {
          storeId: store.id,
          createdAt: { gte: startTime }
        },
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          financialStatus: true
        }
      }),
      prisma.product.count({
        where: { storeId: store.id, isActive: true }
      }),
      prisma.customer.count({
        where: { storeId: store.id }
      })
    ]);

    // Calculate business metrics
    const revenue = recentOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const completedOrders = recentOrders.filter(o => o.status === 'completed').length;
    const conversionRate = recentOrders.length > 0 ? (completedOrders / recentOrders.length) * 100 : 0;

    // Calculate performance metrics from stored data
    const performanceMetrics = calculatePerformanceMetrics(recentMetrics);

    // Get historical data for trends
    const historicalData = performanceHistory.slice(-7); // Last 7 entries
    const trends = calculatePerformanceTrends(performanceMetrics, historicalData);

    // Page performance insights
    const pageInsights = {
      totalPageViews: recentMetrics.filter(m => m.type === 'page_load').length,
      uniqueSessions: new Set(recentMetrics.map(m => m.metadata?.sessionId).filter(Boolean)).size,
      mostVisitedPages: recentMetrics
        .filter(m => m.type === 'page_load' && m.metadata?.url)
        .reduce((acc, m) => {
          const url = m.metadata.url;
          acc[url] = (acc[url] || 0) + 1;
          return acc;
        }, {}),
      slowestPages: recentMetrics
        .filter(m => m.type === 'page_load' && m.metadata?.url)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(m => ({
          url: m.metadata.url,
          loadTime: m.value,
          timestamp: m.timestamp
        }))
    };

    // API performance insights
    const apiInsights = {
      totalApiCalls: recentMetrics.filter(m => m.type === 'api_call').length,
      averageResponseTime: performanceMetrics.averageApiResponse,
      slowestEndpoints: recentMetrics
        .filter(m => m.type === 'api_call' && m.metadata?.endpoint)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(m => ({
          endpoint: m.metadata.endpoint,
          responseTime: m.value,
          timestamp: m.timestamp
        })),
      errorsByEndpoint: recentMetrics
        .filter(m => m.type === 'api_call' && m.metadata?.success === false)
        .reduce((acc, m) => {
          const endpoint = m.metadata?.endpoint || 'unknown';
          acc[endpoint] = (acc[endpoint] || 0) + 1;
          return acc;
        }, {})
    };

    // Business performance metrics
    const businessMetrics = {
      revenue: Math.round(revenue * 100) / 100,
      orderCount: recentOrders.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageOrderValue: recentOrders.length > 0 ? 
        Math.round((revenue / recentOrders.length) * 100) / 100 : 0,
      customerGrowth: totalCustomers,
      productCatalogSize: totalProducts
    };

    const response = {
      timeRange,
      period: {
        start: startTime.toISOString(),
        end: now.toISOString()
      },
      performance: performanceMetrics,
      trends,
      insights: {
        pages: pageInsights,
        api: apiInsights,
        business: businessMetrics
      },
      alerts: [
        // Generate performance alerts based on thresholds
        ...(performanceMetrics.averagePageLoad > 3000 ? [{
          type: 'warning',
          metric: 'page_load_time',
          message: `Average page load time (${performanceMetrics.averagePageLoad}ms) exceeds recommended threshold (3000ms)`,
          severity: 'medium'
        }] : []),
        ...(performanceMetrics.errorRate > 5 ? [{
          type: 'error',
          metric: 'error_rate',
          message: `Error rate (${performanceMetrics.errorRate}%) is above acceptable threshold (5%)`,
          severity: 'high'
        }] : []),
        ...(performanceMetrics.conversionRate < 2 ? [{
          type: 'info',
          metric: 'conversion_rate',
          message: `Conversion rate (${performanceMetrics.conversionRate}%) is below target (2%)`,
          severity: 'low'
        }] : [])
      ],
      lastUpdated: now.toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[PERFORMANCE MONITORING API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Record performance metrics or update configuration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    const { action = 'record_metric' } = body;

    // Verify store exists (public endpoint for metric recording)
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain },
          { subdomain: subdomain }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    if (action === 'update_config') {
      // Require authentication for config updates
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return apiResponse.unauthorized();
      }

      // Verify store ownership
      const ownedStore = await prisma.store.findFirst({
        where: {
          OR: [
            { subdomain: subdomain, userId: session.user.id },
            { subdomain: subdomain, userId: session.user.id }
          ]
        }
      });

      if (!ownedStore) {
        return apiResponse.notFound('Store ');
      }

      // Validate configuration
      const validation = performanceConfigSchema.safeParse(body.config);
      if (!validation.success) {
        return NextResponse.json({
          error: 'Invalid performance configuration',
          details: validation.error.format()
        }, { status: 400 });
      }

      // Update performance configuration
      await prisma.storeSettings.upsert({
        where: { storeId: store.id },
        update: {
          performanceConfig: validation.data,
          updatedAt: new Date()
        },
        create: {
          storeId: store.id,
          performanceConfig: validation.data
        }
      });

      return NextResponse.json({
        message: 'Performance configuration updated successfully',
        config: validation.data
      });
    }

    // Default: Record performance metric
    const validation = recordMetricSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid metric data',
        details: validation.error.format()
      }, { status: 400 });
    }

    const metric = {
      ...validation.data,
      timestamp: validation.data.timestamp || new Date().toISOString(),
      storeId: store.id
    };

    // Get current performance history
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentHistory = (storeSettings?.performanceHistory as any[]) || [];
    
    // Add new metric and keep last 10000 entries to prevent unlimited growth
    const updatedHistory = [metric, ...currentHistory.slice(0, 9999)];

    // Update performance history
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { performanceHistory: updatedHistory },
      create: { storeId: store.id, performanceHistory: updatedHistory }
    });

    return NextResponse.json({
      message: 'Performance metric recorded successfully',
      metricId: `${metric.type}_${Date.now()}`
    });
  } catch (error) {
    console.error('[PERFORMANCE MONITORING API] POST Error:', error);
    return apiResponse.serverError();
  }
}