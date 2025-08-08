import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// GET: List installed apps
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

    // Get installed apps
    const installedApps = await prisma.appInstall.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        app: true,
      },
      orderBy: {
        installedAt: 'desc',
      },
    });

    return NextResponse.json({ apps: installedApps });
  } catch (error) {
    console.error('Error fetching installed apps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installed apps' },
      { status: 500 }
    );
  }
}

// POST: Install an app
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    const { appCode } = body;

    if (!appCode) {
      return NextResponse.json({ error: 'App code is required' }, { status: 400 });
    }

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

    // First check if app exists in DB, if not create it
    let app = await prisma.app.findUnique({
      where: { code: appCode },
    });

    if (!app) {
      // Create app based on predefined list
      const appDefinitions: Record<string, any> = {
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
        return NextResponse.json({ error: 'Invalid app code' }, { status: 400 });
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
          storeId: storeId,
          appId: app.id,
        },
      },
    });

    if (existingInstall) {
      return NextResponse.json(
        { error: 'App is already installed' },
        { status: 400 }
      );
    }

    // Install the app
    const installation = await prisma.appInstall.create({
      data: {
        storeId: storeId,
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

    return NextResponse.json({ installation });
  } catch (error) {
    console.error('Error installing app:', error);
    return NextResponse.json(
      { error: 'Failed to install app' },
      { status: 500 }
    );
  }
}