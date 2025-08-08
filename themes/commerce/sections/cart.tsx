'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Minus, Plus, X, ArrowLeft, Truck, Shield, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName?: string;
  price: number;
  image?: string;
  quantity: number;
  sku?: string;
  maxQuantity?: number;
}

interface CartProps {
  settings: {
    title?: string;
    emptyCartMessage?: string;
    emptyCartButtonText?: string;
    emptyCartButtonLink?: string;
    showRecommendations?: boolean;
    recommendationsTitle?: string;
    showShippingCalculator?: boolean;
    showCouponCode?: boolean;
    showOrderNotes?: boolean;
    showTrustBadges?: boolean;
    backgroundColor?: string;
    textColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  store?: any;
  isPreview?: boolean;
}

export function Cart({ settings, store, isPreview }: CartProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [orderNotes, setOrderNotes] = useState('');

  const {
    title = 'Shopping Cart',
    emptyCartMessage = 'Your cart is empty',
    emptyCartButtonText = 'Continue Shopping',
    emptyCartButtonLink = '/collections/all',
    showRecommendations = true,
    recommendationsTitle = 'You May Also Like',
    showShippingCalculator = true,
    showCouponCode = true,
    showOrderNotes = true,
    showTrustBadges = true,
    backgroundColor = '#f9fafb',
    textColor = '#111827',
    primaryColor = '#000000',
    secondaryColor = '#6b7280'
  } = settings;

  // Mock cart items for preview
  const mockCartItems: CartItem[] = [
    {
      variantId: '1',
      productId: '1',
      name: 'Premium Cotton T-Shirt',
      variantName: 'Size: M, Color: Black',
      price: 29.99,
      quantity: 2,
      image: '/placeholder-product.jpg',
      sku: 'TSH-BLK-M',
      maxQuantity: 10
    },
    {
      variantId: '2',
      productId: '2',
      name: 'Classic Denim Jeans',
      variantName: 'Size: 32',
      price: 89.99,
      quantity: 1,
      image: '/placeholder-product.jpg',
      sku: 'JNS-32',
      maxQuantity: 5
    }
  ];

  useEffect(() => {
    if (isPreview) {
      setCartItems(mockCartItems);
      setLoading(false);
    } else {
      loadCart();
    }
  }, [isPreview]);

  const loadCart = () => {
    // Load cart from localStorage or session
    const savedCart = localStorage.getItem(`cart_${store?.subdomain}`);
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  };

  const updateQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(variantId);
      return;
    }

    const updatedCart = cartItems.map(item => 
      item.variantId === variantId 
        ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity || 99) }
        : item
    );
    
    setCartItems(updatedCart);
    if (!isPreview) {
      localStorage.setItem(`cart_${store?.subdomain}`, JSON.stringify(updatedCart));
    }
  };

  const removeItem = (variantId: string) => {
    const updatedCart = cartItems.filter(item => item.variantId !== variantId);
    setCartItems(updatedCart);
    if (!isPreview) {
      localStorage.setItem(`cart_${store?.subdomain}`, JSON.stringify(updatedCart));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (!isPreview) {
      localStorage.removeItem(`cart_${store?.subdomain}`);
    }
  };

  const applyCoupon = () => {
    if (!couponCode) return;
    
    // In a real implementation, validate coupon with API
    if (couponCode === 'SAVE10' || isPreview) {
      setAppliedCoupon({
        code: couponCode,
        type: 'percentage',
        value: 10,
        description: '10% off your order'
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = () => {
    if (isPreview) {
      alert('Checkout is disabled in preview mode');
      return;
    }
    
    // Save order notes if any
    if (orderNotes) {
      sessionStorage.setItem(`order_notes_${store?.subdomain}`, orderNotes);
    }
    
    router.push('/checkout');
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section 
        className="py-16 min-h-[60vh] flex items-center" 
        style={{ backgroundColor }}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2" style={{ color: textColor }}>
            {emptyCartMessage}
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href={emptyCartButtonLink}
            className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {emptyCartButtonText}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" style={{ backgroundColor, color: textColor }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.variantId} className="p-6 flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          {item.variantName && (
                            <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                            min="1"
                            max={item.maxQuantity}
                          />
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Notes */}
              {showOrderNotes && (
                <div className="p-6 border-t">
                  <label htmlFor="orderNotes" className="block text-sm font-medium mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Add any special instructions for your order..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Coupon Code */}
              {showCouponCode && (
                <div className="mb-6">
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {appliedCoupon.code}: {appliedCoupon.description}
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(calculateDiscount())}</span>
                  </div>
                )}

                {showShippingCalculator && (
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <Link
                href="/collections/all"
                className="block text-center mt-4 text-sm"
                style={{ color: secondaryColor }}
              >
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              {showTrustBadges && (
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="h-5 w-5" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="h-5 w-5" />
                    <span>Free Shipping on Orders Over $50</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}export default Cart;
