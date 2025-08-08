import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Predefined apps list
const AVAILABLE_APPS = [
  {
    code: 'shopify-import',
    name: 'Shopify Import',
    description: 'Import products, collections, and content from your existing Shopify store',
    icon: '🛍️',
    category: 'import',
    developer: 'Nuvi',
    version: '1.0.0',
    pricing: {
      type: 'free',
      price: 0
    },
    features: [
      'Import products with variants',
      'Import product images',
      'Import collections/categories',
      'Import store information',
      'Preview before import',
      'Field mapping'
    ],
    permissions: [
      'products:write',
      'categories:write',
      'media:write'
    ],
    settings: {
      shopifyUrl: {
        type: 'text',
        label: 'Shopify Store URL',
        placeholder: 'mystore.myshopify.com',
        required: true
      }
    }
  },
  {
    code: 'email-marketing',
    name: 'Email Marketing Pro',
    description: 'Send marketing emails and newsletters to your customers',
    icon: '📧',
    category: 'marketing',
    developer: 'Nuvi',
    version: '1.0.0',
    pricing: {
      type: 'subscription',
      price: 19.99,
      period: 'month'
    },
    features: [
      'Email campaigns',
      'Newsletter templates',
      'Customer segmentation',
      'Analytics dashboard',
      'A/B testing'
    ],
    permissions: [
      'customers:read',
      'orders:read'
    ]
  },
  {
    code: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights into your store performance with advanced analytics',
    icon: '📊',
    category: 'analytics',
    developer: 'Nuvi',
    version: '1.0.0',
    pricing: {
      type: 'subscription',
      price: 29.99,
      period: 'month'
    },
    features: [
      'Real-time analytics',
      'Customer behavior tracking',
      'Sales forecasting',
      'Custom reports',
      'Export to CSV/PDF'
    ],
    permissions: [
      'orders:read',
      'products:read',
      'customers:read'
    ]
  },
  {
    code: 'smart-search',
    name: 'Smart Search',
    description: 'Advanced search functionality with filters, autocomplete, and intelligent results',
    icon: '🔍',
    category: 'search',
    developer: 'Nuvi',
    version: '1.0.0',
    pricing: {
      type: 'free',
      price: 0
    },
    features: [
      'Intelligent search results',
      'Auto-complete suggestions',
      'Advanced filtering',
      'Search analytics',
      'Customizable search interface',
      'Product recommendations'
    ],
    permissions: [
      'products:read',
      'categories:read'
    ]
  },
  {
    code: 'social-commerce',
    name: 'Social Commerce',
    description: 'Sell directly on social media platforms',
    icon: '🌐',
    category: 'sales',
    developer: 'Nuvi',
    version: '1.0.0',
    pricing: {
      type: 'one-time',
      price: 99.99
    },
    features: [
      'Instagram Shopping',
      'Facebook Shop',
      'Social media sync',
      'Auto-posting',
      'Social analytics'
    ],
    permissions: [
      'products:read',
      'media:read'
    ]
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get installed apps for this store
    const installedApps = await prisma.appInstall.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        app: true,
      },
    });

    // Get installed app codes
    const installedAppCodes = new Set<string>(
      installedApps.map(install => install.app.code)
    );

    // Add installation status to available apps
    const appsWithStatus = AVAILABLE_APPS.map(app => ({
      ...app,
      isInstalled: installedAppCodes.has(app.code),
    }));

    return apiResponse.success({ apps: appsWithStatus });
  } catch (error) {
    console.error('Error fetching available apps:', error);
    return handleApiError(error);
  }
}