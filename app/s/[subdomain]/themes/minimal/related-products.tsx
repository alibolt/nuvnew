'use client';

import { CartIcon, HeartIcon, StarIcon } from '@/components/icons/minimal-icons';
import { cn } from '@/lib/utils';

interface RelatedProductsProps {
  relatedProducts: any[];
  settings: {
    title?: string;
    showRating?: boolean;
    showAddToCart?: boolean;
    productsPerRow?: number;
    maxProducts?: number;
  };
  store: any;
}

export function RelatedProducts({ relatedProducts, settings, store }: RelatedProductsProps) {
  const title = settings.title || 'You might also like';
  const showRating = settings.showRating ?? true;
  const showAddToCart = settings.showAddToCart ?? true;
  const productsPerRow = settings.productsPerRow || 4;
  const maxProducts = settings.maxProducts || 4;

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  const displayProducts = relatedProducts.slice(0, maxProducts);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  const getProductImage = (product: any) => {
    return product.variants?.[0]?.images?.[0]?.url || '/placeholder-product.jpg';
  };

  const getProductPrice = (product: any) => {
    const variant = product.variants?.[0];
    if (!variant) return { price: 0, compareAtPrice: null };
    
    return {
      price: variant.price,
      compareAtPrice: variant.compareAtPrice
    };
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
      <div className="text-center">
        <h2 
          className="font-bold mb-2"
          style={{
            fontFamily: 'var(--theme-font-heading)',
            fontSize: 'var(--theme-text-2xl)',
            color: 'var(--theme-text)'
          }}
        >
          {title}
        </h2>
        <div 
          className="w-20 h-0.5 mx-auto"
          style={{ backgroundColor: 'var(--theme-accent)' }}
        />
      </div>

      {/* Products Grid */}
      <div className={cn(
        'grid gap-6',
        gridCols[productsPerRow as keyof typeof gridCols] || gridCols[4]
      )}>
        {displayProducts.map((product) => {
          const { price, compareAtPrice } = getProductPrice(product);
          const hasDiscount = compareAtPrice && compareAtPrice > price;

          return (
            <div key={product.id} className="group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                {/* Product Image */}
                <div className="aspect-square relative">
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div 
                      className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: 'var(--theme-error)' }}
                    >
                      -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
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
              <div className="space-y-2">
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
                    {formatPrice(price)}
                  </span>
                  {hasDiscount && (
                    <span 
                      className="text-sm line-through"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {formatPrice(compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {relatedProducts.length > maxProducts && (
        <div className="text-center pt-4">
          <a
            href="/products"
            className="inline-flex items-center px-6 py-3 border rounded-md font-medium transition-all hover:scale-105"
            style={{
              borderColor: 'var(--theme-primary)',
              color: 'var(--theme-primary)',
              fontSize: 'var(--theme-text-sm)'
            }}
          >
            View All Products
          </a>
        </div>
      )}
    </div>
  );
}