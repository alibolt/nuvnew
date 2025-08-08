/**
 * Search utility functions
 */

import { ProductFilter, ProductListResponse } from '@/types/product';

/**
 * Parse search query from URL parameters
 * Supports both 'q' and 'query' parameters for compatibility
 */
export function parseSearchQuery(params: URLSearchParams | Record<string, string | string[] | undefined>): string {
  if (params instanceof URLSearchParams) {
    return params.get('q') || params.get('query') || '';
  }
  
  // Handle Next.js searchParams object
  const q = params.q || params.query;
  if (Array.isArray(q)) {
    return q[0] || '';
  }
  return q || '';
}

/**
 * Build search filters from URL parameters
 */
export function buildSearchFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): ProductFilter {
  const filters: ProductFilter = {};
  
  // Helper to get param value
  const getParam = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key) || undefined;
    }
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  
  // Helper to get array param
  const getArrayParam = (key: string): string[] | undefined => {
    if (params instanceof URLSearchParams) {
      const values = params.getAll(key);
      return values.length > 0 ? values : undefined;
    }
    const value = params[key];
    if (Array.isArray(value)) {
      return value;
    }
    return value ? [value] : undefined;
  };
  
  // Categories
  const categories = getArrayParam('category') || getArrayParam('categories');
  if (categories && categories.length > 0) {
    filters.categories = categories;
  }
  
  // Collections
  const collections = getArrayParam('collection') || getArrayParam('collections');
  if (collections && collections.length > 0) {
    filters.collections = collections;
  }
  
  // Vendors
  const vendors = getArrayParam('vendor') || getArrayParam('vendors');
  if (vendors && vendors.length > 0) {
    filters.vendors = vendors;
  }
  
  // Tags
  const tags = getArrayParam('tag') || getArrayParam('tags');
  if (tags && tags.length > 0) {
    filters.tags = tags;
  }
  
  // Price range
  const minPrice = getParam('min_price') || getParam('minPrice');
  const maxPrice = getParam('max_price') || getParam('maxPrice');
  if (minPrice || maxPrice) {
    filters.priceRange = {
      min: minPrice ? parseFloat(minPrice) : undefined,
      max: maxPrice ? parseFloat(maxPrice) : undefined,
    };
  }
  
  // In stock
  const inStock = getParam('in_stock') || getParam('inStock');
  if (inStock !== undefined) {
    filters.inStock = inStock === 'true' || inStock === '1';
  }
  
  // Sort
  const sortBy = getParam('sort') || getParam('sortBy') || getParam('sort_by');
  if (sortBy && isValidSortOption(sortBy)) {
    filters.sortBy = sortBy as ProductFilter['sortBy'];
  }
  
  return filters;
}

/**
 * Build pagination info from URL parameters
 */
export function buildPagination(params: URLSearchParams | Record<string, string | string[] | undefined>): {
  page: number;
  limit: number;
} {
  const getParam = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key) || undefined;
    }
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  
  const page = parseInt(getParam('page') || '1', 10);
  const limit = parseInt(getParam('limit') || getParam('per_page') || '24', 10);
  
  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 || limit > 100 ? 24 : limit,
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(total: number, page: number, limit: number): {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
} {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  
  return {
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex,
    endIndex,
  };
}

/**
 * Build URL with search parameters
 */
export function buildSearchUrl(baseUrl: string, params: Record<string, any>): string {
  const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, String(v)));
    } else {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, searchTerms: string | string[]): string {
  if (!text || !searchTerms) {
    return text;
  }
  
  const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  let highlightedText = text;
  
  terms.forEach(term => {
    if (term && term.length > 0) {
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }
  });
  
  return highlightedText;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if sort option is valid
 */
function isValidSortOption(sort: string): boolean {
  const validOptions = [
    'relevance',
    'price-asc',
    'price-desc',
    'newest',
    'name-asc',
    'name-desc',
    'title-asc',
    'title-desc',
  ];
  return validOptions.includes(sort);
}

/**
 * Get display label for sort option
 */
export function getSortLabel(sort: ProductFilter['sortBy']): string {
  const labels: Record<string, string> = {
    'relevance': 'Most Relevant',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'newest': 'Newest First',
    'name-asc': 'Name: A to Z',
    'name-desc': 'Name: Z to A',
    'title-asc': 'Title: A to Z',
    'title-desc': 'Title: Z to A',
  };
  
  return labels[sort || 'relevance'] || 'Most Relevant';
}

/**
 * Parse search suggestions from response
 */
export function parseSearchSuggestions(query: string, products: any[]): {
  query: string;
  products: string[];
  categories: string[];
  collections: string[];
} {
  const suggestions = {
    query,
    products: [] as string[],
    categories: [] as string[],
    collections: [] as string[],
  };
  
  // Extract unique product names/titles
  const productNames = new Set<string>();
  products.forEach(product => {
    const name = product.title || product.name;
    if (name && name.toLowerCase().includes(query.toLowerCase())) {
      productNames.add(name);
    }
  });
  suggestions.products = Array.from(productNames).slice(0, 5);
  
  // Extract unique categories
  const categories = new Set<string>();
  products.forEach(product => {
    if (product.category?.name) {
      categories.add(product.category.name);
    }
  });
  suggestions.categories = Array.from(categories).slice(0, 3);
  
  // Extract unique collections
  const collections = new Set<string>();
  products.forEach(product => {
    if (product.collections) {
      product.collections.forEach((collection: any) => {
        if (collection.name || collection.title) {
          collections.add(collection.name || collection.title);
        }
      });
    }
  });
  suggestions.collections = Array.from(collections).slice(0, 3);
  
  return suggestions;
}

/**
 * Build search analytics data
 */
export function buildSearchAnalytics(query: string, results: ProductListResponse): {
  query: string;
  resultsCount: number;
  pageViewed: number;
  filters: Record<string, any>;
  timestamp: string;
} {
  return {
    query,
    resultsCount: results.pagination.total,
    pageViewed: results.pagination.page,
    filters: {
      categories: results.filters?.categories?.map(c => c.name),
      vendors: results.filters?.vendors?.map(v => v.name),
      priceRange: results.filters?.priceRange,
      tags: results.filters?.tags?.map(t => t.name),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Debounce search function
 */
export function debounceSearch<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Format search results count message
 */
export function formatResultsCount(count: number, query?: string): string {
  if (count === 0) {
    return query ? `No results found for "${query}"` : 'No results found';
  }
  
  if (count === 1) {
    return query ? `1 result for "${query}"` : '1 result';
  }
  
  return query ? `${count} results for "${query}"` : `${count} results`;
}

/**
 * Build breadcrumb items for search page
 */
export function buildSearchBreadcrumbs(query?: string, filters?: ProductFilter): Array<{
  label: string;
  href: string;
}> {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
  ];
  
  if (query) {
    breadcrumbs.push({
      label: `Results for "${query}"`,
      href: `/search?q=${encodeURIComponent(query)}`,
    });
  }
  
  return breadcrumbs;
}

/**
 * Merge search results (for infinite scroll)
 */
export function mergeSearchResults(
  existingResults: any[],
  newResults: any[],
  removeDuplicates: boolean = true
): any[] {
  if (!removeDuplicates) {
    return [...existingResults, ...newResults];
  }
  
  const existingIds = new Set(existingResults.map(item => item.id));
  const uniqueNewResults = newResults.filter(item => !existingIds.has(item.id));
  
  return [...existingResults, ...uniqueNewResults];
}