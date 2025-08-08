'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, Search, Grid, List, ChevronDown, X } from 'lucide-react';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';

interface CollectionFiltersProps {
  settings?: any;
  pageData?: {
    filters?: {
      available?: {
        sizes?: string[];
        colors?: string[];
        brands?: string[];
        priceRange?: {
          min: number;
          max: number;
        };
      };
      applied?: {
        sizes?: string[];
        colors?: string[];
        brands?: string[];
        minPrice?: number;
        maxPrice?: number;
      };
    };
  };
}

export function CollectionFilters({ settings, pageData }: CollectionFiltersProps) {
  const { settings: themeSettings } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Filter states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: ''
  });

  const currentSort = searchParams.get('sort') || 'created';
  
  const showSortBy = settings?.showSortBy ?? true;
  const showFiltersOption = settings?.showFilters ?? true;
  const showSearch = settings?.showSearch ?? true;
  const showViewToggle = settings?.showViewToggle ?? false;

  // Available filters from API
  const availableFilters = pageData?.filters?.available || {};
  const appliedFilters = pageData?.filters?.applied || {};

  // Initialize filter states from URL params
  useEffect(() => {
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    setSelectedSizes(sizes);
    setSelectedColors(colors);
    setSelectedBrands(brands);
    setPriceRange({ min: minPrice, max: maxPrice });
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const sortOptions = [
    { value: 'created', label: 'Newest' },
    { value: 'name', label: 'A-Z' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ];

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sortValue: string) => {
    updateFilters({ sort: sortValue });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const handleFilterChange = () => {
    const filters: Record<string, string> = {};
    
    if (selectedSizes.length > 0) filters.sizes = selectedSizes.join(',');
    if (selectedColors.length > 0) filters.colors = selectedColors.join(',');
    if (selectedBrands.length > 0) filters.brands = selectedBrands.join(',');
    if (priceRange.min) filters.minPrice = priceRange.min;
    if (priceRange.max) filters.maxPrice = priceRange.max;
    
    updateFilters(filters);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
    
    router.push(pathname);
  };

  const hasActiveFilters = selectedSizes.length > 0 || 
                          selectedColors.length > 0 || 
                          selectedBrands.length > 0 || 
                          priceRange.min || 
                          priceRange.max ||
                          searchQuery;

  return (
    <div 
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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--theme-border)',
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--theme-text-sm)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                />
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              </div>
            </form>
          )}

          <div className="flex items-center gap-4">
            {/* Active Filters Count */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{
                  color: 'var(--theme-primary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                Clear all
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Filters Toggle */}
            {showFiltersOption && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg transition-all hover:opacity-70"
                style={{
                  borderColor: 'var(--theme-border)',
                  fontSize: 'var(--theme-text-sm)',
                  fontFamily: 'var(--theme-font-body)',
                  backgroundColor: showFilters ? 'var(--theme-primary)' : 'transparent',
                  color: showFilters ? 'white' : 'var(--theme-text)',
                }}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span 
                    className="ml-1 px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: showFilters ? 'rgba(255,255,255,0.2)' : 'var(--theme-primary)',
                      color: showFilters ? 'white' : 'white',
                    }}
                  >
                    {(selectedSizes.length + selectedColors.length + selectedBrands.length + (priceRange.min || priceRange.max ? 1 : 0))}
                  </span>
                )}
              </button>
            )}

            {/* Sort Dropdown */}
            {showSortBy && (
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all cursor-pointer"
                  style={{
                    borderColor: 'var(--theme-border)',
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--theme-text-sm)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              </div>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2 transition-all"
                  style={{
                    backgroundColor: viewMode === 'grid' ? 'var(--theme-primary)' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : 'var(--theme-text)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 transition-all"
                  style={{
                    backgroundColor: viewMode === 'list' ? 'var(--theme-primary)' : 'transparent',
                    color: viewMode === 'list' ? 'white' : 'var(--theme-text)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && showFiltersOption && (
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <h4 
                  className="font-medium mb-3"
                  style={{
                    color: 'var(--theme-text)',
                    fontSize: 'var(--theme-text-sm)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  Price Range
                </h4>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                      style={{
                        borderColor: 'var(--theme-border)',
                        backgroundColor: 'var(--theme-background)',
                        color: 'var(--theme-text)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                    />
                    <span style={{ color: 'var(--theme-text-secondary)' }}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                      style={{
                        borderColor: 'var(--theme-border)',
                        backgroundColor: 'var(--theme-background)',
                        color: 'var(--theme-text)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                    />
                  </div>
                  {availableFilters.priceRange && (
                    <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                      ${availableFilters.priceRange.min} - ${availableFilters.priceRange.max}
                    </p>
                  )}
                </div>
              </div>

              {/* Size */}
              {availableFilters.sizes && availableFilters.sizes.length > 0 && (
                <div>
                  <h4 
                    className="font-medium mb-3"
                    style={{
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-sm)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    Size
                  </h4>
                  <div className="space-y-2">
                    {availableFilters.sizes.map(size => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedSizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSizes([...selectedSizes, size]);
                            } else {
                              setSelectedSizes(selectedSizes.filter(s => s !== size));
                            }
                          }}
                        />
                        <span style={{ fontSize: 'var(--theme-text-sm)', fontFamily: 'var(--theme-font-body)' }}>{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}
              {availableFilters.colors && availableFilters.colors.length > 0 && (
                <div>
                  <h4 
                    className="font-medium mb-3"
                    style={{
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-sm)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    Color
                  </h4>
                  <div className="space-y-2">
                    {availableFilters.colors.map(color => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedColors.includes(color)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColors([...selectedColors, color]);
                            } else {
                              setSelectedColors(selectedColors.filter(c => c !== color));
                            }
                          }}
                        />
                        <span style={{ fontSize: 'var(--theme-text-sm)', fontFamily: 'var(--theme-font-body)' }}>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand */}
              {availableFilters.brands && availableFilters.brands.length > 0 && (
                <div>
                  <h4 
                    className="font-medium mb-3"
                    style={{
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-sm)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    Brand
                  </h4>
                  <div className="space-y-2">
                    {availableFilters.brands.map(brand => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                        />
                        <span style={{ fontSize: 'var(--theme-text-sm)', fontFamily: 'var(--theme-font-body)' }}>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apply Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleFilterChange}
                className="px-6 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'white',
                  fontSize: 'var(--theme-text-sm)',
                  fontFamily: 'var(--theme-font-body)',
                  fontWeight: 'var(--theme-font-weight-medium)',
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}