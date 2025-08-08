import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/layout/page-transition';

export default async function StoreLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const session = await requireAuth();
  const { subdomain } = await params;

  // Check if subdomain is actually a subdomain (contains letters, not just random chars)
  const isSubdomain = /^[a-z0-9-]+$/.test(subdomain) && !subdomain.startsWith('cm'); // CUID starts with 'cm'
  
  const store = await prisma.store.findFirst({
    where: isSubdomain ? {
      subdomain: subdomain,
      userId: session.user.id
    } : {
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
    <div className="min-h-screen bg-gray-50" data-dashboard-layout>
      <PageTransition>
        {children}
      </PageTransition>
    </div>
  );
}