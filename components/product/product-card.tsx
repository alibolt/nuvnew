'use client';

import React, { useState, useEffect, memo } from 'react';
import { Heart, Eye, ShoppingCart, GitCompare, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';

interface ProductCardProps {
  product: any;
  settings?: {
    showQuickView?: boolean;
    showWishlist?: boolean;
    showCompare?: boolean;
    showAddToCart?: boolean;
    showPrice?: boolean;
    showRating?: boolean;
    showVendor?: boolean;
    showCategory?: boolean;
    showBadge?: boolean;
    showHoverImage?: boolean;
    imageAspectRatio?: string;
    cardStyle?: string;
    cardLayout?: string;
    textAlignment?: string;
    cardPadding?: string;
    hoverEffect?: string;
    addToCartStyle?: string;
    cardBackgroundColor?: string;
    cardBorderColor?: string;
  };
  subdomain?: string;
}

export const ProductCard = memo(function ProductCard({ product, settings = {}, subdomain }: ProductCardProps) {
  const [hoveredProduct, setHoveredProduct] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { addItem } = useCart();
  const router = useRouter();
  
  // Get theme values from context
  let typography = { bodyFont: 'Inter' };
  let borderRadius = '8px';
  let themeAvailable = false;
  try {
    const theme = useTheme();
    typography = theme.typography;
    borderRadius = theme.borderRadius;
    themeAvailable = true;
    // Theme values loaded successfully
  } catch (error) {
    // Theme context not available, using defaults
  }

  // Listen for theme updates to force re-render
  useEffect(() => {
    const handleThemeUpdate = () => {
      // Theme update detected, forcing re-render
      setForceUpdate(prev => prev + 1);
    };

    // Listen for CSS variable updates
    window.addEventListener('cssVariablesUpdated', handleThemeUpdate);
    return () => window.removeEventListener('cssVariablesUpdated', handleThemeUpdate);
  }, []);

  const {
    showQuickView = true,
    showWishlist = true,
    showCompare = false,
    showAddToCart = true,
    showPrice = true,
    showRating = false,
    showVendor = false,
    showCategory = false,
    showBadge = true,
    showHoverImage = true,
    imageAspectRatio = 'square',
    cardStyle = 'minimal',
    cardLayout = 'standard',
    textAlignment = 'left',
    cardPadding = 'md',
    hoverEffect = 'lift',
    addToCartStyle = 'button',
    cardBackgroundColor = '#ffffff',
    cardBorderColor = '#e2e8f0'
  } = settings;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const firstVariant = product.variants?.[0];
      if (!firstVariant) {
        toast.error('Product variant not found');
        return;
      }

      await addItem({
        productId: product.id,
        variantId: firstVariant.id,
        productName: product.name || product.title,
        productSlug: product.slug || product.handle,
        price: firstVariant.price || product.price || 0,
        image: product.images?.[0] 
          ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
          : '',
        subdomain: subdomain || window.location.hostname.split('.')[0],
      });
      
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleProductClick = () => {
    const productSlug = product.slug || product.handle;
    console.log('[ProductCard] handleProductClick:', {
      productId: product.id,
      productSlug,
      slug: product.slug,
      handle: product.handle,
      subdomain,
      fullPath: `/s/${subdomain}/products/${productSlug}`
    });
    
    if (!productSlug) {
      console.error('[ProductCard] No slug or handle found for product:', product);
      return;
    }
    
    if (subdomain) {
      router.push(`/s/${subdomain}/products/${productSlug}`);
    } else {
      router.push(`/products/${productSlug}`);
    }
  };

  const getImageAspectClass = () => {
    switch (imageAspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'square': 
      default: return 'aspect-square';
    }
  };

  const getCardClasses = () => {
    const baseClasses = 'group relative overflow-hidden transition-all duration-300 cursor-pointer';
    
    // Card style classes
    let styleClasses = '';
    switch (cardStyle) {
      case 'bordered':
        styleClasses = 'border hover:shadow-lg';
        break;
      case 'elevated':
        styleClasses = 'shadow-md hover:shadow-xl';
        break;
      case 'modern':
        styleClasses = 'border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200';
        break;
      case 'overlay':
        styleClasses = 'shadow-lg hover:shadow-2xl';
        break;
      case 'compact':
        styleClasses = 'border border-transparent hover:border-gray-200 hover:shadow-md';
        break;
      case 'minimal':
      default:
        styleClasses = 'hover:shadow-lg';
    }
    
    // Hover effect classes
    let hoverClasses = '';
    switch (hoverEffect) {
      case 'lift':
        hoverClasses = 'hover:-translate-y-1';
        break;
      case 'scale':
        hoverClasses = 'hover:scale-105';
        break;
      case 'shadow':
        hoverClasses = 'hover:shadow-2xl';
        break;
      case 'glow':
        hoverClasses = 'hover:shadow-lg hover:shadow-blue-500/25';
        break;
      case 'none':
      default:
        hoverClasses = '';
    }
    
    // Layout classes
    let layoutClasses = '';
    switch (cardLayout) {
      case 'horizontal':
        layoutClasses = 'flex flex-row';
        break;
      case 'overlay':
        layoutClasses = 'relative';
        break;
      default:
        layoutClasses = 'flex flex-col';
    }
    
    return cn(baseClasses, styleClasses, hoverClasses, layoutClasses);
  };

  const getPaddingClasses = () => {
    switch (cardPadding) {
      case 'none': return '';
      case 'sm': return 'p-2';
      case 'lg': return 'p-6';
      case 'md':
      default: return 'p-4';
    }
  };

  const getTextAlignmentClasses = () => {
    switch (textAlignment) {
      case 'center': return 'text-center items-center';
      case 'right': return 'text-right items-end';
      case 'left':
      default: return 'text-left items-start';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const productPrice = product.variants?.[0]?.price || product.price || 0;
  const comparePrice = product.variants?.[0]?.compareAtPrice || product.compareAtPrice;
  const discount = comparePrice ? Math.round((1 - productPrice / comparePrice) * 100) : 0;

  return (
    <div
      className={cn(getCardClasses(), 'product-card-component')}
      style={{
        backgroundColor: cardBackgroundColor,
        borderColor: cardBorderColor,
        borderRadius: borderRadius,
        // Force override with individual properties
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius, 
        borderBottomLeftRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
        // CSS custom property for consistent override
        '--border-radius-override': borderRadius
      } as React.CSSProperties}
      onMouseEnter={() => setHoveredProduct(true)}
      onMouseLeave={() => setHoveredProduct(false)}
      onClick={handleProductClick}
      data-border-radius={borderRadius}
      data-force-update={forceUpdate}
    >
      {/* Product Badge */}
      {showBadge && (product.badge || discount > 0) && (
        <div className="absolute top-3 left-3 z-10">
          <span 
            className={cn(
              'px-2 py-1 text-xs font-semibold',
              product.badge === 'Sale' || discount > 0
                ? 'bg-red-500 text-white' 
                : product.badge === 'New'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            )}
            style={{ borderRadius: borderRadius || 'var(--theme-borders-global-radius, 8px)' }}
          >
            {product.badge || (discount > 0 ? `-${discount}%` : '')}
          </span>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className={cn(
        'absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all duration-300',
        hoveredProduct ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
      )}>
        {showWishlist && (
          <button 
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ borderRadius: '50%' }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Wishlist clicked for product:', product.id);
            }}
            title="Add to Wishlist"
          >
            <Heart className="h-3.5 w-3.5 text-gray-700" />
          </button>
        )}

        {showQuickView && (
          <button 
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ borderRadius: '50%' }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Quick view clicked for product:', product.id);
            }}
            title="Quick View"
          >
            <Eye className="h-3.5 w-3.5 text-gray-700" />
          </button>
        )}

        {showCompare && (
          <button 
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ borderRadius: '50%' }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Compare clicked for product:', product.id);
            }}
            title="Compare"
          >
            <GitCompare className="h-3.5 w-3.5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Product Image */}
      <div className={cn(
        cardLayout === 'horizontal' ? 'w-1/3 flex-shrink-0' : getImageAspectClass(), 
        'overflow-hidden bg-gray-50 relative'
      )}>
        <img
          src={
            product.images?.[0] 
              ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
              : '/placeholder-product.svg'
          }
          alt={
            product.images?.[0] && typeof product.images[0] !== 'string' 
              ? product.images[0].alt || product.name || product.title
              : product.name || product.title
          }
          className={cn(
            'w-full h-full object-cover transition-all duration-700 ease-out',
            hoveredProduct ? 'scale-110' : 'scale-100',
            showHoverImage && product.images?.[1] && hoveredProduct ? 'opacity-0' : 'opacity-100',
            cardLayout === 'horizontal' && 'aspect-square'
          )}
          style={{ borderRadius: borderRadius || 'var(--theme-borders-image-radius, 8px)' }}
        />
        
        {/* Secondary Image on Hover */}
        {showHoverImage && product.images?.[1] && (
          <img
            src={typeof product.images[1] === 'string' ? product.images[1] : product.images[1].url}
            alt={
              typeof product.images[1] !== 'string' 
                ? product.images[1].alt || product.name || product.title
                : product.name || product.title
            }
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out',
              hoveredProduct ? 'opacity-100 scale-110' : 'opacity-0 scale-100',
              cardLayout === 'horizontal' && 'aspect-square'
            )}
            style={{ borderRadius: borderRadius || 'var(--theme-borders-image-radius, 8px)' }}
          />
        )}
      </div>

      {/* Product Info */}
      <div className={cn(
        getPaddingClasses(), 
        getTextAlignmentClasses(), 
        'flex-1',
        cardLayout === 'overlay' && 'absolute bottom-0 left-0 right-0 text-white z-10'
      )}>
        {cardLayout === 'overlay' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10" />
        )}
        {/* Category */}
        {showCategory && product.category && (
          <p className={cn(
            "text-xs uppercase tracking-wider mb-1",
            cardLayout === 'overlay' ? 'text-white/80' : 'text-gray-500'
          )}>
            {product.category.name || product.category}
          </p>
        )}

        {/* Vendor */}
        {showVendor && product.vendor && (
          <p className={cn(
            "text-xs mb-1",
            cardLayout === 'overlay' ? 'text-white/80' : 'text-gray-500'
          )}>
            {product.vendor}
          </p>
        )}

        {cardLayout === 'split' ? (
          /* Split Layout: Title and Price side by side */
          <div className="flex justify-between items-start mb-3">
            <h3 
              className={cn(
                "font-medium line-clamp-2 text-sm flex-1 mr-2",
                cardLayout === 'overlay' ? 'text-white' : 'text-gray-900'
              )}
              style={{ 
                fontFamily: typography.bodyFont || 'var(--theme-typography-body-font, Inter)',
                color: cardLayout === 'overlay' ? '#FFFFFF' : 'var(--theme-colors-text, #1E293B)',
                fontSize: '14px'
              }}
            >
              {product.name || product.title}
            </h3>
            {showPrice && (
              <div className="flex flex-col items-end">
                <span 
                  className={cn(
                    "text-lg font-semibold",
                    cardLayout === 'overlay' ? 'text-white' : ''
                  )}
                  style={{ 
                    fontFamily: 'var(--theme-typography-body-font, Inter)',
                    color: cardLayout === 'overlay' ? '#FFFFFF' : 'var(--theme-colors-primary, #2563EB)',
                    fontSize: '1.125rem',
                    fontWeight: '600'
                  }}
                >
                  ${productPrice.toFixed(2)}
                </span>
                {comparePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${comparePrice.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Standard Layout */
          <>
            {/* Product Name */}
            <h3 
              className={cn(
                "font-medium line-clamp-2 mb-2 text-sm",
                cardLayout === 'overlay' ? 'text-white' : 'text-gray-900'
              )}
              style={{ 
                fontFamily: typography.bodyFont || 'var(--theme-typography-body-font, Inter)',
                color: cardLayout === 'overlay' ? '#FFFFFF' : 'var(--theme-colors-text, #1E293B)',
                fontSize: '14px'
              }}
            >
              {product.name || product.title}
            </h3>

            {/* Price */}
            {showPrice && (
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className={cn(
                    "text-lg font-semibold",
                    cardLayout === 'overlay' ? 'text-white' : ''
                  )}
                  style={{ 
                    fontFamily: 'var(--theme-typography-body-font, Inter)',
                    color: cardLayout === 'overlay' ? '#FFFFFF' : 'var(--theme-colors-primary, #2563EB)',
                    fontSize: '1.125rem',
                    fontWeight: '600'
                  }}
                >
                  ${productPrice.toFixed(2)}
                </span>
                {comparePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${comparePrice.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Rating */}
        {showRating && product.rating && (
          <div className="flex items-center gap-2 mb-2">
            {renderStars(product.rating)}
            {product.reviewCount && (
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Add to Cart */}
        {showAddToCart && (
          <>
            {addToCartStyle === 'icon' ? (
              <button
                onClick={handleAddToCart}
                className="absolute bottom-4 right-4 p-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                style={{ borderRadius: '50%' }}
                title="Add to Cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            ) : addToCartStyle === 'text' ? (
              <button 
                onClick={handleAddToCart}
                className="text-sm font-medium transition-colors hover:underline"
                style={{
                  color: 'var(--theme-buttons-primary-background-color, #2563EB)',
                  fontFamily: typography.bodyFont || 'var(--theme-typography-body-font, Inter)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--theme-buttons-primary-hover-color, #1D4ED8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--theme-buttons-primary-background-color, #2563EB)';
                }}
              >
                Add to Cart
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                className="w-full py-2 px-4 transition-all"
                style={{
                  backgroundColor: 'var(--theme-buttons-primary-background-color, #2563EB)',
                  color: 'var(--theme-buttons-primary-text-color, #FFFFFF)',
                  borderRadius: borderRadius || 'var(--theme-borders-button-radius, 8px)',
                  fontWeight: 'var(--theme-buttons-button-font-weight, 600)',
                  fontFamily: typography.bodyFont || 'var(--theme-typography-body-font, Inter)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-buttons-primary-hover-color, #1D4ED8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-buttons-primary-background-color, #2563EB)';
                }}
              >
                Add to Cart
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
});