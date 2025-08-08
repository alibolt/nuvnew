import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for shipping calculation request
const shippingCalculationSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    weight: z.number().min(0).optional(),
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
      unit: z.enum(['cm', 'in']).default('cm')
    }).optional(),
    value: z.number().min(0),
    requiresShipping: z.boolean().default(true)
  })).min(1),
  destination: z.object({
    country: z.string().min(2).max(2), // ISO country code
    state: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    address: z.string().optional()
  }),
  origin: z.object({
    country: z.string().min(2).max(2),
    state: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    address: z.string().optional()
  }).optional(),
  options: z.object({
    includeInsurance: z.boolean().default(false),
    includeSignature: z.boolean().default(false),
    expedited: z.boolean().default(false),
    currency: z.string().default('USD')
  }).optional()
});

// Schema for shipping zone configuration
const shippingZoneSchema = z.object({
  name: z.string().min(1),
  countries: z.array(z.string().min(2).max(2)),
  states: z.array(z.string()).optional(),
  postalCodes: z.array(z.string()).optional(),
  enabled: z.boolean().default(true),
  methods: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['flat_rate', 'weight_based', 'price_based', 'carrier', 'free']),
    enabled: z.boolean().default(true),
    conditions: z.object({
      minWeight: z.number().min(0).optional(),
      maxWeight: z.number().min(0).optional(),
      minValue: z.number().min(0).optional(),
      maxValue: z.number().min(0).optional(),
      minQuantity: z.number().min(0).optional(),
      maxQuantity: z.number().min(0).optional()
    }).optional(),
    pricing: z.object({
      baseRate: z.number().min(0),
      perKgRate: z.number().min(0).optional(),
      perItemRate: z.number().min(0).optional(),
      freeShippingThreshold: z.number().min(0).optional(),
      maxRate: z.number().min(0).optional()
    }),
    deliveryTime: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
      unit: z.enum(['hours', 'days', 'weeks']).default('days')
    }).optional(),
    carrier: z.object({
      name: z.string(),
      service: z.string(),
      apiKey: z.string().optional(),
      accountNumber: z.string().optional()
    }).optional()
  }))
});

