import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ShopifyImportClient } from './shopify-import-client';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function ShopifyImportPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { subdomain } = await params;

  // Get store and verify ownership
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { subdomain: subdomain, userId: session.user.id },
        { subdomain: subdomain, userId: session.user.id }
      ]
    },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        }
      }
    },
  });

  if (!store) {
    notFound();
  }

  // Get all user's stores for the store switcher
  const allStores = await prisma.store.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Check if Shopify Import app is installed
  const appInstall = await prisma.appInstall.findFirst({
    where: {
      storeId: store.id,
      app: {
        code: 'shopify-import',
      },
    },
    include: {
      app: true,
    },
  });

  if (!appInstall) {
    redirect(`/dashboard/stores/${subdomain}?tab=apps`);
  }

  // Get previous import sessions
  const importSessions = await prisma.shopifyImport.findMany({
    where: {
      appInstallId: appInstall.id,
    },
    orderBy: {
      startedAt: 'desc',
    },
    take: 10,
  });

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="apps"
    >
      <ShopifyImportClient
        store={store}
        appInstall={appInstall}
        importSessions={importSessions}
      />
    </DashboardWrapper>
  );
}