import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { OrderDetailView } from './order-detail-view';

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ subdomain: string; orderId: string }>
}) {
  const session = await requireAuth();
  const { subdomain, orderId } = await params;

  // Verify store ownership and get order details
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });

  if (!store) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      storeId: store.id
    },
    include: {
      lineItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              slug: true
            }
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true
            }
          }
        }
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });
  
  // Get metafields for this order
  const metafields = await prisma.metafield.findMany({
    where: {
      storeId: store.id,
      ownerType: 'Order',
      ownerId: orderId
    },
    include: {
      definition: true
    }
  });
  
  // Get available metafield definitions for orders
  const metafieldDefinitions = await prisma.metafieldDefinition.findMany({
    where: {
      storeId: store.id,
      appliesTo: 'orders'
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailView 
      order={order}
      subdomain={subdomain}
      metafields={metafields}
      metafieldDefinitions={metafieldDefinitions}
    />
  );
}