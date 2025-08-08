import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '../../../page-renderer';
import { RealtimePreviewWrapper } from '../../../preview/realtime-preview-wrapper';
import { getCompiledTemplate } from '@/lib/services/hybrid-template-loader';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface LatestProductPreviewProps {
  params: Promise<{
    subdomain: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getLatestProduct(storeId: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        storeId,
        isActive: true,
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
      orderBy: {
        createdAt: 'desc'
      }
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
    console.error('Error fetching latest product:', error);
    return null;
  }
}

async function getStore(subdomain: string) {
  try {
    return await prisma.store.findUnique({
      where: { subdomain },
      include: {},
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
                orderBy: { position: 'asc' }
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
          orderBy: { position: 'asc' }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product template:', error);
    return null;
  }
}

export async function generateMetadata({ params }: LatestProductPreviewProps): Promise<Metadata> {
  const { subdomain } = await params;
  
  const store = await getStore(subdomain);
  if (!store) {
    return {
      title: 'Latest Product Preview',
    };
  }

  return {
    title: `Latest Product Preview | ${store.name}`,
    description: `Preview of the latest product from ${store.name}`,
  };
}

export default async function LatestProductPreviewPage({ params, searchParams }: LatestProductPreviewProps) {
  const { subdomain } = await params;
  
  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    notFound();
  }

  // Get latest product
  const product = await getLatestProduct(store.id);
  if (!product) {
    // If no products exist, create a sample product for preview
    const sampleProduct = {
      id: 'sample-product',
      name: 'Sample Product', // Add name field
      title: 'Sample Product',
      description: 'This is a sample product for preview purposes. Add your first product to see it here.',
      slug: 'sample-product',
      tags: ['sample', 'preview'],
      images: [{url: '/images/sample-product.jpg', altText: 'Sample Product'}], // Fix images format
      productType: 'physical',
      isActive: true,
      requiresShipping: true,
      trackQuantity: true,
      weight: 0,
      weightUnit: 'kg',
      dimensions: null,
      metaTitle: 'Sample Product',
      metaDescription: 'Sample product for preview',
      vendor: 'Store',
      category: null,
      variants: [{
        id: 'sample-variant',
        name: 'Default', // Add name field
        title: 'Default',
        sku: 'SAMPLE-001',
        barcode: '',
        price: 29.99, // Use decimal format
        compareAtPrice: 39.99, // Use decimal format
        cost: 15.00,
        inventory: 10,
        weight: 0,
        weightUnit: 'kg',
        trackQuantity: true,
        continueSellingWhenOutOfStock: false,
        options: {},
        images: [],
      }],
      template: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Use sample product
    const themeCode = store.themeCode || 'commerce';
    const [compiledTemplate, globalSections] = await Promise.all([
      getCompiledTemplate(subdomain, themeCode, 'product'),
      getGlobalSections(subdomain, themeCode)
    ]);
    
    let template;
    
    if (compiledTemplate) {
      template = {
        id: 'product-hybrid',
        sections: compiledTemplate.sections,
        templateType: 'product',
      };
    } else {
      template = await getProductTemplate(store.id);
      if (!template) {
        notFound();
      }
    }

    const pageData = {
      type: 'product',
      product: sampleProduct,
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
      <div className="min-h-screen" data-preview-page="true">
          <RealtimePreviewWrapper
            initialSections={template.sections}
            globalSections={globalSections}
            store={pageData.store}
            themeCode="commerce"
            isPreview={true}
            pageData={pageData}
          />
        </div>
    );
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
    <div className="min-h-screen" data-preview-page="true">
        <RealtimePreviewWrapper
          initialSections={template.sections}
          globalSections={globalSections}
          store={pageData.store}
          themeCode={'commerce'}
          isPreview={true}
          pageData={pageData}
        />
      </div>
  );
}