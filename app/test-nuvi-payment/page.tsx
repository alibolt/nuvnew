'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TestNuviPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTestPayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Create a test checkout session
      const response = await fetch('/api/test-nuvi-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10.00,
          productName: 'Test Product - Nuvi Payment',
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setMessage(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Nuvi Payment</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              This is a test page for Nuvi payment integration. Click the button below to test a $10 payment.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Test Transaction Details:</h3>
            <ul className="text-sm space-y-1">
              <li>• Amount: $10.00</li>
              <li>• Nuvi Fee (5.9% + $0.50): -$1.09</li>
              <li>• Merchant Receives: $8.91</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Test card: <code className="bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
            </p>
            <p className="text-sm text-gray-600">
              Any future expiry date and any 3-digit CVC
            </p>
          </div>

          <Button 
            onClick={handleTestPayment} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating checkout session...
              </>
            ) : (
              'Test Nuvi Payment ($10.00)'
            )}
          </Button>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'
            }`}>
              {message}
            </div>
          )}
        </div>
      </Card>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">How to test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure Stripe CLI webhook listener is running</li>
          <li>Click the test payment button</li>
          <li>Complete payment with test card</li>
          <li>Check webhook logs and database for order creation</li>
        </ol>
      </div>
    </div>
  );
}