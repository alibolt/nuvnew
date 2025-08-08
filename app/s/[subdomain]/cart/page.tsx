import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageWithGlobalSections } from '../page-with-global-sections';

interface CartPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { subdomain } = await params;

  // Get store by subdomain
  const store = await prisma.store.findUnique({
    where: { subdomain },
    include: {
      products: {
        include: {
          category: true,
          variants: {
            include: {
              images: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store) {
    notFound();
  }

  // Page template for cart
  const pageTemplate = {
    id: 'cart-page',
    sections: [
      {
        id: 'cart-section',
        sectionType: 'cart',
        settings: {
          title: 'Shopping Cart',
          emptyCartMessage: 'Your cart is empty',
          emptyCartButtonText: 'Continue Shopping',
          emptyCartButtonLink: '/collections/all',
          showRecommendations: true,
          recommendationsTitle: 'You May Also Like',
        },
        enabled: true,
        position: 0,
      },
    ],
  };

  const pageData = {
    storeSubdomain: subdomain,
  };

  return (
    <PageWithGlobalSections
      pageData={{ template: pageTemplate, type: "cart", ...pageData }}
      store={store}
      subdomain={subdomain}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    return {
      title: 'Cart Not Found',
    };
  }

  return {
    title: `Shopping Cart | ${store.name}`,
    description: `View your shopping cart at ${store.name}`,
  };
}