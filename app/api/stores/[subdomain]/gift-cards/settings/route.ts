import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const giftCardSettingsSchema = z.object({
  enabled: z.boolean(),
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  defaultAmounts: z.array(z.number()),
  expirationDays: z.number().min(0),
  allowPartialUse: z.boolean()
});

// GET /api/stores/[subdomain]/gift-cards/settings
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

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const giftCardSettings = (storeSettings?.giftCardSettings as any) || {
      enabled: false,
      minAmount: 10,
      maxAmount: 500,
      defaultAmounts: [25, 50, 100, 250],
      expirationDays: 365,
      allowPartialUse: true
    };

    return NextResponse.json(giftCardSettings);
  } catch (error) {
    console.error('[GIFT CARDS SETTINGS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT /api/stores/[subdomain]/gift-cards/settings
export async function PUT(
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
    const validation = giftCardSettingsSchema.safeParse(body);
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

    // Update or create store settings
    const storeSettings = await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        giftCardSettings: validation.data
      },
      update: {
        giftCardSettings: validation.data
      }
    });

    return NextResponse.json((storeSettings.giftCardSettings as any) || validation.data);
  } catch (error) {
    console.error('[GIFT CARDS SETTINGS API] PUT Error:', error);
    return apiResponse.serverError();
  }
}