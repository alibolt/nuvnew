'use client';

import { useTheme } from '../../theme-provider';

interface SearchHeaderProps {
  settings?: any;
  pageData?: {
    searchQuery?: string;
    searchResults?: {
      products?: any[];
      collections?: any[];
      totalProducts?: number;
      totalCollections?: number;
    };
    pagination?: {
      totalResults?: number;
    };
  };
}

export function SearchHeader({ settings: sectionSettings, pageData }: SearchHeaderProps) {
  const { settings } = useTheme();
  
  const title = sectionSettings?.title || 'Search';
  const showResultCount = sectionSettings?.showResultCount ?? true;
  const showFilters = sectionSettings?.showFilters ?? true;
  
  const searchQuery = pageData?.searchQuery || '';
  const totalResults = pageData?.pagination?.totalResults || 0;
  const productsCount = pageData?.searchResults?.totalProducts || 0;
  const collectionsCount = pageData?.searchResults?.totalCollections || 0;

  return (
    <section 
      className="py-12 border-b"
      style={{
        backgroundColor: 'var(--theme-background)',
        borderColor: 'var(--theme-border)',
      }}
    >
      <div 
        className="container mx-auto text-center"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        {/* Main Title */}
        <h1 
          className="mb-4"
          style={{
            fontSize: 'var(--theme-text-3xl)',
            fontFamily: 'var(--theme-font-heading)',
            fontWeight: 'var(--theme-font-weight-light)',
            color: 'var(--theme-text)',
            lineHeight: 'var(--theme-line-height-tight)',
          }}
        >
          {searchQuery ? `Search results for "${searchQuery}"` : 'Search'}
        </h1>

        {/* Search Description */}
        {searchQuery && (
          <p 
            className="mb-6"
            style={{
              fontSize: 'var(--theme-text-base)',
              color: 'var(--theme-text-secondary)',
              fontFamily: 'var(--theme-font-body)',
            }}
          >
            {totalResults === 0 ? (
              'No results found. Try different keywords.'
            ) : (
              `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`
            )}
          </p>
        )}

        {/* Result Count Breakdown */}
        {showResultCount && searchQuery && totalResults > 0 && (
          <div className="flex justify-center gap-6 text-sm">
            {productsCount > 0 && (
              <span style={{ color: 'var(--theme-text-secondary)' }}>
                {productsCount} product{productsCount !== 1 ? 's' : ''}
              </span>
            )}
            {collectionsCount > 0 && (
              <span style={{ color: 'var(--theme-text-secondary)' }}>
                {collectionsCount} collection{collectionsCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="max-w-lg mx-auto">
            <p 
              style={{
                fontSize: 'var(--theme-text-base)',
                color: 'var(--theme-text-secondary)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              Enter a search term above to find products and collections.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}