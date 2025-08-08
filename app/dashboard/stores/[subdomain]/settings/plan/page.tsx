import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { SettingsClient } from '../settings-client';
import { PlanFormV2 } from './plan-form-v2';

export default async function PlanPage({
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
        }
      },
      subscription: {
        include: {
          plan: true,
          invoices: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          }
        }
      }
    },
  });

  if (!store) {
    notFound();
  }

  // Get all available pricing plans
  const pricingPlans = await prisma.pricingPlan.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      priceMonthly: 'asc'
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
      activeTab="settings"
    >
      <SettingsClient store={store}>
        <div className="p-8">
          <PlanFormV2 
            store={store} 
            subscription={store.subscription}
            pricingPlans={pricingPlans}
          />
        </div>
      </SettingsClient>
    </DashboardWrapper>
  );
}