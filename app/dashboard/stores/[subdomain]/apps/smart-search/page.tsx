import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import SmartSearchClient from './smart-search-client';

export default async function SmartSearchPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id,
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

  // Check if the app is installed
  const appInstall = await prisma.appInstall.findFirst({
    where: {
      storeId: store.id,
      app: {
        code: 'smart-search'
      }
    },
    include: {
      app: true
    }
  });

  if (!appInstall) {
    notFound();
  }

  // Get search settings
  const searchSettings = await prisma.searchSettings.findUnique({
    where: {
      storeId: store.id
    }
  });

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

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="apps"
    >
      <SmartSearchClient 
        subdomain={subdomain}
        searchSettings={searchSettings}
      />
    </DashboardWrapper>
  );
}