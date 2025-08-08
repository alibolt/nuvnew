import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for payment method configuration
const paymentMethodSchema = z.object({
  provider: z.enum(['stripe', 'paypal', 'manual']),
  enabled: z.boolean(),
  testMode: z.boolean().optional(),
  settings: z.record(z.string(), z.any()).optional(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
});

// GET - List payment methods for a store
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

    // Get payment methods from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Default payment methods structure
    const defaultPaymentMethods = [
      {
        provider: 'stripe',
        enabled: false,
        testMode: true,
        displayName: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card',
        settings: {
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        }
      },
      {
        provider: 'paypal',
        enabled: false,
        testMode: true,
        displayName: 'PayPal',
        description: 'Pay with your PayPal account',
        settings: {
          clientId: '',
          clientSecret: '',
          webhookId: ''
        }
      },
      {
        provider: 'manual',
        enabled: false,
        displayName: 'Bank Transfer',
        description: 'Pay via bank transfer',
        instructions: 'Transfer the total amount to our bank account and include your order number as reference.',
        settings: {
          bankName: '',
          accountName: '',
          accountNumber: '',
          routingNumber: '',
          swiftCode: ''
        }
      }
    ];

    // Merge with saved settings if any
    const savedPaymentMethods = storeSettings?.paymentMethods as any || {};
    const paymentMethods = defaultPaymentMethods.map(method => ({
      ...method,
      ...(savedPaymentMethods[method.provider] || {})
    }));

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('[PAYMENT METHODS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update payment methods configuration
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
    const validation = z.array(paymentMethodSchema).safeParse(body.paymentMethods);
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

    // Convert array to object for storage
    const paymentMethodsObject = validation.data.reduce((acc, method) => {
      // Remove sensitive data from being exposed
      const settings = { ...method.settings };
      if (method.provider === 'stripe' && settings.secretKey) {
        settings.secretKey = settings.secretKey.startsWith('sk_') 
          ? `${settings.secretKey.substring(0, 10)}...${settings.secretKey.slice(-4)}`
          : settings.secretKey;
      }
      if (method.provider === 'paypal' && settings.clientSecret) {
        settings.clientSecret = settings.clientSecret.length > 10
          ? `${settings.clientSecret.substring(0, 10)}...`
          : settings.clientSecret;
      }
      
      acc[method.provider] = {
        ...method,
        settings
      };
      return acc;
    }, {} as Record<string, any>);

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        paymentMethods: paymentMethodsObject
      },
      create: {
        storeId: store.id,
        paymentMethods: paymentMethodsObject
      }
    });

    return NextResponse.json({ 
      message: 'Payment methods updated successfully',
      paymentMethods: validation.data 
    });
  } catch (error) {
    console.error('[PAYMENT METHODS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}