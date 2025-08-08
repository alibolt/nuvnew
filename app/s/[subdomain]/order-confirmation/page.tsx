import { Suspense } from 'react';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { StripeTestBanner } from '@/components/stripe-test-banner';

function OrderConfirmationContent() {
  return (
    <>
      <StripeTestBanner />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start mb-4">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Confirmation Email Sent
                </p>
                <p className="text-sm text-gray-600">
                  We've sent order details to your email address
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Package className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Processing Your Order
                </p>
                <p className="text-sm text-gray-600">
                  You'll receive shipping updates via email
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/account/orders"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Order Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}