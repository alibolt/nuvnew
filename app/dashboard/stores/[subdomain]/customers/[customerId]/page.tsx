import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { CustomerDetailView } from './customer-detail-view';

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ subdomain: string; customerId: string }>
}) {
  const { subdomain, customerId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
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
    }
  });

  if (!store) {
    notFound();
  }

  // Get customer details with orders
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      storeId: store.id
    },
    include: {
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
        orderBy: { createdAt: 'desc' },
        take: 10 // Last 10 orders
      },
      _count: {
        select: {
          orders: true
        }
      }
    }
  });
  
  // Get metafields for this customer
  const metafields = await prisma.metafield.findMany({
    where: {
      storeId: store.id,
      ownerType: 'Customer',
      ownerId: customerId
    },
    include: {
      definition: true
    }
  });
  
  // Get available metafield definitions for customers
  const metafieldDefinitions = await prisma.metafieldDefinition.findMany({
    where: {
      storeId: store.id,
      appliesTo: 'customers'
    }
  });

  if (!customer) {
    notFound();
  }

  // Calculate customer statistics
  const stats = {
    totalOrders: customer._count.orders,
    totalSpent: customer.totalSpent || 0,
    averageOrderValue: customer._count.orders > 0 
      ? (customer.totalSpent || 0) / customer._count.orders 
      : 0,
    lastOrderDate: customer.lastOrderAt,
  };

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
      activeTab="customers"
    >
      <CustomerDetailView 
        customer={customer} 
        stats={stats}
        subdomain={subdomain}
        metafields={metafields}
        metafieldDefinitions={metafieldDefinitions}
      />
    </DashboardWrapper>
  );
}