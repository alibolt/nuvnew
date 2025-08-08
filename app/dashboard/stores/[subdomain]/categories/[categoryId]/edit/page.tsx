import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import { CategoryFormV2 } from '../../category-form-v2';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ subdomain: string; categoryId: string }>;
}) {
  const { subdomain, categoryId } = await params;
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
  
  // Get metafields for this category
  const metafields = await prisma.metafield.findMany({
    where: {
      storeId: store.id,
      ownerType: 'Category',
      ownerId: categoryId
    },
    include: {
      definition: true
    }
  });
  
  // Get available metafield definitions for categories
  const metafieldDefinitions = await prisma.metafieldDefinition.findMany({
    where: {
      storeId: store.id,
      appliesTo: 'collections'
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
      activeTab="categories"
    >
      <CategoryFormV2 
        subdomain={subdomain} 
        category={category}
        metafields={metafields}
        metafieldDefinitions={metafieldDefinitions}
      />
    </DashboardWrapper>
  );
}