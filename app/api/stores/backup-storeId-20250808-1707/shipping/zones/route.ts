import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for individual shipping zone
const shippingZoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  countries: z.array(z.string().min(2).max(2)),
  states: z.array(z.string()).optional(),
  postalCodes: z.array(z.string()).optional(),
  enabled: z.boolean().default(true),
  priority: z.number().min(0).default(0), // Higher priority zones are checked first
  methods: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(['flat_rate', 'weight_based', 'price_based', 'carrier', 'free', 'local_pickup']),
    enabled: z.boolean().default(true),
    conditions: z.object({
      minWeight: z.number().min(0).optional(),
      maxWeight: z.number().min(0).optional(),
      minValue: z.number().min(0).optional(),
      maxValue: z.number().min(0).optional(),
      minQuantity: z.number().min(0).optional(),
      maxQuantity: z.number().min(0).optional(),
      categories: z.array(z.string()).optional(),
      products: z.array(z.string()).optional()
    }).optional(),
    pricing: z.object({
      baseRate: z.number().min(0),
      perKgRate: z.number().min(0).optional(),
      perItemRate: z.number().min(0).optional(),
      freeShippingThreshold: z.number().min(0).optional(),
      maxRate: z.number().min(0).optional(),
      handlingFee: z.number().min(0).optional()
    }),
    deliveryTime: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
      unit: z.enum(['hours', 'days', 'weeks']).default('days'),
      cutoffTime: z.string().optional(), // e.g., "14:00" for 2 PM
      businessDaysOnly: z.boolean().default(true)
    }).optional(),
    carrier: z.object({
      name: z.string(),
      service: z.string(),
      apiKey: z.string().optional(),
      accountNumber: z.string().optional(),
      settings: z.record(z.any()).optional()
    }).optional(),
    features: z.object({
      tracking: z.boolean().default(false),
      insurance: z.boolean().default(false),
      signature: z.boolean().default(false),
      packaging: z.boolean().default(false)
    }).optional()
  }))
});

// Schema for zone testing
const zoneTestSchema = z.object({
  destination: z.object({
    country: z.string().min(2).max(2),
    state: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional()
  }),
  items: z.array(z.object({
    weight: z.number().min(0),
    value: z.number().min(0),
    quantity: z.number().min(1)
  })).optional()
});

// Common countries list
const COMMON_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'NZ', name: 'New Zealand' }
];

// GET - Get all shipping zones
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
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

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

    if (action === 'countries') {
      return NextResponse.json({ countries: COMMON_COUNTRIES });
    }

    if (action === 'templates') {
      const templates = [
        {
          name: 'Domestic Shipping',
          description: 'Basic shipping within your country',
          countries: [store.address?.country || 'US'],
          methods: [
            {
              name: 'Standard Shipping',
              type: 'flat_rate',
              pricing: { baseRate: 5.99 },
              deliveryTime: { min: 3, max: 7, unit: 'days' }
            },
            {
              name: 'Express Shipping',
              type: 'flat_rate',
              pricing: { baseRate: 12.99 },
              deliveryTime: { min: 1, max: 3, unit: 'days' }
            },
            {
              name: 'Free Shipping',
              type: 'free',
              pricing: { baseRate: 0, freeShippingThreshold: 50 },
              deliveryTime: { min: 5, max: 10, unit: 'days' }
            }
          ]
        },
        {
          name: 'International Shipping',
          description: 'Shipping to other countries',
          countries: ['CA', 'GB', 'AU', 'DE', 'FR'],
          methods: [
            {
              name: 'International Standard',
              type: 'weight_based',
              pricing: { baseRate: 15, perKgRate: 5 },
              deliveryTime: { min: 7, max: 21, unit: 'days' }
            },
            {
              name: 'International Express',
              type: 'weight_based',
              pricing: { baseRate: 35, perKgRate: 10 },
              deliveryTime: { min: 3, max: 7, unit: 'days' }
            }
          ]
        },
        {
          name: 'Local Pickup',
          description: 'Customer picks up in store',
          countries: [store.address?.country || 'US'],
          methods: [
            {
              name: 'Store Pickup',
              type: 'local_pickup',
              pricing: { baseRate: 0 },
              deliveryTime: { min: 0, max: 1, unit: 'days' }
            }
          ]
        }
      ];

      return NextResponse.json({ templates });
    }

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const shippingZones = (storeSettings?.shippingZones as any[]) || [];

    // Sort zones by priority
    shippingZones.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Get analytics for each zone
    const zonesWithStats = await Promise.all(
      shippingZones.map(async (zone) => {
        const stats = await getZoneAnalytics(store.id, zone.id);
        return { ...zone, stats };
      })
    );

    return NextResponse.json({
      zones: zonesWithStats,
      summary: {
        totalZones: shippingZones.length,
        activeZones: shippingZones.filter(z => z.enabled).length,
        totalMethods: shippingZones.reduce((sum, z) => sum + z.methods.length, 0),
        activeMethods: shippingZones.reduce((sum, z) => 
          sum + z.methods.filter(m => m.enabled).length, 0
        )
      }
    });
  } catch (error) {
    console.error('[SHIPPING ZONES API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create new shipping zone
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

    // Validate input
    const validation = shippingZoneSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid shipping zone data',
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

    // Get current zones
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentZones = (storeSettings?.shippingZones as any[]) || [];

    // Create new zone with IDs
    const newZone = {
      ...validation.data,
      id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      methods: validation.data.methods.map(method => ({
        ...method,
        id: method.id || `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      }))
    };

    // Add to zones array
    const updatedZones = [...currentZones, newZone];

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { shippingZones: updatedZones },
      create: { storeId: store.id, shippingZones: updatedZones }
    });

    return NextResponse.json({
      message: 'Shipping zone created successfully',
      zone: newZone
    }, { status: 201 });
  } catch (error) {
    console.error('[SHIPPING ZONES API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update shipping zones (bulk update)
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
    const validation = z.array(shippingZoneSchema).safeParse(body.zones);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid shipping zones data',
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

    // Process zones with IDs and timestamps
    const processedZones = validation.data.map(zone => ({
      ...zone,
      id: zone.id || `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      updatedAt: new Date().toISOString(),
      methods: zone.methods.map(method => ({
        ...method,
        id: method.id || `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date().toISOString()
      }))
    }));

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { shippingZones: processedZones },
      create: { storeId: store.id, shippingZones: processedZones }
    });

    return NextResponse.json({
      message: 'Shipping zones updated successfully',
      zones: processedZones
    });
  } catch (error) {
    console.error('[SHIPPING ZONES API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete shipping zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    if (!zoneId) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
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

    // Get current zones
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const currentZones = (storeSettings?.shippingZones as any[]) || [];
    const updatedZones = currentZones.filter(zone => zone.id !== zoneId);

    if (currentZones.length === updatedZones.length) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { shippingZones: updatedZones }
    });

    return NextResponse.json({
      message: 'Shipping zone deleted successfully'
    });
  } catch (error) {
    console.error('[SHIPPING ZONES API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to get zone analytics
async function getZoneAnalytics(storeId: string, zoneId: string) {
  // In a real implementation, you would track which zones/methods were used for each order
  // For now, return mock analytics
  return {
    ordersCount: 0,
    revenue: 0,
    averageShippingCost: 0,
    mostUsedMethod: null,
    lastUsed: null
  };
}