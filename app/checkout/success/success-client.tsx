'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // In a real app, you'd fetch order details here
      // For now, we'll just show a success message
      setOrder({ id: orderId });
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've sent a confirmation email with your order details.
          </p>

          {orderId && (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono font-semibold">{orderId}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B9F7E] hover:bg-opacity-90"
            >
              Continue Shopping
            </Link>
            
            <Link
              href="/dashboard"
              className="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}