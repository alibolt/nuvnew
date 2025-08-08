import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { validateSubdomain } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const { valid, error, store } = await validateSubdomain(subdomain, request);
    
    if (!valid || !store) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Get email settings from StoreSettings
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: {
        emailSettings: true
      }
    });

    const emailSettings = settings?.emailSettings || {
      fromEmail: '',
      fromName: store.name || '',
      replyToEmail: '',
      notifications: {
        orderConfirmation: true,
        orderShipped: true,
        orderDelivered: true,
        orderCancelled: true,
        orderRefunded: true,
        customerWelcome: true,
        customerPasswordReset: true,
        abandonedCart: true,
        abandonedCartDelay: 1,
        newOrderAdmin: true,
        lowStockAdmin: true,
        newCustomerAdmin: false
      }
    };

    return NextResponse.json(emailSettings);
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email settings' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const { valid, error, store } = await validateSubdomain(subdomain, request);
    
    if (!valid || !store) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();

    // Update email settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        emailSettings: body
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email settings:', error);
    return NextResponse.json(
      { error: 'Failed to update email settings' }, 
      { status: 500 }
    );
  }
}