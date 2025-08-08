import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { CategoryForm } from '../../category-form';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ storeId: string; categoryId: string }>;
}) {
  const { storeId, categoryId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { id: storeId, userId: session.user.id },
        { subdomain: storeId, userId: session.user.id }
      ]
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

  // Get the category to edit
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      storeId: store.id,
    },
  });

  if (!category) {
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

  return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="categories"
    >
      <CategoryForm storeId={storeId} category={category} />
    </DashboardWrapper>
  );
}