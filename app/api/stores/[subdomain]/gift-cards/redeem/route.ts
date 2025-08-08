import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const redeemSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
  amount: z.number().positive('Amount must be positive'),
  orderId: z.string().optional()
});

// POST /api/stores/[subdomain]/gift-cards/redeem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = redeemSchema.safeParse(body);
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
        success: false,
        error: 'Invalid gift card code'
      }, { status: 400 });
    }

    // Check if expired
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Gift card has expired'
      }, { status: 400 });
    }

    // Check if cancelled
    if (giftCard.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Gift card has been cancelled'
      }, { status: 400 });
    }

    // Check if sufficient balance
    if (giftCard.currentBalance < validation.data.amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient gift card balance',
        availableBalance: giftCard.currentBalance
      }, { status: 400 });
    }

    // Create transaction and update balance
    const newBalance = giftCard.currentBalance - validation.data.amount;
    
    const [updatedGiftCard, transaction] = await prisma.$transaction([
      // Update gift card
      prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          currentBalance: newBalance,
          lastUsedAt: new Date(),
          status: newBalance === 0 ? 'used' : 'active'
        }
      }),
      // Create transaction
      prisma.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          orderId: validation.data.orderId,
          amount: -validation.data.amount, // Negative for redemption
          balance: newBalance,
          type: 'redemption',
          description: validation.data.orderId 
            ? `Used for order ${validation.data.orderId}`
            : 'Redeemed'
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      remainingBalance: newBalance,
      transaction: {
        id: transaction.id,
        amount: validation.data.amount,
        remainingBalance: newBalance
      }
    });

  } catch (error) {
    console.error('[GIFT CARDS REDEEM API] Error:', error);
    return apiResponse.serverError();
  }
}