'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Check, Plus, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product?: {
    id?: string;
    name?: string;
    price?: number;
    images?: Array<{ url?: string; name?: string }>;
    inventory?: number;
    category?: string;
  };
  settings?: {
    variant?: 'default' | 'switchable';
    showPreview?: boolean;
    isAddedToCart?: boolean;
  };
  onAddToCart?: () => Promise<void>;
  onSwitch?: () => Promise<void>;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default function ProductCard({ 
  product = {}, 
  settings = {},
  onAddToCart,
  onSwitch 
}: ProductCardProps) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const {
    id = '1',
    name = 'Skateboard Deck',
    price = 99.99,
    images = [],
    inventory = 10,
    category = 'Decks'
  } = product;

  const {
    variant = 'default',
    showPreview = true,
    isAddedToCart = false
  } = settings;

  const handleAddToCart = async () => {
    startUpdateTransition(async () => {
      if (onAddToCart) {
        await onAddToCart();
      }
    });
  };

  const handleSwitch = async () => {
    startUpdateTransition(async () => {
      if (onSwitch) {
        await onSwitch();
      }
    });
  };

  return (
    <div className="size-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg">
      <Link href={`/product/${id}`} className="block">
        <div className="border-b p-0">
          <div className="relative aspect-[4/3]">
            {images.length > 0 ? (
              <Image
                src={images[0]?.url || '/images/product-placeholder.webp'}
                alt={images[0]?.name || name}
                className="object-cover"
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
                fill
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
        <span className="sr-only">{name}</span>
      </Link>
      
      <Link href={`/product/${id}`} tabIndex={-1}>
        <div className="space-y-1.5 p-4">
          <h3 className="line-clamp-1 text-sm font-semibold">{name}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {formatPrice(price)}
          </p>
        </div>
      </Link>
      
      <div className="p-4 pt-1">
        {variant === 'default' ? (
          <div className="flex w-full items-center space-x-2">
            <button
              aria-label="Add to cart"
              className="h-8 w-full rounded-sm bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
              onClick={handleAddToCart}
              disabled={isUpdatePending || inventory === 0}
            >
              {isUpdatePending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {inventory === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
            {showPreview && (
              <Link
                href={`/preview/product/${id}`}
                title="Preview"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Preview</span>
              </Link>
            )}
          </div>
        ) : (
          <button
            aria-label={isAddedToCart ? 'Remove from cart' : 'Add to cart'}
            className="h-8 w-full rounded-sm bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
            onClick={handleSwitch}
            disabled={isUpdatePending}
          >
            {isUpdatePending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : isAddedToCart ? (
              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {isAddedToCart ? 'Added' : 'Add to cart'}
          </button>
        )}
      </div>
    </div>
  );
}

export const schema = {
  name: 'Product Card',
  type: 'product-card',
  settings: [
    {
      type: 'select',
      id: 'variant',
      label: 'Card Variant',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'switchable', label: 'Switchable' }
      ],
      default: 'default'
    },
    {
      type: 'checkbox',
      id: 'showPreview',
      label: 'Show Preview Button',
      default: true
    },
    {
      type: 'checkbox',
      id: 'isAddedToCart',
      label: 'Is Added to Cart',
      default: false
    }
  ]
};