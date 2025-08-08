import { CheckCircle, Package, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: { subdomain: string };
  searchParams: { session_id?: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3 text-left">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Confirmation Email</p>
              <p className="text-sm text-gray-600">
                We've sent a confirmation email with your order details and tracking information.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-left">
            <Package className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Shipping Updates</p>
              <p className="text-sm text-gray-600">
                You'll receive shipping updates via email once your order is dispatched.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href={`/s/${params.subdomain}/account/orders`}>
            <Button className="w-full">
              View Order Details
            </Button>
          </Link>
          
          <Link href={`/s/${params.subdomain}`}>
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {searchParams.session_id && (
          <p className="text-xs text-gray-500 mt-6">
            Order reference: {searchParams.session_id.slice(0, 8)}...
          </p>
        )}
      </Card>
    </div>
  );
}