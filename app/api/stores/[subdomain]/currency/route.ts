import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Available currencies
const availableCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' }
];

// Schema for currency settings
const currencySettingsSchema = z.object({
  code: z.string().optional(),
  symbol: z.string().optional(),
  name: z.string().optional(),
  position: z.enum(['before', 'after', 'before-space', 'after-space']).optional(),
  decimalPlaces: z.number().optional(),
  thousandSeparator: z.string().optional(),
  decimalSeparator: z.string().optional(),
  hideDecimalForWholeNumbers: z.boolean().optional(),
  enableMultiCurrency: z.boolean().optional(),
  enabledCurrencies: z.array(z.string()).optional(),
  defaultCurrency: z.string().optional(),
  autoDetect: z.boolean().optional(),
  showCurrencySelector: z.boolean().optional(),
  exchangeRateMode: z.enum(['manual', 'automatic']).optional(),
  exchangeRates: z.record(z.number()).optional()
});

// GET - Get currency settings (public endpoint for reading)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Find store by subdomain (no authentication required for reading)
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get currency settings from storeSettings
    console.log('[CURRENCY API] GET - Store settings:', store.storeSettings);
    const currencySettings = (store.storeSettings as any)?.currency || {
      enabledCurrencies: ['USD'],
      defaultCurrency: store.currency || 'USD',
      autoDetect: false,
      showCurrencySelector: true,
      exchangeRateMode: 'manual',
      exchangeRates: {}
    };
    console.log('[CURRENCY API] GET - Currency settings:', currencySettings);

    // Also include the currency formatting settings
    const formattingSettings = {
      code: currencySettings.defaultCurrency || store.currency || 'USD',
      symbol: currencySettings.symbol || availableCurrencies.find(c => c.code === (store.currency || 'USD'))?.symbol || '$',
      name: currencySettings.name || availableCurrencies.find(c => c.code === (store.currency || 'USD'))?.name || 'US Dollar',
      position: currencySettings.position || 'before',
      decimalPlaces: currencySettings.decimalPlaces ?? 2,
      thousandSeparator: currencySettings.thousandSeparator || ',',
      decimalSeparator: currencySettings.decimalSeparator || '.'
    };

    // Return currency settings with available currencies
    const enabledCurrencyDetails = currencySettings.enabledCurrencies.map((code: string) => 
      availableCurrencies.find(currency => currency.code === code)
    ).filter(Boolean);

    return NextResponse.json({ 
      currencySettings: {
        ...currencySettings,
        ...formattingSettings
      },
      availableCurrencies,
      enabledCurrencies: enabledCurrencyDetails
    });
  } catch (error) {
    console.error('[CURRENCY API] GET Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load currency settings',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}

// PUT - Update currency settings (requires authentication)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[CURRENCY API] Session:', session?.user?.email);
    
    if (!session?.user?.id) {
      console.log('[CURRENCY API] No session found');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please login',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const { subdomain } = await params;
    const body = await request.json();
    
    console.log('[CURRENCY API] PUT Request body:', body);
    console.log('[CURRENCY API] Subdomain:', subdomain);
    
    // Validate that we're updating the right store
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Validate input with schema
    const validation = currencySettingsSchema.safeParse(body);
    if (!validation.success) {
      console.error('[CURRENCY API] Validation error:', validation.error.format());
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const currencyData = validation.data;

    // Validate that all enabled currencies are supported
    if (currencyData.enabledCurrencies) {
      const invalidCurrencies = currencyData.enabledCurrencies.filter(
        (code: string) => !availableCurrencies.some(currency => currency.code === code)
      );

      if (invalidCurrencies.length > 0) {
        return apiResponse.badRequest(`Unsupported currencies: ${invalidCurrencies.join(', ')}`);
      }

      // Ensure default currency is in enabled currencies
      if (currencyData.defaultCurrency && !currencyData.enabledCurrencies.includes(currencyData.defaultCurrency)) {
        return apiResponse.badRequest('Default currency must be in enabled currencies');
      }
    }

    // Update store currency if default currency is changed
    const defaultCurrency = currencyData.defaultCurrency || currencyData.code || store.currency;
    if (defaultCurrency && defaultCurrency !== store.currency) {
      await prisma.store.update({
        where: { id: store.id },
        data: { currency: defaultCurrency }
      });
    }

    // Prepare final currency data
    const finalCurrencyData = {
      ...currencyData,
      defaultCurrency: defaultCurrency,
      symbol: currencyData.symbol || availableCurrencies.find(c => c.code === defaultCurrency)?.symbol || '$',
      name: currencyData.name || availableCurrencies.find(c => c.code === defaultCurrency)?.name || 'US Dollar'
    };
    
    console.log('[CURRENCY API] Final currency data:', finalCurrencyData);
    console.log('[CURRENCY API] Store ID:', store.id);

    const updatedSettings = await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        currency: finalCurrencyData
      } as any,
      create: {
        storeId: store.id,
        currency: finalCurrencyData
      } as any
    });
    
    console.log('[CURRENCY API] Settings updated successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Currency settings updated successfully',
      currencySettings: finalCurrencyData 
    });
  } catch (error) {
    console.error('[CURRENCY API] PUT Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update currency settings',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}

// POST - Get exchange rates (public endpoint)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    const { from, to } = body;

    if (!from || !to) {
      return apiResponse.badRequest('From and to currencies are required');
    }

    // Find store by subdomain
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get exchange rates from store settings
    const currencySettings = (store.storeSettings as any)?.currency || {};
    const exchangeRates = currencySettings.exchangeRates || {};

    // If we have manual exchange rates, use them
    if (exchangeRates[from] && exchangeRates[to]) {
      const rate = exchangeRates[to] / exchangeRates[from];
      return NextResponse.json({ 
        from,
        to,
        rate,
        mode: 'manual'
      });
    }

    // Otherwise return a default rate (in production, you'd call an exchange rate API)
    // For now, return mock rates
    const mockRates: Record<string, number> = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'TRY': 32.50,
      'JPY': 110,
      'CAD': 1.25,
      'AUD': 1.35
    };

    const fromRate = mockRates[from] || 1;
    const toRate = mockRates[to] || 1;
    const rate = toRate / fromRate;

    return NextResponse.json({ 
      from,
      to,
      rate,
      mode: 'automatic'
    });
  } catch (error) {
    console.error('[CURRENCY API] POST Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to get exchange rates',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}