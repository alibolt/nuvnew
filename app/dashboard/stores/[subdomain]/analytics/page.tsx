import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { AnalyticsClient } from './analytics-client';

export default async function AnalyticsPage({
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

  // Get basic stats
  const [totalOrders, totalProducts, totalRevenue, totalCustomers] = await Promise.all([
    prisma.order.count({ where: { storeId: store.id } }),
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.order.aggregate({
      where: { storeId: store.id },
      _sum: { totalPrice: true }
    }),
    prisma.customer.count({ where: { storeId: store.id } })
  ]);

  const initialStats = {
    totalRevenue: (totalRevenue._sum.totalPrice || 0) / 100, // Convert from cents
    totalOrders,
    totalProducts,
    totalCustomers
  };

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="analytics"
    >
      <AnalyticsClient 
        storeId={store.id} 
        subdomain={subdomain}
        initialStats={initialStats}
      />
    </DashboardWrapper>
  );
}