'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    name: string;
    value: string;
  };
}

interface CartSectionProps {
  settings?: {
    title?: string;
    emptyCartMessage?: string;
    emptyCartButtonText?: string;
    emptyCartButtonLink?: string;
    showRecommendations?: boolean;
    recommendationsTitle?: string;
    showCouponCode?: boolean;
    showShippingCalculator?: boolean;
    continueShopping?: boolean;
    continueShoppingText?: string;
    continueShoppingLink?: string;
  };
  cart?: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
  };
  recommendedProducts?: any[];
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onApplyCoupon?: (code: string) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default function CartSection({ 
  settings = {}, 
  cart,
  recommendedProducts = [],
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon
}: CartSectionProps) {
  const {
    title = 'Shopping Cart',
    emptyCartMessage = 'Your cart is empty',
    emptyCartButtonText = 'Start Shopping',
    emptyCartButtonLink = '/collections/all',
    showRecommendations = true,
    recommendationsTitle = 'You Might Also Like',
    showCouponCode = true,
    showShippingCalculator = false,
    continueShopping = true,
    continueShoppingText = 'Continue Shopping',
    continueShoppingLink = '/collections/all'
  } = settings;

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

  if (isEmpty) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{emptyCartMessage}</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link 
              href={emptyCartButtonLink}
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              {emptyCartButtonText}
            </Link>
          </div>

          {showRecommendations && recommendedProducts.length > 0 && (
            <div className="mt-16 border-t pt-16">
              <h3 className="text-xl font-bold mb-8">{recommendationsTitle}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendedProducts.slice(0, 4).map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.slug}`}
                    className="group"
                  >
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
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-gray-600">{formatPrice(product.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        {continueShopping && (
          <Link 
            href={continueShoppingLink}
            className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {continueShoppingText}
          </Link>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-6">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            {item.variant && (
                              <p className="text-sm text-gray-600">
                                {item.variant.name}: {item.variant.value}
                              </p>
                            )}
                            <button
                              onClick={() => onRemoveItem?.(item.id)}
                              className="text-sm text-red-600 hover:text-red-700 mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded border hover:bg-gray-50 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded border hover:bg-gray-50 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-right">
                        {formatPrice(item.price)}
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Code */}
            {showCouponCode && (
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-medium mb-3">Have a coupon code?</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter coupon code"]') as HTMLInputElement;
                      if (input?.value) {
                        onApplyCoupon?.(input.value);
                      }
                    }}
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between">
                  <span>Subtotal ({cart?.itemCount || 0} items)</span>
                  <span>{formatPrice(cart?.subtotal || 0)}</span>
                </div>
                {cart?.shipping !== undefined && cart.shipping > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(cart.shipping)}</span>
                  </div>
                )}
                {cart?.tax !== undefined && cart.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(cart.tax)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg pt-4 pb-6">
                <span>Total</span>
                <span>{formatPrice(cart?.total || cart?.subtotal || 0)}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full py-3 bg-black text-white text-center font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </Link>

              {showShippingCalculator && (
                <div className="mt-4 pt-4 border-t">
                  <button className="text-sm text-gray-600 hover:text-black">
                    Calculate Shipping
                  </button>
                </div>
              )}

              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  Free Shipping Over $100
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const schema = {
  name: 'Shopping Cart',
  type: 'cart',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Shopping Cart'
    },
    {
      type: 'text',
      id: 'emptyCartMessage',
      label: 'Empty Cart Message',
      default: 'Your cart is empty'
    },
    {
      type: 'text',
      id: 'emptyCartButtonText',
      label: 'Empty Cart Button Text',
      default: 'Start Shopping'
    },
    {
      type: 'text',
      id: 'emptyCartButtonLink',
      label: 'Empty Cart Button Link',
      default: '/collections/all'
    },
    {
      type: 'checkbox',
      id: 'showRecommendations',
      label: 'Show Product Recommendations',
      default: true
    },
    {
      type: 'text',
      id: 'recommendationsTitle',
      label: 'Recommendations Title',
      default: 'You Might Also Like'
    },
    {
      type: 'checkbox',
      id: 'showCouponCode',
      label: 'Show Coupon Code Field',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showShippingCalculator',
      label: 'Show Shipping Calculator',
      default: false
    },
    {
      type: 'checkbox',
      id: 'continueShopping',
      label: 'Show Continue Shopping Link',
      default: true
    },
    {
      type: 'text',
      id: 'continueShoppingText',
      label: 'Continue Shopping Text',
      default: 'Continue Shopping'
    },
    {
      type: 'text',
      id: 'continueShoppingLink',
      label: 'Continue Shopping Link',
      default: '/collections/all'
    }
  ]
};