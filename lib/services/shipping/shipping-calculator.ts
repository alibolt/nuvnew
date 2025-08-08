import { prisma } from '@/lib/prisma';

export interface ShippingRate {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  carrier?: string;
  service?: string;
}

export interface ShippingAddress {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  line1: string;
  line2?: string;
}

export interface ShippingItem {
  weight: number; // in kg or lb based on store settings
  width?: number;
  height?: number;
  length?: number;
  quantity: number;
  price: number;
  requiresShipping: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states?: Record<string, string[]>; // country -> states mapping
  postalCodes?: Record<string, string[]>; // country -> postal codes mapping
  rates: ShippingRateConfig[];
}

export interface ShippingRateConfig {
  id: string;
  name: string;
  type: 'flat_rate' | 'weight_based' | 'price_based' | 'item_based';
  price: number;
  conditions?: {
    minWeight?: number;
    maxWeight?: number;
    minPrice?: number;
    maxPrice?: number;
    minItems?: number;
    maxItems?: number;
  };
  estimatedDays: {
    min: number;
    max: number;
  };
}

export class ShippingCalculator {
  private storeId: string;
  private shippingZones: ShippingZone[] = [];
  private weightUnit: string = 'kg';
  private currency: string = 'USD';

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  async initialize() {
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: this.storeId },
      select: { 
        shippingZones: true,
        weightUnit: true
      }
    });

    const store = await prisma.store.findUnique({
      where: { id: this.storeId },
      select: { currency: true }
    });
    
    this.shippingZones = (storeSettings?.shippingZones as ShippingZone[]) || this.getDefaultShippingZones();
    this.weightUnit = storeSettings?.weightUnit || 'kg';
    this.currency = store?.currency || 'USD';
  }

  /**
   * Calculate available shipping rates for given items and address
   */
  async calculateShippingRates(
    items: ShippingItem[],
    shippingAddress: ShippingAddress
  ): Promise<ShippingRate[]> {
    if (!this.shippingZones.length) {
      await this.initialize();
    }

    // Check if any items require shipping
    const shippableItems = items.filter(item => item.requiresShipping);
    if (shippableItems.length === 0) {
      return [{
        id: 'digital_delivery',
        name: 'Digital Delivery',
        description: 'No shipping required',
        price: 0,
        currency: this.currency,
        estimatedDays: { min: 0, max: 0 }
      }];
    }

    // Find applicable shipping zone
    const zone = this.findApplicableZone(shippingAddress);
    if (!zone) {
      return []; // No shipping available to this address
    }

    // Calculate totals for rate conditions
    const totalWeight = this.calculateTotalWeight(shippableItems);
    const totalPrice = this.calculateTotalPrice(shippableItems);
    const totalItems = this.calculateTotalItems(shippableItems);

    // Get applicable rates from the zone
    const applicableRates: ShippingRate[] = [];

    for (const rateConfig of zone.rates) {
      if (this.isRateApplicable(rateConfig, totalWeight, totalPrice, totalItems)) {
        const rate = this.calculateRate(rateConfig, totalWeight, totalPrice, totalItems);
        applicableRates.push({
          id: rateConfig.id,
          name: rateConfig.name,
          price: rate,
          currency: this.currency,
          estimatedDays: rateConfig.estimatedDays
        });
      }
    }

    // Sort by price
    return applicableRates.sort((a, b) => a.price - b.price);
  }

  /**
   * Find the shipping zone that applies to the given address
   */
  private findApplicableZone(address: ShippingAddress): ShippingZone | null {
    for (const zone of this.shippingZones) {
      // Check country
      if (!zone.countries.includes(address.country) && !zone.countries.includes('*')) {
        continue;
      }

      // Check state if specified
      if (zone.states && zone.states[address.country] && address.state) {
        const allowedStates = zone.states[address.country];
        if (!allowedStates.includes(address.state) && !allowedStates.includes('*')) {
          continue;
        }
      }

      // Check postal code if specified
      if (zone.postalCodes && zone.postalCodes[address.country] && address.postalCode) {
        const postalPatterns = zone.postalCodes[address.country];
        const matches = postalPatterns.some(pattern => {
          if (pattern.includes('*')) {
            const prefix = pattern.replace('*', '');
            return address.postalCode!.startsWith(prefix);
          }
          return address.postalCode === pattern;
        });
        
        if (!matches) continue;
      }

      // This zone matches
      return zone;
    }

    return null;
  }

  /**
   * Check if a rate configuration is applicable based on conditions
   */
  private isRateApplicable(
    rateConfig: ShippingRateConfig,
    totalWeight: number,
    totalPrice: number,
    totalItems: number
  ): boolean {
    const conditions = rateConfig.conditions;
    if (!conditions) return true;

    // Check weight conditions
    if (conditions.minWeight !== undefined && totalWeight < conditions.minWeight) return false;
    if (conditions.maxWeight !== undefined && totalWeight > conditions.maxWeight) return false;

    // Check price conditions
    if (conditions.minPrice !== undefined && totalPrice < conditions.minPrice) return false;
    if (conditions.maxPrice !== undefined && totalPrice > conditions.maxPrice) return false;

    // Check item count conditions
    if (conditions.minItems !== undefined && totalItems < conditions.minItems) return false;
    if (conditions.maxItems !== undefined && totalItems > conditions.maxItems) return false;

    return true;
  }

  /**
   * Calculate the shipping rate based on the configuration
   */
  private calculateRate(
    rateConfig: ShippingRateConfig,
    totalWeight: number,
    totalPrice: number,
    totalItems: number
  ): number {
    switch (rateConfig.type) {
      case 'flat_rate':
        return rateConfig.price;

      case 'weight_based':
        // Price per unit weight
        return rateConfig.price * totalWeight;

      case 'price_based':
        // Percentage of order value
        return (rateConfig.price / 100) * totalPrice;

      case 'item_based':
        // Price per item
        return rateConfig.price * totalItems;

      default:
        return rateConfig.price;
    }
  }

  /**
   * Calculate total weight of items
   */
  private calculateTotalWeight(items: ShippingItem[]): number {
    return items.reduce((total, item) => {
      const weight = item.weight || 0;
      return total + (weight * item.quantity);
    }, 0);
  }

  /**
   * Calculate total price of items
   */
  private calculateTotalPrice(items: ShippingItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Calculate total number of items
   */
  private calculateTotalItems(items: ShippingItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get default shipping zones if none are configured
   */
  private getDefaultShippingZones(): ShippingZone[] {
    return [
      {
        id: 'domestic',
        name: 'Domestic Shipping',
        countries: ['US'],
        rates: [
          {
            id: 'standard',
            name: 'Standard Shipping',
            type: 'flat_rate',
            price: 10,
            estimatedDays: { min: 5, max: 7 }
          },
          {
            id: 'express',
            name: 'Express Shipping',
            type: 'flat_rate',
            price: 25,
            estimatedDays: { min: 2, max: 3 }
          },
          {
            id: 'overnight',
            name: 'Overnight Shipping',
            type: 'flat_rate',
            price: 50,
            estimatedDays: { min: 1, max: 1 }
          }
        ]
      },
      {
        id: 'international',
        name: 'International Shipping',
        countries: ['*'], // All countries
        rates: [
          {
            id: 'international_standard',
            name: 'International Standard',
            type: 'flat_rate',
            price: 30,
            estimatedDays: { min: 10, max: 21 }
          },
          {
            id: 'international_express',
            name: 'International Express',
            type: 'flat_rate',
            price: 60,
            estimatedDays: { min: 5, max: 10 }
          }
        ]
      }
    ];
  }

  /**
   * Validate shipping address
   */
  validateAddress(address: ShippingAddress): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.country || address.country.length !== 2) {
      errors.push('Invalid country code');
    }

    if (!address.line1 || address.line1.trim().length === 0) {
      errors.push('Street address is required');
    }

    if (!address.city || address.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!address.postalCode || address.postalCode.trim().length === 0) {
      errors.push('Postal code is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format shipping rate for display
   */
  formatShippingRate(rate: ShippingRate): string {
    const price = rate.price === 0 ? 'Free' : `$${rate.price.toFixed(2)}`;
    const days = rate.estimatedDays.min === rate.estimatedDays.max
      ? `${rate.estimatedDays.min} day${rate.estimatedDays.min > 1 ? 's' : ''}`
      : `${rate.estimatedDays.min}-${rate.estimatedDays.max} days`;
    
    return `${rate.name} - ${price} (${days})`;
  }
}

// Helper function to create a shipping calculator instance
export async function createShippingCalculator(storeId: string): Promise<ShippingCalculator> {
  const calculator = new ShippingCalculator(storeId);
  await calculator.initialize();
  return calculator;
}