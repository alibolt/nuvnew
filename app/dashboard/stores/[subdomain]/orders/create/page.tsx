import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CreateOrderForm } from './create-order-form';

export default async function CreateOrderPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  const session = await requireAuth();
  const { subdomain } = await params;

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });

  if (!store) {
    notFound();
  }

  // Get products for order creation
  const products = await prisma.product.findMany({
    where: {
      storeId: store.id,
      isActive: true
    },
    include: {
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Get customers for selection
  const customers = await prisma.customer.findMany({
    where: {
      storeId: store.id
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      addresses: true
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' }
    ]
  });

  return (
    <div className="nuvi-container">
      <div className="nuvi-page-header">
        <div>
          <h1 className="nuvi-page-title">Create Order</h1>
          <p className="nuvi-page-description">
            Create a new order manually for customers
          </p>
        </div>
      </div>

      <div className="nuvi-content">
        <CreateOrderForm
          subdomain={subdomain}
          products={products}
          customers={customers}
          store={store}
        />
      </div>
    </div>
  );
}