/**
 * Price formatting utilities
 */

interface FormatPriceOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  showCurrency?: boolean;
}

/**
 * Format a price value with currency symbol
 */
export function formatPrice(
  price: number,
  options: FormatPriceOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    decimals = 2,
    showCurrency = true,
  } = options;

  if (showCurrency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

/**
 * Alias for formatPrice for backward compatibility
 */
export const formatCurrency = formatPrice;

/**
 * Format a price range (e.g., "$10.00 - $20.00")
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  options: FormatPriceOptions = {}
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, options);
  }

  return `${formatPrice(minPrice, options)} - ${formatPrice(maxPrice, options)}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0 || discountedPrice < 0) {
    return 0;
  }

  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Calculate savings amount
 */
export function calculateSavings(
  originalPrice: number,
  discountedPrice: number
): number {
  return Math.max(0, originalPrice - discountedPrice);
}

/**
 * Get formatted savings text
 */
export function getFormattedSavings(
  originalPrice: number,
  discountedPrice: number,
  options: FormatPriceOptions = {}
): string {
  const savings = calculateSavings(originalPrice, discountedPrice);
  const percentage = calculateDiscountPercentage(originalPrice, discountedPrice);

  if (savings === 0) {
    return '';
  }

  return `Save ${formatPrice(savings, options)} (${percentage}%)`;
}

/**
 * Parse price from string (handles various formats)
 */
export function parsePrice(priceString: string): number {
  // Remove currency symbols and whitespace
  const cleanedString = priceString.replace(/[^0-9.,\-]/g, '');
  
  // Handle different decimal separators
  const normalizedString = cleanedString.replace(',', '.');
  
  return parseFloat(normalizedString) || 0;
}

/**
 * Format price for display in product cards
 */
export function getProductPriceDisplay(product: {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
}): {
  currentPrice: string;
  originalPrice?: string;
  discount?: string;
  savings?: string;
} {
  const result: any = {
    currentPrice: formatPrice(product.price, { currency: product.currency }),
  };

  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    result.originalPrice = formatPrice(product.compareAtPrice, { currency: product.currency });
    result.discount = `-${calculateDiscountPercentage(product.compareAtPrice, product.price)}%`;
    result.savings = getFormattedSavings(product.compareAtPrice, product.price, { currency: product.currency });
  }

  return result;
}

/**
 * Get price display for variant-based products
 */
export function getVariantPriceRange(variants: Array<{ price: number }>): {
  min: number;
  max: number;
  display: string;
} {
  if (!variants || variants.length === 0) {
    return { min: 0, max: 0, display: formatPrice(0) };
  }

  const prices = variants.map(v => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min,
    max,
    display: formatPriceRange(min, max),
  };
}