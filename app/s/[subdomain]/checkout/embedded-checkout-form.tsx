'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, Package, Mail, MapPin, Check, FileText, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  subdomain: string;
  store: any;
}

// Payment form component
function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError,
  amount,
  currency 
}: { 
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  amount: number;
  currency: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + `/s/${window.location.pathname.split('/')[2]}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          layout: 'tabs',
        }}
      />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay {formatPrice(amount, currency)}</>
        )}
      </Button>
    </form>
  );
}

export function EmbeddedCheckoutForm({ subdomain, store }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [step, setStep] = useState<'details' | 'shipping' | 'payment' | 'success'>('details');
  const [orderData, setOrderData] = useState<any>(null);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<any>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  // Get checkout settings
  const checkoutSettings = store.storeSettings?.checkoutSettings || {};
  
  // Set default payment method based on what's enabled
  // If Nuvi is enabled, use it; otherwise use Stripe if available
  const defaultPaymentMethod = store.storeSettings?.paymentMethods?.nuvi?.enabled ? 'nuvi' :
                               store.storeSettings?.paymentMethods?.stripe?.enabled ? 'stripe' : 
                               store.storeSettings?.paymentMethods?.paypal?.enabled ? 'paypal' : 
                               store.storeSettings?.paymentMethods?.manual?.enabled ? 'manual' : 'stripe';
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    company: '',
    shippingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
    billingAddressSame: true,
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
    discountCode: '',
    newsletterSignup: false,
    specialInstructions: '',
    customFields: {} as Record<string, any>,
    termsAccepted: false,
  });

  // Initialize Stripe
  useEffect(() => {
    if (paymentMethod === 'nuvi') {
      // Use platform's publishable key for Nuvi payments
      const key = process.env.NEXT_PUBLIC_PLATFORM_STRIPE_PUBLISHABLE_KEY;
      if (key) {
        setStripePromise(loadStripe(key));
      } else {
        console.error('Platform Stripe publishable key not found. Please set NEXT_PUBLIC_PLATFORM_STRIPE_PUBLISHABLE_KEY in your environment variables.');
        toast({
          title: 'Configuration Error',
          description: 'Payment system is not properly configured. Please contact support.',
          variant: 'destructive',
        });
      }
    } else if (paymentMethod === 'stripe') {
      // Use store's publishable key for regular Stripe payments
      const stripeSettings = store.storeSettings?.paymentMethods?.stripe?.settings;
      const publishableKey = stripeSettings?.publishableKey || stripeSettings?.publicKey;
      
      if (publishableKey) {
        setStripePromise(loadStripe(publishableKey));
      } else {
        console.error('Store Stripe publishable key not found.');
        toast({
          title: 'Configuration Error',
          description: 'Stripe is not properly configured for this store. Please contact the store owner.',
          variant: 'destructive',
        });
      }
    }
  }, [paymentMethod, store]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = selectedShippingRate?.rate || 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  // Helper function to render custom fields
  const renderCustomFields = (section: string) => {
    const fields = checkoutSettings.customFields?.filter((f: any) => f.section === section) || [];
    if (fields.length === 0) return null;
    
    return (
      <div className="space-y-4 pt-4 border-t">
        {fields.map((field: any) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`custom_${field.id}`} className="text-sm font-medium text-gray-700 block mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.type === 'text' && (
              <Input
                id={`custom_${field.id}`}
                name={`customFields.${field.id}`}
                type="text"
                placeholder={field.placeholder}
                value={formData.customFields?.[field.id] || ''}
                onChange={(e) => handleInputChange(`customFields.${field.id}`, e.target.value)}
                required={field.required}
                disabled={step === 'payment'}
                className="mt-1"
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                id={`custom_${field.id}`}
                name={`customFields.${field.id}`}
                rows={3}
                placeholder={field.placeholder}
                value={formData.customFields?.[field.id] || ''}
                onChange={(e) => handleInputChange(`customFields.${field.id}`, e.target.value)}
                required={field.required}
                disabled={step === 'payment'}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary focus:outline-none"
              />
            )}
            {field.type === 'select' && (
              <select
                id={`custom_${field.id}`}
                name={`customFields.${field.id}`}
                value={formData.customFields?.[field.id] || ''}
                onChange={(e) => handleInputChange(`customFields.${field.id}`, e.target.value)}
                required={field.required}
                disabled={step === 'payment'}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary focus:outline-none bg-white"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            {field.type === 'checkbox' && (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="checkbox"
                  id={`custom_${field.id}`}
                  checked={formData.customFields?.[field.id] || false}
                  onChange={(e) => handleInputChange(`customFields.${field.id}`, e.target.checked)}
                  required={field.required}
                  disabled={step === 'payment'}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor={`custom_${field.id}`} className="text-sm cursor-pointer text-gray-700">
                  {field.placeholder || field.label}
                </Label>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleInputChange = (nameOrEvent: string | React.ChangeEvent<HTMLInputElement>, value?: any) => {
    if (typeof nameOrEvent === 'string') {
      // Direct field update (for custom fields)
      const name = nameOrEvent;
      if (name.includes('.')) {
        const parts = name.split('.');
        if (parts[0] === 'customFields') {
          setFormData(prev => ({
            ...prev,
            customFields: {
              ...prev.customFields,
              [parts[1]]: value
            }
          }));
        } else {
          const [parent, field] = parts;
          setFormData(prev => ({
            ...prev,
            [parent]: {
              ...(prev as any)[parent],
              [field]: value
            }
          }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // Event-based update
      const { name, value } = nameOrEvent.target;
      if (name.includes('.')) {
        const [parent, field] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [field]: value
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const validateForm = () => {
    // Check email if shown and required
    if (checkoutSettings.showEmail !== false && checkoutSettings.requireEmail === true && !formData.email) {
      toast({
        title: 'Missing Information',
        description: 'Email address is required',
        variant: 'destructive',
      });
      return false;
    }

    // Always require name
    if (!formData.name) {
      toast({
        title: 'Missing Information',
        description: 'Full name is required',
        variant: 'destructive',
      });
      return false;
    }

    // Check phone if shown and required
    if (checkoutSettings.showPhone !== false && checkoutSettings.requirePhone && !formData.phone) {
      toast({
        title: 'Missing Information',
        description: 'Phone number is required',
        variant: 'destructive',
      });
      return false;
    }

    // Check company if shown and required
    if (checkoutSettings.showCompany !== false && checkoutSettings.requireCompany && !formData.company) {
      toast({
        title: 'Missing Information',
        description: 'Company name is required',
        variant: 'destructive',
      });
      return false;
    }

    // Check shipping address
    if (!formData.shippingAddress.line1 || !formData.shippingAddress.city || 
        !formData.shippingAddress.postalCode) {
      toast({
        title: 'Missing Address',
        description: 'Please complete your shipping address',
        variant: 'destructive',
      });
      return false;
    }

    // Check address line 2 if shown and required
    if (checkoutSettings.showAddress2 !== false && checkoutSettings.requireAddress2 && !formData.shippingAddress.line2) {
      toast({
        title: 'Missing Address',
        description: 'Address line 2 is required',
        variant: 'destructive',
      });
      return false;
    }

    // Check custom fields
    if (checkoutSettings.customFields && checkoutSettings.customFields.length > 0) {
      for (const field of checkoutSettings.customFields) {
        if (field.required && !formData.customFields[field.id]) {
          toast({
            title: 'Missing Information',
            description: `${field.label} is required`,
            variant: 'destructive',
          });
          return false;
        }
      }
    }
    
    // Check terms acceptance
    if (!formData.termsAccepted) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms and conditions to continue',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const calculateShipping = async () => {
    if (!validateForm()) return;

    setLoadingShipping(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/shipping/calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            weight: 0.5, // Default weight, should come from product data
            value: item.price,
            requiresShipping: true
          })),
          destination: {
            country: formData.shippingAddress.country,
            state: formData.shippingAddress.state,
            city: formData.shippingAddress.city,
            postalCode: formData.shippingAddress.postalCode,
            address: formData.shippingAddress.line1
          },
          options: {
            currency: store.currency
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate shipping');
      }

      if (data.rates && data.rates.length > 0) {
        setShippingRates(data.rates);
        setSelectedShippingRate(data.rates[0]); // Select cheapest by default
        setStep('shipping');
      } else {
        throw new Error('No shipping available to your location');
      }
    } catch (error) {
      toast({
        title: 'Shipping Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoadingShipping(false);
    }
  };

  const createPaymentIntent = async () => {
    if (!selectedShippingRate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a shipping method',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items,
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.billingAddressSame ? formData.shippingAddress : formData.billingAddress,
          customer: {
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            company: formData.company,
          },
          paymentMethod,
          discountCode: formData.discountCode,
          specialInstructions: formData.specialInstructions,
          customFields: formData.customFields,
          shippingRate: selectedShippingRate,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setClientSecret(data.clientSecret);
      setOrderData(data);
      
      // For manual payments, skip directly to order creation
      if (paymentMethod === 'manual') {
        await handlePaymentSuccess({ id: data.paymentIntentId, status: 'requires_action' });
      } else {
        setStep('payment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    // Create order in database
    try {
      const response = await fetch(`/api/stores/${subdomain}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.billingAddressSame ? formData.shippingAddress : formData.billingAddress,
          billingAddressSame: formData.billingAddressSame,
          newsletterSignup: formData.newsletterSignup,
          specialInstructions: formData.specialInstructions,
          discountCode: formData.discountCode,
          customFields: formData.customFields,
          cartItems: items,
          paymentMethod,
          total,
          shippingRate: selectedShippingRate,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        clearCart();
        setStep('success');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push(data.redirectUrl || `/s/${subdomain}/orders/${data.order.orderNumber}/confirmation`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const paymentMethods = store.storeSettings?.paymentMethods || {};

  if (step === 'success') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-gray-600">
              Your order has been placed successfully. Redirecting to order confirmation...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {checkoutSettings.showEmail !== false && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email {checkoutSettings.requireEmail === true && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required={checkoutSettings.requireEmail === true}
                    disabled={step === 'payment'}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={step === 'payment'}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {checkoutSettings.showPhone !== false && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number {checkoutSettings.requirePhone && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required={checkoutSettings.requirePhone}
                    disabled={step === 'payment'}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                </div>
              )}
              {checkoutSettings.showCompany !== false && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                    Company {checkoutSettings.requireCompany && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required={checkoutSettings.requireCompany}
                    disabled={step === 'payment'}
                    placeholder="Company Name"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            {checkoutSettings.showNewsletterSignup && (
              <div className="pt-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="newsletterSignup"
                    checked={formData.newsletterSignup}
                    onChange={(e) => handleInputChange({
                      target: { name: 'newsletterSignup', value: e.target.checked }
                    } as any)}
                    disabled={step === 'payment'}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="newsletterSignup" className="text-sm cursor-pointer text-gray-600">
                    Email me with news and offers
                  </Label>
                </div>
              </div>
            )}
            
            {/* Custom Fields for Customer Information */}
            {renderCustomFields('customer')}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="line1" className="text-sm font-medium text-gray-700">
                Address Line 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="line1"
                name="shippingAddress.line1"
                value={formData.shippingAddress.line1}
                onChange={handleInputChange}
                required
                disabled={step === 'payment'}
                placeholder="123 Main Street"
                className="mt-1"
              />
            </div>
            {checkoutSettings.showAddress2 !== false && (
              <div className="space-y-2">
                <Label htmlFor="line2" className="text-sm font-medium text-gray-700">
                  Address Line 2 {checkoutSettings.requireAddress2 && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="line2"
                  name="shippingAddress.line2"
                  placeholder="Apartment, suite, unit, etc."
                  value={formData.shippingAddress.line2}
                  onChange={handleInputChange}
                  required={checkoutSettings.requireAddress2}
                  disabled={step === 'payment'}
                  className="mt-1"
                />
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="shippingAddress.city"
                  value={formData.shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  disabled={step === 'payment'}
                  placeholder="New York"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  State/Province <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  name="shippingAddress.state"
                  value={formData.shippingAddress.state}
                  onChange={handleInputChange}
                  required
                  disabled={step === 'payment'}
                  placeholder="NY"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  name="shippingAddress.postalCode"
                  value={formData.shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  disabled={step === 'payment'}
                  placeholder="10001"
                  className="mt-1"
                />
              </div>
            </div>
            
            {/* Custom Fields for Shipping Address */}
            {renderCustomFields('shipping')}
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {checkoutSettings.showSpecialInstructions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Special Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                rows={3}
                placeholder="Add any special delivery instructions or notes..."
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange({ target: { name: 'specialInstructions', value: e.target.value } } as any)}
                disabled={step === 'payment'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </CardContent>
          </Card>
        )}
        
        {/* Additional Information */}
        {checkoutSettings.customFields?.some((f: any) => f.section === 'additional') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCustomFields('additional')}
            </CardContent>
          </Card>
        )}

        {/* Shipping Method */}
        {step === 'shipping' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Select Shipping Method
              </CardTitle>
              <CardDescription>
                Choose your preferred shipping option
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={selectedShippingRate?.id || ''} 
                onValueChange={(value) => {
                  const rate = shippingRates.find(r => r.id === value);
                  setSelectedShippingRate(rate);
                }}
              >
                {shippingRates.map((rate) => (
                  <div key={rate.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={rate.id} id={rate.id} />
                    <Label htmlFor={rate.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{rate.name}</div>
                          {rate.description && (
                            <div className="text-sm text-gray-600">{rate.description}</div>
                          )}
                          {rate.estimatedDelivery && (
                            <div className="text-sm text-gray-500">
                              Estimated delivery: {rate.estimatedDelivery.range}
                            </div>
                          )}
                        </div>
                        <div className="font-medium">
                          {formatPrice(rate.rate, store.currency)}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={createPaymentIntent}
                  disabled={loading || !selectedShippingRate}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method */}
        {(step === 'details' || step === 'payment') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 'details' ? (
              <>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {(paymentMethods.nuvi?.enabled || paymentMethods.stripe?.enabled) && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={paymentMethods.nuvi?.enabled ? "nuvi" : "stripe"} id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-sm text-gray-600">
                            Pay with Visa, Mastercard, American Express
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}

                  {paymentMethods.manual?.enabled && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">Bank Transfer</div>
                          <div className="text-sm text-gray-600">
                            Pay via bank transfer (order ships after payment received)
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}
                </RadioGroup>
                
                {/* Terms and Conditions */}
                <div className="pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="termsAcceptance"
                      checked={formData.termsAccepted || false}
                      onChange={(e) => handleInputChange({
                        target: { name: 'termsAccepted', value: e.target.checked }
                      } as any)}
                      required={true}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                    />
                    <Label htmlFor="termsAcceptance" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a 
                        href={`/s/${subdomain}/pages/terms`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Terms and Conditions
                      </a>
                      ,{' '}
                      <a 
                        href={`/s/${subdomain}/pages/privacy`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Privacy Policy
                      </a>
                      {' '}and{' '}
                      <a 
                        href={`/s/${subdomain}/pages/returns`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Return Policy
                      </a>
                    </Label>
                  </div>
                </div>

                <Button 
                  onClick={calculateShipping}
                  disabled={loadingShipping || !formData.termsAccepted}
                  className="w-full"
                >
                  {loadingShipping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating Shipping...
                    </>
                  ) : (
                    'Continue to Shipping'
                  )}
                </Button>
              </>
            ) : (
              // Payment step
              <>
                {paymentMethod === 'manual' ? (
                  // Manual payment instructions
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Bank Transfer Instructions</h3>
                      <p className="text-sm text-blue-800">
                        {orderData?.instructions || 'Please transfer the payment to our bank account. Your order will be processed once payment is received.'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Total Amount: <strong>{formatPrice(total, store.currency)}</strong></p>
                      <p className="mt-2">Order Reference: <strong>{orderData?.paymentIntentId}</strong></p>
                    </div>
                    <Button 
                      onClick={() => handlePaymentSuccess({ id: orderData?.paymentIntentId, status: 'requires_action' })}
                      className="w-full"
                    >
                      Complete Order
                    </Button>
                  </div>
                ) : (
                  // Stripe payment
                  stripePromise && clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                        onError={(error) => {
                          toast({
                            title: 'Payment Failed',
                            description: error,
                            variant: 'destructive',
                          });
                        }}
                        amount={total}
                        currency={store.currency}
                      />
                    </Elements>
                  )
                )}
              </>
            )}
          </CardContent>
        </Card>
        )}
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <div>
                  <div>{item.title}</div>
                  {item.variantTitle !== 'Default Title' && (
                    <div className="text-gray-500">{item.variantTitle}</div>
                  )}
                  <div className="text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div>{formatPrice(item.price * item.quantity, store.currency)}</div>
              </div>
            ))}
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, store.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping{selectedShippingRate && ` (${selectedShippingRate.name})`}</span>
                <span>{shipping > 0 ? formatPrice(shipping, store.currency) : 'Calculated at next step'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPrice(tax, store.currency)}</span>
              </div>
              
              
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total, store.currency)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}