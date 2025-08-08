import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EmbeddedCheckoutForm } from './embedded-checkout-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

async function getStore(subdomain: string) {
  const store = await prisma.store.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      subdomain: true,
      logo: true,
      currency: true,
      storeSettings: true,
    }
  });

  if (!store) {
    redirect('/');
  }

  return store;
}

export default async function CheckoutPage({ 
  params 
}: { 
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params;
  const store = await getStore(subdomain);

  // Check checkout settings
  const checkoutSettings = store.storeSettings?.checkoutSettings || {};
  
  // If guest checkout is disabled, redirect to login
  if (checkoutSettings.enableGuestCheckout === false && !checkoutSettings.requireAccountCreation) {
    // Check if customer is logged in
    // For now, we'll allow checkout since we don't have customer session check here
  }

  // Check if payment methods are configured
  const paymentMethods = store.storeSettings?.paymentMethods as any;
  const hasPaymentMethods = paymentMethods && (
    paymentMethods.nuvi?.enabled ||
    paymentMethods.stripe?.enabled || 
    paymentMethods.paypal?.enabled || 
    paymentMethods.manual?.enabled
  );
  
  if (!hasPaymentMethods) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Payment Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This store has not configured payment methods yet. Please contact the store owner.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Logo Section */}
      {(() => {
        const logo = store.storeSettings?.checkoutSettings?.checkoutLogo || store.logo;
        if (logo) {
          return (
            <div className="flex justify-center mb-8">
              <img 
                src={logo} 
                alt={store.name} 
                className="h-12 md:h-16 object-contain"
              />
            </div>
          );
        }
        return null;
      })()}
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">Complete your order by filling out the information below</p>
      </div>
      
      <Suspense fallback={
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      }>
        <EmbeddedCheckoutForm subdomain={subdomain} store={store} />
      </Suspense>
    </div>
  );
}