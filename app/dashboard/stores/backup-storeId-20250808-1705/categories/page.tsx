import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CategoryManagerV2 } from './category-manager-v2';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export default async function CategoriesPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const session = await getServerSession(authOptions);
  const { storeId } = await params;

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
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
    >
      <div className="nuvi-tab-panel">
        <CategoryManagerV2 storeId={storeId} />
      </div>
    </DashboardWrapper>
  );
}