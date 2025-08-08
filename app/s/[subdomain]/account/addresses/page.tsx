import { notFound } from 'next/navigation';
import { getStore } from '@/lib/stores';
import { TemplateRenderer } from '../../template-renderer';
import { getTemplateByType } from '@/lib/templates';

interface AddressesPageProps {
  params: {
    subdomain: string;
  };
}

export default async function AddressesPage({ params }: AddressesPageProps) {
  try {
    const store = await getStore(params.subdomain);
    if (!store) {
      return notFound();
    }

    // Get addresses template
    const template = await getTemplateByType(store.id, 'addresses');
    if (!template) {
      return notFound();
    }

    return (
      <div className="min-h-screen">
        <TemplateRenderer 
          store={store}
          sections={(template.settings as any)?.sections || []}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading addresses page:', error);
    return notFound();
  }
}