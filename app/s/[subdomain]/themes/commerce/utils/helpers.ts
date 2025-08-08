// Commerce theme helper functions and utilities

import { type Product, type Category, type Collection } from '@/lib/types';

// Format currency values
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `$${amount.toFixed(2)}`;
  }
}

// Calculate discount percentage
export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Format product rating
export function formatRating(rating: number, maxRating: number = 5): string {
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  return clampedRating.toFixed(1);
}

// Generate star rating array
export function generateStarRating(rating: number, maxRating: number = 5): boolean[] {
  const stars: boolean[] = [];
  for (let i = 1; i <= maxRating; i++) {
    stars.push(i <= rating);
  }
  return stars;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substr(0, maxLength).trim() + '...';
}

// Generate product URL slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Check if product is on sale
export function isProductOnSale(product: Partial<Product>): boolean {
  return !!(product.originalPrice && product.price && product.originalPrice > product.price);
}

// Check if product is new (within last 30 days)
export function isProductNew(product: Partial<Product>, daysThreshold: number = 30): boolean {
  if (!product.createdAt) return false;
  
  const createdDate = new Date(product.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= daysThreshold;
}

// Get product badge text
export function getProductBadge(product: Partial<Product>): string | null {
  if (isProductNew(product)) {
    return 'New';
  }
  if (isProductOnSale(product)) {
    return 'Sale';
  }
  if (product.featured) {
    return 'Featured';
  }
  if (product.stock !== undefined && product.stock <= 5) {
    return 'Low Stock';
  }
  return null;
}

// Format inventory status
export function getInventoryStatus(stock: number): {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  message: string;
  color: string;
} {
  if (stock <= 0) {
    return {
      status: 'out-of-stock',
      message: 'Out of Stock',
      color: '#EF4444' // red
    };
  }
  
  if (stock <= 5) {
    return {
      status: 'low-stock',
      message: `Only ${stock} left`,
      color: '#F59E0B' // amber
    };
  }
  
  return {
    status: 'in-stock',
    message: 'In Stock',
    color: '#10B981' // green
  };
}

// Sort products by different criteria
export function sortProducts(
  products: Product[],
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating' | 'newest' | 'popularity'
): Product[] {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    
    case 'popularity':
      return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    
    default:
      return sorted;
  }
}

// Filter products by price range
export function filterProductsByPrice(
  products: Product[],
  minPrice: number,
  maxPrice: number
): Product[] {
  return products.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
}

// Filter products by rating
export function filterProductsByRating(
  products: Product[],
  minRating: number
): Product[] {
  return products.filter(product => 
    (product.rating || 0) >= minRating
  );
}

// Get related products based on categories/tags
export function getRelatedProducts(
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 4
): Product[] {
  const related = allProducts.filter(product => 
    product.id !== currentProduct.id &&
    (
      // Same category
      product.categoryId === currentProduct.categoryId ||
      // Similar tags (if available)
      (product.tags && currentProduct.tags && 
       product.tags.some(tag => currentProduct.tags?.includes(tag)))
    )
  );
  
  // Sort by rating and return limited results
  return related
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

// Calculate shipping cost
export function calculateShipping(
  subtotal: number,
  weight: number = 0,
  shippingMethod: 'standard' | 'express' | 'overnight' = 'standard'
): number {
  // Free shipping over $100
  if (subtotal >= 100) {
    return 0;
  }
  
  const baseRates = {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99
  };
  
  const weightMultiplier = Math.max(1, Math.ceil(weight / 2)); // $1 per 2 lbs
  
  return baseRates[shippingMethod] + (weightMultiplier - 1);
}

// Calculate tax amount
export function calculateTax(
  subtotal: number,
  taxRate: number = 0.08
): number {
  return subtotal * taxRate;
}

// Generate order total
export function calculateOrderTotal(
  subtotal: number,
  shipping: number = 0,
  tax: number = 0,
  discount: number = 0
): number {
  return Math.max(0, subtotal + shipping + tax - discount);
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

// Validate email address
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate breadcrumb navigation
export function generateBreadcrumbs(
  pathname: string,
  product?: Product,
  category?: Category,
  collection?: Collection
): Array<{ label: string; href: string }> {
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  const segments = pathname.split('/').filter(Boolean);
  
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    switch (segment) {
      case 'products':
        breadcrumbs.push({ label: 'Products', href });
        if (product) {
          breadcrumbs.push({ label: product.name, href: `/products/${product.slug}` });
        }
        break;
      
      case 'collections':
        breadcrumbs.push({ label: 'Collections', href });
        if (collection) {
          breadcrumbs.push({ label: collection.name, href: `/collections/${collection.slug}` });
        }
        break;
      
      case 'categories':
        breadcrumbs.push({ label: 'Categories', href });
        if (category) {
          breadcrumbs.push({ label: category.name, href: `/categories/${category.slug}` });
        }
        break;
      
      default:
        // Capitalize first letter
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({ label, href });
    }
  });
  
  return breadcrumbs;
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Local storage helpers
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage errors silently
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  }
};

// Session storage helpers
export const sessionStorage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage errors silently
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  }
};