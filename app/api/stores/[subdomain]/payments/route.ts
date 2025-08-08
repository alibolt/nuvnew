import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { encrypt, decrypt } from '@/lib/crypto';

// Schema for payment settings update
const paymentSettingsSchema = z.object({
  stripe: z.object({
    enabled: z.boolean(),
    publicKey: z.string().optional(),
    secretKey: z.string().optional(),
    webhookSecret: z.string().optional(),
    testMode: z.boolean(),
  }).optional(),
  paypal: z.object({
    enabled: z.boolean(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    testMode: z.boolean(),
  }).optional(),
  currency: z.string(),
  captureMethod: z.enum(['automatic', 'manual']),
  statementDescriptor: z.string().optional(),
  saveCards: z.boolean(),
  requireCVV: z.boolean(),
  requirePostalCode: z.boolean(),
  enableWallets: z.object({
    applePay: z.boolean(),
    googlePay: z.boolean(),
  }),
  taxes: z.object({
    enabled: z.boolean(),
    inclusive: z.boolean(),
    defaultRate: z.number(),
    regions: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      code: z.string(),
      rate: z.number(),
    })),
  }),
  testMode: z.object({
    enabled: z.boolean(),
    showBanner: z.boolean(),
    testCards: z.boolean(),
  }),
});

// GET - Get payment settings
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
    
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      },
      include: {
        paymentSettings: {
          include: {
            taxRegions: true
          }
        }
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Decrypt sensitive fields if payment settings exist
    if (store.paymentSettings) {
      const settings = store.paymentSettings;
      
      return NextResponse.json({
        stripe: {
          enabled: settings.stripeEnabled,
          publicKey: settings.stripePublicKey || '',
          secretKey: settings.stripeSecretKey ? '********' : '', // Don't send actual secret
          webhookSecret: settings.stripeWebhookSecret ? '********' : '', // Don't send actual secret
          testMode: settings.stripeTestMode,
        },
        paypal: {
          enabled: settings.paypalEnabled,
          clientId: settings.paypalClientId || '',
          clientSecret: settings.paypalClientSecret ? '********' : '', // Don't send actual secret
          testMode: settings.paypalTestMode,
        },
        currency: settings.currency,
        captureMethod: settings.captureMethod,
        statementDescriptor: settings.statementDescriptor || '',
        saveCards: settings.saveCards,
        requireCVV: settings.requireCVV,
        requirePostalCode: settings.requirePostalCode,
        enableWallets: {
          applePay: settings.enableApplePay,
          googlePay: settings.enableGooglePay,
        },
        taxes: {
          enabled: settings.taxEnabled,
          inclusive: settings.taxInclusive,
          defaultRate: settings.defaultTaxRate,
          regions: settings.taxRegions,
        },
        testMode: {
          enabled: settings.testModeEnabled,
          showBanner: settings.testModeShowBanner,
          testCards: settings.testModeAllowTestCards,
        },
      });
    }

    // Return default settings if none exist
    return NextResponse.json({
      stripe: {
        enabled: false,
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        testMode: true,
      },
      paypal: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        testMode: true,
      },
      currency: 'USD',
      captureMethod: 'automatic',
      statementDescriptor: store.name.substring(0, 22),
      saveCards: true,
      requireCVV: true,
      requirePostalCode: false,
      enableWallets: {
        applePay: true,
        googlePay: true,
      },
      taxes: {
        enabled: false,
        inclusive: false,
        defaultRate: 0,
        regions: [],
      },
      testMode: {
        enabled: true,
        showBanner: true,
        testCards: true,
      },
    });
  } catch (error) {
    console.error('[PAYMENT SETTINGS API] GET Error:', error);
    return handleApiError(error);
  }
}

// PUT - Update payment settings
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
    const validation = paymentSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      },
      include: {
        paymentSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const data = validation.data;
    
    // Prepare data for database
    const paymentData: any = {
      currency: data.currency,
      captureMethod: data.captureMethod,
      statementDescriptor: data.statementDescriptor,
      saveCards: data.saveCards,
      requireCVV: data.requireCVV,
      requirePostalCode: data.requirePostalCode,
      enableApplePay: data.enableWallets.applePay,
      enableGooglePay: data.enableWallets.googlePay,
      taxEnabled: data.taxes.enabled,
      taxInclusive: data.taxes.inclusive,
      defaultTaxRate: data.taxes.defaultRate,
      testModeEnabled: data.testMode.enabled,
      testModeShowBanner: data.testMode.showBanner,
      testModeAllowTestCards: data.testMode.testCards,
    };

    // Handle Stripe settings
    if (data.stripe) {
      paymentData.stripeEnabled = data.stripe.enabled;
      paymentData.stripePublicKey = data.stripe.publicKey || null;
      paymentData.stripeTestMode = data.stripe.testMode;
      
      // Only update secrets if they're not masked values
      if (data.stripe.secretKey && !data.stripe.secretKey.includes('*')) {
        paymentData.stripeSecretKey = encrypt(data.stripe.secretKey);
      }
      if (data.stripe.webhookSecret && !data.stripe.webhookSecret.includes('*')) {
        paymentData.stripeWebhookSecret = encrypt(data.stripe.webhookSecret);
      }
    }

    // Handle PayPal settings
    if (data.paypal) {
      paymentData.paypalEnabled = data.paypal.enabled;
      paymentData.paypalClientId = data.paypal.clientId || null;
      paymentData.paypalTestMode = data.paypal.testMode;
      
      // Only update secret if it's not a masked value
      if (data.paypal.clientSecret && !data.paypal.clientSecret.includes('*')) {
        paymentData.paypalClientSecret = encrypt(data.paypal.clientSecret);
      }
    }

    // Update or create payment settings
    const paymentSettings = await prisma.$transaction(async (tx) => {
      // Update or create payment settings
      const settings = await tx.paymentSettings.upsert({
        where: { storeId: store.id },
        update: paymentData,
        create: {
          storeId: store.id,
          ...paymentData
        }
      });

      // Handle tax regions
      if (data.taxes.regions) {
        // Delete existing regions
        await tx.taxRegion.deleteMany({
          where: { paymentSettingsId: settings.id }
        });

        // Create new regions
        if (data.taxes.regions.length > 0) {
          await tx.taxRegion.createMany({
            data: data.taxes.regions.map(region => ({
              paymentSettingsId: settings.id,
              name: region.name,
              code: region.code,
              rate: region.rate,
            }))
          });
        }
      }

      return settings;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PAYMENT SETTINGS API] PUT Error:', error);
    return handleApiError(error);
  }
}