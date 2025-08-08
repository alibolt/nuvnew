import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// GET - Get public store details (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    const store = await prisma.store.findUnique({
      where: { subdomain: subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true,
        description: true,
        primaryColor: true,
        email: true,
        phone: true,
        address: true,
        paymentSettings: {
          select: {
            stripeEnabled: true,
            stripePublicKey: true,
            stripeTestMode: true,
            currency: true
          }
        }
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('GET_PUBLIC_STORE_ERROR', error);
    return apiResponse.serverError();
  }
}