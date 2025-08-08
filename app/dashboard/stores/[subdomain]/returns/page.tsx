import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ReturnsManagement } from './returns-management';

export default async function ReturnsPage({
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

  // Get returns data
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId: store.id }
  });

  const returns = (storeSettings?.returns as any[]) || [];

  // Get recent orders for return creation
  const recentOrders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      status: { in: ['completed', 'processing'] },
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    },
    include: {
      lineItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true
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
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  return (
    <div className="nuvi-container">
      <div className="nuvi-page-header">
        <div>
          <h1 className="nuvi-page-title">Returns & Exchanges</h1>
          <p className="nuvi-page-description">
            Manage product returns, exchanges, and refunds
          </p>
        </div>
      </div>

      <div className="nuvi-content">
        <ReturnsManagement
          subdomain={subdomain}
          returns={returns}
          recentOrders={recentOrders}
        />
      </div>
    </div>
  );
}