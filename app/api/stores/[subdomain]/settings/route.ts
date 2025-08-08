import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for store settings update
const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  timeZone: z.string().optional(),
  
  // Multi-currency support
  currencies: z.array(z.object({
    code: z.string().min(3).max(3), // ISO 4217
    rate: z.number().positive(),
    enabled: z.boolean(),
    symbol: z.string(),
    symbolPosition: z.enum(['before', 'after']),
    decimalPlaces: z.number().min(0).max(4),
    thousandsSeparator: z.string(),
    decimalSeparator: z.string(),
    roundingMode: z.enum(['up', 'down', 'nearest']).default('nearest')
  })).optional(),
  defaultCurrency: z.string().min(3).max(3).optional(),
  autoUpdateRates: z.boolean().default(false).optional(),
  
  // Units
  weightUnit: z.enum(['kg', 'g', 'lb', 'oz']).optional(),
  lengthUnit: z.enum(['cm', 'm', 'in', 'ft']).optional(),
  
  // Business details
  businessName: z.string().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessZip: z.string().optional(),
  businessCountry: z.string().optional(),
  businessType: z.string().optional(),
  taxId: z.string().optional(),
  
  // Business hours
  businessHours: z.object({
    enabled: z.boolean(),
    timezone: z.string(),
    hours: z.record(z.object({
      enabled: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
      breaks: z.array(z.object({
        startTime: z.string(),
        endTime: z.string()
      })).optional()
    })),
    holidayDates: z.array(z.string()).optional(),
    vacationMode: z.object({
      enabled: z.boolean(),
      message: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }).optional()
  }).optional(),
  
  // Checkout settings
  checkoutSettings: z.object({
    // Logo and branding
    checkoutLogo: z.string().optional(),
    
    // Terms and policies toggles
    showTermsAndConditions: z.boolean().optional(),
    showPrivacyPolicy: z.boolean().optional(),
    showReturnPolicy: z.boolean().optional(),
    
    // Form Fields - now with show/require options
    showEmail: z.boolean().optional(),
    requireEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    requirePhone: z.boolean().optional(),
    showCompany: z.boolean().optional(),
    requireCompany: z.boolean().optional(),
    showAddress2: z.boolean().optional(),
    requireAddress2: z.boolean().optional(),
    showNewsletterSignup: z.boolean().optional(),
    showSpecialInstructions: z.boolean().optional(),
    customFields: z.array(z.any()).optional(),
    
    // Checkout Behavior
    enableGuestCheckout: z.boolean().optional(),
    showShippingCalculator: z.boolean().optional(),
    requireAccountCreation: z.boolean().optional(),
    enableExpressCheckout: z.boolean().optional(),
    showOrderSummary: z.boolean().optional(),
    enableTipsAndGratuity: z.boolean().optional(),
    
    // Customer Accounts
    accountCreation: z.string().optional(),
    passwordRequirements: z.object({
      minLength: z.number().optional(),
      requireUppercase: z.boolean().optional(),
      requireNumbers: z.boolean().optional(),
      requireSpecialChars: z.boolean().optional()
    }).optional(),
    enableSocialLogin: z.boolean().optional(),
    allowAccountDeletion: z.boolean().optional(),
    
    // Post-Purchase
    showThankYouPage: z.boolean().optional(),
    enableOrderTracking: z.boolean().optional(),
    showRecommendedProducts: z.boolean().optional(),
    enableReviews: z.boolean().optional(),
    sendConfirmationEmail: z.boolean().optional(),
    redirectUrl: z.string().optional(),
    thankYouMessage: z.string().optional(),
    
    // Legacy fields (for backward compatibility)
    guestCheckoutEnabled: z.boolean().optional(),
    requirePhoneNumber: z.boolean().optional(),
    requireShippingAddress: z.boolean().optional(),
    requireBillingAddress: z.boolean().optional(),
    enableOrderNotes: z.boolean().optional(),
    enableGiftMessages: z.boolean().optional(),
    termsAndConditionsRequired: z.boolean().optional(),
    termsAndConditionsUrl: z.string().url().optional(),
    checkoutMessage: z.string().optional(),
    successPageMessage: z.string().optional()
  }).optional(),
  
  // Order settings
  orderSettings: z.object({
    orderNumberPrefix: z.string().optional(),
    orderNumberSuffix: z.string().optional(),
    orderNumberFormat: z.enum(['sequential', 'random', 'date-based']),
    orderNumberStartValue: z.number().min(1).optional(),
    autoArchiveAfterDays: z.number().min(0).optional(),
    autoFulfillDigitalOrders: z.boolean(),
    sendOrderConfirmationEmail: z.boolean(),
    allowPartialFulfillment: z.boolean()
  }).optional(),
  
  // Stock management
  stockSettings: z.object({
    trackInventory: z.boolean(),
    allowBackorders: z.boolean(),
    hideOutOfStock: z.boolean(),
    lowStockThreshold: z.number().min(0).optional(),
    stockDisplayFormat: z.enum(['exact', 'range', 'availability']),
    reserveStockMinutes: z.number().min(0).optional()
  }).optional(),
  
  // Social media
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  tiktokUrl: z.string().url().optional().or(z.literal('')),
  
  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  
  // Analytics
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  tiktokPixelId: z.string().optional(),
  
  // Advanced settings
  enablePasswordProtection: z.boolean().optional(),
  storePassword: z.string().optional(),
  enableAgeVerification: z.boolean().optional(),
  minimumAge: z.number().optional(),
  enableMaintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  
  // Payment settings (both payments and paymentMethods for compatibility)
  payments: z.object({
    stripe: z.object({
      enabled: z.boolean(),
      publicKey: z.string(),
      secretKey: z.string(),
      webhookSecret: z.string(),
      testMode: z.boolean(),
    }).optional(),
    paypal: z.object({
      enabled: z.boolean(),
      clientId: z.string(),
      clientSecret: z.string(),
      testMode: z.boolean(),
    }).optional(),
    currency: z.string(),
    captureMethod: z.enum(['automatic', 'manual']),
    statementDescriptor: z.string(),
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
        id: z.string(),
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
  }).optional(),
  
  paymentMethods: z.object({
    stripe: z.object({
      enabled: z.boolean(),
      publicKey: z.string(),
      secretKey: z.string(),
      webhookSecret: z.string(),
      testMode: z.boolean(),
    }).optional(),
    paypal: z.object({
      enabled: z.boolean(),
      clientId: z.string(),
      clientSecret: z.string(),
      testMode: z.boolean(),
    }).optional(),
    currency: z.string(),
    captureMethod: z.enum(['automatic', 'manual']),
    statementDescriptor: z.string(),
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
        id: z.string(),
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
  }).optional(),
  
  // Email settings
  emailSettings: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses']),
    fromEmail: z.string().email(),
    fromName: z.string(),
    replyToEmail: z.string().email().optional(),
    smtp: z.object({
      host: z.string(),
      port: z.number(),
      secure: z.boolean(),
      auth: z.object({
        user: z.string(),
        pass: z.string(),
      }),
    }).optional(),
    sendgrid: z.object({
      apiKey: z.string(),
    }).optional(),
    mailgun: z.object({
      apiKey: z.string(),
      domain: z.string(),
    }).optional(),
    ses: z.object({
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      region: z.string(),
    }).optional(),
    notifications: z.object({
      orderConfirmation: z.boolean(),
      orderShipped: z.boolean(),
      orderCancelled: z.boolean(),
      orderRefunded: z.boolean(),
      customerWelcome: z.boolean(),
      abandonedCart: z.boolean(),
      lowStock: z.boolean(),
    }).optional(),
    templates: z.object({
      orderConfirmation: z.object({
        subject: z.string(),
        enabled: z.boolean(),
      }).optional(),
      orderShipped: z.object({
        subject: z.string(),
        enabled: z.boolean(),
      }).optional(),
      customerWelcome: z.object({
        subject: z.string(),
        enabled: z.boolean(),
      }).optional(),
      abandonedCart: z.object({
        subject: z.string(),
        enabled: z.boolean(),
        delayHours: z.number(),
      }).optional(),
    }).optional(),
  }).optional(),
});

