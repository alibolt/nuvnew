import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; customerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, customerId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get customer with all related data
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId: store.id
      },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 orders
          include: {
            lineItems: true
          }
        },
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    });

    if (!customer) {
      return apiResponse.notFound('Customer ');
    }

    // Parse JSON fields
    const customerData = {
      ...customer,
      tags: customer.tags || [],
      addresses: customer.addresses || [],
      taxExemptions: customer.taxExemptions || [],
      lifetimeValue: customer.totalSpent || 0,
      averageOrderValue: customer.ordersCount > 0 
        ? (customer.totalSpent || 0) / customer.ordersCount 
        : 0,
      totalOrders: customer._count.orders,
      totalReviews: customer._count.reviews
    };

    return apiResponse.success({ customer: customerData });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return apiResponse.serverError();
  }
}

// PUT /api/stores/[subdomain]/customers/[customerId] - Update a customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { subdomain: string; customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, customerId } = params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId: store.id,
      },
    });

    if (!existingCustomer) {
      return apiResponse.notFound('Customer ');
    }

    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      notes,
      tags,
      acceptsMarketing,
      status,
    } = body;

    // If email is being changed, check for conflicts
    if (email && email !== existingCustomer.email) {
      const emailConflict = await prisma.customer.findFirst({
        where: {
          storeId: store.id,
          email,
          id: { not: customerId },
        },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        email: email || existingCustomer.email,
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        note: notes,
        tags: tags ? JSON.stringify(tags) : undefined,
        acceptsMarketing: acceptsMarketing ?? existingCustomer.acceptsMarketing,
        status: status || existingCustomer.status,
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            totalPrice: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // Calculate metrics
    const totalSpent = updatedCustomer.orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );
    const lastOrderDate = updatedCustomer.orders[0]?.createdAt || null;

    return NextResponse.json({
      customer: {
        ...updatedCustomer,
        name: `${updatedCustomer.firstName || ''} ${updatedCustomer.lastName || ''}`.trim() || 'No name',
        totalOrders: updatedCustomer._count.orders,
        totalSpent,
        lastOrderDate,
        tags: updatedCustomer.tags ? JSON.parse(updatedCustomer.tags as string) : [],
      },
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return apiResponse.serverError();
  }
}

// DELETE /api/stores/[subdomain]/customers/[customerId] - Delete a customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { subdomain: string; customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, customerId } = params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if customer exists
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId: store.id,
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      return apiResponse.notFound('Customer ');
    }

    // Check if customer has orders
    if (customer._count.orders > 0) {
      return apiResponse.badRequest('Cannot delete customer with existing orders. Consider deactivating instead.');
    }

    // Delete customer
    await prisma.customer.delete({
      where: {
        id: customerId,
      },
    });

    return apiResponse.success({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return apiResponse.serverError();
  }
}