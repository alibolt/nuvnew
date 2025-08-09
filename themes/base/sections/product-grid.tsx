'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  badge?: string;
}

interface ProductGridProps {
  settings?: {
    title?: string;
    subtitle?: string;
    columns?: number;
    limit?: number;
    showViewAll?: boolean;
    viewAllText?: string;
    viewAllLink?: string;
    showFilters?: boolean;
    showRating?: boolean;
    showQuickView?: boolean;
    showWishlist?: boolean;
    collection?: string;
  };
  store?: any;
  blocks?: any[];
}

export default function ProductGrid({ settings = {}, store }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    title = 'Featured Products',
    subtitle = 'Check out our latest arrivals',
    columns = 4,
    limit = 8,
    showViewAll = true,
    viewAllText = 'View All Products',
    viewAllLink = '/products',
    showRating = true,
    showQuickView = true,
    showWishlist = true,
  } = settings;

  useEffect(() => {
    // Simulate loading products
    // In real implementation, this would fetch from API
    const mockProducts: Product[] = Array.from({ length: limit }, (_, i) => ({
      id: `product-${i + 1}`,
      name: `Product ${i + 1}`,
      description: 'High-quality product with amazing features',
      price: Math.floor(Math.random() * 100) + 20,
      compareAtPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 120 : undefined,
      rating: 4 + Math.random(),
      reviews: Math.floor(Math.random() * 100) + 10,
      category: ['Electronics', 'Accessories', 'Gadgets'][Math.floor(Math.random() * 3)],
      badge: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'New' : 'Sale') : undefined,
    }));
    
    setProducts(mockProducts);
    setLoading(false);
  }, [limit]);

  const calculateDiscount = (price: number, compareAtPrice?: number) => {
    if (!compareAtPrice) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const gridColumns = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-2 lg:grid-cols-5',
    6: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className={`grid gap-6 ${gridColumns[columns as keyof typeof gridColumns]}`}>
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-6 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${gridColumns[columns as keyof typeof gridColumns]}`}>
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow">
              {/* Product Badge */}
              {product.badge && (
                <span className={`absolute top-2 left-2 z-10 px-2 py-1 text-xs font-semibold rounded ${
                  product.badge === 'Sale' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {product.badge}
                </span>
              )}

              {/* Discount Badge */}
              {product.compareAtPrice && (
                <span className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded">
                  -{calculateDiscount(product.price, product.compareAtPrice)}%
                </span>
              )}

              {/* Quick Actions */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {showWishlist && (
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                    <Heart className="w-4 h-4" />
                  </button>
                )}
                {showQuickView && (
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Product Image */}
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-16 h-16" />
                  </div>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                {product.category && (
                  <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                )}
                
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                {showRating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 0) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.compareAtPrice}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {showViewAll && (
          <div className="text-center mt-12">
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
            >
              {viewAllText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export const schema = {
  name: 'Product Grid',
  type: 'product-grid',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Featured Products'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Check out our latest arrivals'
    },
    {
      type: 'range',
      id: 'columns',
      label: 'Columns',
      min: 2,
      max: 6,
      default: 4
    },
    {
      type: 'range',
      id: 'limit',
      label: 'Number of Products',
      min: 2,
      max: 24,
      default: 8
    },
    {
      type: 'checkbox',
      id: 'showViewAll',
      label: 'Show View All Button',
      default: true
    },
    {
      type: 'text',
      id: 'viewAllText',
      label: 'View All Button Text',
      default: 'View All Products'
    },
    {
      type: 'text',
      id: 'viewAllLink',
      label: 'View All Link',
      default: '/products'
    },
    {
      type: 'checkbox',
      id: 'showRating',
      label: 'Show Rating',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showQuickView',
      label: 'Show Quick View',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showWishlist',
      label: 'Show Wishlist',
      default: true
    }
  ]
};