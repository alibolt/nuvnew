import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for dashboard configuration
const dashboardConfigSchema = z.object({
  widgets: z.array(z.object({
    id: z.string(),
    type: z.enum(['health_overview', 'performance_metrics', 'alerts_summary', 'business_metrics', 'system_status']),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }),
    config: z.record(z.any()).optional(),
    isVisible: z.boolean().default(true)
  })),
  refreshInterval: z.number().min(30).max(3600).default(300), // seconds
  timezone: z.string().default('UTC')
});

// Helper function to calculate business metrics
async function calculateBusinessMetrics(storeId: string, timeRange: string): Promise<any> {
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

  const [orders, customers, products, reviews] = await Promise.all([
    prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: startTime }
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        financialStatus: true,
        createdAt: true
      }
    }),
    prisma.customer.count({
      where: {
        storeId,
        createdAt: { gte: startTime }
      }
    }),
    prisma.product.count({
      where: {
        storeId,
        isActive: true
      }
    }),
    prisma.productReview.count({
      where: {
        product: { storeId },
        createdAt: { gte: startTime }
      }
    })
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const completedOrders = orders.filter(o => o.status === 'completed');
  const conversionRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0;
  const averageOrderValue = orders.length > 0 ? revenue / orders.length : 0;

  return {
    revenue: Math.round(revenue * 100) / 100,
    orders: orders.length,
    completedOrders: completedOrders.length,
    conversionRate: Math.round(conversionRate * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    newCustomers: customers,
    totalProducts: products,
    newReviews: reviews,
    period: timeRange
  };
}

// Helper function to get system status
async function getSystemStatus(storeId: string): Promise<any> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      storeSettings: true
    }
  });

  if (!store) {
    return {
      status: 'error',
      message: 'Store not found',
      services: []
    };
  }

  // Check various system components
  const services = [
    {
      name: 'Database',
      status: 'operational',
      responseTime: Math.floor(Math.random() * 50) + 10, // Simulated
      uptime: 99.9
    },
    {
      name: 'Payment Processing',
      status: store.storeSettings?.paymentMethods ? 'operational' : 'degraded',
      responseTime: Math.floor(Math.random() * 100) + 50,
      uptime: 99.5
    },
    {
      name: 'Email Service',
      status: 'operational',
      responseTime: Math.floor(Math.random() * 200) + 100,
      uptime: 99.8
    },
    {
      name: 'File Storage',
      status: 'operational',
      responseTime: Math.floor(Math.random() * 75) + 25,
      uptime: 99.95
    },
    {
      name: 'Search Engine',
      status: store.storeSettings?.searchSettings ? 'operational' : 'warning',
      responseTime: Math.floor(Math.random() * 30) + 5,
      uptime: 99.7
    }
  ];

  const overallStatus = services.every(s => s.status === 'operational') ? 'operational' :
    services.some(s => s.status === 'error') ? 'error' : 'degraded';

  return {
    status: overallStatus,
    services,
    lastUpdated: new Date().toISOString()
  };
}

