import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for gift card
const giftCardSchema = z.object({
  initialBalance: z.number().min(0),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
  message: z.string().max(500).optional(),
  expirationDays: z.number().optional(),
});

// Generate unique gift card code
async function generateUniqueGiftCardCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  
  while (attempts < 10) {
    let code = 'GIFT-';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code exists
    const existing = await prisma.giftCard.findUnique({
      where: { code }
    });
    
    if (!existing) return code;
    attempts++;
  }
  
  throw new Error('Failed to generate unique gift card code');
}

// GET - List gift cards
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
    const status = searchParams.get('status'); // active, used, expired
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Build where clause
    const where: any = {
      storeId: store.id
    };

    // Status filter
    if (status) {
      const now = new Date();
      switch (status) {
        case 'active':
          where.status = 'active';
          where.currentBalance = { gt: 0 };
          where.OR = [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ];
          break;
        case 'used':
          where.currentBalance = 0;
          break;
        case 'expired':
          where.expiresAt = { lt: now };
          break;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { recipientEmail: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get gift cards with pagination
    const [giftCards, total] = await prisma.$transaction([
      prisma.giftCard.findMany({
        where,
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.giftCard.count({ where })
    ]);

    return NextResponse.json({
      giftCards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[GIFT CARDS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create gift card
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
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get store settings for defaults
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const giftCardSettings = (storeSettings as any)?.giftCardSettings || {
      expirationDays: 365,
      allowPartialUse: true
    };

    // Generate unique code
    const code = await generateUniqueGiftCardCode();

    // Calculate expiration date
    let expiresAt = null;
    if (validation.data.expirationDays || giftCardSettings.expirationDays) {
      const days = validation.data.expirationDays || giftCardSettings.expirationDays;
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    // Create gift card
    const giftCard = await prisma.giftCard.create({
      data: {
        storeId: store.id,
        code,
        initialBalance: validation.data.initialBalance,
        currentBalance: validation.data.initialBalance,
        currency: store.currency || 'USD',
        recipientEmail: validation.data.recipientEmail,
        recipientName: validation.data.recipientName,
        senderName: validation.data.senderName,
        senderEmail: validation.data.senderEmail,
        message: validation.data.message,
        status: 'active',
        expiresAt,
        activatedAt: new Date()
      }
    });

    // Create initial transaction
    await prisma.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        amount: validation.data.initialBalance,
        balance: validation.data.initialBalance,
        type: 'purchase',
        description: 'Gift card purchased'
      }
    });

    // TODO: Send email notification if recipientEmail is provided

    return NextResponse.json(giftCard, { status: 201 });
  } catch (error) {
    console.error('[GIFT CARDS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// GET /api/stores/[subdomain]/gift-cards/[giftCardId]
export async function GET_BY_ID(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; giftCardId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, giftCardId } = await params;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get gift card
    const giftCard = await prisma.giftCard.findFirst({
      where: {
        id: giftCardId,
        storeId: store.id
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!giftCard) {
      return apiResponse.notFound('Gift card not found');
    }

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error('[GIFT CARDS API] GET_BY_ID Error:', error);
    return apiResponse.serverError();
  }
}