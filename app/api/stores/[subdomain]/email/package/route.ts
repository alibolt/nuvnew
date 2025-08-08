import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { EMAIL_PLANS } from '@/lib/email/resend-service';

// Schema for email package subscription
const emailSettingsSchema = z.object({
  planId: z.enum(['free', 'starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annually']).default('monthly'),
});

// GET - Get current email package info
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
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const emailPackage = (store.storeSettings?.emailSettings as any)?.package;
    
    // Get current month usage
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const currentUsage = await prisma.emailLog.count({
      where: {
        storeId: store.id,
        status: 'sent',
        createdAt: {
          gte: monthStart
        }
      }
    });

    // Get current plan details
    const currentPlan = emailPackage?.planId 
      ? EMAIL_PLANS[emailPackage.planId.toUpperCase() as keyof typeof EMAIL_PLANS]
      : EMAIL_PLANS.FREE;

    const remainingEmails = currentPlan.monthlyLimit === -1 
      ? -1 
      : Math.max(0, currentPlan.monthlyLimit - currentUsage);

    return NextResponse.json({
      currentPackage: {
        planId: emailPackage?.planId || 'free',
        planName: currentPlan.name,
        isActive: emailPackage?.isActive !== false,
        expiresAt: emailPackage?.expiresAt,
        billingCycle: emailPackage?.billingCycle || 'monthly',
      },
      usage: {
        currentUsage,
        monthlyLimit: currentPlan.monthlyLimit,
        remainingEmails,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      },
      availablePlans: Object.values(EMAIL_PLANS).map(plan => ({
        id: plan.id,
        name: plan.name,
        monthlyLimit: plan.monthlyLimit,
        price: plan.price,
        features: plan.features,
        pricePerEmail: plan.pricePerEmail
      }))
    });

  } catch (error) {
    console.error('Error getting email package:', error);
    return apiResponse.serverError();
  }
}

// POST - Subscribe to email package
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
    const validation = emailSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { planId, billingCycle } = validation.data;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const plan = EMAIL_PLANS[planId.toUpperCase() as keyof typeof EMAIL_PLANS];
    if (!plan) {
      return apiResponse.badRequest('Invalid plan');
    }

    // Calculate expiry date (30 days for monthly, 365 days for annually)
    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Get current settings
    const existingSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Update store settings with new email package
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        emailSettings: {
          ...(existingSettings?.emailSettings as any || {}),
          package: {
            planId: planId,
            planName: plan.name,
            isActive: true,
            subscribedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            billingCycle: billingCycle,
            monthlyLimit: plan.monthlyLimit,
            price: billingCycle === 'monthly' ? plan.price : plan.price * 10, // 2 months free annually
            features: plan.features
          }
        }
      },
      create: {
        storeId: store.id,
        emailSettings: {
          planId: planId,
          planName: plan.name,
          isActive: true,
          subscribedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          billingCycle: billingCycle,
          monthlyLimit: plan.monthlyLimit,
          price: billingCycle === 'monthly' ? plan.price : plan.price * 10,
          features: plan.features
        }
      }
    });

    return NextResponse.json({ 
      message: 'Email package subscribed successfully',
      package: {
        planId,
        planName: plan.name,
        expiresAt: expiresAt.toISOString(),
        billingCycle
      }
    });

  } catch (error) {
    console.error('Error subscribing to email package:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Cancel email package subscription
export async function DELETE(
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
      return apiResponse.notFound('Store ');
    }

    // Update to free plan
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        emailSettings: {
          planId: 'free',
          planName: EMAIL_PLANS.FREE.name,
          isActive: true,
          subscribedAt: new Date().toISOString(),
          expiresAt: null,
          billingCycle: 'monthly',
          monthlyLimit: EMAIL_PLANS.FREE.monthlyLimit,
          price: 0,
          features: EMAIL_PLANS.FREE.features
        }
      },
      create: {
        storeId: store.id,
        emailSettings: {
          planId: 'free',
          planName: EMAIL_PLANS.FREE.name,
          isActive: true,
          subscribedAt: new Date().toISOString(),
          expiresAt: null,
          billingCycle: 'monthly',
          monthlyLimit: EMAIL_PLANS.FREE.monthlyLimit,
          price: 0,
          features: EMAIL_PLANS.FREE.features
        }
      }
    });

    return apiResponse.success({ message: 'Email package cancelled successfully. Reverted to free plan.' });

  } catch (error) {
    console.error('Error cancelling email package:', error);
    return apiResponse.serverError();
  }
}