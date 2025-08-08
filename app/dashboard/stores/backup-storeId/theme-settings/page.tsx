import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { ThemeSettingsClient } from './theme-settings-client';
import { defaultThemeSettings } from '@/lib/theme-settings-schema';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';

export default async function ThemeSettingsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { id: storeId, userId: session.user.id },
        { subdomain: storeId, userId: session.user.id }
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

  // Get current theme settings
  const themeSettings = store.themeSettings || defaultThemeSettings;

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session}
    >
      <div className="nuvi-tab-panel">
        <div className="nuvi-max-w-4xl nuvi-mx-auto">
          <div className="nuvi-mb-lg">
            <h2 className="nuvi-text-2xl nuvi-font-bold">Theme Settings</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Configure global theme settings for your store</p>
          </div>

          <ThemeSettingsClient 
            storeId={store.id} 
            initialSettings={themeSettings as any}
          />
        </div>
      </div>
    </DashboardWrapper>
  );
}