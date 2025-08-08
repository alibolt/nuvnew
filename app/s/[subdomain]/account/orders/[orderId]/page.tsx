import { notFound } from 'next/navigation';
import { getStore } from '@/lib/stores';
import { SectionRenderer } from '../../../section-renderer';
import { getTemplateByType } from '@/lib/templates';

interface OrderDetailsPageProps {
  params: {
    subdomain: string;
    orderId: string;
  };
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  try {
    const store = await getStore(params.subdomain);
    if (!store) {
      return notFound();
    }

    // Get order details template
    const template = await getTemplateByType(store.id, 'order-details');
    if (!template) {
      return notFound();
    }

    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Order Details</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Order ID: {params.orderId}</p>
            <p className="text-gray-600">Store: {params.subdomain}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading order details page:', error);
    return notFound();
  }
}