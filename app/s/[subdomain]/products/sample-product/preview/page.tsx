import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '../../../template-renderer';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface PreviewPageProps {
  params: Promise<{ subdomain: string }>;
}

// Sample product data for preview
const sampleProduct = {
  id: 'preview-product',
  handle: 'sample-product',
  name: 'Premium Leather Jacket',
  description: `Experience luxury with our Premium Leather Jacket. Crafted from the finest genuine leather, this jacket combines timeless style with modern functionality.

Features:
• 100% genuine leather construction
• YKK zippers for durability
• Multiple interior and exterior pockets
• Quilted lining for comfort
• Available in classic black and brown

Perfect for both casual and formal occasions, this jacket is a wardrobe essential that only gets better with age.`,
  price: 299.99,
  compareAtPrice: 399.99,
  currency: 'USD',
  category: {
    id: 'cat-1',
    name: 'Outerwear',
    slug: 'outerwear',
  },
  tags: ['leather', 'jacket', 'premium', 'outerwear'],
  images: [
    'https://via.placeholder.com/800x1200',
    'https://via.placeholder.com/800x1200',
    'https://via.placeholder.com/800x1200',
    'https://via.placeholder.com/800x1200',
  ],
  variants: [
    {
      id: 'v1',
      name: 'Black / Small',
      price: 299.99,
      compareAtPrice: 399.99,
      inventoryQuantity: 5,
      options: { color: 'Black', size: 'Small' },
      images: [{ url: 'https://via.placeholder.com/800x1200' }],
    },
    {
      id: 'v2',
      name: 'Black / Medium',
      price: 299.99,
      compareAtPrice: 399.99,
      inventoryQuantity: 10,
      options: { color: 'Black', size: 'Medium' },
      images: [{ url: 'https://via.placeholder.com/800x1200' }],
    },
    {
      id: 'v3',
      name: 'Black / Large',
      price: 299.99,
      compareAtPrice: 399.99,
      inventoryQuantity: 8,
      options: { color: 'Black', size: 'Large' },
      images: [{ url: 'https://via.placeholder.com/800x1200' }],
    },
    {
      id: 'v4',
      name: 'Brown / Small',
      price: 299.99,
      compareAtPrice: 399.99,
      inventoryQuantity: 3,
      options: { color: 'Brown', size: 'Small' },
      images: [{ url: 'https://via.placeholder.com/800x1200' }],
    },
    {
      id: 'v5',
      name: 'Brown / Medium',
      price: 299.99,
      compareAtPrice: 399.99,
      inventoryQuantity: 7,
      options: { color: 'Brown', size: 'Medium' },
      images: [{ url: 'https://via.placeholder.com/800x1200' }],
    },
    {
      id: 'v6',
      name: 'Brown / Large',
      price: 299.99,
      compareAtPrice: 399.99,
      inventoryQuantity: 5,
      options: { color: 'Brown', size: 'Large' },
      images: [{ url: 'https://via.placeholder.com/800x1200' }],
    },
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Sample related products
const relatedProducts = [
  {
    id: 'related-1',
    handle: 'wool-scarf',
    name: 'Wool Scarf',
    price: 49.99,
    compareAtPrice: 69.99,
    currency: 'USD',
    images: ['https://via.placeholder.com/400x600'],
  },
  {
    id: 'related-2',
    handle: 'leather-gloves',
    name: 'Leather Gloves',
    price: 79.99,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://via.placeholder.com/400x600'],
  },
  {
    id: 'related-3',
    handle: 'denim-shirt',
    name: 'Denim Shirt',
    price: 59.99,
    compareAtPrice: 89.99,
    currency: 'USD',
    images: ['https://via.placeholder.com/400x600'],
  },
  {
    id: 'related-4',
    handle: 'canvas-boots',
    name: 'Canvas Boots',
    price: 119.99,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://via.placeholder.com/400x600'],
  },
];

export default async function ProductPreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = await params;
  const { subdomain } = resolvedParams;

  const store = await prisma.store.findUnique({
    where: { subdomain }
  });

  if (!store) {
    notFound();
  }

  // Get product template
  const template = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      templateType: 'product',
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

  const sections = template?.sections || [];

  // Load global sections
  const themeCode = store.themeCode || 'commerce';
  const globalSections = await getGlobalSections(subdomain, themeCode);

  // Pass sample data through page props
  const pageData = {
    product: sampleProduct,
    relatedProducts,
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: 'Outerwear', href: '/collections/outerwear' },
      { name: sampleProduct.name, href: '#' },
    ],
  };

  return (
    <TemplateRenderer
      store={store}
      sections={sections}
      globalSections={globalSections}
      isPreview={true}
      pageData={pageData}
    />
  );
}