'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Package, Zap, Clock, Info, Loader2 } from 'lucide-react';

interface ShippingMethodsProps {
  settings: {
    title?: string;
    subtitle?: string;
    showEstimatedDelivery?: boolean;
    showMethodDescription?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    primaryColor?: string;
    textColor?: string;
    mutedColor?: string;
    selectedBorderColor?: string;
  };
  store?: any;
  pageData?: any;
  isPreview?: boolean;
  shippingAddress?: any;
  cartItems?: any[];
  onShippingMethodSelect?: (method: any) => void;
}

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays?: { min: number; max: number };
  icon?: 'truck' | 'package' | 'zap';
}

export function ShippingMethods({ 
  settings, 
  store, 
  pageData, 
  isPreview,
  shippingAddress,
  cartItems,
  onShippingMethodSelect 
}: ShippingMethodsProps) {
  const {
    title = 'Shipping Method',
    subtitle = 'Choose your preferred shipping option',
    showEstimatedDelivery = true,
    showMethodDescription = true,
    backgroundColor = '#ffffff',
    borderColor = '#e5e7eb',
    primaryColor = '#000000',
    textColor = '#111827',
    mutedColor = '#6b7280',
    selectedBorderColor = '#000000'
  } = settings;

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(!isPreview);
  const [error, setError] = useState('');

  // Mock shipping methods for preview
  const mockShippingMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivered in 5-7 business days',
      price: 5.99,
      estimatedDays: { min: 5, max: 7 },
      icon: 'truck'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivered in 2-3 business days',
      price: 15.99,
      estimatedDays: { min: 2, max: 3 },
      icon: 'zap'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Delivered next business day',
      price: 29.99,
      estimatedDays: { min: 1, max: 1 },
      icon: 'package'
    }
  ];

  useEffect(() => {
    if (isPreview) {
      setShippingMethods(mockShippingMethods);
      setSelectedMethod(mockShippingMethods[0].id);
      setLoading(false);
    } else {
      fetchShippingMethods();
    }
  }, [isPreview, shippingAddress, cartItems]);

  const fetchShippingMethods = async () => {
    if (!shippingAddress || !cartItems || cartItems.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate total weight and value
      const totalWeight = cartItems.reduce((sum: number, item: any) => sum + (item.weight || 0.5) * item.quantity, 0);
      const totalValue = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      const response = await fetch(`/api/stores/${store?.subdomain}/shipping/calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: {
            country: shippingAddress.country,
            state: shippingAddress.state,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode
          },
          items: cartItems,
          totalWeight,
          totalValue
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShippingMethods(data.methods || []);
        if (data.methods.length > 0) {
          setSelectedMethod(data.methods[0].id);
          if (onShippingMethodSelect) {
            onShippingMethodSelect(data.methods[0]);
          }
        }
      } else {
        throw new Error('Failed to fetch shipping methods');
      }
    } catch (err) {
      console.error('Error fetching shipping methods:', err);
      setError('Unable to calculate shipping rates. Please try again.');
      // Fallback to default methods
      setShippingMethods([
        {
          id: 'flat-rate',
          name: 'Flat Rate Shipping',
          price: 10,
          estimatedDays: { min: 3, max: 7 }
        }
      ]);
      setSelectedMethod('flat-rate');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: ShippingMethod) => {
    setSelectedMethod(method.id);
    if (onShippingMethodSelect) {
      onShippingMethodSelect(method);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store?.currency || 'USD',
    }).format(price);
  };

  const getEstimatedDeliveryDate = (days: { min: number; max: number }) => {
    const today = new Date();
    const minDate = new Date(today);
    const maxDate = new Date(today);
    
    // Add business days (skip weekends)
    let addedDays = 0;
    while (addedDays < days.min) {
      minDate.setDate(minDate.getDate() + 1);
      if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
        addedDays++;
      }
    }
    
    addedDays = 0;
    while (addedDays < days.max) {
      maxDate.setDate(maxDate.getDate() + 1);
      if (maxDate.getDay() !== 0 && maxDate.getDay() !== 6) {
        addedDays++;
      }
    }
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (days.min === days.max) {
      return minDate.toLocaleDateString('en-US', options);
    }
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case 'zap':
        return <Zap className="h-5 w-5" />;
      case 'package':
        return <Package className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <section className="p-6 rounded-lg" style={{ backgroundColor, borderColor, borderWidth: '1px', borderStyle: 'solid' }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
          <span className="ml-2" style={{ color: mutedColor }}>Calculating shipping rates...</span>
        </div>
      </section>
    );
  }

  return (
    <section style={{ backgroundColor }}>
      <div className="py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: textColor }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        {shippingMethods.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-lg border" style={{ borderColor }}>
            <Package className="h-12 w-12 mx-auto mb-4" style={{ color: mutedColor }} />
            <p style={{ color: mutedColor }}>
              No shipping methods available for your location.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                className="block cursor-pointer"
              >
                <div
                  className="p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: selectedMethod === method.id ? selectedBorderColor : borderColor,
                    backgroundColor: selectedMethod === method.id ? `${primaryColor}08` : 'transparent'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping-method"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => handleMethodSelect(method)}
                      className="mt-1"
                      style={{ accentColor: primaryColor }}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={{ color: primaryColor }}>
                            {getIcon(method.icon)}
                          </span>
                          <h3 className="font-medium" style={{ color: textColor }}>
                            {method.name}
                          </h3>
                        </div>
                        <span className="font-semibold" style={{ color: textColor }}>
                          {method.price === 0 ? 'Free' : formatPrice(method.price)}
                        </span>
                      </div>
                      
                      {showMethodDescription && method.description && (
                        <p className="mt-1 text-sm" style={{ color: mutedColor }}>
                          {method.description}
                        </p>
                      )}
                      
                      {showEstimatedDelivery && method.estimatedDays && (
                        <div className="mt-2 flex items-center gap-1 text-sm" style={{ color: mutedColor }}>
                          <Clock className="h-4 w-4" />
                          <span>
                            Estimated delivery: {getEstimatedDeliveryDate(method.estimatedDays)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {!isPreview && cartItems && cartItems.length > 0 && !shippingAddress && (
          <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Please enter your shipping address to see available shipping options.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}export default ShippingUmethods;
