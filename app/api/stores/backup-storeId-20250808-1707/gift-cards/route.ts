import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for gift card
const giftCardSchema = z.object({
  code: z.string().min(8).max(20).optional(), // Auto-generate if not provided
  initialBalance: z.number().min(0),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  senderName: z.string().optional(),
  message: z.string().max(500).optional(),
  expiresAt: z.string().datetime().optional(),
  sendAt: z.string().datetime().optional(), // Schedule sending
});

// Generate unique gift card code
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - List gift cards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, used, expired
    const search = searchParams.get('search');
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get gift cards from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let giftCards = storeSettings?.giftCards as any[] || [];

    // Search filter
    if (search) {
      giftCards = giftCards.filter(card => 
        card.code.toLowerCase().includes(search.toLowerCase()) ||
        card.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
        card.recipientName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (status) {
      const now = new Date();
      giftCards = giftCards.filter(card => {
        const expiresAt = card.expiresAt ? new Date(card.expiresAt) : null;
        const isExpired = expiresAt && expiresAt < now;
        const isUsed = card.currentBalance === 0;
        
        switch (status) {
          case 'active':
            return !isExpired && !isUsed && card.status === 'active';
          case 'used':
            return isUsed;
          case 'expired':
            return isExpired;
          default:
            return true;
        }
      });
    }

    return NextResponse.json({ giftCards });
  } catch (error) {
    console.error('[GIFT CARDS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create gift card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = giftCardSchema.safeParse(body);
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
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current gift cards
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const giftCards = storeSettings?.giftCards as any[] || [];

    // Generate unique code if not provided
    let code = validation.data.code;
    if (!code) {
      do {
        code = generateGiftCardCode();
      } while (giftCards.some(card => card.code === code));
    } else {
      // Check for duplicate code
      const existingCard = giftCards.find(card => card.code === code);
      if (existingCard) {
        return NextResponse.json({ 
          error: 'A gift card with this code already exists' 
        }, { status: 400 });
      }
    }

    // Create new gift card
    const newGiftCard = {
      id: `giftcard_${Date.now()}`,
      code,
      initialBalance: validation.data.initialBalance,
      currentBalance: validation.data.initialBalance,
      recipientEmail: validation.data.recipientEmail,
      recipientName: validation.data.recipientName,
      senderName: validation.data.senderName,
      message: validation.data.message,
      expiresAt: validation.data.expiresAt,
      sendAt: validation.data.sendAt,
      status: validation.data.sendAt && new Date(validation.data.sendAt) > new Date() 
        ? 'scheduled' 
        : 'active',
      createdAt: new Date().toISOString(),
      createdBy: session.user.email,
      usageHistory: []
    };

    // Add to gift cards
    giftCards.push(newGiftCard);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        giftCards
      },
      create: {
        storeId: store.id,
        giftCards
      }
    });

    // TODO: If recipientEmail is provided and sendAt is null/past, send email immediately

    return NextResponse.json({ 
      message: 'Gift card created successfully',
      giftCard: newGiftCard 
    });
  } catch (error) {
    console.error('[GIFT CARDS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update gift card balance (for refunds/adjustments)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { giftCardId, adjustment, reason } = await request.json();
    
    if (!giftCardId || typeof adjustment !== 'number') {
      return NextResponse.json({ 
        error: 'Gift card ID and adjustment amount are required' 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get gift cards
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const giftCards = storeSettings?.giftCards as any[] || [];
    const cardIndex = giftCards.findIndex(card => card.id === giftCardId);

    if (cardIndex === -1) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 });
    }

    const card = giftCards[cardIndex];
    const newBalance = card.currentBalance + adjustment;

    if (newBalance < 0) {
      return NextResponse.json({ 
        error: 'Gift card balance cannot be negative' 
      }, { status: 400 });
    }

    // Update gift card
    giftCards[cardIndex] = {
      ...card,
      currentBalance: newBalance,
      updatedAt: new Date().toISOString(),
      usageHistory: [
        ...card.usageHistory,
        {
          type: adjustment > 0 ? 'refund' : 'adjustment',
          amount: Math.abs(adjustment),
          balance: newBalance,
          reason,
          performedBy: session.user.email,
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        giftCards
      }
    });

    return NextResponse.json({ 
      message: 'Gift card balance updated successfully',
      giftCard: giftCards[cardIndex]
    });
  } catch (error) {
    console.error('[GIFT CARDS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Deactivate gift card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const giftCardId = searchParams.get('giftCardId');
    
    if (!giftCardId) {
      return NextResponse.json({ error: 'Gift card ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get gift cards
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const giftCards = storeSettings?.giftCards as any[] || [];
    const cardIndex = giftCards.findIndex(card => card.id === giftCardId);

    if (cardIndex === -1) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 });
    }

    // Deactivate instead of delete (for audit trail)
    giftCards[cardIndex] = {
      ...giftCards[cardIndex],
      status: 'deactivated',
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: session.user.email
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        giftCards
      }
    });

    return NextResponse.json({ 
      message: 'Gift card deactivated successfully'
    });
  } catch (error) {
    console.error('[GIFT CARDS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}