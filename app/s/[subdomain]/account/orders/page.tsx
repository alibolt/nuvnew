import { notFound } from 'next/navigation';
import { getStore } from '@/lib/stores';
import { SectionRenderer } from '../../section-renderer';
import { getTemplateByType } from '@/lib/templates';

interface OrdersPageProps {
  params: {
    subdomain: string;
  };
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  try {
    const store = await getStore(params.subdomain);
    if (!store) {
      return notFound();
    }

    // Get orders template
    const template = await getTemplateByType(store.id, 'orders');
    if (!template) {
      return notFound();
    }

    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Order History</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">No orders found for store: {params.subdomain}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading orders page:', error);
    return notFound();
  }
}