import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react';

export default async function AnalyticsPage({
  params
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
      id: storeId,
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
  const [totalOrders, totalProducts, totalRevenue] = await Promise.all([
    prisma.order.count({ where: { storeId } }),
    prisma.product.count({ where: { storeId } }),
    prisma.order.aggregate({
      where: { storeId },
      _sum: { totalPrice: true }
    })
  ]);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue._sum.totalPrice?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Conversion Rate',
      value: '0%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="analytics"
    >
      <div className="nuvi-tab-panel">
        <div className="nuvi-mb-lg">
          <h2 className="nuvi-text-2xl nuvi-font-bold">Analytics</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Track your store's performance</p>
        </div>

        {/* Stats Grid */}
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="nuvi-card">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                    <div className={`nuvi-p-sm nuvi-rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <h3 className="nuvi-text-2xl nuvi-font-bold">{stat.value}</h3>
                  <p className="nuvi-text-secondary nuvi-text-sm">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Placeholder Charts */}
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-md">
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title">Sales Over Time</h2>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-text-muted">
                <p>Chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title">Top Products</h2>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-text-muted">
                <p>Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="nuvi-mt-lg nuvi-card nuvi-bg-primary-light">
          <div className="nuvi-card-content">
            <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">Coming Soon</h3>
            <p className="nuvi-text-secondary">
              We're working on bringing you detailed analytics including visitor tracking, 
              conversion rates, product performance, and more. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}