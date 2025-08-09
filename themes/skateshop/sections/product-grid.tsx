'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '../blocks/product-card';


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
  const {
    title = 'Featured products',
    subtitle = 'Explore products from around the world',
    columns = 4,
    limit = 8,
    showViewAll = true,
    viewAllText = 'View all products',
    viewAllLink = '/products',
    showRating = true,
    showQuickView = true,
    showWishlist = true,
  } = settings;

  // Use store products if available, otherwise use demo products
  const storeProducts = store?.products || [];
  
  // Demo products for Skateshop theme
  const demoProducts = [
    {
      id: '1',
      name: 'Element Seal Skateboard Deck',
      price: 89.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Deck', name: 'Element Deck' }],
      inventory: 10,
      category: 'Decks'
    },
    {
      id: '2',
      name: 'Spitfire Classic Wheels',
      price: 49.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Wheels', name: 'Spitfire Wheels' }],
      inventory: 15,
      category: 'Wheels'
    },
    {
      id: '3',
      name: 'Independent Stage 11 Trucks',
      price: 64.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Trucks', name: 'Independent Trucks' }],
      inventory: 8,
      category: 'Trucks'
    },
    {
      id: '4',
      name: 'Bones Reds Bearings',
      price: 24.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Bearings', name: 'Bones Bearings' }],
      inventory: 20,
      category: 'Bearings'
    },
    {
      id: '5',
      name: 'Santa Cruz Screaming Hand Deck',
      price: 94.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Santa+Cruz', name: 'Santa Cruz Deck' }],
      inventory: 5,
      category: 'Decks'
    },
    {
      id: '6',
      name: 'Ricta Clouds Wheels',
      price: 44.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Ricta', name: 'Ricta Wheels' }],
      inventory: 12,
      category: 'Wheels'
    },
    {
      id: '7',
      name: 'Thunder Lights Trucks',
      price: 59.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Thunder', name: 'Thunder Trucks' }],
      inventory: 7,
      category: 'Trucks'
    },
    {
      id: '8',
      name: 'Bones Super Swiss 6 Bearings',
      price: 54.99,
      images: [{ url: 'https://via.placeholder.com/800x800/1a1a1a/ffffff?text=Swiss', name: 'Swiss Bearings' }],
      inventory: 3,
      category: 'Bearings'
    }
  ];

  // Use store products if available, otherwise use demo products
  const products = storeProducts.length > 0 
    ? storeProducts.slice(0, limit)
    : demoProducts.slice(0, limit);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-base text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        {/* Product Grid */}
        <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-${columns}`}>
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price || product.variants?.[0]?.price,
                images: product.images || product.variants?.[0]?.images,
                inventory: product.inventory || product.variants?.[0]?.inventory,
                category: product.category?.name || product.category
              }}
              settings={{
                variant: 'default',
                showPreview: showQuickView,
                isAddedToCart: false
              }}
            />
          ))}
        </div>

        {/* View All Link */}
        {showViewAll && (
          <div className="mt-12 text-center">
            <Link
              href={viewAllLink}
              className="inline-flex items-center px-6 py-3 border border-gray-900 text-base font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              {viewAllText}
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
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
      default: 'Featured products'
    },
    {
      type: 'textarea',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Explore products from around the world'
    },
    {
      type: 'number',
      id: 'columns',
      label: 'Columns',
      default: 4,
      min: 2,
      max: 6
    },
    {
      type: 'number',
      id: 'limit',
      label: 'Number of products',
      default: 8,
      min: 1,
      max: 24
    },
    {
      type: 'checkbox',
      id: 'showViewAll',
      label: 'Show "View all" link',
      default: true
    },
    {
      type: 'text',
      id: 'viewAllText',
      label: '"View all" text',
      default: 'View all products'
    },
    {
      type: 'text',
      id: 'viewAllLink',
      label: '"View all" link',
      default: '/products'
    },
    {
      type: 'checkbox',
      id: 'showRating',
      label: 'Show product rating',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showQuickView',
      label: 'Show quick view button',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showWishlist',
      label: 'Show wishlist button',
      default: true
    }
  ]
};