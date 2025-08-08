
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { ThemesClient } from './themes-client';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';

export default async function ThemesPage({
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
      activeTheme: true,
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

  // Fetch all available themes from database
  const allThemes = await prisma.theme.findMany({
    orderBy: { name: 'asc' },
  });

  // For now, we only have one theme
  const themes = allThemes.map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description || 'A versatile theme perfect for all types of stores',
    preview: `/themes/${theme.code}/preview.svg`,
    isActive: store.activeTheme?.id === theme.id,
  }));

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="themes"
    >
      <ThemesClient store={store} themes={themes} />
    </DashboardWrapper>
  );
}
