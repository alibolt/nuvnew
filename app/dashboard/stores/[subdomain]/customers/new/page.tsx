import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { CustomerForm } from '../customer-form';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function NewCustomerPage({ params }: PageProps) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get store
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
    }
  });

  if (!store) {
    redirect('/dashboard');
  }

  // Get all user stores for the dropdown
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
      <div className="nuvi-space-y-6">
        <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
          <div>
            <h1 className="nuvi-text-2xl nuvi-font-semibold nuvi-text-primary">Add customer</h1>
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mt-1">
              Add a new customer to your store
            </p>
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <CustomerForm store={store} />
        </Suspense>
      </div>
    </DashboardWrapper>
  );
}