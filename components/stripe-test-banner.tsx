'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function StripeTestBanner() {
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Check if we're using test keys
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    setIsTestMode(publishableKey.includes('pk_test_'));
  }, []);

  if (!isTestMode) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800 font-medium">
            Test Mode: This store is using Stripe test keys. No real payments will be processed.
          </p>
        </div>
      </div>
    </div>
  );
}