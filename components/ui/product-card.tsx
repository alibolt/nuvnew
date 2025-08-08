'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/price-utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    handle: string;
    images: string[];
    price: number;
    compareAtPrice?: number | null;
    vendor?: string;
    category?: {
      name: string;
      slug: string;
    };
    inStock?: boolean;
  };
  layout?: 'grid' | 'list';
  showQuickActions?: boolean;
  showVendor?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  imageAspectRatio?: 'square' | 'portrait' | 'landscape';
  imageFit?: 'cover' | 'contain';
  className?: string;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  onQuickView?: (product: any) => void;
}

// Helper function to get a valid image URL
function getProductImage(images: string[]): string {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return '/placeholder-product.svg';
  }
  
  const firstImage = images[0];
  
  // Check if the image is a valid string and not a malformed JSON
  if (!firstImage || typeof firstImage !== 'string' || firstImage === '[' || firstImage === '[]') {
    return '/placeholder-product.svg';
  }
  
  // Check if it's a valid URL or path
  if (firstImage.startsWith('/') || firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
    return firstImage;
  }
  
  return '/placeholder-product.svg';
}

const aspectRatioClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
};

export function ProductCard({
  product,
  layout = 'grid',
  showQuickActions = true,
  showVendor = false,
  showCategory = false,
  showRating = false,
  showAddToCart = true,
  showWishlist = true,
  showQuickView = true,
  imageAspectRatio = 'square',
  imageFit = 'cover',
  className,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
}: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToWishlist?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickView?.(product);
  };

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const salePercentage = isOnSale 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  if (layout === 'list') {
    return (
      <div className={cn('flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow', className)}>
        <Link href={`/products/${product.handle}`} className="flex-shrink-0">
          <div className={cn('relative overflow-hidden bg-gray-100 w-32', aspectRatioClasses[imageAspectRatio])}>
            <Image
              src={getProductImage(product.images)}
              alt={product.name}
              fill
              className={cn('object-center', imageFit === 'cover' ? 'object-cover' : 'object-contain')}
            />
            {isOnSale && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                -{salePercentage}%
              </div>
            )}
          </div>
        </Link>
        
        <div className="flex-1">
          <Link href={`/products/${product.handle}`}>
            <h3 className="font-medium hover:underline">{product.name}</h3>
          </Link>
          
          {(showVendor || showCategory) && (
            <div className="text-sm text-gray-600 mt-1">
              {showVendor && product.vendor && <span>{product.vendor}</span>}
              {showVendor && showCategory && product.vendor && product.category && <span> • </span>}
              {showCategory && product.category && <span>{product.category.name}</span>}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div className={cn('group relative', className)}>
      <Link href={`/products/${product.handle}`}>
        <div className={cn('relative overflow-hidden bg-gray-100', aspectRatioClasses[imageAspectRatio])}>
          <Image
            src={getProductImage(product.images)}
            alt={product.name}
            fill
            className={cn(
              'object-center transition-transform duration-300 group-hover:scale-105',
              imageFit === 'cover' ? 'object-cover' : 'object-contain'
            )}
          />
          
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
              -{salePercentage}%
            </div>
          )}
          
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-gray-700 font-medium">Out of Stock</span>
            </div>
          )}
          
          {/* Quick action buttons */}
          {showQuickActions && (
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {showQuickView && (
                <button 
                  onClick={handleQuickView}
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="Quick view"
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
              {showWishlist && (
                <button 
                  onClick={handleAddToWishlist}
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
      
      <div className="pt-4">
        {(showVendor || showCategory) && (
          <div className="text-sm text-gray-600 mb-1">
            {showVendor && product.vendor && <span>{product.vendor}</span>}
            {showVendor && showCategory && product.vendor && product.category && <span> • </span>}
            {showCategory && product.category && (
              <Link href={`/collections/${product.category.slug}`} className="hover:underline">
                {product.category.name}
              </Link>
            )}
          </div>
        )}
        
        <h3 className="font-medium mb-2">
          <Link href={`/products/${product.handle}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        
        {showRating && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 text-sm">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} className={i < 4 ? '' : 'opacity-30'}>{star}</span>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">(24)</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        
        {showAddToCart && (
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              'w-full py-2 px-4 rounded transition-colors',
              product.inStock
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
}