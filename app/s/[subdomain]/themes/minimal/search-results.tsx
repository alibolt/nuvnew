'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';
import { useCart } from '@/lib/cart-context';

interface SearchResultsProps {
  settings?: any;
  pageData?: {
    storeSubdomain?: string;
    searchQuery?: string;
    searchResults?: {
      products?: any[];
      collections?: any[];
    };
    pagination?: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      totalResults: number;
    };
  };
}

export function SearchResults({ settings: sectionSettings, pageData }: SearchResultsProps) {
  const { settings } = useTheme();
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const showProductResults = sectionSettings?.showProductResults ?? true;
  const showCollectionResults = sectionSettings?.showCollectionResults ?? true;
  const productsPerRow = sectionSettings?.productsPerRow || { mobile: 2, tablet: 3, desktop: 4 };
  const showPrice = sectionSettings?.showPrice ?? true;
  const showQuickAdd = sectionSettings?.showQuickAdd ?? true;
  const showWishlist = sectionSettings?.showWishlist ?? true;
  const emptyStateMessage = sectionSettings?.emptyStateMessage || 'No results found.';

  const storeSubdomain = pageData?.storeSubdomain || '';
  const searchQuery = pageData?.searchQuery || '';
  const products = pageData?.searchResults?.products || [];
  const collections = pageData?.searchResults?.collections || [];
  const pagination = pageData?.pagination;

  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleQuickAdd = async (product: any) => {
    if (!product.variants || product.variants.length === 0) return;
    
    setAddingToCart(product.id);
    try {
      await addToCart({
        productId: product.id,
        variantId: product.variants[0].id,
        quantity: 1,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    router.push(`/search?${newParams.toString()}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  // Show empty state if no query or no results
  if (!searchQuery || (products.length === 0 && collections.length === 0)) {
    return (
      <section 
        className="py-16"
        style={{
          backgroundColor: 'var(--theme-background)',
        }}
      >
        <div 
          className="container mx-auto text-center"
          style={{
            maxWidth: 'var(--theme-container-max-width)',
            padding: '0 var(--theme-container-padding)',
          }}
        >
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <MinimalIcons.Search 
                size={48} 
                className="mx-auto opacity-40"
                style={{ color: 'var(--theme-text-secondary)' }}
              />
            </div>
            <h3 
              className="mb-4"
              style={{
                fontSize: 'var(--theme-text-xl)',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
              }}
            >
              {searchQuery ? 'No results found' : 'Start searching'}
            </h3>
            <p 
              style={{
                fontSize: 'var(--theme-text-base)',
                color: 'var(--theme-text-secondary)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              {emptyStateMessage}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-12"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        {/* Collections Results */}
        {showCollectionResults && collections.length > 0 && (
          <div className="mb-12">
            <h2 
              className="mb-6"
              style={{
                fontSize: 'var(--theme-text-2xl)',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
                marginBottom: '1.5rem',
              }}
            >
              Collections ({collections.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/s/${storeSubdomain}/collections/${collection.handle}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-100">
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MinimalIcons.Layers 
                          size={32} 
                          style={{ color: 'var(--theme-text-secondary)' }}
                        />
                      </div>
                    )}
                    {/* Product Count Overlay */}
                    <div 
                      className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs backdrop-blur-sm"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                    >
                      {collection.productCount} item{collection.productCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <h3 
                    className="font-medium group-hover:opacity-70 transition-opacity"
                    style={{
                      fontSize: 'var(--theme-text-lg)',
                      fontFamily: 'var(--theme-font-heading)',
                      color: 'var(--theme-text)',
                    }}
                  >
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p 
                      className="text-sm line-clamp-2"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                    >
                      {collection.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Results */}
        {showProductResults && products.length > 0 && (
          <div>
            <h2 
              className="mb-6"
              style={{
                fontSize: 'var(--theme-text-2xl)',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
                marginBottom: '1.5rem',
              }}
            >
              Products ({products.length})
            </h2>
            <div 
              className={`grid gap-6 grid-cols-${productsPerRow.mobile} md:grid-cols-${productsPerRow.tablet} lg:grid-cols-${productsPerRow.desktop}`}
            >
              {products.map((product) => (
                <div key={product.id} className="group">
                  <div className="relative">
                    <Link href={`/s/${storeSubdomain}/products/${product.handle}`}>
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MinimalIcons.Package 
                              size={32} 
                              style={{ color: 'var(--theme-text-secondary)' }}
                            />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {showWishlist && (
                        <button 
                          className="p-2 bg-white rounded-full shadow-sm transition-colors hover:bg-gray-50"
                          style={{ color: 'var(--theme-text-secondary)' }}
                        >
                          <MinimalIcons.Heart size={16} />
                        </button>
                      )}
                      {showQuickAdd && product.variants && product.variants.length > 0 && (
                        <button 
                          onClick={() => handleQuickAdd(product)}
                          disabled={addingToCart === product.id}
                          className="p-2 bg-white rounded-full shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                          style={{ color: 'var(--theme-text-secondary)' }}
                        >
                          {addingToCart === product.id ? (
                            <MinimalIcons.Loader className="animate-spin" size={16} />
                          ) : (
                            <MinimalIcons.Plus size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <Link href={`/s/${storeSubdomain}/products/${product.handle}`}>
                    <h3 
                      className="font-medium mb-2 group-hover:opacity-70 transition-opacity"
                      style={{
                        fontSize: 'var(--theme-text-base)',
                        fontFamily: 'var(--theme-font-heading)',
                        color: 'var(--theme-text)',
                      }}
                    >
                      {product.name}
                    </h3>
                    
                    {showPrice && (
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-medium"
                          style={{
                            fontSize: 'var(--theme-text-base)',
                            color: 'var(--theme-text)',
                            fontFamily: 'var(--theme-font-body)',
                          }}
                        >
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span 
                            className="line-through text-sm"
                            style={{
                              color: 'var(--theme-text-secondary)',
                              fontFamily: 'var(--theme-font-body)',
                            }}
                          >
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 text-sm border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                Previous
              </button>
              
              <span 
                className="px-4 py-2 text-sm"
                style={{
                  color: 'var(--theme-text-secondary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 text-sm border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}