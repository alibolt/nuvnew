'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductFilter, ProductListResponse } from '@/types/product';
import { 
  parseSearchQuery, 
  buildSearchFilters, 
  buildSearchUrl, 
  debounceSearch,
  mergeSearchResults 
} from '@/lib/search-utils';

interface SearchState {
  query: string;
  filters: ProductFilter;
  results: ProductListResponse | null;
  loading: boolean;
  error: string | null;
  suggestions: Array<{ type: string; text: string; slug?: string }>;
  recentSearches: string[];
  isLoadingMore: boolean;
}

interface SearchContextValue extends SearchState {
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<ProductFilter>) => void;
  search: (query?: string, filters?: Partial<ProductFilter>) => Promise<void>;
  loadMore: () => Promise<void>;
  clearSearch: () => void;
  getSuggestions: (query: string) => Promise<void>;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
  subdomain: string;
  initialQuery?: string;
  initialFilters?: ProductFilter;
}

export function SearchProvider({ 
  children, 
  subdomain,
  initialQuery = '',
  initialFilters = {}
}: SearchProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<SearchState>({
    query: initialQuery || parseSearchQuery(Object.fromEntries(searchParams.entries())),
    filters: initialFilters || buildSearchFilters(Object.fromEntries(searchParams.entries())),
    results: null,
    loading: false,
    error: null,
    suggestions: [],
    recentSearches: [],
    isLoadingMore: false,
  });

  // Debounced search function
  const performSearch = useCallback(async (query: string, filters: ProductFilter, append: boolean = false) => {
    if (!append) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    } else {
      setState(prev => ({ ...prev, isLoadingMore: true }));
    }

    try {
      const url = buildSearchUrl(`/api/stores/${subdomain}/search`, {
        q: query,
        ...filters,
        page: append && state.results ? state.results.pagination.page + 1 : 1,
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        results: append && prev.results 
          ? {
              ...data,
              products: mergeSearchResults(prev.results.products, data.products)
            }
          : data,
        loading: false,
        isLoadingMore: false,
        error: null,
      }));

      // Update URL without navigation
      const newUrl = buildSearchUrl(window.location.pathname, { q: query, ...filters });
      window.history.pushState({}, '', newUrl);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        isLoadingMore: false,
        error: 'Failed to perform search',
      }));
    }
  }, [subdomain, state.results]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounceSearch((query: string, filters: ProductFilter) => {
      performSearch(query, filters);
    }, 300),
    [performSearch]
  );

  // Set query
  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
    debouncedSearch(query, state.filters);
  }, [debouncedSearch, state.filters]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<ProductFilter>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    performSearch(state.query, updatedFilters);
  }, [state.query, state.filters, performSearch]);

  // Search action
  const search = useCallback(async (query?: string, filters?: Partial<ProductFilter>) => {
    const searchQuery = query ?? state.query;
    const searchFilters = { ...state.filters, ...filters };
    
    setState(prev => ({
      ...prev,
      query: searchQuery,
      filters: searchFilters,
    }));
    
    await performSearch(searchQuery, searchFilters);
  }, [state.query, state.filters, performSearch]);

  // Load more results
  const loadMore = useCallback(async () => {
    if (state.results && state.results.pagination.hasNext && !state.isLoadingMore) {
      await performSearch(state.query, state.filters, true);
    }
  }, [state.results, state.query, state.filters, state.isLoadingMore, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      filters: {},
      results: null,
      error: null,
      suggestions: [],
    }));
    router.push('/search');
  }, [router]);

  // Get suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      const response = await fetch(
        `/api/stores/${subdomain}/search?action=autocomplete&q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, suggestions: data.suggestions || [] }));
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, [subdomain]);

  // Recent searches management
  const addToRecentSearches = useCallback((query: string) => {
    if (query.trim()) {
      setState(prev => {
        const filtered = prev.recentSearches.filter(q => q !== query);
        const updated = [query, ...filtered].slice(0, 5);
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`search-history-${subdomain}`, JSON.stringify(updated));
        }
        
        return { ...prev, recentSearches: updated };
      });
    }
  }, [subdomain]);

  const clearRecentSearches = useCallback(() => {
    setState(prev => ({ ...prev, recentSearches: [] }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`search-history-${subdomain}`);
    }
  }, [subdomain]);

  // Load recent searches from localStorage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`search-history-${subdomain}`);
      if (stored) {
        try {
          const recentSearches = JSON.parse(stored);
          setState(prev => ({ ...prev, recentSearches }));
        } catch (error) {
          console.error('Failed to parse recent searches:', error);
        }
      }
    }
  });

  const value: SearchContextValue = {
    ...state,
    setQuery,
    setFilters,
    search,
    loadMore,
    clearSearch,
    getSuggestions,
    addToRecentSearches,
    clearRecentSearches,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

// Hook for search suggestions
export function useSearchSuggestions(query: string) {
  const { getSuggestions, suggestions } = useSearch();
  const debouncedGetSuggestions = useCallback(
    debounceSearch((q: string) => getSuggestions(q), 200),
    [getSuggestions]
  );

  useState(() => {
    if (query) {
      debouncedGetSuggestions(query);
    }
  });

  return suggestions;
}

// Hook for infinite scroll
export function useSearchInfiniteScroll() {
  const { results, isLoadingMore, loadMore } = useSearch();
  
  const hasMore = results?.pagination.hasNext || false;
  const canLoadMore = hasMore && !isLoadingMore;
  
  return {
    hasMore,
    isLoadingMore,
    loadMore: canLoadMore ? loadMore : undefined,
  };
}