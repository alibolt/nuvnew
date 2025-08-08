'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';

interface SearchFiltersProps {
  settings?: any;
  pageData?: {
    filters?: {
      sort?: string;
      type?: string;
      minPrice?: number;
      maxPrice?: number;
    };
  };
}

export function SearchFilters({ settings: sectionSettings, pageData }: SearchFiltersProps) {
  const { settings } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const showSortBy = sectionSettings?.showSortBy ?? true;
  const showTypeFilter = sectionSettings?.showTypeFilter ?? true;
  const showPriceFilter = sectionSettings?.showPriceFilter ?? true;
  const showSearch = sectionSettings?.showSearch ?? true;

  // Current filter values
  const currentQuery = searchParams.get('q') || searchParams.get('query') || '';
  const currentSort = searchParams.get('sort') || 'relevance';
  const currentType = searchParams.get('type') || 'all';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Local state
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Update local state when URL params change
  useEffect(() => {
    setSearchQuery(currentQuery);
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentQuery, currentMinPrice, currentMaxPrice]);

  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 when filters change
    newParams.set('page', '1');
    
    router.push(`/search?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ q: searchQuery });
  };

  const handleSortChange = (sort: string) => {
    updateSearchParams({ sort });
  };

  const handleTypeChange = (type: string) => {
    updateSearchParams({ type });
  };

  const handlePriceFilter = () => {
    updateSearchParams({ minPrice, maxPrice });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    updateSearchParams({ 
      sort: 'relevance', 
      type: 'all', 
      minPrice: '', 
      maxPrice: '' 
    });
  };

  const hasActiveFilters = currentSort !== 'relevance' || currentType !== 'all' || currentMinPrice || currentMaxPrice;

  return (
    <section 
      className="py-6 border-b"
      style={{
        backgroundColor: 'var(--theme-background)',
        borderColor: 'var(--theme-border)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products and collections..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--theme-text-base)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-opacity hover:opacity-70"
                  style={{
                    color: 'var(--theme-text-secondary)',
                  }}
                >
                  <MinimalIcons.Search size={20} />
                </button>
              </form>
            </div>
          )}

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Sort Dropdown */}
            {showSortBy && (
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 pr-8 rounded-lg border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--theme-text-sm)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="created">Newest</option>
                </select>
                <MinimalIcons.ChevronDown 
                  size={16} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              </div>
            )}

            {/* Type Filter */}
            {showTypeFilter && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'products', label: 'Products' },
                  { value: 'collections', label: 'Collections' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTypeChange(option.value)}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      currentType === option.value
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-white/50'
                    }`}
                    style={{
                      color: currentType === option.value 
                        ? 'var(--theme-primary)' 
                        : 'var(--theme-text-secondary)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* More Filters Toggle */}
            {showPriceFilter && (
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-all hover:bg-gray-50"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-secondary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                <MinimalIcons.Filter size={16} />
                <span>Filters</span>
                {hasActiveFilters && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm transition-opacity hover:opacity-70"
                style={{
                  color: 'var(--theme-text-secondary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {filtersExpanded && showPriceFilter && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-4">
              {/* Price Range */}
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm font-medium"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  Price:
                </span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                />
                <span style={{ color: 'var(--theme-text-secondary)' }}>-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                />
                <button
                  onClick={handlePriceFilter}
                  className="px-3 py-1 text-sm border rounded transition-all hover:bg-gray-50"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}