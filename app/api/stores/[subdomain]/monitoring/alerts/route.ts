import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for alert configuration
const alertConfigSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['performance', 'business', 'security', 'system']),
  condition: z.object({
    metric: z.string(),
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']), // greater than, less than, etc.
    threshold: z.number(),
    timeWindow: z.number().min(1).max(60) // minutes
  }),
  actions: z.object({
    email: z.boolean().default(true),
    webhook: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    notification: z.boolean().default(true),
    autoResolve: z.boolean().default(false)
  }),
  recipients: z.array(z.string().email()).optional(),
  isActive: z.boolean().default(true),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

// Schema for triggering alerts
const triggerAlertSchema = z.object({
  type: z.string(),
  metric: z.string(),
  value: z.number(),
  message: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  metadata: z.record(z.any()).optional()
});

// Helper function to evaluate alert conditions
function evaluateAlertCondition(condition: any, currentValue: number): boolean {
  const { operator, threshold } = condition;
  
  switch (operator) {
    case 'gt': return currentValue > threshold;
    case 'lt': return currentValue < threshold;
    case 'eq': return currentValue === threshold;
    case 'gte': return currentValue >= threshold;
    case 'lte': return currentValue <= threshold;
    default: return false;
  }
}

// Helper function to check and trigger alerts
async function checkAlerts(storeId: string, metrics: any): Promise<any[]> {
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId }
  });

  const alertConfigs = (storeSettings?.alertConfigs as any[]) || [];
  const triggeredAlerts = [];

  for (const config of alertConfigs.filter(c => c.isActive)) {
    const metricValue = metrics[config.condition.metric];
    
    if (metricValue !== undefined && evaluateAlertCondition(config.condition, metricValue)) {
      const alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        configId: config.id,
        name: config.name,
        type: config.type,
        metric: config.condition.metric,
        value: metricValue,
        threshold: config.condition.threshold,
        severity: config.severity,
        message: `${config.name}: ${config.condition.metric} is ${metricValue} (threshold: ${config.condition.threshold})`,
        triggeredAt: new Date().toISOString(),
        status: 'active',
        actions: config.actions
      };
      
      triggeredAlerts.push(alert);
    }
  }

  return triggeredAlerts;
}

