'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Lock, AlertCircle, Check, Loader2 } from 'lucide-react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentMethodProps {
  settings: {
    title?: string;
    subtitle?: string;
    showSecurityBadges?: boolean;
    securityText?: string;
    showTestModeWarning?: boolean;
    testModeText?: string;
    backgroundColor?: string;
    formBackgroundColor?: string;
    primaryColor?: string;
    textColor?: string;
    mutedColor?: string;
    errorColor?: string;
    successColor?: string;
  };
  store?: any;
  pageData?: any;
  isPreview?: boolean;
  clientSecret?: string;
  onPaymentMethodReady?: (ready: boolean) => void;
}

// Inner component that uses Stripe hooks
function PaymentForm({ 
  settings,
  store,
  isPreview,
  onPaymentMethodReady,
  onPaymentComplete
}: {
  settings: any;
  store: any;
  isPreview?: boolean;
  onPaymentMethodReady?: (ready: boolean) => void;
  onPaymentComplete?: (paymentIntent: any) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const {
    primaryColor = '#000000',
    textColor = '#111827',
    errorColor = '#ef4444',
    successColor = '#10b981'
  } = settings;

  useEffect(() => {
    if (stripe && elements) {
      if (onPaymentMethodReady) {
        onPaymentMethodReady(true);
      }
    }
  }, [stripe, elements, onPaymentMethodReady]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/s/${store?.subdomain}/checkout/success`,
      },
      redirect: 'if_required'
    });

    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      if (onPaymentComplete) {
        onPaymentComplete(paymentIntent);
      }
    }

    setProcessing(false);
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: `${successColor}20` }}>
          <Check className="h-8 w-8" style={{ color: successColor }} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
          Payment Successful!
        </h3>
        <p style={{ color: settings.mutedColor }}>
          Your order is being processed...
        </p>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement 
        id="payment-element"
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              email: sessionStorage.getItem(`checkout_email_${store?.subdomain}`) || ''
            }
          }
        }}
      />
      
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm flex items-center gap-2" style={{ color: errorColor }}>
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      <button
        id="submit-payment"
        type="submit"
        disabled={!stripe || processing || succeeded}
        className="mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          backgroundColor: primaryColor,
          color: '#ffffff',
          opacity: (!stripe || processing || succeeded) ? 0.5 : 1
        }}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : (
          'Complete Payment'
        )}
      </button>
    </form>
  );
}

export function PaymentMethod({ 
  settings, 
  store, 
  pageData, 
  isPreview,
  clientSecret,
  onPaymentMethodReady
}: PaymentMethodProps) {
  const {
    title = 'Payment',
    subtitle = 'All transactions are secure and encrypted',
    showSecurityBadges = true,
    securityText = 'Your payment information is encrypted and secure',
    showTestModeWarning = true,
    testModeText = 'Test mode - Use card 4242 4242 4242 4242',
    backgroundColor = '#ffffff',
    formBackgroundColor = '#f9fafb',
    primaryColor = '#000000',
    textColor = '#111827',
    mutedColor = '#6b7280',
    errorColor = '#ef4444',
    successColor = '#10b981'
  } = settings;

  const [stripePromise, setStripePromise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize Stripe
  useEffect(() => {
    const initStripe = async () => {
      if (isPreview) {
        // Use a test key for preview
        const stripe = await loadStripe('pk_test_placeholder');
        setStripePromise(stripe);
        setLoading(false);
      } else {
        // Get the store's Stripe public key
        const publicKey = (store?.storeSettings as any)?.payments?.stripe?.publicKey || 
                         process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        
        if (publicKey) {
          const stripe = await loadStripe(publicKey);
          setStripePromise(stripe);
        } else {
          setError('Payment configuration is missing');
        }
        setLoading(false);
      }
    };

    initStripe();
  }, [store, isPreview]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || 'pi_test_placeholder_secret',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: primaryColor,
        colorBackground: formBackgroundColor,
        colorText: textColor,
        colorDanger: errorColor,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px'
      }
    }
  };

  const isTestMode = (store?.storeSettings as any)?.payments?.stripe?.testMode || 
                     (store?.storeSettings as any)?.payments?.testMode?.enabled;

  if (loading) {
    return (
      <section className="p-6 rounded-lg" style={{ backgroundColor: formBackgroundColor }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6 rounded-lg" style={{ backgroundColor: formBackgroundColor }}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: errorColor }} />
          <p style={{ color: errorColor }}>{error}</p>
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

        {showTestModeWarning && isTestMode && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {testModeText}
            </p>
          </div>
        )}

        <div 
          className="p-6 rounded-lg"
          style={{ backgroundColor: formBackgroundColor }}
        >
          {isPreview ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="h-5 w-5" style={{ color: primaryColor }} />
                  <span className="font-medium" style={{ color: textColor }}>Card Payment</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: mutedColor }}>Card number</label>
                    <div className="p-3 border rounded" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                      <span style={{ color: mutedColor }}>4242 4242 4242 4242</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1" style={{ color: mutedColor }}>Expiry</label>
                      <div className="p-3 border rounded" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                        <span style={{ color: mutedColor }}>MM / YY</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1" style={{ color: mutedColor }}>CVC</label>
                      <div className="p-3 border rounded" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                        <span style={{ color: mutedColor }}>123</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                disabled
                className="w-full py-3 px-4 rounded-lg font-medium opacity-50 cursor-not-allowed"
                style={{ backgroundColor: primaryColor, color: '#ffffff' }}
              >
                Complete Payment (Preview)
              </button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm 
                settings={settings}
                store={store}
                isPreview={isPreview}
                onPaymentMethodReady={onPaymentMethodReady}
                onPaymentComplete={(paymentIntent) => {
                  // Handle successful payment
                  console.log('Payment successful:', paymentIntent);
                }}
              />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
              <p style={{ color: mutedColor }}>Initializing payment...</p>
            </div>
          )}

          {showSecurityBadges && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-sm" style={{ color: mutedColor }}>
                  <Lock className="h-4 w-4" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: mutedColor }}>
                  <Shield className="h-4 w-4" />
                  <span>SSL encrypted</span>
                </div>
              </div>
              {securityText && (
                <p className="text-center text-xs mt-3" style={{ color: mutedColor }}>
                  {securityText}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}