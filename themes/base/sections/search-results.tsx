'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X, ChevronDown, Grid, List, SlidersHorizontal } from 'lucide-react';

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  category?: string;
  inStock?: boolean;
}

interface SearchResultsProps {
  settings?: {
    title?: string;
    showFilters?: boolean;
    showSorting?: boolean;
    showViewToggle?: boolean;
    gridColumns?: number;
    showPriceFilter?: boolean;
    showCategoryFilter?: boolean;
    showAvailabilityFilter?: boolean;
    noResultsMessage?: string;
    noResultsButtonText?: string;
    noResultsButtonLink?: string;
    productsPerPage?: number;
  };
  searchQuery?: string;
  searchResults?: {
    products: SearchProduct[];
    totalCount: number;
    categories?: string[];
    priceRange?: {
      min: number;
      max: number;
    };
  };
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onSort?: (sortBy: string) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default function SearchResults({ 
  settings = {}, 
  searchQuery = '',
  searchResults,
  onSearch,
  onFilter,
  onSort
}: SearchResultsProps) {
  const {
    title = 'Search Results',
    showFilters = true,
    showSorting = true,
    showViewToggle = true,
    gridColumns = 4,
    showPriceFilter = true,
    showCategoryFilter = true,
    showAvailabilityFilter = true,
    noResultsMessage = 'No products found',
    noResultsButtonText = 'Browse All Products',
    noResultsButtonLink = '/collections/all',
    productsPerPage = 12
  } = settings;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    categories: [] as string[],
    inStock: false
  });

  const products = searchResults?.products || [];
  const totalCount = searchResults?.totalCount || 0;
  const categories = searchResults?.categories || [];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSort?.(value);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      categories: [],
      inStock: false
    });
    onFilter?.({});
  };

  const activeFilterCount = 
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    filters.categories.length +
    (filters.inStock ? 1 : 0);

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {searchQuery ? `Results for "${searchQuery}"` : title}
          </h1>
          <p className="text-gray-600">
            {totalCount} {totalCount === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            {showFilters && (
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-black text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            {showSorting && (
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="hidden sm:flex items-center border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          {showFilters && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <h3 className="font-semibold">Filters</h3>

                {/* Price Filter */}
                {showPriceFilter && (
                  <div>
                    <h4 className="font-medium mb-3">Price</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                {showCategoryFilter && categories.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Category</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('categories', [...filters.categories, category]);
                              } else {
                                handleFilterChange('categories', filters.categories.filter(c => c !== category));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Filter */}
                {showAvailabilityFilter && (
                  <div>
                    <h4 className="font-medium mb-3">Availability</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">In Stock Only</span>
                    </label>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">{noResultsMessage}</h2>
                <p className="text-gray-600 mb-8">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <Link 
                  href={noResultsButtonLink}
                  className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {noResultsButtonText}
                </Link>
              </div>
            ) : viewMode === 'grid' ? (
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${gridColumns} gap-6`}>
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group">
                    <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-gray-100">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                          Sale
                        </span>
                      )}
                      {product.inStock === false && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    {product.category && (
                      <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.slug}`}
                    className="flex gap-4 p-4 border rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <div className="w-24 h-24 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{product.name}</h3>
                      {product.category && (
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                              Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                      {product.inStock === false && (
                        <p className="text-sm text-red-600 mt-2">Out of Stock</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Mobile filter content (same as desktop) */}
              <div className="space-y-6">
                {showPriceFilter && (
                  <div>
                    <h4 className="font-medium mb-3">Price</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {showCategoryFilter && categories.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Category</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('categories', [...filters.categories, category]);
                              } else {
                                handleFilterChange('categories', filters.categories.filter(c => c !== category));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {showAvailabilityFilter && (
                  <div>
                    <h4 className="font-medium mb-3">Availability</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">In Stock Only</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-black text-white font-medium rounded-lg"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full py-3 border border-gray-300 font-medium rounded-lg"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export const schema = {
  name: 'Search Results',
  type: 'search-results',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Search Results'
    },
    {
      type: 'checkbox',
      id: 'showFilters',
      label: 'Show Filters',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showSorting',
      label: 'Show Sorting',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showViewToggle',
      label: 'Show View Toggle',
      default: true
    },
    {
      type: 'number',
      id: 'gridColumns',
      label: 'Grid Columns',
      default: 4,
      min: 2,
      max: 6
    },
    {
      type: 'checkbox',
      id: 'showPriceFilter',
      label: 'Show Price Filter',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showCategoryFilter',
      label: 'Show Category Filter',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showAvailabilityFilter',
      label: 'Show Availability Filter',
      default: true
    },
    {
      type: 'text',
      id: 'noResultsMessage',
      label: 'No Results Message',
      default: 'No products found'
    },
    {
      type: 'text',
      id: 'noResultsButtonText',
      label: 'No Results Button Text',
      default: 'Browse All Products'
    },
    {
      type: 'text',
      id: 'noResultsButtonLink',
      label: 'No Results Button Link',
      default: '/collections/all'
    },
    {
      type: 'number',
      id: 'productsPerPage',
      label: 'Products Per Page',
      default: 12,
      min: 6,
      max: 48
    }
  ]
};