import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import GoogleIntegrationClient from './google-integration-client';

interface GoogleIntegrationPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function GoogleIntegrationPage({ params }: GoogleIntegrationPageProps) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  // Get store
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id,
    },
  });

  if (!store) {
    notFound();
  }

  // Check if Google Integration app is installed
  const googleApp = await prisma.app.findUnique({
    where: { code: 'google-integration' }
  });

  if (!googleApp) {
    notFound();
  }

  const appInstall = await prisma.appInstall.findUnique({
    where: {
      storeId_appId: {
        storeId: store.id,
        appId: googleApp.id
      }
    }
  });

  if (!appInstall || appInstall.status !== 'active') {
    notFound();
  }

  // Get Google integration settings
  const googleIntegration = await prisma.googleIntegration.findUnique({
    where: {
      storeId: store.id
    }
  });

  // Get store products count for Merchant Center
  const productsCount = await prisma.product.count({
    where: { storeId: store.id }
  });

  return (
    <GoogleIntegrationClient
      subdomain={subdomain}
      store={store}
      googleIntegration={googleIntegration}
      productsCount={productsCount}
    />
  );
}