import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createTaxCalculator } from '@/lib/services/tax/tax-calculator';

// Tax calculation request schema
const taxCalculationSchema = z.object({
  lineItems: z.array(z.object({
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    taxable: z.boolean().default(true),
  })),
  shippingAddress: z.object({
    country: z.string().length(2),
    state: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  shippingAmount: z.number().min(0).default(0),
  shippingTaxable: z.boolean().default(true),
});

// POST - Calculate tax for given items and address
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate request
    const validation = taxCalculationSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse.error('Invalid tax calculation data', 400);
    }

    const { lineItems, shippingAddress, shippingAmount, shippingTaxable } = validation.data;

    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Create tax calculator
    const taxCalculator = await createTaxCalculator(store.id);

    // Calculate tax
    const result = await taxCalculator.calculateTax(
      lineItems,
      shippingAddress,
      shippingAmount,
      shippingTaxable
    );

    // Return calculation result
    return NextResponse.json({
      subtotal: result.subtotal,
      taxLines: result.taxLines,
      totalTax: result.totalTax,
      totalWithTax: result.totalWithTax,
      taxSummary: taxCalculator.formatTaxSummary(result),
    });

  } catch (error) {
    console.error('[TAX CALCULATION API] Error:', error);
    return apiResponse.serverError();
  }
}

// GET - Get tax settings for the store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        storeSettings: {
          select: { taxSettings: true }
        }
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    const taxSettings = (store.storeSettings?.taxSettings as any) || {
      enabled: false,
      inclusive: false,
      defaultRate: 0,
      regions: []
    };

    return NextResponse.json({
      enabled: taxSettings.enabled,
      inclusive: taxSettings.inclusive,
      defaultRate: taxSettings.defaultRate,
      regionCount: taxSettings.regions?.length || 0,
      regions: taxSettings.regions || []
    });

  } catch (error) {
    console.error('[TAX SETTINGS API] Error:', error);
    return apiResponse.serverError();
  }
}