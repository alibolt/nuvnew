import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for shipping test request
const shippingTestSchema = z.object({
  destination: z.object({
    country: z.string().min(2).max(2),
    state: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    address: z.string().optional()
  }),
  testItems: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0),
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
      unit: z.enum(['cm', 'in']).default('cm')
    }).optional(),
    value: z.number().min(0),
    quantity: z.number().min(1),
    requiresShipping: z.boolean().default(true)
  })).min(1),
  options: z.object({
    includeInsurance: z.boolean().default(false),
    includeSignature: z.boolean().default(false),
    expedited: z.boolean().default(false),
    currency: z.string().default('USD')
  }).optional()
});

// Schema for zone coverage test
const coverageTestSchema = z.object({
  destinations: z.array(z.object({
    name: z.string().optional(),
    country: z.string().min(2).max(2),
    state: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional()
  })).min(1).max(20)
});

// Helper functions (copied from calculator for consistency)
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

function isDestinationInZone(destination: any, zone: any): boolean {
  if (!zone.countries.includes(destination.country)) {
    return false;
  }

  if (zone.states?.length && destination.state) {
    if (!zone.states.includes(destination.state)) {
      return false;
    }
  }

  if (zone.postalCodes?.length && destination.postalCode) {
    const matchesPostalCode = zone.postalCodes.some((pattern: string) => {
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

function calculateMethodRate(method: any, packageMetrics: any, options: any = {}) {
  const { pricing, conditions, type } = method;
  const { totalWeight, totalValue, itemCount } = packageMetrics;

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
        return null;
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

    case 'local_pickup':
      rate = pricing.baseRate || 0;
      break;

    case 'carrier':
      rate = pricing.baseRate + (pricing.perKgRate || 0) * totalWeight;
      break;

    default:
      rate = pricing.baseRate;
  }

  if (pricing.handlingFee) {
    rate += pricing.handlingFee;
  }

  if (pricing.maxRate && rate > pricing.maxRate) {
    rate = pricing.maxRate;
  }

  if (options.includeInsurance) {
    rate += Math.max(5, totalValue * 0.01);
  }

  if (options.includeSignature) {
    rate += 3;
  }

  if (options.expedited) {
    rate *= 1.5;
  }

  return Math.round(rate * 100) / 100;
}

// POST - Test shipping rates for specific scenario
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
    const { action } = body;

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

    if (action === 'coverage') {
      // Test zone coverage for multiple destinations
      const validation = coverageTestSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({
          error: 'Invalid coverage test request',
          details: validation.error.format()
        }, { status: 400 });
      }

      const storeSettings = await prisma.storeSettings.findUnique({
        where: { storeId: store.id }
      });

      const shippingZones = (storeSettings?.shippingZones as any[]) || [];
      const { destinations } = validation.data;

      const coverageResults = destinations.map(destination => {
        const applicableZones = shippingZones.filter(zone => 
          zone.enabled && isDestinationInZone(destination, zone)
        );

        return {
          destination,
          covered: applicableZones.length > 0,
          zones: applicableZones.map(zone => ({
            id: zone.id,
            name: zone.name,
            methodCount: zone.methods.filter((m: any) => m.enabled).length
          })),
          methodCount: applicableZones.reduce(
            (sum, zone) => sum + zone.methods.filter((m: any) => m.enabled).length, 
            0
          )
        };
      });

      const summary = {
        totalDestinations: destinations.length,
        coveredDestinations: coverageResults.filter(r => r.covered).length,
        uncoveredDestinations: coverageResults.filter(r => !r.covered).length,
        coveragePercentage: Math.round(
          (coverageResults.filter(r => r.covered).length / destinations.length) * 100
        )
      };

      return NextResponse.json({
        coverage: coverageResults,
        summary
      });
    }

    // Default: Test shipping rates
    const validation = shippingTestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid shipping test request',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { destination, testItems, options } = validation.data;

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const shippingZones = (storeSettings?.shippingZones as any[]) || [];
    
    // Calculate package metrics
    const packageMetrics = calculatePackageMetrics(testItems);

    if (!packageMetrics.requiresShipping) {
      return NextResponse.json({
        testResults: {
          packageMetrics,
          applicableZones: [],
          availableRates: [],
          warnings: ['No items require shipping']
        }
      });
    }

    // Find applicable zones
    const applicableZones = shippingZones.filter(zone => 
      zone.enabled && isDestinationInZone(destination, zone)
    );

    // Calculate rates
    const rates: any[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const zone of applicableZones) {
      for (const method of zone.methods) {
        if (!method.enabled) continue;

        try {
          const rate = calculateMethodRate(method, packageMetrics, options);
          
          if (rate !== null) {
            rates.push({
              zoneId: zone.id,
              zoneName: zone.name,
              methodId: method.id,
              methodName: method.name,
              methodType: method.type,
              rate: rate,
              currency: options?.currency || 'USD',
              deliveryTime: method.deliveryTime,
              features: method.features || {},
              conditions: method.conditions || {},
              calculation: {
                baseRate: method.pricing.baseRate,
                weightCharge: method.pricing.perKgRate ? 
                  (method.pricing.perKgRate * packageMetrics.totalWeight) : 0,
                handlingFee: method.pricing.handlingFee || 0,
                insurance: options?.includeInsurance ? 
                  Math.max(5, packageMetrics.totalValue * 0.01) : 0,
                signature: options?.includeSignature ? 3 : 0,
                expedited: options?.expedited ? (rate * 0.5) : 0
              }
            });
          } else {
            warnings.push(
              `Method "${method.name}" in zone "${zone.name}" conditions not met`
            );
          }
        } catch (error) {
          errors.push(
            `Error calculating rate for "${method.name}" in zone "${zone.name}": ${(error as Error).message}`
          );
        }
      }
    }

    // Sort rates by price
    rates.sort((a, b) => a.rate - b.rate);

    // Add recommendations
    const recommendations: string[] = [];
    
    if (rates.length === 0) {
      recommendations.push('No shipping methods available for this destination');
      if (applicableZones.length === 0) {
        recommendations.push('Consider adding a shipping zone for this destination');
      } else {
        recommendations.push('Check method conditions (weight, value, quantity limits)');
      }
    }

    if (rates.length > 5) {
      recommendations.push('Consider reducing the number of shipping methods to avoid choice overload');
    }

    const freeShippingMethods = rates.filter(r => r.rate === 0);
    if (freeShippingMethods.length === 0 && packageMetrics.totalValue > 50) {
      recommendations.push('Consider offering free shipping for orders over a certain amount');
    }

    const testResults = {
      destination,
      packageMetrics: {
        totalWeight: packageMetrics.totalWeight,
        totalValue: packageMetrics.totalValue,
        itemCount: packageMetrics.itemCount,
        packageDimensions: packageMetrics.packageDimensions
      },
      applicableZones: applicableZones.map(zone => ({
        id: zone.id,
        name: zone.name,
        countries: zone.countries,
        methodCount: zone.methods.filter((m: any) => m.enabled).length
      })),
      availableRates: rates,
      analysis: {
        cheapestRate: rates.length > 0 ? rates[0] : null,
        mostExpensiveRate: rates.length > 0 ? rates[rates.length - 1] : null,
        averageRate: rates.length > 0 ? 
          Math.round((rates.reduce((sum, r) => sum + r.rate, 0) / rates.length) * 100) / 100 : 0,
        rateRange: rates.length > 1 ? {
          min: rates[0].rate,
          max: rates[rates.length - 1].rate,
          spread: Math.round((rates[rates.length - 1].rate - rates[0].rate) * 100) / 100
        } : null
      },
      warnings,
      errors,
      recommendations,
      testedAt: new Date().toISOString()
    };

    return apiResponse.success(testResults);
  } catch (error) {
    console.error('[SHIPPING TEST API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// GET - Get shipping test scenarios and examples
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

    // Provide test scenarios and examples
    const testScenarios = [
      {
        name: 'Domestic Small Package',
        description: 'Test domestic shipping for a small, lightweight item',
        destination: {
          country: 'US',
          state: 'CA',
          city: 'Los Angeles',
          postalCode: '90210'
        },
        testItems: [
          {
            name: 'Small Electronics',
            weight: 0.5,
            dimensions: { length: 15, width: 10, height: 5, unit: 'cm' },
            value: 29.99,
            quantity: 1,
            requiresShipping: true
          }
        ]
      },
      {
        name: 'International Heavy Package',
        description: 'Test international shipping for heavy items',
        destination: {
          country: 'GB',
          city: 'London',
          postalCode: 'SW1A 1AA'
        },
        testItems: [
          {
            name: 'Heavy Equipment',
            weight: 5.2,
            dimensions: { length: 40, width: 30, height: 20, unit: 'cm' },
            value: 299.99,
            quantity: 1,
            requiresShipping: true
          }
        ]
      },
      {
        name: 'Multiple Items Order',
        description: 'Test shipping for an order with multiple different items',
        destination: {
          country: 'CA',
          state: 'ON',
          city: 'Toronto',
          postalCode: 'M5V 3A1'
        },
        testItems: [
          {
            name: 'Book',
            weight: 0.3,
            dimensions: { length: 20, width: 15, height: 2, unit: 'cm' },
            value: 19.99,
            quantity: 2,
            requiresShipping: true
          },
          {
            name: 'T-Shirt',
            weight: 0.2,
            dimensions: { length: 30, width: 25, height: 1, unit: 'cm' },
            value: 24.99,
            quantity: 1,
            requiresShipping: true
          }
        ]
      },
      {
        name: 'High Value Package',
        description: 'Test shipping for expensive items requiring insurance',
        destination: {
          country: 'AU',
          state: 'NSW',
          city: 'Sydney',
          postalCode: '2000'
        },
        testItems: [
          {
            name: 'Luxury Watch',
            weight: 0.1,
            dimensions: { length: 10, width: 10, height: 8, unit: 'cm' },
            value: 1299.99,
            quantity: 1,
            requiresShipping: true
          }
        ],
        options: {
          includeInsurance: true,
          includeSignature: true
        }
      }
    ];

    const commonDestinations = [
      { name: 'New York, US', country: 'US', state: 'NY', city: 'New York', postalCode: '10001' },
      { name: 'London, UK', country: 'GB', city: 'London', postalCode: 'SW1A 1AA' },
      { name: 'Toronto, Canada', country: 'CA', state: 'ON', city: 'Toronto', postalCode: 'M5V 3A1' },
      { name: 'Sydney, Australia', country: 'AU', state: 'NSW', city: 'Sydney', postalCode: '2000' },
      { name: 'Berlin, Germany', country: 'DE', city: 'Berlin', postalCode: '10115' },
      { name: 'Tokyo, Japan', country: 'JP', city: 'Tokyo', postalCode: '100-0001' }
    ];

    return NextResponse.json({
      scenarios: testScenarios,
      commonDestinations,
      testOptions: {
        includeInsurance: 'Add insurance coverage based on package value',
        includeSignature: 'Require signature confirmation on delivery',
        expedited: 'Apply expedited shipping rates (typically 50% surcharge)',
        currency: 'Display rates in specified currency'
      },
      packageLimits: {
        maxWeight: 70, // kg
        maxDimensions: { length: 100, width: 100, height: 100, unit: 'cm' },
        maxValue: 10000 // currency units
      }
    });
  } catch (error) {
    console.error('[SHIPPING TEST API] GET Error:', error);
    return apiResponse.serverError();
  }
}