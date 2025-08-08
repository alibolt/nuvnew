import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { SettingsClient } from '../settings-client';
import { StoreDetailsFormV2 } from './store-details-form-v2';

export default async function StoreDetailsPage({
  params,
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
      OR: [
        { subdomain: subdomain, userId: session.user.id },
        { subdomain: subdomain, userId: session.user.id }
      ]
    },
    include: {
      storeSettings: true,
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


  // If in modal mode, render without DashboardWrapper


  

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="settings"
    >
      <SettingsClient store={store}>
        <StoreDetailsFormV2 store={{
          ...store,
          settings: store.storeSettings
        }} />
      </SettingsClient>
    </DashboardWrapper>
  );
}