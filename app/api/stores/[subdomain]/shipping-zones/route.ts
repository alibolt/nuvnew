import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for shipping zone
const shippingZoneSchema = z.object({
  name: z.string().min(1),
  countries: z.array(z.string()),
  states: z.array(z.string()).optional(),
  zipCodes: z.array(z.string()).optional(),
  enabled: z.boolean().default(true),
  shippingRates: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number().min(0),
    minOrderAmount: z.number().min(0).optional(),
    maxOrderAmount: z.number().min(0).optional(),
    minWeight: z.number().min(0).optional(),
    maxWeight: z.number().min(0).optional(),
    estimatedDays: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    enabled: z.boolean().default(true)
  })).optional()
});

// GET - List shipping zones
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

    // Get shipping zones from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const shippingZones = storeSettings?.shippingZones as any || [];

    // Add default "Rest of World" zone if no zones exist
    if (shippingZones.length === 0) {
      shippingZones.push({
        id: 'default_zone',
        name: 'Rest of World',
        countries: ['*'], // All countries
        enabled: true,
        shippingRates: [
          {
            id: 'standard_shipping',
            name: 'Standard Shipping',
            description: 'Delivery in 7-14 business days',
            price: 10,
            enabled: true,
            estimatedDays: { min: 7, max: 14 }
          }
        ]
      });
    }

    return apiResponse.success(shippingZones);
  } catch (error) {
    console.error('[SHIPPING ZONES API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create shipping zone
export async function POST(
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
    const validation = shippingZoneSchema.safeParse(body);
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

    // Get current shipping zones
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const shippingZones = storeSettings?.shippingZones as any[] || [];

    // Create new zone with ID
    const newZone = {
      id: `zone_${Date.now()}`,
      ...validation.data,
      shippingRates: validation.data.shippingRates?.map(rate => ({
        id: `rate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...rate
      })) || []
    };

    // Add new zone
    shippingZones.push(newZone);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        shippingZones
      },
      create: {
        storeId: store.id,
        shippingZones
      }
    });

    return NextResponse.json({ 
      message: 'Shipping zone created successfully',
      shippingZone: newZone 
    });
  } catch (error) {
    console.error('[SHIPPING ZONES API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update all shipping zones
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
    
    // Validate input - array of zones
    const validation = z.array(shippingZoneSchema.extend({
      id: z.string()
    })).safeParse(body.shippingZones);
    
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

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        shippingZones: validation.data
      },
      create: {
        storeId: store.id,
        shippingZones: validation.data
      }
    });

    return NextResponse.json({ 
      message: 'Shipping zones updated successfully',
      shippingZones: validation.data 
    });
  } catch (error) {
    console.error('[SHIPPING ZONES API] PUT Error:', error);
    return apiResponse.serverError();
  }
}