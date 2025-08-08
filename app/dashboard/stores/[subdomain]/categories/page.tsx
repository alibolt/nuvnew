import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { CategoriesTabContent } from '../components/categories-tab-content';

export default async function CategoriesPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  const session = await getServerSession(authOptions);
  const { subdomain } = await params;
  
  if (!session) {
    notFound();
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session?.user?.id
    },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        }
      }
    }
  });

  if (!store) {
    notFound();
  }

  // Get all user's stores for the store switcher
  const allStores = await prisma.store.findMany({
    where: {
      userId: session?.user?.id || ''
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
      activeTab="categories"
    >
      <CategoriesTabContent store={store} />
    </DashboardWrapper>
  );
}