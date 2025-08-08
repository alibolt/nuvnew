'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';

interface Product {
  id: string;
  name: string;
  handle: string;
  price: number;
  compareAtPrice?: number | null;
  images: Array<{
    id: string;
    url: string;
    altText?: string | null;
  }>;
  variants: Array<{
    id: string;
    price: number;
    inventory: number;
  }>;
}

interface CollectionProductsProps {
  products: Product[];
  storeSubdomain: string;
  settings?: {
    productsPerRow?: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    showPrice?: boolean;
    showQuickAdd?: boolean;
    showWishlist?: boolean;
    paginationType?: 'pagination' | 'infinite' | 'load-more';
  };
}

export function CollectionProducts({ products, storeSubdomain, settings }: CollectionProductsProps) {
  const { settings: themeSettings } = useTheme();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  
  const productsPerRow = settings?.productsPerRow || { mobile: 2, tablet: 3, desktop: 4 };
  const showPrice = settings?.showPrice ?? true;
  const showQuickAdd = settings?.showQuickAdd ?? true;
  const showWishlist = settings?.showWishlist ?? true;

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const getGridClasses = () => {
    return `grid gap-6 grid-cols-${productsPerRow.mobile} md:grid-cols-${productsPerRow.tablet} lg:grid-cols-${productsPerRow.desktop}`;
  };

  if (products.length === 0) {
    return (
      <div 
        className="py-16 text-center"
        style={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text)',
        }}
      >
        <div 
          className="container mx-auto"
          style={{
            maxWidth: 'var(--theme-container-max-width)',
            padding: '0 var(--theme-container-padding)',
          }}
        >
          <div className="max-w-md mx-auto">
            <MinimalIcons.Search size={48} className="mx-auto mb-4 opacity-40" />
            <h3 
              className="mb-2"
              style={{
                fontSize: 'var(--theme-text-xl)',
                fontWeight: 'var(--theme-font-weight-semibold)',
                color: 'var(--theme-text)',
              }}
            >
              No products found
            </h3>
            <p 
              className="opacity-60"
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: 'var(--theme-text)',
              }}
            >
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
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
        <div className={getGridClasses()}>
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square mb-4">
                <Link href={`/s/${storeSubdomain}/products/${product.handle}`}>
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        color: 'var(--theme-text-muted)',
                      }}
                    >
                      <MinimalIcons.Image size={48} />
                    </div>
                  )}
                </Link>

                {/* Hover Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {showWishlist && (
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 bg-white rounded-full shadow-md transition-colors hover:bg-gray-50"
                      style={{
                        color: wishlist.has(product.id) ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                      }}
                    >
                      <Heart className={`h-4 w-4 ${wishlist.has(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  )}
                  <Link
                    href={`/s/${storeSubdomain}/products/${product.handle}`}
                    className="p-2 bg-white rounded-full shadow-md transition-colors hover:bg-gray-50"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>

                {/* Sale Badge */}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div 
                    className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded"
                    style={{
                      backgroundColor: 'var(--theme-primary)',
                      color: 'var(--theme-background)',
                    }}
                  >
                    Sale
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="text-center">
                <Link 
                  href={`/s/${storeSubdomain}/products/${product.handle}`}
                  className="block"
                >
                  <h3 
                    className="mb-2 transition-opacity hover:opacity-70"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      color: 'var(--theme-text)',
                    }}
                  >
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                {showPrice && (
                  <div className="mb-3">
                    {product.compareAtPrice && product.compareAtPrice > product.price ? (
                      <div className="flex items-center justify-center gap-2">
                        <span 
                          className="font-medium"
                          style={{
                            fontSize: 'var(--theme-text-sm)',
                            color: 'var(--theme-primary)',
                          }}
                        >
                          {formatPrice(product.price)}
                        </span>
                        <span 
                          className="line-through opacity-50"
                          style={{
                            fontSize: 'var(--theme-text-xs)',
                            color: 'var(--theme-text)',
                          }}
                        >
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      </div>
                    ) : (
                      <span 
                        className="font-medium"
                        style={{
                          fontSize: 'var(--theme-text-sm)',
                          color: 'var(--theme-text)',
                        }}
                      >
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                )}

                {/* Quick Add Button */}
                {showQuickAdd && product.variants.length > 0 && product.variants[0].inventory > 0 && (
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--theme-primary)',
                      color: 'var(--theme-background)',
                      fontSize: 'var(--theme-text-xs)',
                      transitionDuration: 'var(--theme-transition-duration)',
                    }}
                  >
                    <MinimalIcons.Bag size={16} />
                    <span>Quick Add</span>
                  </button>
                )}

                {/* Out of Stock */}
                {product.variants.every(v => v.inventory <= 0) && (
                  <div 
                    className="w-full py-2 text-sm font-medium rounded-lg"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      color: 'var(--theme-text-muted)',
                      fontSize: 'var(--theme-text-xs)',
                    }}
                  >
                    Out of Stock
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More / Pagination */}
        {settings?.paginationType === 'load-more' && (
          <div className="text-center mt-12">
            <button
              className="px-8 py-3 font-medium rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--theme-text)',
                border: `1px solid var(--theme-border)`,
                fontSize: 'var(--theme-text-sm)',
                transitionDuration: 'var(--theme-transition-duration)',
              }}
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}