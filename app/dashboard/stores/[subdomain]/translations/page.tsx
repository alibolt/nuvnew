import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TranslationsUnified } from './translations-unified';

export default async function TranslationsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const store = await prisma.store.findFirst({
    where: {
      subdomain,
      userId: session.user.id,
    },
    include: {
      storeSettings: true,
    },
  });

  if (!store) {
    redirect('/dashboard');
  }

  // Get translation statistics for the overview tab
  const [productTranslations, categoryTranslations, pageTranslations] = await Promise.all([
    prisma.productTranslation.groupBy({
      by: ['language'],
      where: {
        product: { storeId: store.id }
      },
      _count: true,
    }),
    prisma.categoryTranslation.groupBy({
      by: ['language'],
      where: {
        category: { storeId: store.id }
      },
      _count: true,
    }),
    prisma.pageTranslation.groupBy({
      by: ['language'],
      where: {
        page: { storeId: store.id }
      },
      _count: true,
    }),
  ]);

  // Get total counts
  const [totalProducts, totalCategories, totalPages] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.category.count({ where: { storeId: store.id } }),
    prisma.page.count({ where: { storeId: store.id } }),
  ]);

  const translationStats = {
    products: {
      total: totalProducts,
      translations: productTranslations,
    },
    categories: {
      total: totalCategories,
      translations: categoryTranslations,
    },
    pages: {
      total: totalPages,
      translations: pageTranslations,
    },
  };

  // Use the unified component with both tabs
  return <TranslationsUnified store={store} stats={translationStats} />;
}