import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Schema for webhook
const webhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.enum([
    'order.created',
    'order.updated',
    'order.paid',
    'order.fulfilled',
    'order.cancelled',
    'order.refunded',
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'product.created',
    'product.updated',
    'product.deleted',
    'inventory.updated',
    'app.uninstalled'
  ])),
  active: z.boolean().default(true),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  retryPolicy: z.object({
    maxAttempts: z.number().min(1).max(10).default(3),
    backoffMultiplier: z.number().min(1).max(10).default(2),
    initialDelay: z.number().min(1).max(3600).default(1) // seconds
  }).optional()
});

// Schema for webhook update
const updateWebhookSchema = webhookSchema.partial().extend({
  id: z.string().min(1)
});

// Generate webhook secret
function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Available webhook events
const availableEvents = [
  {
    category: 'Orders',
    events: [
      { value: 'order.created', label: 'Order Created', description: 'Triggered when a new order is placed' },
      { value: 'order.updated', label: 'Order Updated', description: 'Triggered when order details are modified' },
      { value: 'order.paid', label: 'Order Paid', description: 'Triggered when payment is received' },
      { value: 'order.fulfilled', label: 'Order Fulfilled', description: 'Triggered when order is marked as fulfilled' },
      { value: 'order.cancelled', label: 'Order Cancelled', description: 'Triggered when order is cancelled' },
      { value: 'order.refunded', label: 'Order Refunded', description: 'Triggered when order is refunded' }
    ]
  },
  {
    category: 'Customers',
    events: [
      { value: 'customer.created', label: 'Customer Created', description: 'Triggered when a new customer registers' },
      { value: 'customer.updated', label: 'Customer Updated', description: 'Triggered when customer details are modified' },
      { value: 'customer.deleted', label: 'Customer Deleted', description: 'Triggered when customer account is deleted' }
    ]
  },
  {
    category: 'Products',
    events: [
      { value: 'product.created', label: 'Product Created', description: 'Triggered when a new product is added' },
      { value: 'product.updated', label: 'Product Updated', description: 'Triggered when product details are modified' },
      { value: 'product.deleted', label: 'Product Deleted', description: 'Triggered when product is deleted' }
    ]
  },
  {
    category: 'Inventory',
    events: [
      { value: 'inventory.updated', label: 'Inventory Updated', description: 'Triggered when inventory levels change' }
    ]
  },
  {
    category: 'App',
    events: [
      { value: 'app.uninstalled', label: 'App Uninstalled', description: 'Triggered when store is deleted' }
    ]
  }
];

// GET - List webhooks
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
    const active = searchParams.get('active');
    
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

    // Get webhooks from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let webhooks = storeSettings?.webhooks as any[] || [];

    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      webhooks = webhooks.filter(webhook => webhook.active === isActive);
    }

    // Hide secrets in response
    const safeWebhooks = webhooks.map(webhook => ({
      ...webhook,
      secret: webhook.secret ? '***' : undefined,
      deliveryStats: {
        totalDeliveries: webhook.deliveryLog?.length || 0,
        successfulDeliveries: webhook.deliveryLog?.filter((log: any) => log.success).length || 0,
        failedDeliveries: webhook.deliveryLog?.filter((log: any) => !log.success).length || 0,
        lastDelivery: webhook.deliveryLog?.length > 0 
          ? webhook.deliveryLog[webhook.deliveryLog.length - 1].timestamp 
          : null
      }
    }));

    return NextResponse.json({ 
      webhooks: safeWebhooks,
      availableEvents
    });
  } catch (error) {
    console.error('[WEBHOOKS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create webhook
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
    
    // Generate secret if not provided
    if (!body.secret) {
      body.secret = generateWebhookSecret();
    }

    // Validate input
    const validation = webhookSchema.safeParse(body);
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

    // Get current webhooks
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const webhooks = storeSettings?.webhooks as any[] || [];

    // Check for duplicate URL
    const existingWebhook = webhooks.find(webhook => webhook.url === validation.data.url);
    if (existingWebhook) {
      return NextResponse.json({ 
        error: 'A webhook with this URL already exists' 
      }, { status: 400 });
    }

    // Create new webhook
    const newWebhook = {
      id: `webhook_${Date.now()}`,
      ...validation.data,
      retryPolicy: validation.data.retryPolicy || {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email,
      deliveryLog: []
    };

    // Add to webhooks
    webhooks.push(newWebhook);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        webhooks
      },
      create: {
        storeId: store.id,
        webhooks
      }
    });

    // Hide secret in response
    const safeWebhook = {
      ...newWebhook,
      secret: '***'
    };

    return NextResponse.json({ 
      message: 'Webhook created successfully',
      webhook: safeWebhook
    });
  } catch (error) {
    console.error('[WEBHOOKS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update webhook
export async function PUT(
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
    const validation = updateWebhookSchema.safeParse(body);
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

    // Get current webhooks
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const webhooks = storeSettings?.webhooks as any[] || [];
    const webhookIndex = webhooks.findIndex(webhook => webhook.id === validation.data.id);

    if (webhookIndex === -1) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Check for duplicate URL if URL is being changed
    if (validation.data.url && validation.data.url !== webhooks[webhookIndex].url) {
      const duplicateUrl = webhooks.find(
        webhook => webhook.url === validation.data.url && webhook.id !== validation.data.id
      );
      
      if (duplicateUrl) {
        return NextResponse.json({ 
          error: 'A webhook with this URL already exists' 
        }, { status: 400 });
      }
    }

    // Update webhook
    const { id, ...updateData } = validation.data;
    webhooks[webhookIndex] = {
      ...webhooks[webhookIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        webhooks
      }
    });

    // Hide secret in response
    const safeWebhook = {
      ...webhooks[webhookIndex],
      secret: webhooks[webhookIndex].secret ? '***' : undefined
    };

    return NextResponse.json({ 
      message: 'Webhook updated successfully',
      webhook: safeWebhook
    });
  } catch (error) {
    console.error('[WEBHOOKS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete webhook
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
    const webhookId = searchParams.get('webhookId');
    
    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
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

    // Get current webhooks
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const webhooks = storeSettings?.webhooks as any[] || [];
    const filteredWebhooks = webhooks.filter(webhook => webhook.id !== webhookId);

    if (filteredWebhooks.length === webhooks.length) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        webhooks: filteredWebhooks
      }
    });

    return NextResponse.json({ 
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('[WEBHOOKS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}