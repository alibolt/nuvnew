import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating activity log
const createLogSchema = z.object({
  action: z.string().min(1),
  resourceType: z.enum(['order', 'product', 'customer', 'setting', 'staff', 'inventory', 'theme', 'webhook', 'api_key']),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    source: z.enum(['dashboard', 'api', 'webhook', 'automation']).optional()
  }).optional()
});

// Activity log categories for filtering
const logCategories = {
  orders: [
    'order.created',
    'order.updated', 
    'order.cancelled',
    'order.fulfilled',
    'order.refunded',
    'order.payment_received'
  ],
  products: [
    'product.created',
    'product.updated',
    'product.deleted',
    'product.published',
    'product.unpublished'
  ],
  customers: [
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'customer.login',
    'customer.logout'
  ],
  inventory: [
    'inventory.adjusted',
    'inventory.restocked',
    'inventory.transferred',
    'inventory.item_created',
    'inventory.item_deleted'
  ],
  settings: [
    'setting.updated',
    'theme.changed',
    'payment.configured',
    'shipping.configured',
    'notification.configured'
  ],
  staff: [
    'staff.invited',
    'staff.activated',
    'staff.deactivated',
    'staff.permissions_changed',
    'staff.2fa_enabled',
    'staff.2fa_disabled'
  ],
  security: [
    'api_key.created',
    'api_key.revoked',
    'webhook.created',
    'webhook.updated',
    'webhook.deleted',
    'login.successful',
    'login.failed',
    'password.changed'
  ]
};

// GET - List activity logs
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
    
    // Filters
    const category = searchParams.get('category');
    const resourceType = searchParams.get('resourceType');
    const resourceId = searchParams.get('resourceId');
    const userId = searchParams.get('userId');
    const source = searchParams.get('source');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
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

    // Get activity logs from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let activityLogs = (storeSettings?.activityLogs as any[]) || [];

    // Apply filters
    if (category && logCategories[category as keyof typeof logCategories]) {
      const categoryActions = logCategories[category as keyof typeof logCategories];
      activityLogs = activityLogs.filter(log => categoryActions.includes(log.action));
    }
    
    if (resourceType) {
      activityLogs = activityLogs.filter(log => log.resourceType === resourceType);
    }
    
    if (resourceId) {
      activityLogs = activityLogs.filter(log => log.resourceId === resourceId);
    }
    
    if (userId) {
      activityLogs = activityLogs.filter(log => log.userId === userId);
    }
    
    if (source) {
      activityLogs = activityLogs.filter(log => log.metadata?.source === source);
    }
    
    if (dateFrom) {
      activityLogs = activityLogs.filter(log => 
        new Date(log.timestamp) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      activityLogs = activityLogs.filter(log => 
        new Date(log.timestamp) <= new Date(dateTo)
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      activityLogs = activityLogs.filter(log =>
        log.action.toLowerCase().includes(searchLower) ||
        log.description?.toLowerCase().includes(searchLower) ||
        log.userEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const total = activityLogs.length;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = activityLogs.slice(startIndex, startIndex + limit);

    // Calculate activity metrics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = {
      total: activityLogs.length,
      today: activityLogs.filter(log => new Date(log.timestamp) >= today).length,
      thisWeek: activityLogs.filter(log => new Date(log.timestamp) >= weekAgo).length,
      thisMonth: activityLogs.filter(log => new Date(log.timestamp) >= monthAgo).length,
      byCategory: Object.keys(logCategories).reduce((acc, cat) => {
        const categoryActions = logCategories[cat as keyof typeof logCategories];
        acc[cat] = activityLogs.filter(log => categoryActions.includes(log.action)).length;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      logs: paginatedLogs,
      metrics,
      categories: logCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[ACTIVITY LOGS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create activity log
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
    const validation = createLogSchema.safeParse(body);
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

    // Create activity log entry
    const logEntry = {
      id: `log_${Date.now()}`,
      action: validation.data.action,
      resourceType: validation.data.resourceType,
      resourceId: validation.data.resourceId,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      description: generateLogDescription(validation.data.action, validation.data.details),
      details: validation.data.details,
      metadata: {
        ...validation.data.metadata,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
      },
      timestamp: new Date().toISOString()
    };

    // Get current activity logs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const activityLogs = (storeSettings?.activityLogs as any[]) || [];
    
    // Add new log entry
    activityLogs.push(logEntry);

    // Keep only the last 10,000 logs to prevent database bloat
    if (activityLogs.length > 10000) {
      activityLogs.splice(0, activityLogs.length - 10000);
    }

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { activityLogs },
      create: {
        storeId: store.id,
        activityLogs
      }
    });

    return NextResponse.json({ 
      message: 'Activity log created successfully',
      log: logEntry
    });
  } catch (error) {
    console.error('[ACTIVITY LOGS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Clear activity logs
export async function DELETE(
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
    const olderThan = searchParams.get('olderThan'); // ISO date string
    
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

    // Get current activity logs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let activityLogs = (storeSettings?.activityLogs as any[]) || [];
    const originalCount = activityLogs.length;

    if (olderThan) {
      // Delete logs older than specified date
      const cutoffDate = new Date(olderThan);
      activityLogs = activityLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
    } else {
      // Clear all logs
      activityLogs = [];
    }

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { activityLogs }
    });

    const deletedCount = originalCount - activityLogs.length;

    return NextResponse.json({ 
      message: `${deletedCount} activity log(s) deleted successfully`,
      deletedCount,
      remainingCount: activityLogs.length
    });
  } catch (error) {
    console.error('[ACTIVITY LOGS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to generate human-readable log descriptions
function generateLogDescription(action: string, details: any = {}): string {
  const actionMap: Record<string, string> = {
    'order.created': 'New order was placed',
    'order.updated': 'Order details were modified',
    'order.cancelled': 'Order was cancelled',
    'order.fulfilled': 'Order was marked as fulfilled',
    'order.refunded': 'Order was refunded',
    'product.created': 'New product was added',
    'product.updated': 'Product details were modified',
    'product.deleted': 'Product was deleted',
    'customer.created': 'New customer account was created',
    'customer.updated': 'Customer details were modified',
    'customer.deleted': 'Customer account was deleted',
    'inventory.adjusted': 'Inventory levels were adjusted',
    'staff.invited': 'New staff member was invited',
    'staff.activated': 'Staff member account was activated',
    'api_key.created': 'New API key was created',
    'webhook.created': 'New webhook was configured'
  };

  let description = actionMap[action] || action;
  
  // Add details if available
  if (details.name || details.title || details.email) {
    description += ` (${details.name || details.title || details.email})`;
  }
  
  if (details.amount) {
    description += ` - Amount: ${details.amount}`;
  }

  return description;
}