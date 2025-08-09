'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  settings?: {
    name?: string;
    description?: string;
    image?: string;
    link?: string;
    productCount?: number;
    showProductCount?: boolean;
    showDescription?: boolean;
  };
}

export default function CategoryCard({ settings = {} }: CategoryCardProps) {
  const {
    name = 'Category Name',
    description = 'Category description',
    link = '/category',
    productCount = 0,
    showProductCount = true,
    showDescription = true
  } = settings;

  return (
    <Link href={link} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="aspect-[16/9] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        
        {/* Category Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/50">
              {name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-bold mb-1 group-hover:translate-x-1 transition-transform">
          {name}
        </h3>
        
        {showDescription && description && (
          <p className="text-sm text-white/80 mb-2">{description}</p>
        )}
        
        <div className="flex items-center justify-between">
          {showProductCount && (
            <span className="text-sm text-white/70">
              {productCount} products
            </span>
          )}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export const schema = {
  name: 'Category Card',
  type: 'category-card',
  settings: [
    {
      type: 'text',
      id: 'name',
      label: 'Category Name',
      default: 'Category Name'
    },
    {
      type: 'text',
      id: 'description',
      label: 'Description',
      default: 'Category description'
    },
    {
      type: 'text',
      id: 'link',
      label: 'Link URL',
      default: '/category'
    },
    {
      type: 'number',
      id: 'productCount',
      label: 'Product Count',
      default: 0
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
    }
  ]
};