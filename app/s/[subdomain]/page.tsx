import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from './template-renderer';
import { getCompiledTemplate } from '@/lib/services/hybrid-template-loader';
import { getGlobalSections } from '@/lib/services/global-sections-loader';
import { syncStorePrimaryColorWithThemeSettings } from '@/lib/migrate-color-system';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { subdomain } = resolvedParams;

  // Get store with theme and sections
  const store = await prisma.store.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      subdomain: true,
      description: true,
      logo: true,
      primaryColor: true,
      themeCode: true,
      email: true,
      phone: true,
      address: true,
      products: {
        include: {
          category: true,
          variants: {
            include: {
              images: true,
            },
          },
        },
      },
      categories: {
        include: {
          _count: {
            select: { products: true }
          }
        }
      },
      templates: {
        where: { enabled: true },
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    }
  });

  if (!store) {
    notFound();
  }

  // Sync primaryColor with theme settings (optional, handles migration)
  try {
    await syncStorePrimaryColorWithThemeSettings(subdomain);
  } catch (error) {
    console.log('Color migration skipped:', error);
  }

  // Get theme settings from store template
  let themeSettings = {};
  if (store.templates[0]?.settings) {
    console.log('[SubdomainPage] Raw settings from DB:', store.templates[0].settings);
    
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
  
  console.log('[SubdomainPage] Flat theme settings:', themeSettings);
  
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
  
  console.log('[SubdomainPage] Nested theme settings:', nestedSettings);
  
  
  // Use hybrid template loader - but we'll fallback to database for now
  const themeCode = store.themeCode || 'commerce'; // Use store's theme or fallback to commerce
  const [compiledTemplate, globalSections] = await Promise.all([
    getCompiledTemplate(subdomain, themeCode, 'homepage'),
    getGlobalSections(subdomain, themeCode)
  ]);
  
  let sections = [];
  
  if (compiledTemplate) {
    // Use sections from compiled template (JSON + DB merge)
    sections = compiledTemplate.sections;
  } else {
    // Fallback to old system
    const template = await prisma.storeTemplate.findFirst({
      where: {
        storeId: store.id,
        templateType: 'homepage',
        isDefault: true,
      },
      include: {
        sections: {
          where: {
            enabled: true,
          },
          orderBy: {
            position: 'asc',
          },
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
        },
      },
    });
    sections = template?.sections || [];
  }

  // Prepare homepage data
  const pageData = {
    featuredProducts: store.products.slice(0, 4),
    newProducts: store.products.slice(0, 8),
    collections: store.categories.map(cat => ({
      id: cat.id,
      handle: cat.slug,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl || 'https://via.placeholder.com/600x800',
      productCount: cat._count.products
    }))
  };

  return (
    <>
      <TemplateRenderer
        store={store}
        sections={sections}
        isPreview={false}
        pageData={pageData}
        globalSections={globalSections}
        themeSettings={nestedSettings}
      />
    </>
  );
}