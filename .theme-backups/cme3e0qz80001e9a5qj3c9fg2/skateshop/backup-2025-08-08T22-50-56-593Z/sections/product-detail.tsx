'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Minus, Plus, Heart, Share2, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  inventory?: number;
  image?: string;
}

interface ProductDetailProps {
  product?: {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number;
    images?: string[];
    variants?: ProductVariant[];
    inventory?: number;
    sku?: string;
    category?: string;
    tags?: string[];
    rating?: number;
    reviewCount?: number;
  };
  settings?: {
    showSku?: boolean;
    showCategory?: boolean;
    showTags?: boolean;
    showRating?: boolean;
    showShareButtons?: boolean;
    showWishlist?: boolean;
    showShippingInfo?: boolean;
    showReturnPolicy?: boolean;
    showSizeGuide?: boolean;
    showRelatedProducts?: boolean;
    thumbnailPosition?: 'bottom' | 'left';
    zoomOnHover?: boolean;
  };
  relatedProducts?: any[];
  onAddToCart?: (quantity: number, variantId?: string) => void;
  onAddToWishlist?: () => void;
  onShare?: (platform: string) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default function ProductDetail({ 
  product = {}, 
  settings = {},
  relatedProducts = [],
  onAddToCart,
  onAddToWishlist,
  onShare
}: ProductDetailProps) {
  const {
    id = '1',
    name = 'Professional Skateboard Deck',
    description = 'High-quality maple wood skateboard deck designed for professional skaters. Features a unique graphic design and superior pop for advanced tricks.',
    price = 89.99,
    compareAtPrice = 119.99,
    images = ['/images/skateboard-1.jpg', '/images/skateboard-2.jpg', '/images/skateboard-3.jpg'],
    variants = [],
    inventory = 15,
    sku = 'SKU-001',
    category = 'Decks',
    tags = ['skateboard', 'deck', 'maple', 'professional'],
    rating = 4.5,
    reviewCount = 128
  } = product;

  const {
    showSku = true,
    showCategory = true,
    showTags = true,
    showRating = true,
    showShareButtons = true,
    showWishlist = true,
    showShippingInfo = true,
    showReturnPolicy = true,
    showSizeGuide = false,
    showRelatedProducts = true,
    thumbnailPosition = 'bottom',
    zoomOnHover = true
  } = settings;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const handleAddToCart = () => {
    onAddToCart?.(quantity, selectedVariant);
  };

  const discount = compareAtPrice && price < compareAtPrice 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${zoomOnHover ? 'group cursor-zoom-in' : ''}`}>
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={`${name} - Image ${selectedImage + 1}`}
                  fill
                  className={`object-cover ${zoomOnHover ? 'group-hover:scale-110 transition-transform duration-500' : ''}`}
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className={`${thumbnailPosition === 'left' ? 'flex flex-row' : 'grid grid-cols-4'} gap-2`}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-black' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {image && (
                      <Image
                        src={image}
                        alt={`${name} - Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {showCategory && category && (
                <p className="text-sm text-gray-600 mb-2">{category}</p>
              )}
              <h1 className="text-3xl font-bold mb-3">{name}</h1>
              
              {showRating && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {rating} ({reviewCount} reviews)
                  </span>
                </div>
              )}

              {showSku && sku && (
                <p className="text-sm text-gray-600">SKU: {sku}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">{formatPrice(price)}</span>
              {compareAtPrice && compareAtPrice > price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                  <span className="px-2 py-1 bg-red-500 text-white text-sm rounded">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <label className="font-medium">Select Option:</label>
                <div className="grid grid-cols-3 gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedVariant === variant.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {inventory !== undefined && (
                  <span className="text-sm text-gray-600">
                    {inventory > 0 ? `${inventory} in stock` : 'Out of stock'}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={inventory === 0}
                  className="flex-1 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                {showWishlist && (
                  <button
                    onClick={onAddToWishlist}
                    className="w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Share Buttons */}
            {showShareButtons && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <span className="text-sm font-medium">Share:</span>
                <button 
                  onClick={() => onShare?.('facebook')}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Info Badges */}
            <div className="space-y-3 pt-4 border-t">
              {showShippingInfo && (
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Free shipping on orders over $100</span>
                </div>
              )}
              {showReturnPolicy && (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">30-day return policy</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Details
              </button>
              {showSizeGuide && (
                <button
                  onClick={() => setActiveTab('sizing')}
                  className={`pb-4 font-medium transition-colors ${
                    activeTab === 'sizing'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Size Guide
                </button>
              )}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Reviews ({reviewCount})
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p>{description}</p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-2">
                <p><strong>Category:</strong> {category}</p>
                {showTags && tags && tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <strong>Tags:</strong>
                    <div className="flex gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sizing' && showSizeGuide && (
              <div>
                <p>Size guide content goes here...</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <p>Reviews content goes here...</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {showRelatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((product) => (
                <a key={product.id} href={`/products/${product.slug}`} className="group">
                  <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-gray-100">
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-gray-600">{formatPrice(product.price)}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export const schema = {
  name: 'Product Detail',
  type: 'product-detail',
  settings: [
    {
      type: 'checkbox',
      id: 'showSku',
      label: 'Show SKU',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showCategory',
      label: 'Show Category',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showTags',
      label: 'Show Tags',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showRating',
      label: 'Show Rating',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showShareButtons',
      label: 'Show Share Buttons',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showWishlist',
      label: 'Show Wishlist Button',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showShippingInfo',
      label: 'Show Shipping Info',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showReturnPolicy',
      label: 'Show Return Policy',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showSizeGuide',
      label: 'Show Size Guide Tab',
      default: false
    },
    {
      type: 'checkbox',
      id: 'showRelatedProducts',
      label: 'Show Related Products',
      default: true
    },
    {
      type: 'select',
      id: 'thumbnailPosition',
      label: 'Thumbnail Position',
      options: [
        { value: 'bottom', label: 'Bottom' },
        { value: 'left', label: 'Left' }
      ],
      default: 'bottom'
    },
    {
      type: 'checkbox',
      id: 'zoomOnHover',
      label: 'Enable Zoom on Hover',
      default: true
    }
  ]
};