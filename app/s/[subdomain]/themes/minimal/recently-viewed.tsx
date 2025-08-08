'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { CartIcon, HeartIcon, StarIcon } from '@/components/icons/minimal-icons';
import { cn } from '@/lib/utils';

interface RecentlyViewedProps {
  currentProduct?: any;
  settings: {
    title?: string;
    maxProducts?: number;
    showRating?: boolean;
    showAddToCart?: boolean;
    productsPerRow?: number;
  };
  store: any;
}

export function RecentlyViewed({ currentProduct, settings, store }: RecentlyViewedProps) {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  const title = settings.title || 'Recently Viewed';
  const maxProducts = settings.maxProducts || 4;
  const showRating = settings.showRating ?? true;
  const showAddToCart = settings.showAddToCart ?? true;
  const productsPerRow = settings.productsPerRow || 4;

  useEffect(() => {
    // Get recently viewed products from localStorage
    const stored = localStorage.getItem('recentlyViewed');
    let viewedProducts = stored ? JSON.parse(stored) : [];

    // Add current product to recently viewed (if not already there)
    if (currentProduct) {
      viewedProducts = viewedProducts.filter((p: any) => p.id !== currentProduct.id);
      viewedProducts.unshift({
        id: currentProduct.id,
        title: currentProduct.title,
        handle: currentProduct.handle,
        image: currentProduct.variants?.[0]?.images?.[0]?.url,
        price: currentProduct.variants?.[0]?.price,
        compareAtPrice: currentProduct.variants?.[0]?.compareAtPrice,
        category: currentProduct.category,
        viewedAt: new Date().toISOString()
      });

      // Keep only last 20 viewed products
      viewedProducts = viewedProducts.slice(0, 20);
      
      // Save back to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(viewedProducts));
    }

    // Remove current product from display list and limit to maxProducts
    const displayProducts = viewedProducts
      .filter((p: any) => !currentProduct || p.id !== currentProduct.id)
      .slice(0, maxProducts);

    setRecentlyViewed(displayProducts);
  }, [currentProduct, maxProducts]);

  if (recentlyViewed.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3', 
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-6'
  };

  return (
    <div 
      className="space-y-6"
      style={{ fontFamily: 'var(--theme-font-body)' }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Eye className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
        <h2 
          className="font-bold"
          style={{
            fontFamily: 'var(--theme-font-heading)',
            fontSize: 'var(--theme-text-xl)',
            color: 'var(--theme-text)'
          }}
        >
          {title}
        </h2>
      </div>

      {/* Products Grid */}
      <div className={cn(
        'grid gap-4',
        gridCols[productsPerRow as keyof typeof gridCols] || gridCols[4]
      )}>
        {recentlyViewed.map((product) => {
          const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

          return (
            <div key={product.id} className="group">
              <div className="relative overflow-hidden rounded-lg mb-3">
                {/* Product Image */}
                <div className="aspect-square relative">
                  <img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div 
                      className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: 'var(--theme-error)' }}
                    >
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      className="p-2 rounded-full transition-transform hover:scale-110"
                      style={{ 
                        backgroundColor: 'var(--theme-background)',
                        color: 'var(--theme-text)'
                      }}
                    >
                      <HeartIcon size={16} />
                    </button>
                    
                    {showAddToCart && (
                      <button 
                        className="p-2 rounded-full transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: 'var(--theme-primary)',
                          color: 'var(--theme-background)'
                        }}
                      >
                        <CartIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                {/* Product Title */}
                <h3 className="font-medium leading-tight">
                  <a 
                    href={`/products/${product.handle}`}
                    className="hover:opacity-70 transition-opacity"
                    style={{ 
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-sm)'
                    }}
                  >
                    {product.title}
                  </a>
                </h3>

                {/* Category */}
                {product.category && (
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {product.category.name}
                  </p>
                )}

                {/* Rating */}
                {showRating && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i}
                          size={12}
                          filled={i < 4}
                          color={i < 4 ? 'var(--theme-accent)' : 'var(--theme-border)'}
                        />
                      ))}
                    </div>
                    <span 
                      className="text-xs"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      (4.0)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span 
                    className="font-bold"
                    style={{ 
                      color: 'var(--theme-primary)',
                      fontSize: 'var(--theme-text-base)'
                    }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span 
                      className="text-sm line-through"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Viewed Date */}
                <p 
                  className="text-xs opacity-75"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Viewed {new Date(product.viewedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear History Link */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            localStorage.removeItem('recentlyViewed');
            setRecentlyViewed([]);
          }}
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          Clear viewing history
        </button>
      </div>
    </div>
  );
}