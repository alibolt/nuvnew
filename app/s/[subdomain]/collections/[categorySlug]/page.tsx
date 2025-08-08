import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '../../page-renderer';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface CategoryPageProps {
  params: Promise<{
    subdomain: string;
    categorySlug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

async function getCategory(storeId: string, slug: string) {
  try {
    const category = await prisma.category.findFirst({
      where: {
        storeId,
        slug,
      },
      include: {
        template: true,
        products: {
          include: {
            variants: {
              include: {
                images: true,
              },
              orderBy: {
                price: 'asc'
              }
            },
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: { 
            products: true
          }
        }
      },
    });

    if (!category) {
      return null;
    }

    // Transform products data for frontend compatibility
    return {
      ...category,
      products: category.products.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description,
        slug: product.slug,
        tags: Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags as string || '[]'),
        images: Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]'),
        productType: product.productType,
        isActive: product.isActive,
        variants: product.variants.map(variant => ({
          id: variant.id,
          title: variant.name,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          inventory: variant.stock,
          images: variant.images.map(img => ({
            id: img.id,
            url: img.url,
          })),
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getCategoryTemplate(storeId: string, categoryId?: string) {
  try {
    // Try to get category-specific template first
    if (categoryId) {
      const categoryTemplate = await prisma.category.findUnique({
        where: { id: categoryId },
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

      if (categoryTemplate?.template) {
        return categoryTemplate.template;
      }
    }

    // Fall back to default collection template
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
    console.error('Error fetching category template:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { subdomain, categorySlug } = await params;
  
  const store = await getStore(subdomain);
  if (!store) {
    return {
      title: 'Category Not Found',
    };
  }

  const category = await getCategory(store.id, categorySlug);
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const title = `${category.name} | ${store.name}`;
  const description = `Browse ${category.name} products at ${store.name}. ${category._count.products} products available.`;

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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { subdomain, categorySlug } = await params;
  
  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    notFound();
  }

  // Get category
  const category = await getCategory(store.id, categorySlug);
  if (!category) {
    notFound();
  }

  // Get category template and global sections
  const themeCode = store.themeCode || 'commerce';
  const [template, globalSections] = await Promise.all([
    getCategoryTemplate(store.id, category.id),
    getGlobalSections(subdomain, themeCode)
  ]);
  
  if (!template) {
    console.error('No category template found for store:', store.id);
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
    type: 'collection',
    collection: category,
    products: category.products,
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
      globalSections={globalSections}
      themeSettings={nestedSettings}
    />
  );
}