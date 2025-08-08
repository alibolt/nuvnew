'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

interface CreateOrderFormProps {
  subdomain: string;
  products: any[];
  customers: any[];
  store: any;
}

export function CreateOrderForm({ subdomain, products, customers, store }: CreateOrderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="nuvi-animate-slide-up">
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-mb-lg">
        <button 
          onClick={() => router.push(`/dashboard/stores/${subdomain}/orders`)}
          className="nuvi-btn nuvi-btn-ghost nuvi-mr-md"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Create Order</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Add products and customer details</p>
        </div>
      </div>

      <div className="nuvi-max-w-4xl nuvi-mx-auto nuvi-space-y-lg">
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">Create Order</h3>
          </div>
          <div className="nuvi-card-content">
            <p className="text-gray-600 mb-4">
              Order creation form is temporarily disabled due to syntax issues. 
              Please check back later.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={true}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Create Order (Disabled)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}