// Helper function to calculate package dimensions and weight
function calculatePackageMetrics(items: any[]) {
  let totalWeight = 0;
  let totalVolume = 0;
  let totalValue = 0;
  let requiresShipping = false;

  for (const item of items) {
    if (item.requiresShipping) {
      requiresShipping = true;
      totalWeight += (item.weight || 0) * item.quantity;
      totalValue += item.value * item.quantity;
      
      if (item.dimensions) {
        const volume = item.dimensions.length * item.dimensions.width * item.dimensions.height;
        totalVolume += volume * item.quantity;
      }
    }
  }

  // Calculate package dimensions (simple cube root approximation)
  const packageDimensions = totalVolume > 0 ? {
    length: Math.ceil(Math.cbrt(totalVolume)),
    width: Math.ceil(Math.cbrt(totalVolume)),
    height: Math.ceil(Math.cbrt(totalVolume)),
    unit: 'cm' as const
  } : null;

  return {
    totalWeight,
    totalVolume,
    totalValue,
    requiresShipping,
    packageDimensions,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

// Helper function to check if destination matches zone
function isDestinationInZone(destination: any, zone: any): boolean {
  // Check country
  if (!zone.countries.includes(destination.country)) {
    return false;
  }

  // Check state if specified
  if (zone.states?.length && destination.state) {
    if (!zone.states.includes(destination.state)) {
      return false;
    }
  }

  // Check postal codes if specified
  if (zone.postalCodes?.length && destination.postalCode) {
    const matchesPostalCode = zone.postalCodes.some((pattern: string) => {
      // Support wildcard patterns like "10*", "SW*", etc.
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$', 'i');
        return regex.test(destination.postalCode);
      }
      return pattern.toLowerCase() === destination.postalCode.toLowerCase();
    });
    
    if (!matchesPostalCode) {
      return false;
    }
  }

  return true;
}

// Helper function to calculate shipping rate for a method
function calculateMethodRate(method: any, packageMetrics: any, options: any = {}) {
  const { pricing, conditions, type } = method;
  const { totalWeight, totalValue, itemCount } = packageMetrics;

  // Check conditions
  if (conditions) {
    if (conditions.minWeight && totalWeight < conditions.minWeight) return null;
    if (conditions.maxWeight && totalWeight > conditions.maxWeight) return null;
    if (conditions.minValue && totalValue < conditions.minValue) return null;
    if (conditions.maxValue && totalValue > conditions.maxValue) return null;
    if (conditions.minQuantity && itemCount < conditions.minQuantity) return null;
    if (conditions.maxQuantity && itemCount > conditions.maxQuantity) return null;
  }

  let rate = 0;

  switch (type) {
    case 'free':
      if (pricing.freeShippingThreshold && totalValue >= pricing.freeShippingThreshold) {
        rate = 0;
      } else {
        return null; // Free shipping conditions not met
      }
      break;

    case 'flat_rate':
      rate = pricing.baseRate;
      break;

    case 'weight_based':
      rate = pricing.baseRate + (pricing.perKgRate || 0) * totalWeight;
      break;

    case 'price_based':
      const percentage = pricing.perItemRate || 0;
      rate = pricing.baseRate + (totalValue * percentage / 100);
      break;

    case 'carrier':
      // For carrier rates, we would integrate with actual carrier APIs
      // For now, return a calculated estimate
      rate = pricing.baseRate + (pricing.perKgRate || 0) * totalWeight;
      break;

    default:
      rate = pricing.baseRate;
  }

  // Apply maximum rate limit
  if (pricing.maxRate && rate > pricing.maxRate) {
    rate = pricing.maxRate;
  }

  // Add insurance if requested
  if (options.includeInsurance) {
    rate += Math.max(5, totalValue * 0.01); // 1% of value, minimum $5
  }

  // Add signature confirmation if requested
  if (options.includeSignature) {
    rate += 3; // $3 for signature
  }

  // Add expedited shipping surcharge
  if (options.expedited) {
    rate *= 1.5; // 50% surcharge for expedited
  }

  return Math.round(rate * 100) / 100; // Round to 2 decimal places
}

// POST - Calculate shipping rates
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();

    // Validate input
    const validation = shippingCalculationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid shipping calculation request',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId },
          { subdomain: storeId }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { items, destination, origin, options } = validation.data;

    // Get store settings for shipping configuration
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const shippingZones = (storeSettings?.shippingZones as any[]) || [];
    
    // Calculate package metrics
    const packageMetrics = calculatePackageMetrics(items);

    // If no items require shipping, return empty rates
    if (!packageMetrics.requiresShipping) {
      return NextResponse.json({
        rates: [],
        packageMetrics,
        message: 'No shipping required for digital items'
      });
    }

    // Find applicable shipping zones
    const applicableZones = shippingZones.filter(zone => 
      zone.enabled && isDestinationInZone(destination, zone)
    );

    if (applicableZones.length === 0) {
      return NextResponse.json({
        rates: [],
        packageMetrics,
        error: 'No shipping available to this destination'
      });
    }

    // Calculate rates for all applicable methods
    const rates: any[] = [];

    for (const zone of applicableZones) {
      for (const method of zone.methods) {
        if (!method.enabled) continue;

        const rate = calculateMethodRate(method, packageMetrics, options);
        
        if (rate !== null) {
          rates.push({
            id: `${zone.id}_${method.id}`,
            zoneId: zone.id,
            zoneName: zone.name,
            methodId: method.id,
            name: method.name,
            description: method.description,
            type: method.type,
            rate: rate,
            currency: options?.currency || 'USD',
            deliveryTime: method.deliveryTime,
            carrier: method.carrier,
            features: {
              tracking: method.type === 'carrier',
              insurance: options?.includeInsurance || false,
              signature: options?.includeSignature || false,
              expedited: options?.expedited || false
            }
          });
        }
      }
    }

    // Sort rates by price (cheapest first)
    rates.sort((a, b) => a.rate - b.rate);

    // Add calculated delivery dates
    const currentDate = new Date();
    const enhancedRates = rates.map(rate => {
      if (rate.deliveryTime) {
        const minDate = new Date(currentDate);
        const maxDate = new Date(currentDate);
        
        const multiplier = rate.deliveryTime.unit === 'hours' ? 1/24 : 
                          rate.deliveryTime.unit === 'weeks' ? 7 : 1;
        
        minDate.setDate(minDate.getDate() + (rate.deliveryTime.min * multiplier));
        maxDate.setDate(maxDate.getDate() + (rate.deliveryTime.max * multiplier));
        
        rate.estimatedDelivery = {
          min: minDate.toISOString().split('T')[0],
          max: maxDate.toISOString().split('T')[0],
          range: `${rate.deliveryTime.min}-${rate.deliveryTime.max} ${rate.deliveryTime.unit}`
        };
      }
      
      return rate;
    });

    return NextResponse.json({
      rates: enhancedRates,
      packageMetrics: {
        totalWeight: packageMetrics.totalWeight,
        totalValue: packageMetrics.totalValue,
        itemCount: packageMetrics.itemCount,
        packageDimensions: packageMetrics.packageDimensions
      },
      destination,
      calculatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[SHIPPING CALCULATOR API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET - Get shipping zones and methods configuration
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

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const shippingZones = (storeSettings?.shippingZones as any[]) || [];
    
    // Get shipping analytics
    const analytics = await getShippingAnalytics(store.id);

    return NextResponse.json({
      zones: shippingZones,
      analytics,
      supportedCarriers: [
        { name: 'UPS', services: ['Ground', 'Next Day', '2nd Day'] },
        { name: 'FedEx', services: ['Ground', 'Express', 'Priority'] },
        { name: 'USPS', services: ['Priority', 'Express', 'Ground'] },
        { name: 'DHL', services: ['Express', 'Economy'] }
      ]
    });
  } catch (error) {
    console.error('[SHIPPING ZONES API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update shipping zones configuration
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
        error: 'Invalid shipping zones configuration',
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

    // Add IDs to zones and methods if not present
    const zonesWithIds = validation.data.map(zone => ({
      ...zone,
      id: zone.id || `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      methods: zone.methods.map(method => ({
        ...method,
        id: method.id || `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))
    }));

    // Update shipping zones
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        shippingZones: zonesWithIds
      },
      create: {
        storeId: store.id,
        shippingZones: zonesWithIds
      }
    });

    return NextResponse.json({
      message: 'Shipping zones updated successfully',
      zones: zonesWithIds
    });
  } catch (error) {
    console.error('[SHIPPING ZONES API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to get shipping analytics
async function getShippingAnalytics(storeId: string) {
  const [
    totalOrders,
    shippingRevenue,
    averageShippingCost,
    topMethods,
    destinationStats
  ] = await Promise.all([
    // Total orders with shipping
    prisma.order.count({
      where: { 
        storeId,
        totalShipping: { gt: 0 }
      }
    }),

    // Total shipping revenue
    prisma.order.aggregate({
      where: { 
        storeId,
        financialStatus: 'paid'
      },
      _sum: { totalShipping: true }
    }),

    // Average shipping cost
    prisma.order.aggregate({
      where: { 
        storeId,
        totalShipping: { gt: 0 }
      },
      _avg: { totalShipping: true }
    }),

    // Most popular shipping methods (would need to track this in orders)
    Promise.resolve([]),

    // Top destination countries (simplified)
    Promise.resolve([])
  ]);

  return {
    totalOrders,
    revenue: shippingRevenue._sum.totalShipping || 0,
    averageCost: Math.round((averageShippingCost._avg.totalShipping || 0) * 100) / 100,
    topMethods,
    destinations: destinationStats
  };
}