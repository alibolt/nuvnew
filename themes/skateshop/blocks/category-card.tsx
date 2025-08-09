'use client';

import React from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  category?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    productCount?: number;
  };
  settings?: {
    showDescription?: boolean;
    showProductCount?: boolean;
  };
}

export default function CategoryCard({ category = {}, settings = {} }: CategoryCardProps) {
  const {
    id = '1',
    name = 'Decks',
    slug = 'decks',
    description = 'Professional skateboard decks from top brands',
    productCount = 42
  } = category;

  const {
    showDescription = true,
    showProductCount = true
  } = settings;

  return (
    <Link href={`/collections/${slug}`}>
      <div className="h-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:bg-muted/25 hover:shadow-md">
        <div className="flex-1 p-6">
          <h3 className="text-lg font-semibold capitalize">{name}</h3>
          {showDescription && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {showProductCount && (
          <div className="px-6 pb-4 pt-2">
            <div className="flex w-fit items-center text-[0.8rem] text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5 h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
              {productCount} products
            </div>
          </div>
        )}
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