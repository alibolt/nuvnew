import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { OverviewContent } from './overview-content';

export default async function OverviewPage({
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
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
          customers: true,
        }
      }
    },
  });

  if (!store) {
    notFound();
  }

  // Get recent orders with details
  const recentOrders = await prisma.order.findMany({
    where: {
      storeId: store.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      customer: true,
      lineItems: true,
    }
  });

  // Calculate revenue
  const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Get sales data for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const salesData = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      storeId: store.id,
      createdAt: {
        gte: sevenDaysAgo
      }
    },
    _sum: {
      totalPrice: true
    },
    orderBy: {
      createdAt: 'asc'
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
      activeTab="overview"
    >
      <OverviewContent 
        store={store} 
        recentOrders={recentOrders}
        totalRevenue={totalRevenue}
        salesData={salesData}
      />
    </DashboardWrapper>
  );
}