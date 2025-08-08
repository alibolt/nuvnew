import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/customer-auth';
import { PageWithGlobalSections } from '../page-with-global-sections';

interface AccountPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { subdomain } = await params;

  // Get store by subdomain
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    notFound();
  }

  // Check if customer is logged in
  const customerSession = await getCustomerSession(store.id);
  
  if (!customerSession) {
    redirect(`/s/${subdomain}/account/login?redirect=/account`);
  }

  // Get customer data with orders
  const customer = await prisma.customer.findUnique({
    where: { id: customerSession.customerId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          lineItems: {
            include: {
              variant: {
                include: {
                  product: true,
                  images: true,
                }
              }
            }
          }
        }
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!customer) {
    redirect(`/s/${subdomain}/account/login`);
  }

  // Page template for account dashboard
  const pageTemplate = {
    id: 'account-dashboard',
    sections: [
      {
        id: 'account-header',
        sectionType: 'account-header',
        settings: {
          showGreeting: true,
          showStats: true,
        },
        enabled: true,
        position: 0,
      },
      {
        id: 'account-navigation',
        sectionType: 'account-navigation',
        settings: {
          showOrders: true,
          showAddresses: true,
          showProfile: true,
          showWishlist: true,
        },
        enabled: true,
        position: 1,
      },
      {
        id: 'account-orders',
        sectionType: 'account-orders',
        settings: {
          title: 'Recent Orders',
          showViewAll: true,
          ordersPerPage: 10,
        },
        enabled: true,
        position: 2,
      },
    ],
  };

  const pageData = {
    customer,
    storeSubdomain: subdomain,
  };

  return (
    <PageWithGlobalSections
      pageData={{ template: pageTemplate, type: "account", ...pageData }}
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
      title: 'Account Not Found',
    };
  }

  return {
    title: `My Account | ${store.name}`,
    description: `Manage your account at ${store.name}`,
  };
}