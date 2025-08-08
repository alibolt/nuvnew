import { prisma } from '@/lib/prisma';

export interface TaxRate {
  id: string;
  name: string;
  code: string;
  rate: number; // Percentage (e.g., 8.5 for 8.5%)
  compound: boolean;
  priority: number;
}

export interface TaxLine {
  name: string;
  rate: number;
  amount: number;
  compound: boolean;
}

export interface TaxCalculationResult {
  subtotal: number;
  taxLines: TaxLine[];
  totalTax: number;
  totalWithTax: number;
}

export interface Address {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

export interface LineItem {
  price: number;
  quantity: number;
  taxable: boolean;
}

export class TaxCalculator {
  private storeId: string;
  private taxSettings: any;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  async initialize() {
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: this.storeId },
      select: { taxSettings: true }
    });
    
    this.taxSettings = settings?.taxSettings || {
      enabled: false,
      inclusive: false,
      defaultRate: 0,
      regions: []
    };
  }

  /**
   * Calculate taxes for a given address and line items
   */
  async calculateTax(
    lineItems: LineItem[],
    shippingAddress: Address,
    shippingAmount: number = 0,
    shippingTaxable: boolean = true
  ): Promise<TaxCalculationResult> {
    if (!this.taxSettings) {
      await this.initialize();
    }

    // If taxes are disabled, return zero tax
    if (!this.taxSettings.enabled) {
      const subtotal = this.calculateSubtotal(lineItems);
      return {
        subtotal,
        taxLines: [],
        totalTax: 0,
        totalWithTax: subtotal + shippingAmount
      };
    }

    // Get applicable tax rates for the address
    const taxRates = await this.getTaxRatesForAddress(shippingAddress);
    
    // Calculate taxable amount
    const taxableAmount = this.calculateTaxableAmount(lineItems, shippingAmount, shippingTaxable);
    
    // Apply tax rates
    const taxLines = this.applyTaxRates(taxableAmount, taxRates);
    
    // Calculate totals
    const subtotal = this.calculateSubtotal(lineItems) + shippingAmount;
    const totalTax = taxLines.reduce((sum, line) => sum + line.amount, 0);
    
    return {
      subtotal,
      taxLines,
      totalTax,
      totalWithTax: this.taxSettings.inclusive ? subtotal : subtotal + totalTax
    };
  }

  /**
   * Get tax rates applicable to a specific address
   */
  private async getTaxRatesForAddress(address: Address): Promise<TaxRate[]> {
    const rates: TaxRate[] = [];
    
    // First, check for region-specific rates
    const regions = this.taxSettings.regions || [];
    
    for (const region of regions) {
      // Match by country
      if (region.country && region.country !== address.country) {
        continue;
      }
      
      // Match by state/province
      if (region.state && address.state && region.state !== address.state) {
        continue;
      }
      
      // Match by postal code (prefix matching)
      if (region.postalCode && address.postalCode) {
        const postalPrefix = region.postalCode.replace('*', '');
        if (!address.postalCode.startsWith(postalPrefix)) {
          continue;
        }
      }
      
      // This region matches, add its rate
      rates.push({
        id: region.id,
        name: region.name,
        code: region.code,
        rate: region.rate,
        compound: region.compound || false,
        priority: region.priority || 0
      });
    }
    
    // If no specific rates found, use default rate
    if (rates.length === 0 && this.taxSettings.defaultRate > 0) {
      rates.push({
        id: 'default',
        name: 'Sales Tax',
        code: 'TAX',
        rate: this.taxSettings.defaultRate,
        compound: false,
        priority: 0
      });
    }
    
    // Sort by priority (higher priority first)
    return rates.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate the total taxable amount
   */
  private calculateTaxableAmount(
    lineItems: LineItem[],
    shippingAmount: number,
    shippingTaxable: boolean
  ): number {
    let taxableAmount = 0;
    
    // Add taxable line items
    for (const item of lineItems) {
      if (item.taxable) {
        taxableAmount += item.price * item.quantity;
      }
    }
    
    // Add shipping if taxable
    if (shippingTaxable && shippingAmount > 0) {
      taxableAmount += shippingAmount;
    }
    
    return taxableAmount;
  }

  /**
   * Apply tax rates to calculate tax lines
   */
  private applyTaxRates(taxableAmount: number, taxRates: TaxRate[]): TaxLine[] {
    const taxLines: TaxLine[] = [];
    let compoundBase = taxableAmount;
    
    // Apply non-compound taxes first
    const nonCompoundRates = taxRates.filter(rate => !rate.compound);
    for (const rate of nonCompoundRates) {
      const amount = this.roundTax(taxableAmount * (rate.rate / 100));
      taxLines.push({
        name: rate.name,
        rate: rate.rate,
        amount,
        compound: false
      });
    }
    
    // Calculate compound base (original amount + non-compound taxes)
    if (this.taxSettings.compoundTaxes) {
      const nonCompoundTax = taxLines.reduce((sum, line) => sum + line.amount, 0);
      compoundBase = taxableAmount + nonCompoundTax;
    }
    
    // Apply compound taxes
    const compoundRates = taxRates.filter(rate => rate.compound);
    for (const rate of compoundRates) {
      const amount = this.roundTax(compoundBase * (rate.rate / 100));
      taxLines.push({
        name: rate.name,
        rate: rate.rate,
        amount,
        compound: true
      });
    }
    
    return taxLines;
  }

  /**
   * Calculate subtotal from line items
   */
  private calculateSubtotal(lineItems: LineItem[]): number {
    return lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Round tax amount based on settings
   */
  private roundTax(amount: number): number {
    // Round to 2 decimal places by default
    return Math.round(amount * 100) / 100;
  }

  /**
   * Validate tax number (VAT, GST, etc.)
   */
  async validateTaxNumber(taxNumber: string, country: string): Promise<{
    valid: boolean;
    message?: string;
  }> {
    // Basic validation patterns for common tax numbers
    const patterns: Record<string, RegExp> = {
      // EU VAT numbers
      'AT': /^ATU\d{8}$/,
      'BE': /^BE0\d{9}$/,
      'DE': /^DE\d{9}$/,
      'FR': /^FR[A-Z0-9]{11}$/,
      'GB': /^GB(\d{9}|\d{12}|(HA|GD)\d{3})$/,
      'IT': /^IT\d{11}$/,
      'NL': /^NL\d{9}B\d{2}$/,
      
      // Other countries
      'US': /^\d{2}-\d{7}$/, // EIN format
      'CA': /^\d{9}(RT|RP)\d{4}$/, // GST/HST number
      'AU': /^\d{11}$/, // ABN
    };
    
    const pattern = patterns[country];
    if (!pattern) {
      return { valid: true, message: 'Tax number validation not available for this country' };
    }
    
    const isValid = pattern.test(taxNumber.replace(/\s/g, ''));
    return {
      valid: isValid,
      message: isValid ? undefined : 'Invalid tax number format'
    };
  }

  /**
   * Get tax summary for display
   */
  formatTaxSummary(result: TaxCalculationResult): string[] {
    if (result.taxLines.length === 0) {
      return ['No tax applicable'];
    }
    
    return result.taxLines.map(line => 
      `${line.name}: ${line.rate}%${line.compound ? ' (compound)' : ''} = $${line.amount.toFixed(2)}`
    );
  }
}

// Helper function to create a tax calculator instance
export async function createTaxCalculator(storeId: string): Promise<TaxCalculator> {
  const calculator = new TaxCalculator(storeId);
  await calculator.initialize();
  return calculator;
}