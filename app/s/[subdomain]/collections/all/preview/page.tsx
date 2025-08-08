import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '../../../template-renderer';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface PreviewPageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Get real collection and products data
async function getCollectionData(storeId: string) {
  try {
    // First, try to get a real collection with products
    const collection = await prisma.category.findFirst({
      where: {
        storeId,
      },
      include: {
        products: {
          where: {
            isActive: true,
          },
          include: {
            variants: {
              include: {
                images: true,
              },
              orderBy: {
                price: 'asc'
              }
            },
            category: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 12 // Show latest 12 products
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (collection && collection.products.length > 0) {
      // Transform products for frontend compatibility
      const transformedProducts = collection.products.map(product => ({
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
      }));

      return {
        collection: {
          id: collection.id,
          handle: collection.slug,
          name: collection.name,
          description: collection.description,
          imageUrl: collection.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
          productCount: collection.products.length,
        },
        products: transformedProducts
      };
    }

    // If no collections exist, get all products directly
    const allProducts = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
      },
      include: {
        variants: {
          include: {
            images: true,
          },
          orderBy: {
            price: 'asc'
          }
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12
    });

    if (allProducts.length > 0) {
      const transformedProducts = allProducts.map(product => ({
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
      }));

      return {
        collection: {
          id: 'all-products',
          handle: 'all',
          name: 'All Products',
          description: 'Browse our complete collection of products',
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
          productCount: allProducts.length,
        },
        products: transformedProducts
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching collection data:', error);
    return null;
  }
}

// Sample collection data for preview when no real data exists
const getSampleData = () => ({
  collection: {
    id: 'sample-collection',
    handle: 'all',
    name: 'All Products',
    description: 'Browse our complete collection of products. Add your first products to see them here.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
    productCount: 3,
  },
  products: [
    {
      id: 'sample-1',
      handle: 'sample-product-1',
      title: 'Sample T-Shirt',
      description: 'Add your first product to see it displayed here',
      price: 29.99,
      compareAtPrice: 39.99,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop'],
      variants: [
        { id: 'v1', title: 'Default', price: 29.99, inventoryQuantity: 10 },
      ],
      vendor: 'Your Store',
      category: 'Clothing',
      tags: ['sample', 'preview'],
    },
    {
      id: 'sample-2',
      handle: 'sample-product-2',
      title: 'Sample Jacket',
      description: 'Add your products to see them in collections',
      price: 89.99,
      compareAtPrice: 119.99,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop'],
      variants: [
        { id: 'v2', title: 'Default', price: 89.99, inventoryQuantity: 5 },
      ],
      vendor: 'Your Store',
      category: 'Clothing',
      tags: ['sample', 'preview'],
    },
    {
      id: 'sample-3',
      handle: 'sample-product-3',
      title: 'Sample Accessory',
      description: 'Your products will appear here once added',
      price: 49.99,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop'],
      variants: [
        { id: 'v3', title: 'Default', price: 49.99, inventoryQuantity: 8 },
      ],
      vendor: 'Your Store',
      category: 'Accessories',
      tags: ['sample', 'preview'],
    },
  ]
});

async function getStore(subdomain: string) {
  try {
    return await prisma.store.findUnique({
      where: { subdomain }
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

async function getCollectionTemplate(storeId: string) {
  try {
    return await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType: 'collection',
        isDefault: true,
      },
      include: {
        sections: {
          orderBy: { position: 'asc' }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching collection template:', error);
    return null;
  }
}

export default async function CollectionPreviewPage({ params, searchParams }: PreviewPageProps) {
  const { subdomain } = await params;
  
  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    notFound();
  }

  // Get collection data (real or sample)
  const collectionData = await getCollectionData(store.id);
  const { collection, products } = collectionData || getSampleData();

  // Get template
  const template = await getCollectionTemplate(store.id);
  if (!template) {
    notFound();
  }
  
  // Get global sections
  const globalSections = await getGlobalSections(subdomain, 'commerce');

  // Prepare page data
  const pageData = {
    type: 'collection',
    collection,
    products,
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
    <TemplateRenderer 
      store={pageData.store}
      sections={template.sections}
      globalSections={globalSections}
      isPreview={true}
      pageData={pageData}
    />
  );
}