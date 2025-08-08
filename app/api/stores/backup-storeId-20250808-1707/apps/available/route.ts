import { NextRequest, NextResponse } from 'next/server';
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
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get installed apps for this store
    const installedApps = await prisma.appInstall.findMany({
      where: {
        storeId: storeId,
      },
      select: {
        appId: true,
        status: true,
      },
    });

    // Get installed app codes
    const installedAppCodes = new Set<string>();

    // Add installation status to available apps
    const appsWithStatus = AVAILABLE_APPS.map(app => ({
      ...app,
      isInstalled: installedAppCodes.has(app.code),
    }));

    return NextResponse.json({ apps: appsWithStatus });
  } catch (error) {
    console.error('Error fetching available apps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available apps' },
      { status: 500 }
    );
  }
}