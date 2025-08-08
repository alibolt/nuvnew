import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// GET /api/stores/[storeId]/customers/auth/me
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    
    // Get token from cookie
    const token = request.cookies.get('customer-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is for this store
    if (decoded.storeId !== storeId) {
      return NextResponse.json(
        { error: 'Invalid token for this store' },
        { status: 403 }
      );
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
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { note, ...customerData } = customer;

    return NextResponse.json({
      success: true,
      customer: customerData,
    });

  } catch (error) {
    console.error('Error getting customer data:', error);
    return NextResponse.json(
      { error: 'Failed to get customer data' },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[storeId]/customers/auth/me
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    
    // Get token from cookie
    const token = request.cookies.get('customer-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is for this store
    if (decoded.storeId !== storeId) {
      return NextResponse.json(
        { error: 'Invalid token for this store' },
        { status: 403 }
      );
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

    return NextResponse.json({
      success: true,
      customer: customerData,
    });

  } catch (error) {
    console.error('Error updating customer data:', error);
    return NextResponse.json(
      { error: 'Failed to update customer data' },
      { status: 500 }
    );
  }
}