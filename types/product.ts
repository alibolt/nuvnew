/**
 * Centralized product type definitions
 * Supports both title/name field variations for compatibility
 */

export interface ProductImage {
  id: string;
  url: string;
  src?: string; // Alternative to url for compatibility
  alt?: string;
  width?: number;
  height?: number;
  position?: number;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  title: string;
  name?: string; // Alternative to title
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  barcode?: string;
  weight?: number;
  inventoryQuantity?: number;
  stockQuantity?: number; // Alternative to inventoryQuantity
  requiresShipping?: boolean;
  availableForSale?: boolean;
  inStock?: boolean; // Alternative to availableForSale
  images?: string[] | ProductImage[];
  selectedOptions?: VariantOption[];
  options?: VariantOption[]; // Alternative to selectedOptions
  dimensions?: ProductDimensions;
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: 'cm' | 'in' | 'mm';
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
  position?: number;
}

export interface Product {
  id: string;
  title: string;
  name?: string; // Alternative to title for compatibility
  handle: string;
  slug?: string; // Alternative to handle
  description?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'active' | 'draft' | 'archived';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string;
  
  // Pricing
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  priceRange?: {
    minVariantPrice: {
      amount: string | number;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string | number;
      currencyCode: string;
    };
  };
  
  // Media
  images: (string | ProductImage)[];
  featuredImage?: string | ProductImage;
  
  // Variants and Options
  variants?: ProductVariant[];
  options?: ProductOption[];
  
  // SEO
  seo?: ProductSEO;
  
  // Inventory
  totalInventory?: number;
  stockQuantity?: number;
  availableForSale?: boolean;
  inStock?: boolean;
  
