import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '../../template-renderer';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface PreviewPageProps {
  params: Promise<{ subdomain: string }>;
}

// Sample customer data for preview
const sampleCustomer = {
  id: 'preview-customer',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1 (555) 123-4567',
  acceptsMarketing: true,
  createdAt: new Date('2023-01-15').toISOString(),
};

// Sample order history
const sampleOrders = [
  {
    id: 'order-1',
    orderNumber: '#1234',
    createdAt: new Date('2024-01-10').toISOString(),
    status: 'delivered',
    total: 189.97,
    currency: 'USD',
    itemCount: 3,
    items: [
      {
        name: 'Classic T-Shirt',
        quantity: 2,
        price: 29.99,
        image: 'https://via.placeholder.com/100x100',
      },
      {
        name: 'Denim Jacket',
        quantity: 1,
        price: 129.99,
        image: 'https://via.placeholder.com/100x100',
      },
    ],
  },
  {
    id: 'order-2',
    orderNumber: '#1233',
    createdAt: new Date('2023-12-25').toISOString(),
    status: 'delivered',
    total: 79.99,
    currency: 'USD',
    itemCount: 1,
    items: [
      {
        name: 'Canvas Backpack',
        quantity: 1,
        price: 79.99,
        image: 'https://via.placeholder.com/100x100',
      },
    ],
  },
  {
    id: 'order-3',
    orderNumber: '#1232',
    createdAt: new Date('2023-11-15').toISOString(),
    status: 'processing',
    total: 149.99,
    currency: 'USD',
    itemCount: 1,
    items: [
      {
        name: 'Leather Boots',
        quantity: 1,
        price: 149.99,
        image: 'https://via.placeholder.com/100x100',
      },
    ],
  },
];

// Sample addresses
const sampleAddresses = [
  {
    id: 'addr-1',
    isDefault: true,
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'New York',
    province: 'NY',
    country: 'United States',
    zip: '10001',
    phone: '+1 (555) 123-4567',
  },
  {
    id: 'addr-2',
    isDefault: false,
    firstName: 'John',
    lastName: 'Doe',
    address1: '456 Oak Avenue',
    address2: '',
    city: 'Los Angeles',
    province: 'CA',
    country: 'United States',
    zip: '90001',
    phone: '+1 (555) 987-6543',
  },
];

export default async function AccountPreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = await params;
  const { subdomain } = resolvedParams;

  const store = await prisma.store.findUnique({
    where: { subdomain }
  });

  if (!store) {
    notFound();
  }

  // Get account template
  const template = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      templateType: 'account',
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
    customer: sampleCustomer,
    orders: sampleOrders,
    addresses: sampleAddresses,
    stats: {
      totalOrders: 12,
      totalSpent: 1549.88,
      loyaltyPoints: 1550,
      memberSince: '2023',
    },
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