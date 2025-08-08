import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import Link from 'next/link';
import { OrderList } from './order-list';

export default async function OrdersPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id
    },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        }
      },
      orders: {
        include: {
          lineItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
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

  const orderStats = {
    total: store.orders.length,
    pending: store.orders.filter(o => o.status === 'pending').length,
    processing: store.orders.filter(o => o.status === 'processing').length,
    completed: store.orders.filter(o => o.status === 'completed').length,
    revenue: store.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalPrice, 0)
  };

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="orders"
    >
      <div className="nuvi-tab-panel">
        <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">Orders</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Manage your store orders and fulfillment</p>
          </div>
        </div>

        {/* Stats */}
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <p className="nuvi-text-sm nuvi-text-secondary">Total Orders</p>
              <p className="nuvi-text-2xl nuvi-font-bold">{orderStats.total}</p>
            </div>
          </div>
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <p className="nuvi-text-sm nuvi-text-secondary">Pending</p>
              <p className="nuvi-text-2xl nuvi-font-bold nuvi-text-warning">{orderStats.pending}</p>
            </div>
          </div>
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <p className="nuvi-text-sm nuvi-text-secondary">Processing</p>
              <p className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">{orderStats.processing}</p>
            </div>
          </div>
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <p className="nuvi-text-sm nuvi-text-secondary">Revenue</p>
              <p className="nuvi-text-2xl nuvi-font-bold nuvi-text-success">
                ${orderStats.revenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {store.orders.length === 0 ? (
          <div className="nuvi-card">
            <div className="nuvi-card-content">
              <div className="nuvi-text-center nuvi-py-xl">
                <svg
                  className="nuvi-mx-auto h-16 w-16 nuvi-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="nuvi-mt-md nuvi-text-lg nuvi-font-semibold">No orders yet</h3>
                <p className="nuvi-mt-sm nuvi-text-muted">
                  Orders will appear here when customers make purchases.
                </p>
                <div className="nuvi-mt-lg">
                  <Link
                    href={`http://${store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`}
                    target="_blank"
                    className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline"
                  >
                    Visit your store →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <OrderList orders={store.orders as any} storeId={storeId} />
        )}
      </div>
    </DashboardWrapper>
  );
}