import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TestPaymentSuccessPage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card className="p-6">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          
          <p className="text-gray-600">
            Your test payment was processed successfully through Nuvi Payment.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">What happened:</h3>
            <ul className="text-sm space-y-1">
              <li>✓ Payment processed through NUVI SOFTWARE LIMITED</li>
              <li>✓ Platform fee (5.9% + $0.50) calculated</li>
              <li>✓ Webhook received and order created</li>
              <li>✓ Merchant payout scheduled</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">Check the following:</h3>
            <ul className="text-sm space-y-1">
              <li>• Webhook logs in your terminal</li>
              <li>• Database for new order record</li>
              <li>• PlatformTransaction table for commission record</li>
            </ul>
          </div>

          <div className="pt-4 space-x-4">
            <Link href="/test-nuvi-payment">
              <Button variant="outline">Test Another Payment</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}