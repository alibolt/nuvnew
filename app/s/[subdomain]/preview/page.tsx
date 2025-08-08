import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import dynamic from 'next/dynamic';
import { SectionRenderer } from '../section-renderer';
import { RealtimePreviewWrapper } from './realtime-preview-wrapper';
import { getGlobalSections } from '@/lib/services/global-sections-loader';
import { getCompiledTemplate } from '@/lib/services/hybrid-template-loader';


export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { subdomain } = await params;
  const resolvedSearchParams = await searchParams;
  const themeParam = resolvedSearchParams.theme as string | undefined;
  
  const store = await prisma.store.findUnique({
    where: { subdomain },
    select: {
      id: true,
      themeCode: true,
      name: true,
      subdomain: true,
      description: true,
      logo: true,
      primaryColor: true,
      email: true,
      phone: true,
      address: true,
      products: {
        include: {
          category: true,
          variants: {
            include: {
              images: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
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

  // Use hybrid template loader to get sections
  // Use theme parameter or fallback to 'commerce'
  const themeCode = themeParam || 'commerce';
  // Include disabled sections/blocks for preview mode
  const compiledTemplate = await getCompiledTemplate(subdomain, themeCode, 'homepage', true);
  
  let sections = [];
  
  if (compiledTemplate) {
    sections = compiledTemplate.sections;
  } else {
    // Fallback to direct database query
    const template = await prisma.storeTemplate.findFirst({
      where: {
        storeId: store.id,
        templateType: 'homepage',
        isDefault: true,
      },
      include: {
        sections: {
          orderBy: {
            position: 'asc',
          },
          include: {
            blocks: {
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
  
  // Get global sections
  const globalSections = await getGlobalSections(subdomain, themeCode);

  // Get theme settings from store template
  let themeSettings = {};
  if (store.templates[0]?.settings) {
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

  // If sections exist, render them
  if (sections.length > 0) {
    return (
      <div className="min-h-screen" data-preview-page="true">
          <RealtimePreviewWrapper
            initialSections={sections}
            globalSections={globalSections}
            store={{...store, themeSettings}}
            themeCode={themeCode}
            isPreview={true}
            pageData={{
              type: 'homepage',
              products: store.products.map(product => ({
                id: product.id,
                handle: product.slug,
                title: product.name,
                description: product.description,
                price: product.variants[0]?.price || 0,
                compareAtPrice: product.variants[0]?.compareAtPrice,
                currency: 'USD',
                images: Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]'),
                variants: product.variants.map(variant => ({
                  id: variant.id,
                  title: variant.name,
                  price: variant.price,
                  inventoryQuantity: variant.stock,
                  compareAtPrice: variant.compareAtPrice,
                  images: variant.images.map(img => img.url),
                })),
                vendor: 'Store',
                category: product.category?.name,
                tags: Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags as string || '[]'),
              })),
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
              }
            }}
          />
        </div>
    );
  }
  
  // Fallback preview if no theme or sections
  return (
    <div className="min-h-screen bg-white" data-preview-page="true">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-8" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              )}
              <h1 className="text-xl font-semibold">{store.name}</h1>
            </div>
            <div className="text-sm text-gray-500">Preview</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Welcome to {store.name}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {store.description || "Discover our amazing products and services."}
            </p>
          </div>

          {/* Products Grid */}
          {store.products.length > 0 ? (
            <div>
              <h3 className="text-2xl font-semibold mb-6">Our Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.products.slice(0, 6).map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {product.variants[0]?.images[0] ? (
                      <img
                        src={product.variants[0].images[0].url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        ${product.variants[0]?.price || '0'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h.01M15 9h.01M21 17h.01M3 17h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-500">Add some products to see them here.</p>
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600">© 2024 {store.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}