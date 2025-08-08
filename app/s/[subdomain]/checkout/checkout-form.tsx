'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, Package, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';

interface CheckoutFormProps {
  subdomain: string;
  store: any;
}

export function CheckoutForm({ subdomain, store }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Set default payment method based on what's enabled
  const defaultPaymentMethod = store.storeSettings?.paymentMethods?.nuvi?.enabled ? 'nuvi' :
                               store.storeSettings?.paymentMethods?.stripe?.enabled ? 'stripe' : 
                               store.storeSettings?.paymentMethods?.paypal?.enabled ? 'paypal' : 
                               store.storeSettings?.paymentMethods?.manual?.enabled ? 'manual' : 'stripe';
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
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
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10; // Flat rate for now
  const tax = subtotal * 0.08; // 8% tax for demo
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const checkoutData = {
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        customer: {
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
        },
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddressSame ? formData.shippingAddress : formData.billingAddress,
        discountCode: formData.discountCode,
        paymentMethod,
      };

      const response = await fetch(`/api/stores/${subdomain}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Checkout error:', data);
        console.error('Response status:', response.status);
        console.error('Full error response:', JSON.stringify(data, null, 2));
        if (data.details) {
          console.error('Error details:', JSON.stringify(data.details, null, 2));
        }
        
        // Provide more specific error messages
        let errorMessage = data.error || 'Checkout failed';
        if (data.error === 'Some products not found') {
          errorMessage = 'Some items in your cart are no longer available. Please refresh the page and try again.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.url) {
        // Redirect to payment provider (Stripe)
        window.location.href = data.url;
      } else if (data.redirectUrl) {
        // Redirect to confirmation page (manual payment)
        window.location.href = data.redirectUrl;
      } else {
        // Handle other payment methods
        toast({
          title: 'Order created!',
          description: data.message || 'Redirecting to confirmation...',
        });
        
        // Clear cart after successful order
        clearCart();
        
        // Redirect to order confirmation if we have order details
        if (data.orderNumber) {
          setTimeout(() => {
            router.push(`/s/${subdomain}/orders/${data.orderNumber}/confirmation?payment=${data.paymentMethod}`);
          }, 2000);
        }
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
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
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="line1">Address Line 1</Label>
            <Input
              id="line1"
              required
              value={formData.shippingAddress.line1}
              onChange={(e) => handleInputChange('shippingAddress.line1', e.target.value)}
              placeholder="123 Main St"
            />
          </div>
          <div>
            <Label htmlFor="line2">Address Line 2 (optional)</Label>
            <Input
              id="line2"
              value={formData.shippingAddress.line2}
              onChange={(e) => handleInputChange('shippingAddress.line2', e.target.value)}
              placeholder="Apt 4B"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                value={formData.shippingAddress.city}
                onChange={(e) => handleInputChange('shippingAddress.city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                required
                value={formData.shippingAddress.state}
                onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)}
                placeholder="NY"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                required
                value={formData.shippingAddress.postalCode}
                onChange={(e) => handleInputChange('shippingAddress.postalCode', e.target.value)}
                placeholder="10001"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                required
                value={formData.shippingAddress.country}
                onChange={(e) => handleInputChange('shippingAddress.country', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="SE">Sweden</option>
                <option value="NO">Norway</option>
                <option value="DK">Denmark</option>
                <option value="FI">Finland</option>
                <option value="BE">Belgium</option>
                <option value="AT">Austria</option>
                <option value="CH">Switzerland</option>
                <option value="IE">Ireland</option>
                <option value="PT">Portugal</option>
                <option value="PL">Poland</option>
                <option value="CZ">Czech Republic</option>
                <option value="HU">Hungary</option>
                <option value="RO">Romania</option>
                <option value="BG">Bulgaria</option>
                <option value="GR">Greece</option>
                <option value="TR">Turkey</option>
                <option value="RU">Russia</option>
                <option value="UA">Ukraine</option>
                <option value="IN">India</option>
                <option value="CN">China</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
                <option value="TH">Thailand</option>
                <option value="ID">Indonesia</option>
                <option value="PH">Philippines</option>
                <option value="VN">Vietnam</option>
                <option value="NZ">New Zealand</option>
                <option value="ZA">South Africa</option>
                <option value="EG">Egypt</option>
                <option value="AE">United Arab Emirates</option>
                <option value="SA">Saudi Arabia</option>
                <option value="IL">Israel</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="AR">Argentina</option>
                <option value="CL">Chile</option>
                <option value="CO">Colombia</option>
                <option value="PE">Peru</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            {store.storeSettings?.paymentMethods?.nuvi?.enabled && (
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="nuvi" id="nuvi" />
                <Label htmlFor="nuvi" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-gray-500">Secure payment via Nuvi</div>
                  </div>
                </Label>
              </div>
            )}
            {store.storeSettings?.paymentMethods?.stripe?.enabled && (
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-4 h-4" />
                  Credit/Debit Card
                  <span className="text-sm text-gray-500 ml-auto">Secure payment via Stripe</span>
                </Label>
              </div>
            )}
            {store.storeSettings?.paymentMethods?.paypal?.enabled && (
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="cursor-pointer flex-1">
                  PayPal
                  <span className="text-sm text-gray-500 ml-auto">Fast & secure</span>
                </Label>
              </div>
            )}
            {store.storeSettings?.paymentMethods?.manual?.enabled && (
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="cursor-pointer flex-1">
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Pay directly to our bank account. Order will be processed after payment confirmation.
                    </div>
                  </div>
                </Label>
              </div>
            )}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Bank Transfer Details */}
      {paymentMethod === 'manual' && store.storeSettings?.paymentMethods?.manual?.settings && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Bank Transfer Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Bank Name:</span>{' '}
                {store.storeSettings.paymentMethods.manual.settings.bankName || 'Contact store for details'}
              </div>
              <div>
                <span className="font-medium">Account Name:</span>{' '}
                {store.storeSettings.paymentMethods.manual.settings.accountName || store.name}
              </div>
              <div>
                <span className="font-medium">Account Number:</span>{' '}
                {store.storeSettings.paymentMethods.manual.settings.accountNumber || 'Contact store for details'}
              </div>
              <div>
                <span className="font-medium">Routing Number:</span>{' '}
                {store.storeSettings.paymentMethods.manual.settings.routingNumber || 'N/A'}
              </div>
              <div>
                <span className="font-medium">SWIFT Code:</span>{' '}
                {store.storeSettings.paymentMethods.manual.settings.swiftCode || 'N/A'}
              </div>
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                <p className="font-medium text-yellow-800">Important:</p>
                <p className="text-yellow-700 text-xs mt-1">
                  {store.storeSettings.paymentMethods.manual.settings.instructions || 
                   'Please include your order number as the payment reference. Your order will be processed after payment confirmation.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, store.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(shipping, store.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatPrice(tax, store.currency)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total, store.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={loading || items.length === 0}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Complete Order (${formatPrice(total, store.currency)})`
        )}
      </Button>
    </form>
  );
}