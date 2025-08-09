'use client';

import React from 'react';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';

interface ProductCardProps {
  product?: {
    id?: string;
    name?: string;
    price?: number;
    compareAtPrice?: number;
    image?: string;
    rating?: number;
    badge?: string;
  };
  settings?: {
    showRating?: boolean;
    showQuickView?: boolean;
    showWishlist?: boolean;
    showComparePrice?: boolean;
  };
}

export default function ProductCard({ product = {}, settings = {} }: ProductCardProps) {
  const {
    name = 'Product Name',
    price = 99.99,
    compareAtPrice,
    rating = 4.5,
    badge
  } = product;

  const {
    showRating = true,
    showQuickView = true,
    showWishlist = true,
    showComparePrice = true
  } = settings;

  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow">
      {/* Badge */}
      {badge && (
        <span className={`absolute top-2 left-2 z-10 px-2 py-1 text-xs font-semibold rounded ${
          badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {badge}
        </span>
      )}

      {/* Discount */}
      {discount > 0 && (
        <span className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded">
          -{discount}%
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
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <ShoppingCart className="w-16 h-16" />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">${price}</span>
          {showComparePrice && compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">${compareAtPrice}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export const schema = {
  name: 'Product Card',
  type: 'product-card',
  settings: [
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
    },
    {
      type: 'checkbox',
      id: 'showComparePrice',
      label: 'Show Compare Price',
      default: true
    }
  ]
};