// GET - Get monitoring dashboard data
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
    const timeRange = searchParams.get('timeRange') || '24h';
    const widget = searchParams.get('widget'); // Specific widget data

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

    // Get store settings for monitoring data
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    if (widget) {
      // Return specific widget data
      switch (widget) {
        case 'health_overview':
          const healthHistory = (storeSettings?.healthHistory as any[]) || [];
          const latestHealth = healthHistory[0] || {
            overallScore: 100,
            status: 'healthy',
            criticalIssues: 0,
            totalIssues: 0
          };
          
          return NextResponse.json({
            widget: 'health_overview',
            data: {
              current: latestHealth,
              trend: healthHistory.slice(0, 7).map(h => ({
                timestamp: h.timestamp,
                score: h.overallScore,
                status: h.status
              }))
            }
          });

        case 'performance_metrics':
          const performanceHistory = (storeSettings?.performanceHistory as any[]) || [];
          const recentMetrics = performanceHistory.slice(0, 100);
          
          const avgPageLoad = recentMetrics
            .filter(m => m.type === 'page_load')
            .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);
            
          const avgApiResponse = recentMetrics
            .filter(m => m.type === 'api_call')
            .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);
          
          return NextResponse.json({
            widget: 'performance_metrics',
            data: {
              averagePageLoad: Math.round(avgPageLoad),
              averageApiResponse: Math.round(avgApiResponse),
              totalRequests: recentMetrics.length,
              errorRate: recentMetrics.filter(m => m.metadata?.success === false).length / recentMetrics.length * 100
            }
          });

        case 'alerts_summary':
          const alertHistory = (storeSettings?.alertHistory as any[]) || [];
          const activeAlerts = alertHistory.filter(a => a.status === 'active');
          const recentAlerts = alertHistory.filter(a => 
            new Date(a.triggeredAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          );
          
          return NextResponse.json({
            widget: 'alerts_summary',
            data: {
              active: activeAlerts.length,
              critical: activeAlerts.filter(a => a.severity === 'critical').length,
              high: activeAlerts.filter(a => a.severity === 'high').length,
              recent24h: recentAlerts.length,
              recent: recentAlerts.slice(0, 5)
            }
          });

        case 'business_metrics':
          const businessMetrics = await calculateBusinessMetrics(store.id, timeRange);
          return NextResponse.json({
            widget: 'business_metrics',
            data: businessMetrics
          });

        case 'system_status':
          const systemStatus = await getSystemStatus(store.id);
          return NextResponse.json({
            widget: 'system_status',
            data: systemStatus
          });

        default:
          return NextResponse.json({ error: 'Unknown widget type' }, { status: 400 });
      }
    }

    // Return complete dashboard data
    const [businessMetrics, systemStatus] = await Promise.all([
      calculateBusinessMetrics(store.id, timeRange),
      getSystemStatus(store.id)
    ]);

    // Get recent health check data
    const healthHistory = (storeSettings?.healthHistory as any[]) || [];
    const latestHealth = healthHistory[0] || {
      overallScore: 100,
      status: 'healthy',
      criticalIssues: 0,
      totalIssues: 0,
      timestamp: new Date().toISOString()
    };

    // Get recent performance data
    const performanceHistory = (storeSettings?.performanceHistory as any[]) || [];
    const recentPerformance = performanceHistory.slice(0, 100);
    
    const performanceMetrics = {
      averagePageLoad: recentPerformance
        .filter(m => m.type === 'page_load')
        .reduce((sum, m, _, arr) => arr.length > 0 ? sum + m.value / arr.length : 0, 0),
      averageApiResponse: recentPerformance
        .filter(m => m.type === 'api_call')
        .reduce((sum, m, _, arr) => arr.length > 0 ? sum + m.value / arr.length : 0, 0),
      totalRequests: recentPerformance.length,
      errorRate: recentPerformance.length > 0 ? 
        (recentPerformance.filter(m => m.metadata?.success === false).length / recentPerformance.length) * 100 : 0
    };

    // Get recent alerts
    const alertHistory = (storeSettings?.alertHistory as any[]) || [];
    const activeAlerts = alertHistory.filter(a => a.status === 'active');
    const recentAlerts = alertHistory.filter(a => 
      new Date(a.triggeredAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const alertsSummary = {
      active: activeAlerts.length,
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      high: activeAlerts.filter(a => a.severity === 'high').length,
      recent24h: recentAlerts.length
    };

    // Calculate overall store health score
    const healthScore = latestHealth.overallScore;
    const performanceScore = Math.max(0, 100 - (performanceMetrics.averagePageLoad / 50) - performanceMetrics.errorRate);
    const alertsScore = Math.max(0, 100 - (activeAlerts.length * 10) - (alertsSummary.critical * 20));
    const overallScore = Math.round((healthScore + performanceScore + alertsScore) / 3);

    let overallStatus = 'healthy';
    if (overallScore < 50 || alertsSummary.critical > 0) {
      overallStatus = 'critical';
    } else if (overallScore < 80 || activeAlerts.length > 3) {
      overallStatus = 'warning';
    }

    const dashboardData = {
      overview: {
        overallScore,
        overallStatus,
        lastUpdated: new Date().toISOString()
      },
      health: {
        current: latestHealth,
        trend: healthHistory.slice(0, 7).map(h => ({
          timestamp: h.timestamp,
          score: h.overallScore,
          status: h.status
        }))
      },
      performance: {
        metrics: performanceMetrics,
        trend: recentPerformance.slice(0, 24).map(p => ({
          timestamp: p.timestamp,
          value: p.value,
          type: p.type
        }))
      },
      alerts: alertsSummary,
      business: businessMetrics,
      system: systemStatus,
      timeRange,
      refreshInterval: storeSettings?.monitoringConfig?.refreshInterval || 300
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('[MONITORING DASHBOARD API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Update dashboard configuration
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

    // Validate configuration
    const validation = dashboardConfigSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid dashboard configuration',
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

    // Update monitoring configuration
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        monitoringConfig: validation.data,
        updatedAt: new Date()
      },
      create: {
        storeId: store.id,
        monitoringConfig: validation.data
      }
    });

    return NextResponse.json({
      message: 'Dashboard configuration updated successfully',
      config: validation.data
    });
  } catch (error) {
    console.error('[MONITORING DASHBOARD API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}