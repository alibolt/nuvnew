import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// GET /api/stores/[subdomain]/customers/auth/me
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Get token from cookie
    const token = request.cookies.get('customer-token')?.value;

    if (!token) {
      return apiResponse.unauthorized('Not authenticated');
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return apiResponse.unauthorized('Invalid token');
    }

    // Check if token is for this store
    const store = await prisma.store.findUnique({
      where: { subdomain: subdomain },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    if (decoded.storeId !== store.id) {
      return apiResponse.forbidden('Invalid token for this store');
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            totalPrice: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      return apiResponse.notFound('Customer ');
    }

    // Remove sensitive data
    const { note, ...customerData } = customer;

    return apiResponse.success(customerData);

  } catch (error) {
    return handleApiError(error, 'customer-auth-get');
  }
}

// PUT /api/stores/[subdomain]/customers/auth/me
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Get token from cookie
    const token = request.cookies.get('customer-token')?.value;

    if (!token) {
      return apiResponse.unauthorized('Not authenticated');
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return apiResponse.unauthorized('Invalid token');
    }

    // Check if token is for this store
    const store = await prisma.store.findUnique({
      where: { subdomain: subdomain },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    if (decoded.storeId !== store.id) {
      return apiResponse.forbidden('Invalid token for this store');
    }

    const body = await request.json();
    const { 
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
      acceptsMarketing
    } = body;

    // Update customer data
    const customer = await prisma.customer.update({
      where: { id: decoded.customerId },
      data: {
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        acceptsMarketing,
        updatedAt: new Date(),
      },
    });

    // Remove sensitive data
    const { note, ...customerData } = customer;

    return apiResponse.success(customerData);

  } catch (error) {
    return handleApiError(error, 'customer-auth-update');
  }
}