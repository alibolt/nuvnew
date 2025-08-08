import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// POST /api/stores/[storeId]/customers/auth/login
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId,
          email: email.toLowerCase(),
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if customer is active
    if (customer.status !== 'active') {
      return NextResponse.json(
        { error: 'Your account has been disabled' },
        { status: 403 }
      );
    }

    // Verify password
    let storedPassword: string | null = null;
    if (customer.note) {
      try {
        const notesData = JSON.parse(customer.note);
        storedPassword = notesData.password;
      } catch (e) {
        // Notes is not JSON or doesn't contain password
      }
    }

    if (!storedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, storedPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
    console.error('Error logging in customer:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}