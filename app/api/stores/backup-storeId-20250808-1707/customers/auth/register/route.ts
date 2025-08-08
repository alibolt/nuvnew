import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// POST /api/stores/[storeId]/customers/auth/register
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { email, password, firstName, lastName, phone, acceptsMarketing } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId,
          email: email.toLowerCase(),
        },
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
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
        storeId,
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
    const response = NextResponse.json({
      success: true,
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
    return NextResponse.json(
      { error: 'Failed to register customer' },
      { status: 500 }
    );
  }
}