'use client';

import { useSearch, useSearchInfiniteScroll } from '@/contexts/search-context';
import { SearchInput } from '@/components/ui/search-input';
import { ProductCard } from '@/components/ui/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Loader2 } from 'lucide-react';
import { formatResultsCount } from '@/lib/search-utils';

export function SearchPageContent() {
  const { 
    query, 
    results, 
    loading, 
    error, 
    setQuery, 
    search,
    clearSearch 
  } = useSearch();

  const { hasMore, isLoadingMore, loadMore } = useSearchInfiniteScroll();

  const handleSearch = (newQuery: string) => {
    search(newQuery);
  };

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">
              {query ? `Search results for "${query}"` : 'Search'}
            </h1>
            
            {results && results.pagination.total > 0 && (
              <p className="text-lg mb-8 text-gray-600">
                {formatResultsCount(results.pagination.total, query)}
              </p>
            )}
            
            <SearchInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              placeholder="Search products..."
              size="lg"
              variant="default"
              className="max-w-2xl mx-auto"
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading && !results ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <EmptyState
              icon={Search}
              title="Something went wrong"
              message={error}
              variant="default"
              size="lg"
              action={{
                label: 'Try Again',
                onClick: () => search(query)
              }}
            />
          ) : results && results.products.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No results found"
              message="Try adjusting your search or filters"
              variant="default"
              size="lg"
              action={{
                label: 'Clear Search',
                onClick: clearSearch
              }}
            />
          ) : results ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="grid"
                    showQuickActions
                    showAddToCart
                  />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}