import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '../page-renderer';

interface CollectionsPageProps {
  params: Promise<{
    subdomain: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getStore(subdomain: string) {
  try {
    return await prisma.store.findUnique({
      where: { subdomain },
      include: {
        templates: {
          where: { enabled: true },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

async function getCategories(storeId: string) {
  try {
    return await prisma.category.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { 
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getCollectionsTemplate(storeId: string) {
  try {
    return await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType: 'collection',
        isDefault: true,
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            blocks: {
              where: {
                enabled: true,
              },
              orderBy: {
                position: 'asc',
              },
            },
          },
        }
      }
    });
  } catch (error) {
    console.error('Error fetching collections template:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CollectionsPageProps): Promise<Metadata> {
  const { subdomain } = await params;
  
  const store = await getStore(subdomain);
  if (!store) {
    return {
      title: 'Collections Not Found',
    };
  }

  const title = `Collections | ${store.name}`;
  const description = `Browse our product collections at ${store.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CollectionsPage({ params, searchParams }: CollectionsPageProps) {
  const { subdomain } = await params;
  
  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    notFound();
  }

  // Get categories (collections)
  const categories = await getCategories(store.id);

  // Get collections template
  const template = await getCollectionsTemplate(store.id);
  if (!template) {
    // If no collections template exists, create a basic one or show error
    console.error('No collections template found for store:', store.id);
    notFound();
  }

  // Get theme settings from store template
  let themeSettings = {};
  if (store.templates?.[0]?.settings) {
    // Settings might be a JSON string or already an object
    if (typeof store.templates[0].settings === 'string') {
      try {
        themeSettings = JSON.parse(store.templates[0].settings);
      } catch (error) {
        console.error('Failed to parse theme settings:', error);
        themeSettings = {};
      }
    } else {
      themeSettings = store.templates[0].settings;
    }
  }
  
  // Convert flat settings to nested object
  const nestedSettings: any = {};
  Object.entries(themeSettings).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = nestedSettings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  });
  
  // Prepare page data
  const pageData = {
    type: 'collections',
    collections: categories,
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      description: store.description,
      logo: store.logo,
      // primaryColor removed - use theme settings colors.primary instead
      email: store.email,
      phone: store.phone,
      address: store.address,
      facebook: store.facebook,
      instagram: store.instagram,
      twitter: store.twitter,
      youtube: store.youtube,
    },
    template,
    searchParams: await searchParams,
  };

  return (
    <PageRenderer 
      pageData={pageData}
      store={pageData.store}
      themeCode={'commerce'}
      themeSettings={nestedSettings}
    />
  );
}