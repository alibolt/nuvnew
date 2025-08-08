import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '../../template-renderer';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface PreviewPageProps {
  params: Promise<{ subdomain: string }>;
}

// Sample cart data for preview
const sampleCartItems = [
  {
    id: 'cart-item-1',
    productId: 'prod-1',
    variantId: 'var-1',
    quantity: 2,
    product: {
      name: 'Classic T-Shirt',
      handle: 'classic-t-shirt',
      images: ['https://via.placeholder.com/200x200'],
    },
    variant: {
      name: 'Black / Medium',
      price: 29.99,
      compareAtPrice: 39.99,
      inventoryQuantity: 15,
      options: { color: 'Black', size: 'Medium' },
    },
  },
  {
    id: 'cart-item-2',
    productId: 'prod-2',
    variantId: 'var-2',
    quantity: 1,
    product: {
      name: 'Denim Jacket',
      handle: 'denim-jacket',
      images: ['https://via.placeholder.com/200x200'],
    },
    variant: {
      name: 'Blue / Large',
      price: 89.99,
      compareAtPrice: 119.99,
      inventoryQuantity: 8,
      options: { color: 'Blue', size: 'Large' },
    },
  },
  {
    id: 'cart-item-3',
    productId: 'prod-3',
    variantId: 'var-3',
    quantity: 1,
    product: {
      name: 'Canvas Backpack',
      handle: 'canvas-backpack',
      images: ['https://via.placeholder.com/200x200'],
    },
    variant: {
      name: 'One Size',
      price: 59.99,
      compareAtPrice: null,
      inventoryQuantity: 20,
      options: { size: 'One Size' },
    },
  },
];

// Calculate cart totals
const calculateCartTotals = (items: typeof sampleCartItems) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.variant.price * item.quantity);
  }, 0);
  
  const savings = items.reduce((sum, item) => {
    if (item.variant.compareAtPrice) {
      return sum + ((item.variant.compareAtPrice - item.variant.price) * item.quantity);
    }
    return sum;
  }, 0);
  
  const tax = subtotal * 0.08; // 8% tax for example
  const shipping = subtotal >= 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;
  
  return {
    subtotal,
    savings,
    tax,
    shipping,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

// Sample recommended products
const recommendedProducts = [
  {
    id: 'rec-1',
    handle: 'leather-belt',
    name: 'Leather Belt',
    price: 39.99,
    compareAtPrice: 49.99,
    currency: 'USD',
    images: ['https://via.placeholder.com/300x300'],
  },
  {
    id: 'rec-2',
    handle: 'wool-socks',
    name: 'Wool Socks (3-Pack)',
    price: 24.99,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://via.placeholder.com/300x300'],
  },
  {
    id: 'rec-3',
    handle: 'sunglasses',
    name: 'Aviator Sunglasses',
    price: 79.99,
    compareAtPrice: 99.99,
    currency: 'USD',
    images: ['https://via.placeholder.com/300x300'],
  },
];

export default async function CartPreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = await params;
  const { subdomain } = resolvedParams;

  const store = await prisma.store.findUnique({
    where: { subdomain }
  });

  if (!store) {
    notFound();
  }

  // Get cart template
  const template = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      templateType: 'cart',
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

  const cartTotals = calculateCartTotals(sampleCartItems);

  // Pass sample data through page props
  const pageData = {
    cart: {
      items: sampleCartItems,
      ...cartTotals,
      currency: 'USD',
    },
    recommendedProducts,
    shippingNote: 'Free shipping on orders over $100',
    acceptedPayments: ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay'],
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