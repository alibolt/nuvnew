import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().min(1, 'Gift card code is required')
});

// POST /api/stores/[subdomain]/gift-cards/validate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = validateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Find gift card
    const giftCard = await prisma.giftCard.findFirst({
      where: {
        code: validation.data.code.toUpperCase(),
        storeId: store.id
      }
    });

    if (!giftCard) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid gift card code'
      });
    }

    // Check if expired
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Gift card has expired'
      });
    }

    // Check if cancelled
    if (giftCard.status === 'cancelled') {
      return NextResponse.json({
        valid: false,
        error: 'Gift card has been cancelled'
      });
    }

    // Check balance
    if (giftCard.currentBalance <= 0) {
      return NextResponse.json({
        valid: false,
        error: 'Gift card has no remaining balance'
      });
    }

    return NextResponse.json({
      valid: true,
      balance: giftCard.currentBalance,
      currency: giftCard.currency,
      expiresAt: giftCard.expiresAt
    });

  } catch (error) {
    console.error('[GIFT CARDS VALIDATE API] Error:', error);
    return apiResponse.serverError();
  }
}