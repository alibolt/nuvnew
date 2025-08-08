import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for customer address
const customerAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  province: z.string().optional(),
  country: z.string().min(2).max(2), // ISO 3166-1 alpha-2
  zip: z.string().min(1),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false)
});

// Schema for creating customer
const createCustomerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  acceptsMarketing: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  addresses: z.array(customerAddressSchema).optional(),
  taxExempt: z.boolean().default(false),
  taxExemptions: z.array(z.string()).optional(),
  emailMarketingConsent: z.object({
    state: z.enum(['subscribed', 'unsubscribed', 'pending', 'not_subscribed']),
    consentUpdatedAt: z.string().datetime().optional()
  }).optional(),
  smsMarketingConsent: z.object({
    state: z.enum(['subscribed', 'unsubscribed', 'pending', 'not_subscribed']),
    consentUpdatedAt: z.string().datetime().optional()
  }).optional()
});

// Schema for updating customer
const updateCustomerSchema = createCustomerSchema.partial();

// GET - List customers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    
    // Filters
    const search = searchParams.get('search');
    const acceptsMarketing = searchParams.get('acceptsMarketing');
    const tags = searchParams.get('tags');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
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

    // Build where clause
    const where: any = { storeId: store.id };
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    
    if (acceptsMarketing !== null) {
      where.acceptsMarketing = acceptsMarketing === 'true';
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Get customers with pagination
    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          _count: {
            select: { orders: true }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    // Parse JSON fields and calculate metrics
    const customersWithMetrics = customers.map(customer => ({
      ...customer,
      tags: customer.tags || [],
      addresses: customer.addresses || [],
      ordersCount: customer._count.orders,
      lifetimeValue: customer.totalSpent || 0,
      averageOrderValue: customer.ordersCount > 0 
        ? (customer.totalSpent || 0) / customer.ordersCount 
        : 0
    }));

    return NextResponse.json({
      customers: customersWithMetrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[CUSTOMERS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = createCustomerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

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

    // Check if customer with email already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        storeId: store.id,
        email: validation.data.email
      }
    });

    if (existingCustomer) {
      return apiResponse.badRequest('Customer with this email already exists');
    }

    // Prepare customer data
    const { addresses, tags, taxExemptions, ...customerData } = validation.data;

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        storeId: store.id,
        tags: tags || [],
        addresses: addresses || [],
        taxExemptions: taxExemptions || [],
        ordersCount: 0,
        totalSpent: 0
      }
    });

    // TODO: Send welcome email if enabled and customer accepts marketing

    return NextResponse.json({ 
      message: 'Customer created successfully',
      customer 
    });
  } catch (error) {
    console.error('[CUSTOMERS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { customerId, ...updateData } = await request.json();
    
    if (!customerId) {
      return apiResponse.badRequest('Customer ID is required');
    }

    // Validate input
    const validation = updateCustomerSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

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

    // Check if customer exists
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId: store.id
      }
    });

    if (!customer) {
      return apiResponse.notFound('Customer ');
    }

    // Check if email is being changed and if it's already taken
    if (validation.data.email && validation.data.email !== customer.email) {
      const emailTaken = await prisma.customer.findFirst({
        where: {
          storeId: store.id,
          email: validation.data.email,
          NOT: { id: customerId }
        }
      });

      if (emailTaken) {
        return apiResponse.badRequest('Email is already taken by another customer');
      }
    }

    // Update customer
    const { addresses, tags, taxExemptions, ...customerUpdateData } = validation.data;
    
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...customerUpdateData,
        ...(tags !== undefined && { tags }),
        ...(addresses !== undefined && { addresses }),
        ...(taxExemptions !== undefined && { taxExemptions }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Customer updated successfully',
      customer: updatedCustomer 
    });
  } catch (error) {
    console.error('[CUSTOMERS API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return apiResponse.badRequest('Customer ID is required');
    }

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

    // Check if customer exists and has orders
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId: store.id
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!customer) {
      return apiResponse.notFound('Customer ');
    }

    if (customer._count.orders > 0) {
      return apiResponse.badRequest('Cannot delete customer with existing orders. Archive instead.');
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: customerId }
    });

    return apiResponse.success({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('[CUSTOMERS API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}