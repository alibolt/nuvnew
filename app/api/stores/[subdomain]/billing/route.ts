import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for subscription update
const updateSubscriptionSchema = z.object({
  planId: z.string(),
  billingCycle: z.enum(['monthly', 'annually']),
  paymentMethod: z.any().optional()
});

// GET - Get subscription details
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
        subscription: {
          include: {
            plan: true,
            invoices: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 20
            }
          }
        }
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get available plans
    const plans = await prisma.pricingPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        priceMonthly: 'asc'
      }
    });

    return NextResponse.json({
      subscription: store.subscription,
      plans,
      usage: {
        products: await prisma.product.count({ where: { storeId: store.id } }),
        orders: await prisma.order.count({ where: { storeId: store.id } }),
        customers: await prisma.customer.count({ where: { storeId: store.id } }),
        storage: 0 // TODO: Calculate actual storage
      }
    });
  } catch (error) {
    console.error('[BILLING API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create or update subscription
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
    const validation = updateSubscriptionSchema.safeParse(body);
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

    // Get the plan
    const plan = await prisma.pricingPlan.findUnique({
      where: { id: validation.data.planId }
    });

    if (!plan) {
      return apiResponse.notFound('Plan not found');
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (validation.data.billingCycle === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { storeId: store.id },
      update: {
        planId: plan.id,
        billingCycle: validation.data.billingCycle,
        currentPeriodEnd: periodEnd,
        status: 'active',
        paymentMethod: validation.data.paymentMethod
      },
      create: {
        storeId: store.id,
        planId: plan.id,
        billingCycle: validation.data.billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        status: 'active',
        paymentMethod: validation.data.paymentMethod
      },
      include: {
        plan: true
      }
    });

    // TODO: Process payment

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('[BILLING API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Cancel subscription
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
      return apiResponse.notFound('Store not found');
    }

    // Update subscription to cancel at period end
    const subscription = await prisma.subscription.update({
      where: { storeId: store.id },
      data: {
        cancelAtPeriodEnd: true
      }
    });

    return NextResponse.json({
      message: 'Subscription will be cancelled at the end of the current period',
      subscription
    });
  } catch (error) {
    console.error('[BILLING API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}