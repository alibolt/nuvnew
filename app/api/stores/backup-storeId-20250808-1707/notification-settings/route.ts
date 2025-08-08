import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for notification settings
const notificationSettingsSchema = z.object({
  // Order notifications
  orderConfirmation: z.object({
    enabled: z.boolean(),
    sendToCustomer: z.boolean(),
    sendToAdmin: z.boolean(),
    adminEmails: z.array(z.string().email()).optional()
  }),
  orderShipped: z.object({
    enabled: z.boolean(),
    sendToCustomer: z.boolean(),
    sendToAdmin: z.boolean()
  }),
  orderDelivered: z.object({
    enabled: z.boolean(),
    sendToCustomer: z.boolean()
  }),
  orderCancelled: z.object({
    enabled: z.boolean(),
    sendToCustomer: z.boolean(),
    sendToAdmin: z.boolean()
  }),
  
  // Customer notifications
  welcomeEmail: z.object({
    enabled: z.boolean(),
    delay: z.number().optional() // Delay in minutes
  }),
  passwordReset: z.object({
    enabled: z.boolean()
  }),
  
  // Inventory notifications
  lowStock: z.object({
    enabled: z.boolean(),
    threshold: z.number().min(0),
    emails: z.array(z.string().email())
  }),
  outOfStock: z.object({
    enabled: z.boolean(),
    emails: z.array(z.string().email())
  }),
  
  // Marketing notifications
  abandonedCart: z.object({
    enabled: z.boolean(),
    delay: z.number().min(30), // Minutes
    maxReminders: z.number().min(1).max(3)
  }),
  
  // Email settings
  emailProvider: z.enum(['smtp', 'sendgrid', 'mailgun', 'default']).default('default'),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  replyToEmail: z.string().email().optional()
});

// GET - Get notification settings
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

    // Get notification settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Default notification settings
    const defaultSettings = {
      orderConfirmation: {
        enabled: true,
        sendToCustomer: true,
        sendToAdmin: true,
        adminEmails: [store.email || session.user.email]
      },
      orderShipped: {
        enabled: true,
        sendToCustomer: true,
        sendToAdmin: false
      },
      orderDelivered: {
        enabled: true,
        sendToCustomer: true
      },
      orderCancelled: {
        enabled: true,
        sendToCustomer: true,
        sendToAdmin: true
      },
      welcomeEmail: {
        enabled: true,
        delay: 0
      },
      passwordReset: {
        enabled: true
      },
      lowStock: {
        enabled: false,
        threshold: 10,
        emails: [store.email || session.user.email]
      },
      outOfStock: {
        enabled: true,
        emails: [store.email || session.user.email]
      },
      abandonedCart: {
        enabled: false,
        delay: 60, // 1 hour
        maxReminders: 2
      },
      emailProvider: 'default',
      fromEmail: store.email || `noreply@${store.subdomain}.com`,
      fromName: store.name,
      replyToEmail: store.email
    };

    const notificationSettings = storeSettings?.notificationSettings as any || defaultSettings;

    return NextResponse.json(notificationSettings);
  } catch (error) {
    console.error('[NOTIFICATION SETTINGS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update notification settings
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
    const validation = notificationSettingsSchema.safeParse(body);
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

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        notificationSettings: validation.data
      },
      create: {
        storeId: store.id,
        notificationSettings: validation.data
      }
    });

    return NextResponse.json({ 
      message: 'Notification settings updated successfully',
      notificationSettings: validation.data 
    });
  } catch (error) {
    console.error('[NOTIFICATION SETTINGS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}