import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for automation trigger
const automationTriggerSchema = z.object({
  type: z.enum([
    'welcome_new_customer',
    'abandoned_cart',
    'post_purchase',
    'win_back',
    'birthday',
    'product_restock',
    'review_request',
    'customer_milestone'
  ]),
  conditions: z.object({
    delay: z.object({
      value: z.number().min(0),
      unit: z.enum(['minutes', 'hours', 'days', 'weeks'])
    }).optional(),
    customerSegment: z.array(z.string()).optional(),
    orderAmount: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    productIds: z.array(z.string()).optional(),
    lastOrderDays: z.number().optional() // For win-back campaigns
  }).optional()
});

// Schema for automation action
const automationActionSchema = z.object({
  type: z.enum(['send_email', 'send_sms', 'create_discount', 'add_tag', 'update_customer']),
  config: z.object({
    // Email action config
    emailTemplate: z.string().optional(),
    subject: z.string().optional(),
    fromEmail: z.string().email().optional(),
    fromName: z.string().optional(),
    
    // SMS action config
    message: z.string().optional(),
    
    // Discount action config
    discountType: z.enum(['percentage', 'fixed_amount', 'free_shipping']).optional(),
    discountValue: z.number().optional(),
    discountCode: z.string().optional(),
    expiryDays: z.number().optional(),
    
    // Tag action config
    tags: z.array(z.string()).optional(),
    
    // Customer update config
    customerData: z.object({
      acceptsMarketing: z.boolean().optional(),
      notes: z.string().optional()
    }).optional()
  })
});

// Schema for creating automation
const createAutomationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: automationTriggerSchema,
  actions: z.array(automationActionSchema).min(1),
  enabled: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// GET - List automations
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
    
    const enabled = searchParams.get('enabled');
    const triggerType = searchParams.get('triggerType');
    
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

    // Get automations from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let automations = (storeSettings?.marketingAutomations as any[]) || [];

    // Apply filters
    if (enabled !== null) {
      automations = automations.filter(a => a.enabled === (enabled === 'true'));
    }
    
    if (triggerType) {
      automations = automations.filter(a => a.trigger.type === triggerType);
    }

    // Calculate automation metrics
    const metrics = {
      total: automations.length,
      enabled: automations.filter(a => a.enabled).length,
      disabled: automations.filter(a => !a.enabled).length,
      totalTriggers: automations.reduce((sum, a) => sum + (a.stats?.triggered || 0), 0),
      totalActions: automations.reduce((sum, a) => sum + (a.stats?.actionsExecuted || 0), 0)
    };

    return NextResponse.json({
      automations,
      metrics
    });
  } catch (error) {
    console.error('[MARKETING AUTOMATIONS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create automation
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
    const validation = createAutomationSchema.safeParse(body);
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

    // Create automation
    const newAutomation = {
      id: `automation_${Date.now()}`,
      ...validation.data,
      stats: {
        triggered: 0,
        actionsExecuted: 0,
        successRate: 0,
        lastTriggered: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Get current automations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const automations = (storeSettings?.marketingAutomations as any[]) || [];
    automations.push(newAutomation);

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { marketingAutomations: automations },
      create: {
        storeId: store.id,
        marketingAutomations: automations
      }
    });

    return NextResponse.json({ 
      message: 'Automation created successfully',
      automation: newAutomation
    });
  } catch (error) {
    console.error('[MARKETING AUTOMATIONS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}