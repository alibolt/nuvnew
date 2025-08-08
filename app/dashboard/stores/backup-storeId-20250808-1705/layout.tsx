import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/layout/page-transition';

export default async function StoreLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const session = await requireAuth();
  const { storeId } = await params;

  // Check if storeId is actually a subdomain (contains letters, not just random chars)
  const isSubdomain = /^[a-z0-9-]+$/.test(storeId) && !storeId.startsWith('cm'); // CUID starts with 'cm'
  
  const store = await prisma.store.findFirst({
    where: isSubdomain ? {
      subdomain: storeId,
      userId: session.user.id
    } : {
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
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="nuvi-layout nuvi-admin" data-dashboard-layout>
      <PageTransition>
        {children}
      </PageTransition>
    </div>
  );
}