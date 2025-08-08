import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { DiscountsTabContent } from '../../components/discounts-tab-content';

export default async function DiscountsPage({
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
    },
  });

  if (!store) {
    notFound();
  }

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
      activeTab="marketing"
    >
      <DiscountsTabContent store={store} />
    </DashboardWrapper>
  );
}