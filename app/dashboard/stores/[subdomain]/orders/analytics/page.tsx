import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { OrderAnalyticsDashboard } from './order-analytics-dashboard';

export default async function OrderAnalyticsPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  const session = await requireAuth();
  const { subdomain } = await params;

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });

  if (!store) {
    notFound();
  }

  // Get date ranges for analytics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get orders data for analytics
  const [currentPeriodOrders, previousPeriodOrders, allTimeOrders] = await Promise.all([
    // Last 30 days
    prisma.order.findMany({
      where: {
        storeId: store.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        lineItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    // Previous 30 days (for comparison)
    prisma.order.findMany({
      where: {
        storeId: store.id,
        createdAt: { 
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      },
      include: {
        lineItems: true
      }
    }),
    // All time orders for trends
    prisma.order.findMany({
      where: {
        storeId: store.id
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        financialStatus: true,
        createdAt: true,
        customerId: true
      },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  return (
    <div className="nuvi-container">
      <div className="nuvi-page-header">
        <div>
          <h1 className="nuvi-page-title">Order Analytics</h1>
          <p className="nuvi-page-description">
            Analyze your order performance, trends, and customer insights
          </p>
        </div>
      </div>

      <div className="nuvi-content">
        <OrderAnalyticsDashboard
          currentPeriodOrders={currentPeriodOrders}
          previousPeriodOrders={previousPeriodOrders}
          allTimeOrders={allTimeOrders}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}