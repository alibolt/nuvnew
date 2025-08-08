import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ShopifyImportClient } from './shopify-import-client';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

export default async function ShopifyImportPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { storeId } = await params;

  // Get store and verify ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id,
    },
  });

  if (!store) {
    notFound();
  }

  // Check if Shopify Import app is installed
  const appInstall = await prisma.appInstall.findFirst({
    where: {
      storeId: storeId,
      app: {
        code: 'shopify-import',
      },
    },
    include: {
      app: true,
    },
  });

  if (!appInstall) {
    redirect(`/dashboard/stores/${storeId}?tab=apps`);
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
    <ShopifyImportClient
      store={store}
      appInstall={appInstall}
      importSessions={importSessions}
    />
  );
}