import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '../../page-renderer';

interface CheckoutPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function SectionBasedCheckoutPage({ params }: CheckoutPageProps) {
  const { subdomain } = await params;

  // Get store by subdomain
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    notFound();
  }

  // Checkout page template with sections
  const pageTemplate = {
    id: 'checkout-page',
    sections: [
      {
        id: 'checkout-form-section',
        sectionType: 'checkout-form',
        settings: {
          title: 'Contact Information',
          subtitle: 'We\'ll use this information to send you order updates',
          requireEmail: true,
          requirePhone: true,
          requireCompany: false,
          requireAddress2: false,
          showNewsletterSignup: true,
          newsletterText: 'Email me with news and offers',
          backgroundColor: '#ffffff',
          formBackgroundColor: '#f9fafb',
          primaryColor: '#000000',
          textColor: '#111827',
          borderColor: '#e5e7eb',
          errorColor: '#ef4444'
        },
        enabled: true,
        position: 0,
      },
      {
        id: 'shipping-methods-section',
        sectionType: 'shipping-methods',
        settings: {
          title: 'Shipping Method',
          subtitle: 'Choose your preferred shipping option',
          showEstimatedDelivery: true,
          showMethodDescription: true,
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          primaryColor: '#000000',
          textColor: '#111827',
          mutedColor: '#6b7280',
          selectedBorderColor: '#000000'
        },
        enabled: true,
        position: 1,
      },
      {
        id: 'payment-method-section',
        sectionType: 'payment-method',
        settings: {
          title: 'Payment',
          subtitle: 'All transactions are secure and encrypted',
          showSecurityBadges: true,
          securityText: 'Your payment information is encrypted and secure',
          showTestModeWarning: true,
          testModeText: 'Test mode - Use card 4242 4242 4242 4242',
          backgroundColor: '#ffffff',
          formBackgroundColor: '#f9fafb',
          primaryColor: '#000000',
          textColor: '#111827',
          mutedColor: '#6b7280',
          errorColor: '#ef4444',
          successColor: '#10b981'
        },
        enabled: true,
        position: 2,
      },
      {
        id: 'order-summary-section',
        sectionType: 'order-summary',
        settings: {
          title: 'Order Summary',
          showProductImages: true,
          showDiscountCode: true,
          discountCodePlaceholder: 'Discount code',
          showShipping: true,
          shippingText: 'Shipping',
          showTax: true,
          taxText: 'Tax',
          emptyCartText: 'Your cart is empty',
          subtotalText: 'Subtotal',
          totalText: 'Total',
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb',
          primaryColor: '#000000',
          textColor: '#111827',
          mutedColor: '#6b7280',
          successColor: '#10b981',
          errorColor: '#ef4444'
        },
        enabled: true,
        position: 3,
      },
    ],
  };

  const pageData = {
    storeSubdomain: subdomain,
    pageType: 'checkout',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main checkout sections */}
          <div className="lg:col-span-2 space-y-8">
            <PageRenderer
              pageData={{ 
                template: {
                  sections: pageTemplate.sections.filter(s => s.sectionType !== 'order-summary')
                }, 
                type: "checkout", 
                ...pageData 
              }}
              store={store}
              themeCode='commerce'
            />
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PageRenderer
                pageData={{ 
                  template: {
                    sections: pageTemplate.sections.filter(s => s.sectionType === 'order-summary')
                  }, 
                  type: "checkout", 
                  ...pageData 
                }}
                store={store}
                themeCode='commerce'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    return {
      title: 'Checkout Not Found',
    };
  }

  return {
    title: `Checkout | ${store.name}`,
    description: `Complete your purchase at ${store.name}`,
  };
}