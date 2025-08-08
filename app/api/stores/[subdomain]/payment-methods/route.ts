import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for payment method configuration
const paymentMethodSchema = z.object({
  provider: z.enum(['nuvi', 'stripe', 'paypal', 'manual']),
  enabled: z.boolean(),
  testMode: z.boolean().optional(),
  settings: z.record(z.string(), z.any()).optional(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  accountVerified: z.boolean().optional(), // For Nuvi
});

// GET - List payment methods for a store
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

    // Get payment methods from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Default payment methods structure
    const defaultPaymentMethods = [
      {
        provider: 'nuvi',
        enabled: false,
        displayName: 'Nuvi Payment',
        description: 'Accept payments through platform account',
        accountVerified: false,
        settings: {
          commission: 5.9,
          fixedFee: 0.50,
          bankName: '',
          accountName: '',
          accountNumber: '',
          iban: '',
          swiftCode: '',
          bankAddress: '',
          accountType: 'checking' // checking or savings
        }
      },
      {
        provider: 'stripe',
        enabled: false,
        testMode: true,
        displayName: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card',
        settings: {
          publicKey: '',
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
    const paymentMethods = defaultPaymentMethods.map(method => {
      const saved = savedPaymentMethods[method.provider];
      if (saved) {
        return {
          ...method,
          ...saved,
          settings: {
            ...method.settings,
            ...(saved.settings || {})
          }
        };
      }
      return method;
    });

    return apiResponse.success(paymentMethods);
  } catch (error) {
    console.error('[PAYMENT METHODS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update payment methods configuration
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Convert array to object for storage
    const paymentMethodsObject = validation.data.reduce((acc, method) => {
      acc[method.provider] = method;
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
    return apiResponse.serverError();
  }
}