// GET - Get store settings
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
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Add default currency settings if not exist
    const defaultCurrencies = (store.storeSettings as any)?.currencies || [{
      code: store.currency || 'USD',
      rate: 1,
      enabled: true,
      symbol: '$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      roundingMode: 'nearest'
    }];

    // Return store with settings
    return NextResponse.json({
      ...store,
      settings: {
        ...store.storeSettings,
        currencies: defaultCurrencies,
        defaultCurrency: store.currency || 'USD',
        checkoutSettings: (store.storeSettings as any)?.checkoutSettings || {}
      }
    });
  } catch (error) {
    console.error('[SETTINGS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update store settings
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
    const validation = updateSettingsSchema.safeParse(body);
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

    // Separate store fields and settings fields
    const { 
      name, description, defaultCurrency,
      ...settingsData 
    } = validation.data;

    // Update store and settings in a transaction
    const updatedStore = await prisma.$transaction(async (tx) => {
      // Update store basic info
      const storeUpdate = await tx.store.update({
        where: { id: store.id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(defaultCurrency && { currency: defaultCurrency })
        }
      });

      // Update or create store settings
      const settings = await tx.storeSettings.upsert({
        where: { storeId: store.id },
        update: settingsData,
        create: {
          storeId: store.id,
          ...settingsData
        }
      });

      return {
        ...storeUpdate,
        settings
      };
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('[SETTINGS API] PUT Error:', error);
    return apiResponse.serverError();
  }
}