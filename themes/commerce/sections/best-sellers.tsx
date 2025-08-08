'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
}

interface BestSellersProps {
  settings: {
    title?: string;
    subtitle?: string;
    maxProducts?: number;
    columns?: string;
    showPrice?: boolean;
    showComparePrice?: boolean;
    showRating?: boolean;
    showAddToCart?: boolean;
    showBadge?: boolean;
    showViewAllButton?: boolean;
    viewAllButtonText?: string;
    viewAllButtonLink?: string;
    imageAspectRatio?: 'square' | 'portrait' | 'landscape';
    cardStyle?: 'simple' | 'bordered' | 'elevated';
    backgroundColor?: string;
    textColor?: string;
    badgeColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  store?: any;
  isPreview?: boolean;
}

export function BestSellers({ settings, store, isPreview }: BestSellersProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {
    title = 'Best Sellers',
    subtitle = 'Our most popular products',
    maxProducts = 8,
    columns = '4',
    showPrice = true,
    showComparePrice = true,
    showRating = false,
    showAddToCart = false,
    showBadge = true,
    showViewAllButton = false,
    viewAllButtonText = 'View All Products',
    viewAllButtonLink = '/collections/all',
    imageAspectRatio = 'square',
    cardStyle = 'simple',
    backgroundColor = '#ffffff',
    textColor = '#111827',
    badgeColor = '#ef4444',
    buttonColor = '#000000',
    buttonTextColor = '#ffffff'
  } = settings;

  // Mock data for preview
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-t-shirt',
      price: 29.99,
      compareAtPrice: 39.99,
      images: ['/placeholder-product.jpg'],
      rating: 4.5,
      reviewCount: 128
    },
    {
      id: '2',
      name: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      price: 89.99,
      compareAtPrice: 119.99,
      images: ['/placeholder-product.jpg'],
      rating: 4.8,
      reviewCount: 95
    },
    {
      id: '3',
      name: 'Leather Crossbody Bag',
      slug: 'leather-crossbody-bag',
      price: 149.99,
      compareAtPrice: 199.99,
      images: ['/placeholder-product.jpg'],
      rating: 4.7,
      reviewCount: 82
    },
    {
      id: '4',
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      price: 79.99,
      images: ['/placeholder-product.jpg'],
      rating: 4.6,
      reviewCount: 156
    }
  ];

  useEffect(() => {
    if (store?.subdomain && !isPreview) {
      fetchBestSellers();
    } else {
      setProducts(mockProducts);
      setLoading(false);
    }
  }, [store?.subdomain, isPreview]);

  const fetchBestSellers = async () => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/products/bestsellers?limit=${maxProducts}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In a real implementation, this would add to cart
    console.log('Adding to cart:', product.id);
    
    // For now, redirect to product page
    router.push(`/s/${store?.subdomain}/products/${product.slug}`);
  };

  const getColumnsClass = () => {
    switch (columns) {
      case '2': return 'grid-cols-1 sm:grid-cols-2';
      case '3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case '5': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  const getAspectRatioClass = () => {
    switch (imageAspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  };

  const getCardStyleClass = () => {
    switch (cardStyle) {
      case 'bordered': return 'border border-gray-200 hover:border-gray-300';
      case 'elevated': return 'shadow-sm hover:shadow-md';
      default: return '';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {showRating && (
          <span className="ml-1 text-sm text-gray-600">({reviewCount})</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loading best sellers...</h2>
          </div>
          <div className={`grid ${getColumnsClass()} gap-8`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-16"
      style={{ backgroundColor, color: textColor }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid ${getColumnsClass()} gap-8`}>
          {products.slice(0, maxProducts).map((product, index) => {
            const discount = product.compareAtPrice 
              ? Math.round((1 - product.price / product.compareAtPrice) * 100)
              : 0;

            return (
              <a
                key={product.id}
                href={`/s/${store?.subdomain}/products/${product.slug}`}
                className={`group block rounded-lg overflow-hidden transition-all duration-300 ${getCardStyleClass()}`}
              >
                {/* Product Image */}
                <div className={`relative ${getAspectRatioClass()} bg-gray-100 overflow-hidden`}>
                  <img
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 space-y-2">
                    {showBadge && index < 3 && (
                      <div 
                        className="px-2 py-1 text-white text-xs font-medium rounded flex items-center gap-1"
                        style={{ backgroundColor: badgeColor }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        #{index + 1} Best Seller
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  {/* Quick Add to Cart */}
                  {showAddToCart && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: buttonColor }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {showRating && product.rating && (
                    <div className="mb-2">
                      {renderStars(product.rating)}
                    </div>
                  )}
                  
                  {showPrice && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">
                        ${product.price.toFixed(2)}
                      </span>
                      {showComparePrice && product.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>

        {/* View All Button */}
        {showViewAllButton && (
          <div className="text-center mt-12">
            <a
              href={viewAllButtonLink}
              className="inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor
              }}
            >
              {viewAllButtonText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default BestSellers;
