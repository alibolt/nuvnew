'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RefundModalProps {
  order: any;
  subdomain: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundModal({ order, subdomain, onClose, onSuccess }: RefundModalProps) {
  const [refundAmount, setRefundAmount] = useState(order.totalPrice.toString());
  const [refundReason, setRefundReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxRefundAmount = order.totalPrice - (order.totalRefunded || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const amount = parseFloat(refundAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }
    
    if (amount > maxRefundAmount) {
      setError(`Maximum refund amount is ${formatPrice(maxRefundAmount)}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/stores/${subdomain}/orders/${order.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason: refundReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Issue Refund</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="refundAmount"
                  step="0.01"
                  max={maxRefundAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Maximum refundable: {formatPrice(maxRefundAmount)}
              </p>
            </div>

            <div>
              <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Refund (Optional)
              </label>
              <textarea
                id="refundReason"
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Customer requested refund, Product defect, etc."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will process a refund through Stripe. The customer will see the refund in 5-10 business days.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Issue Refund'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}