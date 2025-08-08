import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for manual recovery
const manualRecoverySchema = z.object({
  sendEmail: z.boolean().default(true),
  emailTemplate: z.string().optional(),
  subject: z.string().optional(),
  includeDiscount: z.boolean().default(false),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  discountCode: z.string().optional(),
  expiryDays: z.number().min(1).max(30).default(7),
  customMessage: z.string().optional()
});

// POST - Send recovery email for specific cart
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; cartId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, cartId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = manualRecoverySchema.safeParse(body);
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

    // Get abandoned cart
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const abandonedCarts = (storeSettings?.abandonedCarts as any[]) || [];
    const cartIndex = abandonedCarts.findIndex(cart => cart.id === cartId);

    if (cartIndex === -1) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const cart = abandonedCarts[cartIndex];

    // Check if cart has email
    if (!cart.email) {
      return NextResponse.json({ 
        error: 'Cannot send recovery email - no email address available' 
      }, { status: 400 });
    }

    // Check if cart is already recovered
    if (cart.status === 'recovered') {
      return NextResponse.json({ 
        error: 'Cart has already been recovered' 
      }, { status: 400 });
    }

    // Generate recovery URL
    const recoveryToken = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = store.customDomain 
      ? `https://${store.customDomain}`
      : `https://${store.subdomain}.nuvi.com`;
    const recoveryUrl = `${baseUrl}/cart/recover/${recoveryToken}`;

    // Generate discount code if needed
    let discountInfo = null;
    if (validation.data.includeDiscount) {
      discountInfo = {
        code: validation.data.discountCode || `SAVE${validation.data.discountValue}`,
        type: validation.data.discountType || 'percentage',
        value: validation.data.discountValue || 10,
        expiryDate: new Date(Date.now() + validation.data.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      };

      // TODO: Create actual discount code in the system
    }

    // Prepare email data
    const emailData = {
      to: cart.email,
      subject: validation.data.subject || `Complete your purchase at ${store.name}`,
      template: validation.data.emailTemplate || 'abandoned_cart_recovery',
      data: {
        storeName: store.name,
        customerName: cart.billingAddress?.firstName || 'Valued Customer',
        cartItems: cart.items,
        cartTotal: cart.estimatedTotal,
        currency: cart.currency,
        recoveryUrl,
        discount: discountInfo,
        customMessage: validation.data.customMessage,
        expiryHours: 48 // Recovery link expires in 48 hours
      }
    };

    // Record recovery attempt
    const recoveryAttempt = {
      id: `attempt_${Date.now()}`,
      sentAt: new Date().toISOString(),
      recoveryToken,
      emailSent: validation.data.sendEmail,
      discount: discountInfo,
      sentBy: session.user.email,
      opened: false,
      clicked: false,
      converted: false
    };

    // Update cart with recovery attempt
    abandonedCarts[cartIndex] = {
      ...cart,
      recoveryAttempts: [...(cart.recoveryAttempts || []), recoveryAttempt],
      lastRecoveryAttempt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { abandonedCarts }
    });

    // TODO: Actually send the email using email service
    // await sendEmail(emailData);

    return NextResponse.json({ 
      message: 'Recovery email sent successfully',
      recoveryAttempt: {
        ...recoveryAttempt,
        recoveryUrl
      }
    });
  } catch (error) {
    console.error('[CART RECOVERY API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET - Get recovery status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; cartId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, cartId } = await params;

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

    // Get abandoned cart
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const abandonedCarts = (storeSettings?.abandonedCarts as any[]) || [];
    const cart = abandonedCarts.find(c => c.id === cartId);

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // Calculate recovery metrics
    const recoveryAttempts = cart.recoveryAttempts || [];
    const lastAttempt = recoveryAttempts[recoveryAttempts.length - 1];

    const recoveryStatus = {
      cartId: cart.id,
      status: cart.status,
      recovered: cart.recovered,
      recoveredAt: cart.recoveredAt,
      orderId: cart.orderId,
      attemptCount: recoveryAttempts.length,
      lastAttemptAt: lastAttempt?.sentAt,
      emailOpened: recoveryAttempts.some((a: any) => a.opened),
      linkClicked: recoveryAttempts.some((a: any) => a.clicked),
      attempts: recoveryAttempts.map((attempt: any) => ({
        sentAt: attempt.sentAt,
        opened: attempt.opened,
        openedAt: attempt.openedAt,
        clicked: attempt.clicked,
        clickedAt: attempt.clickedAt,
        converted: attempt.converted,
        hasDiscount: !!attempt.discount
      }))
    };

    return NextResponse.json({ recoveryStatus });
  } catch (error) {
    console.error('[CART RECOVERY API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}