  // Relations
  categoryId?: string;
  category?: ProductCategory;
  collections?: ProductCollection[];
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProductCategory {
  id: string;
  title: string;
  name?: string; // Alternative to title
  handle: string;
  slug?: string; // Alternative to handle
  description?: string;
  image?: string;
  parentId?: string;
}

export interface ProductCollection {
  id: string;
  title: string;
  name?: string; // Alternative to title
  handle: string;
  slug?: string; // Alternative to handle
  description?: string;
  image?: string;
  productCount?: number;
}

// Product list item (simplified for performance)
export interface ProductListItem {
  id: string;
  title: string;
  name?: string; // Alternative to title
  handle: string;
  slug?: string; // Alternative to handle
  price: number;
  compareAtPrice?: number | null;
  featuredImage?: string | ProductImage;
  images?: (string | ProductImage)[];
  vendor?: string;
  availableForSale?: boolean;
  inStock?: boolean;
  category?: Pick<ProductCategory, 'name' | 'slug'>;
}

// Product card props
export interface ProductCardProps {
  product: Product | ProductListItem | any; // Support flexible product types
  layout?: 'grid' | 'list';
  priority?: boolean;
  showVendor?: boolean;
  showCategory?: boolean;
  showComparePrice?: boolean;
  showQuickActions?: boolean;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  showRating?: boolean;
  imageAspectRatio?: 'square' | 'portrait' | 'landscape';
  imageFit?: 'cover' | 'contain';
  className?: string;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  onQuickView?: (product: any) => void;
}

// Price information
export interface PriceInfo {
  min: number;
  max: number;
  display: string;
  currency?: string;
  compareAtPrice?: {
    min: number;
    max: number;
    display: string;
  };
}

// Search and filter types
export interface ProductSearchResult {
  product: Product | ProductListItem;
  score?: number;
  highlights?: {
    title?: string;
    name?: string;
    description?: string;
  };
}

export interface ProductFilter {
  categories?: string[];
  collections?: string[];
  vendors?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  inStock?: boolean;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc' | 'name-desc' | 'title-asc' | 'title-desc';
}

export interface ProductListResponse {
  products: (Product | ProductListItem)[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    categories: Array<{
      name: string;
      slug: string;
      count: number;
    }>;
    vendors: Array<{
      name: string;
      count: number;
    }>;
    priceRange: {
      min: number;
      max: number;
    };
    tags: Array<{
      name: string;
      count: number;
    }>;
  };
}

// Type guards
export function isProduct(obj: any): obj is Product {
  return obj && typeof obj === 'object' && 
    'id' in obj && 
    ('title' in obj || 'name' in obj) && 
    ('handle' in obj || 'slug' in obj) && 
    'price' in obj;
}

export function hasVariants(product: Product | ProductListItem): boolean {
  return 'variants' in product && 
    product.variants !== undefined && 
    product.variants.length > 0;
}

export function isInStock(product: Product | ProductListItem): boolean {
  // Check direct inStock field
  if ('inStock' in product && product.inStock !== undefined) {
    return product.inStock;
  }
  
  // Check availableForSale field
  if ('availableForSale' in product && product.availableForSale !== undefined) {
    return product.availableForSale;
  }
  
  // Check stock quantity
  if ('stockQuantity' in product && product.stockQuantity !== undefined) {
    return product.stockQuantity > 0;
  }
  
  if ('totalInventory' in product && product.totalInventory !== undefined) {
    return product.totalInventory > 0;
  }
  
  // Check variants
  if ('variants' in product && product.variants && product.variants.length > 0) {
    return product.variants.some(variant => {
      if (variant.inStock !== undefined) return variant.inStock;
      if (variant.availableForSale !== undefined) return variant.availableForSale;
      if (variant.stockQuantity !== undefined) return variant.stockQuantity > 0;
      if (variant.inventoryQuantity !== undefined) return variant.inventoryQuantity > 0;
      return true;
    });
  }
  
  return true; // Default to in stock if no stock info
}

// Helpers to normalize product fields
export function getProductTitle(product: any): string {
  return product.title || product.name || '';
}

export function getProductHandle(product: any): string {
  return product.handle || product.slug || '';
}

export function getProductImage(product: any): string {
  if (typeof product.featuredImage === 'string') {
    return product.featuredImage;
  }
  if (product.featuredImage?.url) {
    return product.featuredImage.url;
  }
  if (product.featuredImage?.src) {
    return product.featuredImage.src;
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    return firstImage.url || firstImage.src || '/placeholder.jpg';
  }
  return '/placeholder.jpg';
}

// Helper to get product price range
export function getProductPriceRange(product: Product | ProductListItem): PriceInfo {
  if (!hasVariants(product)) {
    return {
      min: product.price,
      max: product.price,
      display: product.price.toString(),
      currency: 'currency' in product ? product.currency : 'USD',
      compareAtPrice: product.compareAtPrice ? {
        min: product.compareAtPrice,
        max: product.compareAtPrice,
        display: product.compareAtPrice.toString()
      } : undefined
    };
  }

  const prices = (product as Product).variants!.map(v => v.price);
  const compareAtPrices = (product as Product).variants!
    .filter(v => v.compareAtPrice)
    .map(v => v.compareAtPrice as number);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    min: minPrice,
    max: maxPrice,
    display: minPrice === maxPrice ? minPrice.toString() : `${minPrice} - ${maxPrice}`,
    currency: 'currency' in product ? product.currency : 'USD',
    compareAtPrice: compareAtPrices.length > 0 ? {
      min: Math.min(...compareAtPrices),
      max: Math.max(...compareAtPrices),
      display: compareAtPrices.length === 1 
        ? compareAtPrices[0].toString()
        : `${Math.min(...compareAtPrices)} - ${Math.max(...compareAtPrices)}`
    } : undefined
  };
}

// Helper to get all product images
export function getAllProductImages(product: Product | ProductListItem): string[] {
  const images: string[] = [];
  
  // Add featured image
  const featuredImage = getProductImage(product);
  if (featuredImage !== '/placeholder.jpg') {
    images.push(featuredImage);
  }
  
  // Add all images
  if (product.images) {
    product.images.forEach(img => {
      const imgUrl = typeof img === 'string' ? img : (img.url || img.src);
      if (imgUrl && !images.includes(imgUrl)) {
        images.push(imgUrl);
      }
    });
  }
  
  // Add variant images
  if ('variants' in product && product.variants) {
    product.variants.forEach(variant => {
      if (variant.images) {
        const variantImages = Array.isArray(variant.images) ? variant.images : [variant.images];
        variantImages.forEach(img => {
          const imgUrl = typeof img === 'string' ? img : (img.url || img.src);
          if (imgUrl && !images.includes(imgUrl)) {
            images.push(imgUrl);
          }
        });
      }
    });
  }
  
  return images.length > 0 ? images : ['/placeholder.jpg'];
}