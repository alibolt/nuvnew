'use client';

import React, { useState, useEffect } from 'react';
import { Star, Eye, Heart, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug?: string;
  images?: any;
  variants?: Array<{
    id: string;
    price: number;
    compareAtPrice?: number;
  }>;
  reviews?: Array<{
    rating: number;
  }>;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
}

interface RecentlyViewedProps {
  settings: {
    title?: string;
    maxProducts?: number;
    layout?: 'grid' | 'carousel' | 'list';
    columns?: string;
    showProductName?: boolean;
    showPrice?: boolean;
    showQuickView?: boolean;
    showAddToCart?: boolean;
    backgroundColor?: string;
  };
  store?: any;
  isPreview?: boolean;
}

// Storage key for recently viewed products
const STORAGE_KEY = 'recently_viewed_products';

export function RecentlyViewed({ settings, store, isPreview }: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const maxProducts = settings.maxProducts || 4;
  const columns = settings.columns || '4';

  // Mock products for preview
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Classic T-Shirt',
      price: 29.99,
      images: ['/placeholder-product.svg'],
      slug: 'classic-t-shirt',
      rating: 4.5,
      reviewCount: 23
    },
    {
      id: '2',
      name: 'Denim Jacket',
      price: 89.99,
      originalPrice: 119.99,
      images: ['/placeholder-product.svg'],
      slug: 'denim-jacket',
      rating: 4.8,
      reviewCount: 45
    },
    {
      id: '3',
      name: 'Leather Boots',
      price: 149.99,
      images: ['/placeholder-product.svg'],
      slug: 'leather-boots',
      rating: 4.7,
      reviewCount: 67
    },
    {
      id: '4',
      name: 'Wool Sweater',
      price: 79.99,
      images: ['/placeholder-product.svg'],
      slug: 'wool-sweater',
      rating: 4.6,
      reviewCount: 34
    }
  ];

  useEffect(() => {
    if (isPreview) {
      setProducts(mockProducts.slice(0, maxProducts));
      setLoading(false);
      return;
    }

    const loadRecentlyViewed = async () => {
      try {
        // Get recently viewed product IDs from localStorage
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) {
          setLoading(false);
          return;
        }

        const viewedData = JSON.parse(storedData);
        const storeKey = store?.subdomain || 'default';
        const viewedIds = viewedData[storeKey] || [];

        if (viewedIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch product details for recently viewed IDs
        const productPromises = viewedIds.slice(0, maxProducts).map(async (productId: string) => {
          try {
            const response = await fetch(`/api/stores/${store.subdomain}/products/${productId}?public=true`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.error('Error fetching product:', productId, error);
            return null;
          }
        });

        const fetchedProducts = await Promise.all(productPromises);
        const validProducts = fetchedProducts.filter(p => p !== null);
        
        // Transform products to display format
        const transformedProducts = validProducts.map(transformProduct);
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, [store?.subdomain, maxProducts, isPreview]);

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

    let productImages: string[] = [];
    if (product.images) {
      if (Array.isArray(product.images)) {
        productImages = product.images.map((img: any) => 
          typeof img === 'string' ? img : img?.url || ''
        ).filter(Boolean);
      } else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          productImages = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          productImages = [];
        }
      }
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug || product.id,
      price: lowestPriceVariant?.price || 0,
      originalPrice: highestComparePrice?.compareAtPrice || undefined,
      images: productImages.length > 0 ? productImages : ['/placeholder-product.svg'],
      rating: avgRating,
      reviewCount: product.reviews?.length || 0,
      variants: product.variants,
      reviews: product.reviews
    };
  };

  const getGridClass = () => {
    switch (columns) {
      case '2': return 'grid-cols-2';
      case '3': return 'grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case '5': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case '6': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      default: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
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

  if (!loading && products.length === 0 && !isPreview) {
    return null; // Don't show section if no recently viewed products
  }

  return (
    <section 
      className="py-16"
      style={{ backgroundColor: settings.backgroundColor || '#f9fafb' }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {settings.title || 'Recently Viewed'}
          </h2>
        </div>

        {/* Loading State */}
        {loading && !isPreview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className={`grid ${getGridClass()} gap-6`}>
            {products.map((product) => (
              <div 
                key={product.id}
                className="group relative"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
                <a href={`/products/${product.slug}`} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg">
                    <img
                      src={product.images?.[0] || '/placeholder-product.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </a>

                {/* Quick Actions */}
                {(settings.showQuickView || settings.showAddToCart) && (
                  <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-opacity duration-300 ${
                    hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {settings.showQuickView && (
                      <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                    )}
                    <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                      <Heart className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                )}

                {/* Product Info */}
                <div className="mt-4">
                  {settings.showProductName !== false && (
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      <a href={`/products/${product.slug}`} className="hover:text-gray-600">
                        {product.name}
                      </a>
                    </h3>
                  )}

                  {product.rating > 0 && (
                    <div className="flex items-center mt-1 gap-1">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-400">({product.reviewCount})</span>
                    </div>
                  )}

                  {settings.showPrice !== false && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  )}

                  {settings.showAddToCart && (
                    <button className="mt-3 w-full btn btn-secondary btn-sm">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Client-side tracking function to add viewed products
export function trackProductView(productId: string, storeSubdomain: string) {
  if (typeof window === 'undefined') return;

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const viewedData = storedData ? JSON.parse(storedData) : {};
    
    // Initialize store array if not exists
    if (!viewedData[storeSubdomain]) {
      viewedData[storeSubdomain] = [];
    }

    // Remove if already exists to move to front
    viewedData[storeSubdomain] = viewedData[storeSubdomain].filter((id: string) => id !== productId);
    
    // Add to front of array
    viewedData[storeSubdomain].unshift(productId);
    
    // Keep only last 20 products
    viewedData[storeSubdomain] = viewedData[storeSubdomain].slice(0, 20);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedData));
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}export default RecentlyUviewed;
