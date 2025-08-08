import { requireAuth } from '@/lib/auth';
import { CreateStoreForm } from './create-store-form';

export default async function NewStorePage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-[#2B2B2B] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>Create New Store</h1>
            <p className="mt-1 text-sm text-gray-600">
              Set up your online store and start selling today
            </p>
          </div>
          <div className="p-6">
            <CreateStoreForm />
          </div>
        </div>
      </div>
    </div>
  );
}