'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, Eye, ShoppingCart, GitCompare } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug?: string;
  images?: any;
  variants?: Array<{
    id: string;
    price: number;
    compareAtPrice?: number;
    stock?: number;
  }>;
  reviews?: Array<{
    rating: number;
  }>;
  // Simplified product interface for display
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
}

interface FeaturedProductsProps {
  settings: {
    title?: string;
    subtitle?: string;
    productSource?: string;
    collectionId?: string;
    productsToShow?: number;
    productsPerRow?: string;
    showQuickView?: boolean;
    showWishlist?: boolean;
    showCompare?: boolean;
    showViewAll?: boolean;
    viewAllText?: string;
    viewAllLink?: string;
    backgroundColor?: string;
    textColor?: string;
    cardBackgroundColor?: string;
    cardBorderColor?: string;
    cardStyle?: string;
    spacing?: string;
  };
  products?: Product[];
  pageData?: any;
  store?: any;
  isPreview?: boolean;
}

// Transform database product to display format
const transformProduct = (product: any): Product => {
  const lowestPriceVariant = product.variants?.reduce((min: any, variant: any) => 
    variant.price < min.price ? variant : min
  , product.variants?.[0]);

  const highestComparePrice = product.variants?.reduce((max: any, variant: any) => 
    (variant.compareAtPrice || 0) > (max.compareAtPrice || 0) ? variant : max
  , product.variants?.[0]);

  const avgRating = product.reviews?.length > 0
    ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
    : 0;

  // Handle product images (can be array, string JSON, or null)
  let productImages: string[] = [];
  
  if (product.images) {
    if (Array.isArray(product.images)) {
      // Handle both string arrays and object arrays
      productImages = product.images.map((img: any) => {
        if (typeof img === 'string') {
          return img;
        } else if (img && img.url) {
          return img.url;
        }
        return '';
      }).filter(Boolean);
    } else if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          productImages = parsed.map((img: any) => {
            if (typeof img === 'string') {
              return img;
            } else if (img && img.url) {
              return img.url;
            }
            return '';
          }).filter(Boolean);
        }
      } catch (e) {
        console.error('Error parsing product images:', e);
        productImages = [];
      }
    }
  }
  
  const firstImage = productImages[0] || '/placeholder-product.svg';

  return {
    id: product.id,
    name: product.name,
    slug: product.slug || product.id,
    price: lowestPriceVariant?.price || 0,
    originalPrice: highestComparePrice?.compareAtPrice || undefined,
    images: productImages.length > 0 ? productImages : ['/placeholder-product.svg'],
    rating: avgRating,
    reviewCount: product.reviews?.length || 0,
    badge: highestComparePrice?.compareAtPrice ? 'Sale' : undefined,
    variants: product.variants,
    reviews: product.reviews
  };
};

