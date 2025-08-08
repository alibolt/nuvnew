'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockQuantity: number;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: ProductVariant[];
  rating?: number;
  reviewCount?: number;
}

interface ProductSectionProps {
  settings: {
    productId?: string;
    layout?: 'horizontal' | 'vertical';
    showRating?: boolean;
    showShipping?: boolean;
    showTrustBadges?: boolean;
    imagePosition?: 'left' | 'right';
    imageSize?: 'small' | 'medium' | 'large';
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    accentColor?: string;
  };
  store?: any;
  isPreview?: boolean;
  pageData?: any;
  context?: any;
}

export function ProductSection({ settings, store, isPreview, pageData, context }: ProductSectionProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  // Mock product for preview
  const mockProduct: Product = {
    id: 'mock-1',
    name: 'Premium Cotton T-Shirt',
    slug: 'premium-cotton-t-shirt',
    description: 'Made from 100% organic cotton, this premium t-shirt offers exceptional comfort and durability. Perfect for everyday wear.',
    price: 29.99,
    compareAtPrice: 39.99,
    images: ['/placeholder-product.jpg'],
    rating: 4.5,
    reviewCount: 124,
    variants: [
      {
        id: 'v1',
        name: 'Small',
        price: 29.99,
        compareAtPrice: 39.99,
        sku: 'TSH-SM',
        stockQuantity: 10
      },
      {
        id: 'v2',
        name: 'Medium',
        price: 29.99,
        compareAtPrice: 39.99,
        sku: 'TSH-MD',
        stockQuantity: 15
      },
      {
        id: 'v3',
        name: 'Large',
        price: 29.99,
        compareAtPrice: 39.99,
        sku: 'TSH-LG',
        stockQuantity: 8
      }
    ]
  };

  useEffect(() => {
    // First check if we have product data from pageData or context
    const productFromContext = pageData?.product || context?.product;
    
    if (productFromContext) {
      // Transform the product data to ensure images is an array
      let parsedImages = [];
      if (productFromContext.images) {
        if (Array.isArray(productFromContext.images)) {
          parsedImages = productFromContext.images;
        } else if (typeof productFromContext.images === 'string') {
          try {
            parsedImages = JSON.parse(productFromContext.images);
          } catch (e) {
            console.error('Failed to parse product images:', e);
            parsedImages = [];
          }
        }
      }
      
      const transformedProduct = {
        ...productFromContext,
        images: parsedImages
      };
      
      // Use the product data passed from the page
      setProduct(transformedProduct);
      if (transformedProduct.variants?.length > 0) {
        setSelectedVariant(transformedProduct.variants[0]);
      }
    } else if (settings.productId && store?.subdomain && !isPreview) {
      // Fallback to fetching by productId
      fetchProduct();
    } else if (isPreview && !productFromContext) {
      // Only use mock product if we don't have real product data
      setProduct(mockProduct);
      setSelectedVariant(mockProduct.variants[0]);
    }
  }, [settings.productId, store?.subdomain, isPreview, pageData?.product, context?.product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/products/${settings.productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setIsAddingToCart(true);
    try {
      const response = await fetch(`/api/stores/${store?.subdomain}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        // Redirect to cart or show success message
        router.push(`/s/${store?.subdomain}/cart`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product && !isPreview) {
    return null;
  }

  const displayProduct = product || mockProduct;
  const currentPrice = selectedVariant?.price || displayProduct.price;
  const comparePrice = selectedVariant?.compareAtPrice || displayProduct.compareAtPrice;
  const discount = comparePrice ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;

  const getImageSizeClass = () => {
    switch (settings.imageSize) {
      case 'small': return 'lg:col-span-5';
      case 'large': return 'lg:col-span-7';
      default: return 'lg:col-span-6';
    }
  };

  const getContentSizeClass = () => {
    switch (settings.imageSize) {
      case 'small': return 'lg:col-span-7';
      case 'large': return 'lg:col-span-5';
      default: return 'lg:col-span-6';
    }
  };

  const renderProduct = () => (
    <>
      {/* Product Image */}
      <div className={`${
        settings.imagePosition === 'right' && settings.layout === 'horizontal' ? 'lg:order-2' : ''
      }`}>
        <div className="relative">
          <img
            src={displayProduct.images[0]?.url || displayProduct.images[0] || '/placeholder-product.jpg'}
            alt={displayProduct.images[0]?.altText || displayProduct.name}
            className="w-full h-auto rounded-lg"
          />
          {discount > 0 && (
            <div 
              className="absolute top-4 left-4 px-3 py-1 text-white text-sm font-medium rounded"
              style={{ backgroundColor: settings.accentColor || '#ef4444' }}
            >
              -{discount}% OFF
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className={`${
        settings.imagePosition === 'right' && settings.layout === 'horizontal' ? 'lg:order-1' : ''
      } space-y-6`}>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{displayProduct.name}</h2>
          
          {settings.showRating && displayProduct.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(displayProduct.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({displayProduct.reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">${currentPrice.toFixed(2)}</span>
            {comparePrice && (
              <span className="text-xl text-gray-500 line-through">
                ${comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {displayProduct.description && (
          <p className="text-gray-600 leading-relaxed">
            {displayProduct.description}
          </p>
        )}

        {/* Variant Selection */}
        {displayProduct.variants.length > 1 && (
          <div>
            <label className="block text-sm font-medium mb-3">
              Select Option
            </label>
            <div className="flex flex-wrap gap-3">
              {displayProduct.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.stockQuantity === 0}
                  className={`px-4 py-2 border rounded-lg transition-all ${
                    selectedVariant?.id === variant.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${
                    variant.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed line-through' : ''
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !selectedVariant || selectedVariant.stockQuantity === 0}
            className="flex-1 px-6 py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: settings.buttonColor || '#000000',
              color: settings.buttonTextColor || '#ffffff'
            }}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Trust Badges */}
        {settings.showTrustBadges && (
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">Secure Payment</p>
            </div>
            <div className="text-center">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">Easy Returns</p>
            </div>
          </div>
        )}

        {/* Shipping Info */}
        {settings.showShipping && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <Truck className="inline-block h-4 w-4 mr-2" />
              Free shipping on orders over $50. Estimated delivery: 3-5 business days.
            </p>
          </div>
        )}
      </div>
    </>
  );

  if (settings.layout === 'vertical') {
    return (
      <section 
        className="py-16"
        style={{ 
          backgroundColor: settings.backgroundColor || '#ffffff',
          color: settings.textColor || '#111827'
        }}
      >
        <div 
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: '800px' }}
        >
          <div className="space-y-8">
            {renderProduct()}
          </div>
        </div>
      </section>
    );
  }

  // Horizontal layout (default)
  return (
    <section 
      className="py-16"
      style={{ 
        backgroundColor: settings.backgroundColor || '#ffffff',
        color: settings.textColor || '#111827'
      }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {renderProduct()}
        </div>
      </div>
    </section>
  );
}