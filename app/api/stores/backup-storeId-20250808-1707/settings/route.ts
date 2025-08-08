import { NextRequest, NextResponse } from 'next/server';
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
    guestCheckoutEnabled: z.boolean(),
    requirePhoneNumber: z.boolean(),
    requireShippingAddress: z.boolean(),
    requireBillingAddress: z.boolean(),
    enableOrderNotes: z.boolean(),
    enableGiftMessages: z.boolean(),
    termsAndConditionsRequired: z.boolean(),
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
});

// GET - Get store settings
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
    
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Add default currency settings if not exist
    const defaultCurrencies = store.storeSettings?.currencies || [{
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
        defaultCurrency: store.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('[SETTINGS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update store settings
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
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}