export function FeaturedProducts({ settings, products = [], pageData, store, isPreview }: FeaturedProductsProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(false);

  // Load bestsellers when product source is 'bestsellers'
  useEffect(() => {
    if (settings.productSource === 'bestsellers' && store?.subdomain && !isPreview) {
      const fetchBestsellers = async () => {
        setLoadingBestsellers(true);
        try {
          const response = await fetch(`/api/stores/${store.subdomain}/products/bestsellers?limit=${settings.productsToShow || 8}`);
          if (response.ok) {
            const data = await response.json();
            // Transform the products to display format
            const transformedBestsellers = data.products.map((product: any) => transformProduct(product));
            setBestsellers(transformedBestsellers);
          }
        } catch (error) {
          console.error('Error fetching bestsellers:', error);
        } finally {
          setLoadingBestsellers(false);
        }
      };
      
      fetchBestsellers();
    }
  }, [settings.productSource, settings.productsToShow, store?.subdomain, isPreview]);

  // Mock products if none provided
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 299,
      originalPrice: 399,
      images: ['/placeholder-product.svg', '/placeholder-product.svg'],
      rating: 4.5,
      reviewCount: 128,
      badge: 'Sale',
      slug: 'premium-wireless-headphones'
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      price: 199,
      images: ['/placeholder-product.svg'],
      rating: 4.7,
      reviewCount: 89,
      badge: 'New',
      slug: 'smart-fitness-watch'
    },
    // Add more mock products...
  ];

  // Select products based on source setting
  const getProductsBySource = () => {
    const allStoreProducts = store?.products || [];
    
    switch (settings.productSource) {
      case 'all':
        return allStoreProducts;
        
      case 'collection':
        if (!settings.collectionId) return [];
        // Filter products by collection/category ID
        return allStoreProducts.filter((p: any) => 
          p.categoryId === settings.collectionId
        );
        
      case 'latest':
        // Sort by creation date and get the latest ones
        return [...allStoreProducts]
          .sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, settings.productsToShow || 8);
        
      case 'bestsellers':
        // Use bestsellers from state if loaded
        return bestsellers.length > 0 ? bestsellers : (pageData?.featuredProducts || allStoreProducts.slice(0, 8));
        
      case 'sale':
        // Filter products that have compareAtPrice (on sale)
        return allStoreProducts.filter((p: any) => 
          p.variants?.some((v: any) => v.compareAtPrice && v.compareAtPrice > v.price)
        );
        
      case 'manual':
        // Use manually selected products from settings
        if (settings.selectedProducts && Array.isArray(settings.selectedProducts)) {
          // Filter store products by selected IDs
          return allStoreProducts.filter((p: any) => 
            settings.selectedProducts.includes(p.id)
          );
        }
        return products || [];
        
      case 'featured':
      default:
        return pageData?.featuredProducts || allStoreProducts.slice(0, 8);
    }
  };

  // Use products from pageData if available, otherwise use provided products or mock products
  const availableProducts = getProductsBySource();
  
  // Transform products if they come from database
  const transformedProducts = availableProducts.map((product: any) => {
    // If product already has price property, it's already transformed
    if (product.price !== undefined) return product;
    // Otherwise transform it
    return transformProduct(product);
  });
  
  const displayProducts = transformedProducts.length > 0 ? transformedProducts : (isPreview ? mockProducts : []);
  const productsToShow = settings.productsToShow || 8;
  const productsPerRow = parseInt(settings.productsPerRow || '4');

  const getGridClass = () => {
    // Tailwind breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
    switch (productsPerRow) {
      case 2: 
        return 'grid-cols-1 sm:grid-cols-2';
      case 3: 
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: 
        // Tablet'te 4 göstermek için md:grid-cols-4 kullanıyoruz
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case 5: 
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5';
      default: 
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-gray-900 fill-current' : 'text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // Get spacing classes
  const getSpacingClass = () => {
    switch (settings.spacing) {
      case 'extra-compact': return 'gap-1 lg:gap-2';
      case 'compact': return 'gap-2 lg:gap-3';
      case 'spacious': return 'gap-8 lg:gap-12';
      default: return 'gap-4 lg:gap-6';
    }
  };

  // Get image aspect ratio class
  const getImageAspectClass = () => {
    switch (settings.imageAspectRatio) {
      case 'square': return 'aspect-square'; // 1:1
      case 'landscape': return 'aspect-[4/3]'; // 4:3
      case 'tall': return 'aspect-[2/3]'; // 2:3
      case 'portrait': 
      default: return 'aspect-[3/4]'; // 3:4
    }
  };

  // Get card style classes
  const getCardClasses = () => {
    const baseClasses = 'group relative overflow-hidden transition-all duration-500';
    switch (settings.cardStyle) {
      case 'minimal':
        // Ultra minimal luxury style
        return `${baseClasses}`;
      case 'bordered':
        // Subtle border with hover effect
        return `${baseClasses} border border-gray-100 hover:border-gray-300`;
      case 'elevated':
        // Floating card effect
        return `${baseClasses} shadow-sm hover:shadow-xl transform hover:-translate-y-1`;
      default:
        // Clean modern style
        return `${baseClasses} hover:shadow-lg`;
    }
  };

  // Padding classes mapping
  const paddingClasses = {
    none: '',
    small: 'py-8',
    medium: 'py-12 md:py-16',
    large: 'py-16 md:py-20',
    xl: 'py-20 md:py-24'
  };

  const paddingTopClasses = {
    none: 'pt-0',
    small: 'pt-8',
    medium: 'pt-12 md:pt-16',
    large: 'pt-16 md:pt-20',
    xl: 'pt-20 md:pt-24'
  };

  const paddingBottomClasses = {
    none: 'pb-0',
    small: 'pb-8',
    medium: 'pb-12 md:pb-16',
    large: 'pb-16 md:pb-20',
    xl: 'pb-20 md:pb-24'
  };

  // Get padding settings with defaults
  const paddingTop = settings.paddingTop || 'medium';
  const paddingBottom = settings.paddingBottom || 'medium';

  // Build padding classes
  const paddingClass = `${paddingTopClasses[paddingTop] || paddingTopClasses.medium} ${paddingBottomClasses[paddingBottom] || paddingBottomClasses.medium}`;

  return (
    <section 
      className={paddingClass}
      style={{ 
        backgroundColor: settings.backgroundColor || '#ffffff',
        color: settings.textColor || '#1e293b'
      }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        
        {/* Section Header */}
        {(settings.title || settings.subtitle) && (
          <div className="text-center mb-12">
            {settings.title && (
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: 'var(--theme-typography-heading-font, Inter)',
                  fontWeight: 'var(--theme-typography-heading-weight, 700)',
                  color: settings.textColor || '#1e293b'
                }}
              >
                {settings.title}
              </h2>
            )}
            {settings.subtitle && (
              <p 
                className="text-lg max-w-2xl mx-auto opacity-80"
                style={{ color: settings.textColor || '#6b7280' }}
              >
                {settings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loadingBestsellers && settings.productSource === 'bestsellers' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading bestsellers...</span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loadingBestsellers && (
          <div className={`grid ${getGridClass()} ${getSpacingClass()}`}>
          {displayProducts.slice(0, productsToShow).map((product) => (
            <div
              key={product.id}
              className={getCardClasses()}
              style={{
                backgroundColor: settings.cardBackgroundColor || '#ffffff',
                borderColor: settings.cardBorderColor || '#e2e8f0'
              }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              
              {/* Product Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3 z-10">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    product.badge === 'Sale' 
                      ? 'bg-red-500 text-white' 
                      : product.badge === 'New'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all duration-300 ${
                hoveredProduct === product.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
              }`}>
                
                {(settings.showWishlist !== false) && (
                  <button 
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => console.log('Wishlist clicked for product:', product.id)}
                    title="Add to Wishlist"
                  >
                    <Heart className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                )}

                {(settings.showQuickView !== false) && (
                  <button 
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => console.log('Quick view clicked for product:', product.id)}
                    title="Quick View"
                  >
                    <Eye className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                )}

                {settings.showCompare && (
                  <button 
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => console.log('Compare clicked for product:', product.id)}
                    title="Compare"
                  >
                    <GitCompare className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                )}
              </div>

              {/* Product Image - Clickable */}
              <a 
                href={`/products/${product.slug}`} 
                className={`${getImageAspectClass()} overflow-hidden bg-gray-50 relative block`}
              >
                <img
                  src={product.images?.[0] || '/placeholder-product.svg'}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                    settings.showHoverImage && product.images?.[1] ? 'group-hover:opacity-0' : 'group-hover:scale-110'
                  }`}
                  onError={(e) => {
                    console.error('Image load error for product:', product.id, product.images);
                    (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                  }}
                />
                {/* Second Image on Hover */}
                {settings.showHoverImage && product.images?.[1] && (
                  <img
                    src={product.images[1]}
                    alt={`${product.name} - Image 2`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </a>

              {/* Product Info */}
              <div className="p-5 space-y-3">
                {/* Product Name and Price on same line */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-light tracking-wide text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors flex-1">
                    <a href={`/products/${product.slug}`}>
                      {product.name}
                    </a>
                  </h3>
                  <div className="flex flex-col items-end flex-shrink-0">
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    <span className="text-sm font-light tracking-wide text-gray-900">
                      ${product.price}
                    </span>
                  </div>
                </div>

                {/* Rating - Only show if enabled and rating > 0 */}
                {settings.showRating !== false && product.rating > 0 && (
                  <div className="flex items-center space-x-2">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-400">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}

                {/* Add to Cart - Button or Link style */}
                {settings.showAddToCart !== false && (
                  settings.addToCartStyle === 'link' ? (
                    <button className="btn btn-secondary text-sm">
                      Add to Cart
                    </button>
                  ) : (
                    <button className="btn btn-secondary w-full mt-1 text-sm">
                      ADD TO CART
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
          </div>
        )}

        {/* View All Button */}
        {settings.showViewAll !== false && (
          <div className="text-center mt-12">
            <a
              href={settings.viewAllLink || '/products'}
              className="btn btn-secondary"
            >
              {(settings.viewAllText || 'VIEW ALL PRODUCTS').toUpperCase()}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}