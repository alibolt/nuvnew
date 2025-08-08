import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for tax settings
const taxSettingsSchema = z.object({
  taxesEnabled: z.boolean(),
  pricesIncludeTax: z.boolean(),
  shippingTaxable: z.boolean(),
  taxIdRequired: z.boolean(),
  defaultTaxRate: z.number().min(0).max(100),
  taxRegions: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    code: z.string(),
    rate: z.number().min(0).max(100),
    compound: z.boolean().optional(),
    priority: z.number().optional(),
    shipping: z.boolean().optional(),
  })).optional(),
});

// GET - Get tax settings
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

    // Get tax settings from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Default tax settings
    const defaultTaxSettings = {
      taxesEnabled: false,
      pricesIncludeTax: false,
      shippingTaxable: false,
      taxIdRequired: false,
      defaultTaxRate: 0,
      taxRegions: []
    };

    const taxSettings = storeSettings?.taxSettings as any || defaultTaxSettings;

    return NextResponse.json(taxSettings);
  } catch (error) {
    console.error('[TAX SETTINGS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update tax settings
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
    const validation = taxSettingsSchema.safeParse(body);
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

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        taxSettings: validation.data
      },
      create: {
        storeId: store.id,
        taxSettings: validation.data
      }
    });

    return NextResponse.json({ 
      message: 'Tax settings updated successfully',
      taxSettings: validation.data 
    });
  } catch (error) {
    console.error('[TAX SETTINGS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Add tax region
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
    
    // Validate tax region
    const taxRegionSchema = z.object({
      name: z.string(),
      code: z.string(),
      rate: z.number().min(0).max(100),
      compound: z.boolean().optional(),
      priority: z.number().optional(),
      shipping: z.boolean().optional(),
    });

    const validation = taxRegionSchema.safeParse(body);
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

    // Get current settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentTaxSettings = storeSettings?.taxSettings as any || {
      taxesEnabled: false,
      pricesIncludeTax: false,
      shippingTaxable: false,
      taxIdRequired: false,
      defaultTaxRate: 0,
      taxRegions: []
    };

    // Add new tax region
    const newTaxRegion = {
      id: `tax_${Date.now()}`,
      ...validation.data
    };

    currentTaxSettings.taxRegions.push(newTaxRegion);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        taxSettings: currentTaxSettings
      },
      create: {
        storeId: store.id,
        taxSettings: currentTaxSettings
      }
    });

    return NextResponse.json({ 
      message: 'Tax region added successfully',
      taxRegion: newTaxRegion 
    });
  } catch (error) {
    console.error('[TAX SETTINGS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}