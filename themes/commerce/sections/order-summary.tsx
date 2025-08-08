'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, X, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

interface OrderSummaryProps {
  settings: {
    title?: string;
    showProductImages?: boolean;
    showDiscountCode?: boolean;
    discountCodePlaceholder?: string;
    showShipping?: boolean;
    shippingText?: string;
    showTax?: boolean;
    taxText?: string;
    emptyCartText?: string;
    subtotalText?: string;
    totalText?: string;
    backgroundColor?: string;
    borderColor?: string;
    primaryColor?: string;
    textColor?: string;
    mutedColor?: string;
    successColor?: string;
    errorColor?: string;
  };
  store?: any;
  pageData?: any;
  isPreview?: boolean;
  cartItems?: any[];
  shippingRate?: number;
  taxRate?: number;
  onDiscountApplied?: (discount: any) => void;
}

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName?: string;
  price: number;
  image?: string;
  quantity: number;
}

export function OrderSummary({ 
  settings, 
  store, 
  pageData, 
  isPreview, 
  cartItems: propCartItems,
  shippingRate = 0,
  taxRate = 0,
  onDiscountApplied 
}: OrderSummaryProps) {
  const {
    title = 'Order Summary',
    showProductImages = true,
    showDiscountCode = true,
    discountCodePlaceholder = 'Discount code',
    showShipping = true,
    shippingText = 'Shipping',
    showTax = true,
    taxText = 'Tax',
    emptyCartText = 'Your cart is empty',
    subtotalText = 'Subtotal',
    totalText = 'Total',
    backgroundColor = '#f9fafb',
    borderColor = '#e5e7eb',
    primaryColor = '#000000',
    textColor = '#111827',
    mutedColor = '#6b7280',
    successColor = '#10b981',
    errorColor = '#ef4444'
  } = settings;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(!isPreview && !propCartItems);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [showItems, setShowItems] = useState(true);

  // Mock cart items for preview
  const mockCartItems: CartItem[] = [
    {
      variantId: '1',
      productId: '1',
      name: 'Premium Cotton T-Shirt',
      variantName: 'Size: M, Color: Black',
      price: 29.99,
      quantity: 2,
      image: '/placeholder-product.jpg'
    },
    {
      variantId: '2',
      productId: '2',
      name: 'Classic Denim Jeans',
      variantName: 'Size: 32',
      price: 89.99,
      quantity: 1,
      image: '/placeholder-product.jpg'
    }
  ];

  useEffect(() => {
    if (isPreview) {
      setCartItems(mockCartItems);
      setLoading(false);
    } else if (propCartItems) {
      setCartItems(propCartItems);
      setLoading(false);
    } else {
      // Load cart from localStorage
      const savedCart = localStorage.getItem(`cart_${store?.subdomain}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error loading cart:', e);
        }
      }
      setLoading(false);
    }
  }, [isPreview, propCartItems, store?.subdomain]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();
    
    if (appliedDiscount.type === 'percentage') {
      return (subtotal * appliedDiscount.value) / 100;
    }
    return Math.min(appliedDiscount.value, subtotal);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * taxRate;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax + shippingRate;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store?.currency || 'USD',
    }).format(price);
  };

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setDiscountLoading(true);
    setDiscountError('');

    try {
      if (isPreview) {
        // Mock discount for preview
        setAppliedDiscount({
          code: discountCode,
          type: 'percentage',
          value: 10,
          description: '10% off'
        });
        if (onDiscountApplied) {
          onDiscountApplied({ code: discountCode, type: 'percentage', value: 10 });
        }
      } else {
        // TODO: Call API to validate discount code
        const response = await fetch(`/api/stores/${store?.subdomain}/discounts/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: discountCode })
        });

        if (response.ok) {
          const discount = await response.json();
          setAppliedDiscount(discount);
          if (onDiscountApplied) {
            onDiscountApplied(discount);
          }
        } else {
          setDiscountError('Invalid discount code');
        }
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code');
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
    if (onDiscountApplied) {
      onDiscountApplied(null);
    }
  };

  if (loading) {
    return (
      <section className="p-6 rounded-lg" style={{ backgroundColor, borderColor, borderWidth: '1px', borderStyle: 'solid' }}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="p-6 rounded-lg" style={{ backgroundColor, borderColor, borderWidth: '1px', borderStyle: 'solid' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
          {title}
        </h2>
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4" style={{ color: mutedColor }} />
          <p style={{ color: mutedColor }}>{emptyCartText}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg" style={{ backgroundColor, borderColor, borderWidth: '1px', borderStyle: 'solid' }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor }}>
        <button
          onClick={() => setShowItems(!showItems)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-xl font-semibold" style={{ color: textColor }}>
            {title} ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </h2>
          {showItems ? (
            <ChevronUp className="h-5 w-5" style={{ color: mutedColor }} />
          ) : (
            <ChevronDown className="h-5 w-5" style={{ color: mutedColor }} />
          )}
        </button>
      </div>

      {/* Cart Items */}
      {showItems && (
        <div className="px-6 py-4 border-b" style={{ borderColor }}>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.variantId} className="flex gap-4">
                {showProductImages && (
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate" style={{ color: textColor }}>
                    {item.name}
                  </h4>
                  {item.variantName && (
                    <p className="text-sm truncate" style={{ color: mutedColor }}>
                      {item.variantName}
                    </p>
                  )}
                  <p className="text-sm" style={{ color: mutedColor }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium" style={{ color: textColor }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm" style={{ color: mutedColor }}>
                      {formatPrice(item.price)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discount Code */}
      {showDiscountCode && (
        <div className="px-6 py-4 border-b" style={{ borderColor }}>
          {!appliedDiscount ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && applyDiscountCode()}
                  placeholder={discountCodePlaceholder}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor, '--tw-ring-color': primaryColor } as any}
                />
                <button
                  onClick={applyDiscountCode}
                  disabled={discountLoading || !discountCode.trim()}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: primaryColor, 
                    color: '#ffffff',
                    opacity: discountLoading || !discountCode.trim() ? 0.5 : 1
                  }}
                >
                  {discountLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
              {discountError && (
                <p className="text-sm flex items-center gap-1" style={{ color: errorColor }}>
                  <AlertCircle className="h-4 w-4" />
                  {discountError}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${successColor}20` }}>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" style={{ color: successColor }} />
                <span className="text-sm font-medium" style={{ color: successColor }}>
                  {appliedDiscount.code}: {appliedDiscount.description || `${appliedDiscount.value}${appliedDiscount.type === 'percentage' ? '%' : ''} off`}
                </span>
              </div>
              <button
                onClick={removeDiscount}
                className="p-1 hover:opacity-70"
              >
                <X className="h-4 w-4" style={{ color: successColor }} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-6 space-y-3">
        <div className="flex justify-between">
          <span style={{ color: textColor }}>{subtotalText}</span>
          <span style={{ color: textColor }}>{formatPrice(calculateSubtotal())}</span>
        </div>
        
        {appliedDiscount && (
          <div className="flex justify-between" style={{ color: successColor }}>
            <span>Discount</span>
            <span>-{formatPrice(calculateDiscount())}</span>
          </div>
        )}

        {showShipping && (
          <div className="flex justify-between">
            <span style={{ color: textColor }}>{shippingText}</span>
            <span style={{ color: textColor }}>
              {shippingRate === 0 ? 'Free' : formatPrice(shippingRate)}
            </span>
          </div>
        )}

        {showTax && taxRate > 0 && (
          <div className="flex justify-between">
            <span style={{ color: textColor }}>{taxText}</span>
            <span style={{ color: textColor }}>{formatPrice(calculateTax())}</span>
          </div>
        )}

        <div className="pt-3 border-t" style={{ borderColor }}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold" style={{ color: textColor }}>
              {totalText}
            </span>
            <span className="text-xl font-bold" style={{ color: textColor }}>
              {formatPrice(calculateTotal())}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}export default OrderUsummary;
