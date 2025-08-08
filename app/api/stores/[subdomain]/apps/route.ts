import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// GET: List installed apps
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

    // Get installed apps
    const installedApps = await prisma.appInstall.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        app: true,
      },
      orderBy: {
        installedAt: 'desc',
      },
    });

    return apiResponse.success({ apps: installedApps });
  } catch (error) {
    console.error('Error fetching installed apps:', error);
    return handleApiError(error);
  }
}

// POST: Install an app
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { appCode } = body;

    if (!appCode) {
      return apiResponse.badRequest('App code is required');
    }

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

    // First check if app exists in DB, if not create it
    let app = await prisma.app.findUnique({
      where: { code: appCode },
    });

    if (!app) {
      // Create app based on predefined list
      const appDefinitions: Record<string, any> = {
        'stripe-payments': {
          name: 'Stripe Payments',
          description: 'Accept payments with Stripe payment gateway',
          icon: '💳',
          category: 'payments',
          developer: 'Stripe',
          version: '1.0.0',
          pricing: { type: 'transaction', price: 2.9, transactionFee: 0.30 },
          features: [
            'Credit card payments',
            'Digital wallets (Apple Pay, Google Pay)',
            'International payments',
            'Fraud protection',
            '3D Secure authentication',
            'Automatic refunds'
          ],
          permissions: ['orders:read', 'orders:write', 'customers:read'],
          settings: {
            publishableKey: {
              type: 'text',
              label: 'Stripe Publishable Key',
              placeholder: 'pk_test_...',
              required: true
            },
            secretKey: {
              type: 'password',
              label: 'Stripe Secret Key',
              placeholder: 'sk_test_...',
              required: true
            },
            webhookSecret: {
              type: 'password',
              label: 'Webhook Signing Secret',
              placeholder: 'whsec_...',
              required: false
            },
            testMode: {
              type: 'boolean',
              label: 'Test Mode',
              default: true
            }
          }
        },
        'shopify-import': {
          name: 'Shopify Import',
          description: 'Import products, collections, and content from your existing Shopify store',
          icon: '🛍️',
          category: 'import',
          developer: 'Nuvi',
          version: '1.0.0',
          pricing: { type: 'free', price: 0 },
          features: [
            'Import products with variants',
            'Import product images',
            'Import collections/categories',
            'Import store information',
            'Preview before import',
            'Field mapping'
          ],
          permissions: ['products:write', 'categories:write', 'media:write'],
          settings: {
            shopifyUrl: {
              type: 'text',
              label: 'Shopify Store URL',
              placeholder: 'mystore.myshopify.com',
              required: true
            }
          }
        },
        'email-marketing': {
          name: 'Email Marketing Pro',
          description: 'Send marketing emails and newsletters to your customers',
          icon: '📧',
          category: 'marketing',
          developer: 'Nuvi',
          version: '1.0.0',
          pricing: { type: 'subscription', price: 19.99, period: 'month' },
          features: [
            'Email campaigns',
            'Newsletter templates',
            'Customer segmentation',
            'Analytics dashboard',
            'A/B testing'
          ],
          permissions: ['customers:read', 'orders:read']
        },
        'advanced-analytics': {
          name: 'Advanced Analytics',
          description: 'Deep insights into your store performance with advanced analytics',
          icon: '📊',
          category: 'analytics',
          developer: 'Nuvi',
          version: '1.0.0',
          pricing: { type: 'subscription', price: 29.99, period: 'month' },
          features: [
            'Real-time analytics',
            'Customer behavior tracking',
            'Sales forecasting',
            'Custom reports',
            'Export to CSV/PDF'
          ],
          permissions: ['orders:read', 'products:read', 'customers:read']
        },
        'smart-search': {
          name: 'Smart Search',
          description: 'Advanced search functionality with filters, autocomplete, and intelligent results',
          icon: '🔍',
          category: 'search',
          developer: 'Nuvi',
          version: '1.0.0',
          pricing: { type: 'free', price: 0 },
          features: [
            'Intelligent search results',
            'Auto-complete suggestions',
            'Advanced filtering',
            'Search analytics',
            'Customizable search interface',
            'Product recommendations'
          ],
          permissions: ['products:read', 'categories:read']
        },
        'social-commerce': {
          name: 'Social Commerce',
          description: 'Sell directly on social media platforms',
          icon: '🌐',
          category: 'sales',
          developer: 'Nuvi',
          version: '1.0.0',
          pricing: { type: 'one-time', price: 99.99 },
          features: [
            'Instagram Shopping',
            'Facebook Shop',
            'Social media sync',
            'Auto-posting',
            'Social analytics'
          ],
          permissions: ['products:read', 'media:read']
        }
      };

      const appDef = appDefinitions[appCode];
      if (!appDef) {
        return apiResponse.badRequest('Invalid app code');
      }

      app = await prisma.app.create({
        data: {
          code: appCode,
          name: appDef.name,
          description: appDef.description,
          icon: appDef.icon,
          category: appDef.category,
          developer: appDef.developer,
          version: appDef.version,
          pricing: appDef.pricing,
          features: appDef.features,
          permissions: appDef.permissions,
          settings: appDef.settings || {},
        },
      });
    }

    // Check if app is already installed
    const existingInstall = await prisma.appInstall.findUnique({
      where: {
        storeId_appId: {
          storeId: store.id,
          appId: app.id,
        },
      },
    });

    if (existingInstall) {
      return apiResponse.badRequest('App is already installed');
    }

    // Install the app
    const installation = await prisma.appInstall.create({
      data: {
        storeId: store.id,
        appId: app.id,
        status: 'active',
        apiKeys: {
          publicKey: `pk_${nanoid(32)}`,
          secretKey: `sk_${nanoid(32)}`,
        },
        permissions: app.permissions as any,
      },
      include: {
        app: true,
      },
    });

    // Post-installation hooks
    if (appCode === 'smart-search') {
      // Create default search settings
      await prisma.searchSettings.create({
        data: {
          storeId: store.id
        }
      });

      // Trigger initial index build
      try {
        const { SearchIndexingService } = await import('@/lib/services/search-indexing.service');
        await SearchIndexingService.rebuildIndex(store.id);
      } catch (error) {
        console.error('Error building initial search index:', error);
      }
    }

    return apiResponse.success(installation);
  } catch (error) {
    console.error('Error installing app:', error);
    return handleApiError(error);
  }
}