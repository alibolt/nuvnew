import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// POST /api/stores/[subdomain]/customers/auth/register
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    const { email, password, firstName, lastName, phone, acceptsMarketing } = body;

    // Validate required fields
    if (!email || !password) {
      return apiResponse.badRequest('Email and password are required');
    }

    // Validate password strength
    if (password.length < 6) {
      return apiResponse.badRequest('Password must be at least 6 characters long');
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { subdomain: subdomain },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: email.toLowerCase(),
        },
      },
    });

    if (existingCustomer) {
      return apiResponse.conflict('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
        acceptsMarketing: acceptsMarketing || false,
        storeId: store.id,
        // Store password in notes field temporarily (in production, use a separate table)
        note: JSON.stringify({ password: hashedPassword }),
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer.id, 
        email: customer.email, 
        storeId: customer.storeId 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { note, ...customerData } = customer;

    // Set cookie
    const response = apiResponse.success({
      customer: customerData,
      token,
    });

    response.cookies.set('customer-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error registering customer:', error);
    return handleApiError(error);
  }
}