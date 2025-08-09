'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  link: string;
}

interface CategoriesProps {
  settings?: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'carousel';
    columns?: number;
    showProductCount?: boolean;
    showDescription?: boolean;
    imageAspectRatio?: 'square' | 'landscape' | 'portrait';
  };
  store?: any;
}

export default function Categories({ settings = {}, store }: CategoriesProps) {
  const {
    title = 'Shop by Category',
    subtitle = 'Browse our collections',
    layout = 'grid',
    columns = 4,
    showProductCount = true,
    showDescription = true,
    imageAspectRatio = 'landscape'
  } = settings;

  // Skateshop categories
  const categories: Category[] = [
    {
      id: '1',
      name: 'Decks',
      description: 'Professional skateboard decks from top brands',
      productCount: 42,
      link: '/collections/decks'
    },
    {
      id: '2',
      name: 'Wheels',
      description: 'High-quality wheels for all terrains',
      productCount: 38,
      link: '/collections/wheels'
    },
    {
      id: '3',
      name: 'Trucks',
      description: 'Durable trucks for optimal performance',
      productCount: 24,
      link: '/collections/trucks'
    },
    {
      id: '4',
      name: 'Bearings',
      description: 'Precision bearings for smooth rides',
      productCount: 18,
      link: '/collections/bearings'
    }
  ];

  const gridColumns = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-2 lg:grid-cols-5',
    6: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const aspectRatios = {
    square: 'aspect-square',
    landscape: 'aspect-[16/9]',
    portrait: 'aspect-[3/4]'
  };

  return (
    <section className="py-16">
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

        {/* Categories Grid */}
        <div className={`grid gap-6 ${gridColumns[columns as keyof typeof gridColumns]}`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Background Pattern */}
              <div className={`${aspectRatios[imageAspectRatio]} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                
                {/* Category Icon/Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary/50">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-1 group-hover:translate-x-1 transition-transform">
                  {category.name}
                </h3>
                
                {showDescription && category.description && (
                  <p className="text-sm text-white/80 mb-2">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  {showProductCount && (
                    <span className="text-sm text-white/70">
                      {category.productCount} products
                    </span>
                  )}
                  
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export const schema = {
  name: 'Categories',
  type: 'categories',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Shop by Category'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Browse our collections'
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' }
      ],
      default: 'grid'
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
      type: 'checkbox',
      id: 'showProductCount',
      label: 'Show Product Count',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showDescription',
      label: 'Show Description',
      default: true
    },
    {
      type: 'select',
      id: 'imageAspectRatio',
      label: 'Image Aspect Ratio',
      options: [
        { value: 'square', label: 'Square' },
        { value: 'landscape', label: 'Landscape' },
        { value: 'portrait', label: 'Portrait' }
      ],
      default: 'landscape'
    }
  ]
};