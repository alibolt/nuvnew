/**
 * Price formatting utilities for multi-currency support
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after' | 'before-space' | 'after-space';
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
}

// Default currency configurations
export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ','
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.'
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    position: 'after-space',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ','
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    position: 'before',
    decimalPlaces: 0,
    thousandSeparator: ',',
    decimalSeparator: '.'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.'
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.'
  }
};

/**
 * Format a price value with currency
 */
export function formatPrice(
  amount: number,
  currencyCode: string = 'USD',
  locale?: string,
  customConfig?: Partial<CurrencyConfig>
): string {
  const config = {
    ...CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.USD,
    ...customConfig
  };

  // Format the number
  const formatted = formatNumber(amount, {
    decimalPlaces: config.decimalPlaces,
    thousandSeparator: config.thousandSeparator,
    decimalSeparator: config.decimalSeparator
  });

  // Apply symbol position
  switch (config.position) {
    case 'before':
      return `${config.symbol}${formatted}`;
    case 'after':
      return `${formatted}${config.symbol}`;
    case 'before-space':
      return `${config.symbol} ${formatted}`;
    case 'after-space':
      return `${formatted} ${config.symbol}`;
    default:
      return `${config.symbol}${formatted}`;
  }
}

/**
 * Format a number with separators
 */
export function formatNumber(
  value: number,
  options: {
    decimalPlaces?: number;
    thousandSeparator?: string;
    decimalSeparator?: string;
  } = {}
): string {
  const {
    decimalPlaces = 2,
    thousandSeparator = ',',
    decimalSeparator = '.'
  } = options;

  // Round to decimal places
  const rounded = Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  
  // Split into integer and decimal parts
  const parts = rounded.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';

  // Add thousand separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  // Combine parts
  if (decimalPlaces === 0) {
    return formattedInteger;
  }

  const paddedDecimal = decimalPart.padEnd(decimalPlaces, '0').slice(0, decimalPlaces);
  return `${formattedInteger}${decimalSeparator}${paddedDecimal}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_CONFIGS[currencyCode]?.symbol || currencyCode;
}

/**
 * Get currency name
 */
export function getCurrencyName(currencyCode: string): string {
  return CURRENCY_CONFIGS[currencyCode]?.name || currencyCode;
}

/**
 * Parse a formatted price string back to number
 */
export function parsePrice(
  formattedPrice: string,
  currencyCode: string = 'USD'
): number {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.USD;
  
  // Remove currency symbol
  let cleaned = formattedPrice.replace(config.symbol, '').trim();
  
  // Remove thousand separators
  cleaned = cleaned.replace(new RegExp(`\\${config.thousandSeparator}`, 'g'), '');
  
  // Replace decimal separator with dot
  cleaned = cleaned.replace(config.decimalSeparator, '.');
  
  return parseFloat(cleaned) || 0;
}

/**
 * Convert price between currencies (requires exchange rates)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first (base currency)
  const usdAmount = fromCurrency === 'USD' 
    ? amount 
    : amount / (exchangeRates[fromCurrency] || 1);
  
  // Convert from USD to target currency
  const targetAmount = toCurrency === 'USD'
    ? usdAmount
    : usdAmount * (exchangeRates[toCurrency] || 1);
  
  return targetAmount;
}

/**
 * Format price range
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currencyCode: string = 'USD',
  locale?: string
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currencyCode, locale);
  }
  
  return `${formatPrice(minPrice, currencyCode, locale)} - ${formatPrice(maxPrice, currencyCode, locale)}`;
}

/**
 * Get locale-specific currency formatter using Intl.NumberFormat
 */
export function getIntlPriceFormatter(
  locale: string = 'en-US',
  currencyCode: string = 'USD'
): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode
  });
}

/**
 * Format price using Intl.NumberFormat (browser native)
 */
export function formatPriceIntl(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  const formatter = getIntlPriceFormatter(locale, currencyCode);
  return formatter.format(amount);
}