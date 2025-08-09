'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutSectionProps {
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showOrderSummary?: boolean;
}

export default function CheckoutSection({
  backgroundColor = "#000000",
  textColor = "#FFFFFF",
  primaryColor = "#DC2626",
  secondaryColor = "#1A1A1A",
  showOrderSummary = true
}: CheckoutSectionProps) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    // Shipping Info
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    country: '',
    state: '',
    zipCode: '',
    phone: '',
    // Payment Info
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // Options
    saveInfo: false,
    newsletter: false
  });

  useEffect(() => {
    // Load cart items from localStorage or API
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    };
    loadCart();
  }, []);

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    return {
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cartItems,
          totals: calculateTotal()
        })
      });

      if (response.ok) {
        localStorage.removeItem('cart');
        router.push('/order-confirmation');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <section className="min-h-screen py-12" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <div className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= i ? 'text-white' : 'text-gray-500'
                    }`}
                    style={{ 
                      backgroundColor: step >= i ? primaryColor : '#333',
                    }}
                  >
                    {i}
                  </div>
                  <span className="ml-2 text-sm" style={{ color: step >= i ? textColor : '#666' }}>
                    {i === 1 ? 'Shipping' : i === 2 ? 'Payment' : 'Review'}
                  </span>
                </div>
                {i < 3 && <div className="flex-1 h-0.5 mx-4" style={{ backgroundColor: step > i ? primaryColor : '#333' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>Shipping Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border"
                      style={{ 
                        backgroundColor: secondaryColor,
                        borderColor: '#333',
                        color: textColor
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border"
                        style={{ 
                          backgroundColor: secondaryColor,
                          borderColor: '#333',
                          color: textColor
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border"
                        style={{ 
                          backgroundColor: secondaryColor,
                          borderColor: '#333',
                          color: textColor
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border"
                      style={{ 
                        backgroundColor: secondaryColor,
                        borderColor: '#333',
                        color: textColor
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border"
                        style={{ 
                          backgroundColor: secondaryColor,
                          borderColor: '#333',
                          color: textColor
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border"
                        style={{ 
                          backgroundColor: secondaryColor,
                          borderColor: '#333',
                          color: textColor
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: primaryColor }}
                    />
                    <label className="ml-2 text-sm" style={{ color: textColor }}>
                      Save this information for next time
                    </label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>Payment Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border"
                      style={{ 
                        backgroundColor: secondaryColor,
                        borderColor: '#333',
                        color: textColor
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      required
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border"
                      style={{ 
                        backgroundColor: secondaryColor,
                        borderColor: '#333',
                        color: textColor
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        required
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border"
                        style={{ 
                          backgroundColor: secondaryColor,
                          borderColor: '#333',
                          color: textColor
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        required
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border"
                        style={{ 
                          backgroundColor: secondaryColor,
                          borderColor: '#333',
                          color: textColor
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>Review Your Order</h2>
                  
                  <div className="rounded-lg p-6" style={{ backgroundColor: secondaryColor }}>
                    <h3 className="font-semibold mb-4" style={{ color: textColor }}>Shipping Address</h3>
                    <p className="text-sm" style={{ color: `${textColor}CC` }}>
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.city}, {formData.zipCode}<br />
                      {formData.email}
                    </p>
                  </div>

                  <div className="rounded-lg p-6" style={{ backgroundColor: secondaryColor }}>
                    <h3 className="font-semibold mb-4" style={{ color: textColor }}>Payment Method</h3>
                    <p className="text-sm" style={{ color: `${textColor}CC` }}>
                      Card ending in {formData.cardNumber.slice(-4)}<br />
                      {formData.cardName}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: primaryColor }}
                    />
                    <label className="ml-2 text-sm" style={{ color: textColor }}>
                      Send me news and offers from Skateshop
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 rounded-md font-medium transition-colors"
                    style={{ 
                      backgroundColor: '#333',
                      color: textColor
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                >
                  {loading ? 'Processing...' : step === 3 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          {showOrderSummary && (
            <div>
              <div className="sticky top-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>Order Summary</h2>
                
                <div className="rounded-lg p-6" style={{ backgroundColor: secondaryColor }}>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium" style={{ color: textColor }}>{item.name}</p>
                            <p className="text-sm" style={{ color: `${textColor}99` }}>Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium" style={{ color: textColor }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2" style={{ borderColor: '#333' }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: `${textColor}CC` }}>Subtotal</span>
                      <span style={{ color: textColor }}>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: `${textColor}CC` }}>Shipping</span>
                      <span style={{ color: textColor }}>
                        {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: `${textColor}CC` }}>Tax</span>
                      <span style={{ color: textColor }}>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ borderColor: '#333' }}>
                      <span style={{ color: textColor }}>Total</span>
                      <span style={{ color: primaryColor }}>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}