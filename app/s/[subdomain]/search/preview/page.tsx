import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RealtimePreviewWrapper } from '../../preview/realtime-preview-wrapper';
import { getCompiledTemplate } from '@/lib/services/hybrid-template-loader';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface PreviewPageProps {
  params: Promise<{ subdomain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Sample search results for preview
const sampleSearchResults = {
  products: [
    {
      id: 'search-1',
      handle: 'vintage-tee',
      name: 'Vintage Band T-Shirt',
      description: 'Authentic vintage band tee from the 90s',
      price: 45.99,
      compareAtPrice: 59.99,
      currency: 'USD',
      images: ['https://via.placeholder.com/400x600'],
      category: { name: 'T-Shirts', slug: 't-shirts' },
    },
    {
      id: 'search-2',
      handle: 'classic-jeans',
      name: 'Classic Straight Jeans',
      description: 'Timeless denim with perfect fit',
      price: 79.99,
      compareAtPrice: null,
      currency: 'USD',
      images: ['https://via.placeholder.com/400x600'],
      category: { name: 'Jeans', slug: 'jeans' },
    },
    {
      id: 'search-3',
      handle: 'leather-wallet',
      name: 'Premium Leather Wallet',
      description: 'Handcrafted leather wallet with RFID protection',
      price: 49.99,
      compareAtPrice: 69.99,
      currency: 'USD',
      images: ['https://via.placeholder.com/400x600'],
      category: { name: 'Accessories', slug: 'accessories' },
    },
  ],
  collections: [
    {
      id: 'col-1',
      handle: 'summer-collection',
      name: 'Summer Collection',
      description: 'Fresh styles for the warm season',
      imageUrl: 'https://via.placeholder.com/600x400',
      productCount: 45,
    },
    {
      id: 'col-2',
      handle: 'new-arrivals',
      name: 'New Arrivals',
      description: 'Latest additions to our store',
      imageUrl: 'https://via.placeholder.com/600x400',
      productCount: 28,
    },
  ],
};

export default async function SearchPreviewPage({ params, searchParams }: PreviewPageProps) {
  const { subdomain } = await params;
  const query = ''; // Empty query for preview

  const store = await prisma.store.findUnique({
    where: { subdomain }
  });

  if (!store) {
    notFound();
  }

  // Use hybrid template loader
  const themeCode = store.themeCode || 'commerce';
  const compiledTemplate = await getCompiledTemplate(subdomain, themeCode, 'search');
  
  // Get global sections (header, footer, announcement bar)
  const globalSections = await getGlobalSections(subdomain, themeCode);
  
  let template;
  
  if (compiledTemplate) {
    template = {
      id: 'search-hybrid',
      sections: compiledTemplate.sections,
      templateType: 'search',
    };
  } else {
    template = await prisma.storeTemplate.findFirst({
      where: {
        storeId: store.id,
        templateType: 'search',
        isDefault: true,
      },
      include: {
        sections: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
    
    if (!template) {
      notFound();
    }
  }

  // Get theme settings from store template
  let themeSettings = {};
  const storeTemplate = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      enabled: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (storeTemplate?.settings) {
    // Settings might be a JSON string or already an object
    if (typeof storeTemplate.settings === 'string') {
      try {
        themeSettings = JSON.parse(storeTemplate.settings);
      } catch (error) {
        console.error('Failed to parse theme settings:', error);
        themeSettings = {};
      }
    } else {
      themeSettings = storeTemplate.settings;
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

  // Pass data through page props with sample search results
  const pageData = {
    type: 'search',
    query: 'sample', // Sample query for preview
    searchParams: { q: 'sample' },
    totalResults: sampleSearchResults.products.length,
    searchResults: sampleSearchResults,
    results: sampleSearchResults, // Some sections might use 'results' instead of 'searchResults'
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
  };

  // For Theme Studio preview, get template with sections from database
  const dbTemplate = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      templateType: 'search',
      isDefault: true
    },
    include: {
      sections: {
        include: {
          blocks: {
            orderBy: { position: 'asc' }
          }
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  // Use database sections if available, otherwise use template sections
  const sectionsToRender = dbTemplate?.sections?.length > 0 
    ? dbTemplate.sections.map(section => ({
        id: section.id,
        sectionType: section.sectionType,
        settings: section.settings as any || {},
        enabled: section.enabled,
        position: section.position,
        blocks: section.blocks || []
      }))
    : template.sections;
    

  return (
    <div className="min-h-screen" data-preview-page="true">
      <RealtimePreviewWrapper
        initialSections={sectionsToRender}
        globalSections={globalSections}
        store={{ ...store, themeSettings: nestedSettings }}
        themeCode={themeCode}
        isPreview={true}
        pageData={pageData}
      />
    </div>
  );
}