// GET - Get alerts and alert configuration
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
    const type = searchParams.get('type'); // 'active', 'resolved', 'config'
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Get store settings for alerts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    if (type === 'config') {
      // Return alert configurations
      const alertConfigs = (storeSettings?.alertConfigs as any[]) || [];
      
      return NextResponse.json({
        configs: alertConfigs,
        totalConfigs: alertConfigs.length,
        activeConfigs: alertConfigs.filter(c => c.isActive).length
      });
    }

    // Get alert history
    const alertHistory = (storeSettings?.alertHistory as any[]) || [];
    
    // Filter alerts based on query parameters
    let filteredAlerts = alertHistory;
    
    if (type && type !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === type);
    }
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    // Sort by triggered time (most recent first) and limit
    const sortedAlerts = filteredAlerts
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
      .slice(0, limit);

    // Calculate alert summary
    const summary = {
      total: alertHistory.length,
      active: alertHistory.filter(a => a.status === 'active').length,
      resolved: alertHistory.filter(a => a.status === 'resolved').length,
      critical: alertHistory.filter(a => a.severity === 'critical').length,
      high: alertHistory.filter(a => a.severity === 'high').length,
      medium: alertHistory.filter(a => a.severity === 'medium').length,
      low: alertHistory.filter(a => a.severity === 'low').length,
      last24h: alertHistory.filter(a => 
        new Date(a.triggeredAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    };

    // Get recent alert trends
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayAlerts = alertHistory.filter(a => {
        const alertDate = new Date(a.triggeredAt);
        return alertDate >= dayStart && alertDate < dayEnd;
      });
      
      return {
        date: dayStart.toISOString().split('T')[0],
        total: dayAlerts.length,
        critical: dayAlerts.filter(a => a.severity === 'critical').length,
        high: dayAlerts.filter(a => a.severity === 'high').length
      };
    }).reverse();

    return NextResponse.json({
      alerts: sortedAlerts,
      summary,
      trends: last7Days,
      hasMore: filteredAlerts.length > limit
    });
  } catch (error) {
    console.error('[ALERTS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create alert configuration or trigger alert
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { action = 'create_config' } = body;

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

    if (action === 'trigger_alert') {
      // Trigger a manual alert
      const validation = triggerAlertSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({
          error: 'Invalid alert data',
          details: validation.error.format()
        }, { status: 400 });
      }

      const alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...validation.data,
        triggeredAt: new Date().toISOString(),
        status: 'active',
        source: 'manual',
        triggeredBy: session.user.email
      };

      // Add to alert history
      const storeSettings = await prisma.storeSettings.findUnique({
        where: { storeId: store.id }
      });
      
      const alertHistory = (storeSettings?.alertHistory as any[]) || [];
      const updatedHistory = [alert, ...alertHistory.slice(0, 999)]; // Keep last 1000 alerts

      await prisma.storeSettings.upsert({
        where: { storeId: store.id },
        update: { alertHistory: updatedHistory },
        create: { storeId: store.id, alertHistory: updatedHistory }
      });

      return NextResponse.json({
        message: 'Alert triggered successfully',
        alert
      });
    }

    // Default: Create alert configuration
    const validation = alertConfigSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid alert configuration',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Get current alert configurations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });
    
    const currentConfigs = (storeSettings?.alertConfigs as any[]) || [];
    
    // Check for duplicate name
    const existingConfig = currentConfigs.find(c => 
      c.name.toLowerCase() === validation.data.name.toLowerCase()
    );
    
    if (existingConfig) {
      return apiResponse.badRequest('Alert configuration with this name already exists');
    }

    // Create new alert configuration
    const newConfig = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    const updatedConfigs = [...currentConfigs, newConfig];
    
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { alertConfigs: updatedConfigs },
      create: { storeId: store.id, alertConfigs: updatedConfigs }
    });

    return NextResponse.json({
      message: 'Alert configuration created successfully',
      config: newConfig
    }, { status: 201 });
  } catch (error) {
    console.error('[ALERTS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update alert configuration or resolve alert
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { action = 'update_config', configId, alertId } = body;

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

    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    if (action === 'resolve_alert') {
      if (!alertId) {
        return apiResponse.badRequest('Alert ID is required');
      }

      // Resolve an active alert
      const alertHistory = (storeSettings?.alertHistory as any[]) || [];
      const alertIndex = alertHistory.findIndex(a => a.id === alertId);
      
      if (alertIndex === -1) {
        return apiResponse.notFound('Alert ');
      }

      alertHistory[alertIndex] = {
        ...alertHistory[alertIndex],
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: session.user.email,
        resolution: body.resolution || 'Manually resolved'
      };

      await prisma.storeSettings.update({
        where: { storeId: store.id },
        data: { alertHistory }
      });

      return NextResponse.json({
        message: 'Alert resolved successfully',
        alert: alertHistory[alertIndex]
      });
    }

    // Default: Update alert configuration
    if (!configId) {
      return apiResponse.badRequest('Configuration ID is required');
    }

    const validation = alertConfigSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid alert configuration',
        details: validation.error.format()
      }, { status: 400 });
    }

    const alertConfigs = (storeSettings?.alertConfigs as any[]) || [];
    const configIndex = alertConfigs.findIndex(c => c.id === configId);
    
    if (configIndex === -1) {
      return apiResponse.notFound('Alert configuration ');
    }

    // Update configuration
    alertConfigs[configIndex] = {
      ...alertConfigs[configIndex],
      ...validation.data,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    };

    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { alertConfigs }
    });

    return NextResponse.json({
      message: 'Alert configuration updated successfully',
      config: alertConfigs[configIndex]
    });
  } catch (error) {
    console.error('[ALERTS API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete alert configuration
export async function DELETE(
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
    const configId = searchParams.get('configId');

    if (!configId) {
      return apiResponse.badRequest('Configuration ID is required');
    }

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

    // Get current configurations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });
    
    const alertConfigs = (storeSettings?.alertConfigs as any[]) || [];
    const updatedConfigs = alertConfigs.filter(c => c.id !== configId);
    
    if (alertConfigs.length === updatedConfigs.length) {
      return apiResponse.notFound('Alert configuration ');
    }

    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { alertConfigs: updatedConfigs }
    });

    return apiResponse.success({ message: 'Alert configuration deleted successfully' });
  } catch (error) {
    console.error('[ALERTS API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}