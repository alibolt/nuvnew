import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '../../page-renderer';
import { getCompiledTemplate } from '@/lib/services/hybrid-template-loader';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface ProductPageProps {
  params: Promise<{
    subdomain: string;
    productSlug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getProduct(storeId: string, slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        storeId,
        slug,
      },
      include: {
        category: true,
        variants: {
          include: {
            images: true,
          },
          orderBy: {
            price: 'asc'
          }
        },
        template: true,
      },
    });

    if (!product) {
      return null;
    }

    // Transform data for frontend compatibility
    return {
      id: product.id,
      name: product.name, // Keep name as name for template variables
      title: product.name, // Also provide title for backward compatibility
      description: product.description,
      slug: product.slug,
      tags: Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags as string || '[]'),
      images: Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]'),
      productType: product.productType,
      isActive: product.isActive,
      requiresShipping: product.requiresShipping,
      trackQuantity: product.trackQuantity,
      weight: product.weight,
      weightUnit: product.weightUnit,
      dimensions: product.dimensions,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      vendor: 'Store', // Default vendor
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      } : null,
      variants: product.variants.map(variant => ({
        id: variant.id,
        name: variant.name, // Keep name as name
        title: variant.name, // Also provide title for backward compatibility
        sku: variant.sku,
        barcode: variant.barcode,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        cost: variant.cost,
        inventory: variant.stock,
        weight: variant.weight,
        weightUnit: variant.weightUnit,
        trackQuantity: variant.trackQuantity,
        continueSellingWhenOutOfStock: variant.continueSellingWhenOutOfStock,
        options: typeof variant.options === 'string' ? JSON.parse(variant.options) : variant.options,
        images: variant.images.map(img => ({
          id: img.id,
          url: img.url,
        })),
      })),
      template: product.template,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getStore(subdomain: string) {
  try {
    return await prisma.store.findUnique({
      where: { subdomain },
      include: {
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
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

async function getProductTemplate(storeId: string, productId?: string) {
  try {
    // Try to get product-specific template first
    if (productId) {
      const productTemplate = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          template: {
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
          }
        }
      });

      if (productTemplate?.template) {
        return productTemplate.template;
      }
    }

    // Fall back to default product template
    return await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType: 'product',
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
    console.error('Error fetching product template:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { subdomain, productSlug } = await params;
  
  const store = await getStore(subdomain);
  if (!store) {
    return {
      title: 'Product Not Found',
    };
  }

  const product = await getProduct(store.id, productSlug);
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = product.metaTitle || `${product.title} | ${store.name}`;
  const description = product.metaDescription || product.description || `${product.title} - Available at ${store.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: (() => {
        const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]');
        return images.length > 0 ? [images[0]] : [];
      })(),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: (() => {
        const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]');
        return images.length > 0 ? [images[0]] : [];
      })(),
    },
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { subdomain, productSlug } = await params;
  
  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    notFound();
  }

  // Get product
  const product = await getProduct(store.id, productSlug);
  if (!product) {
    notFound();
  }

  // Use hybrid template loader
  const themeCode = store.themeCode || 'commerce';
  const [compiledTemplate, globalSections] = await Promise.all([
    getCompiledTemplate(subdomain, themeCode, 'product'),
    getGlobalSections(subdomain, themeCode)
  ]);
  
  let template;
  
  if (compiledTemplate) {
    // Create template structure from compiled template
    template = {
      id: 'product-hybrid',
      sections: compiledTemplate.sections,
      templateType: 'product',
    };
  } else {
    // Fallback to old system
    template = await getProductTemplate(store.id, product.id);
    if (!template) {
      console.error('No product template found for store:', store.id);
      notFound();
    }
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
    type: 'product',
    product,
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
      store={store}
      themeCode={'commerce'}
      globalSections={globalSections}
      themeSettings={nestedSettings}
    />
  );
}