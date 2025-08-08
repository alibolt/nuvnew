import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { EMAIL_PLANS } from '@/lib/email/resend-service';

// GET - Get all email packages for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Check if user is admin (you might want to add proper role checking)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return apiResponse.forbidden();
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const plan = url.searchParams.get('plan') || 'all';
    const status = url.searchParams.get('status') || 'all';

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get stores with their email packages
    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        storeSettings: {
          select: { emailSettings: true }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Get current month for usage calculation
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get email usage for all stores
    const storeIds = stores.map(store => store.id);
    const emailUsage = await prisma.emailLog.groupBy({
      by: ['storeId'],
      where: {
        storeId: { in: storeIds },
        status: 'sent',
        createdAt: { gte: monthStart }
      },
      _count: { id: true }
    });

    // Create usage map
    const usageMap = emailUsage.reduce((acc, usage) => {
      acc[usage.storeId] = usage._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Transform data for frontend
    const packages = stores.map(store => {
      const emailPackage = (store.storeSettings as any)?.emailSettings as any;
      const currentPlan = emailPackage?.planId 
        ? EMAIL_PLANS[emailPackage.planId.toUpperCase() as keyof typeof EMAIL_PLANS]
        : EMAIL_PLANS.FREE;

      const currentUsage = usageMap[store.id] || 0;
      const remainingEmails = currentPlan.monthlyLimit === -1 
        ? -1 
        : Math.max(0, currentPlan.monthlyLimit - currentUsage);
      
      const usagePercentage = currentPlan.monthlyLimit === -1 
        ? 0 
        : (currentUsage / currentPlan.monthlyLimit) * 100;

      return {
        storeId: store.id,
        storeName: store.name,
        subdomain: store.subdomain,
        planId: emailPackage?.planId || 'free',
        planName: currentPlan.name,
        monthlyLimit: currentPlan.monthlyLimit,
        currentUsage,
        remainingEmails,
        isActive: emailPackage?.isActive !== false,
        subscribedAt: emailPackage?.subscribedAt || store.createdAt.toISOString(),
        expiresAt: emailPackage?.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        billingCycle: emailPackage?.billingCycle || 'monthly',
        price: emailPackage?.price || 0,
        usagePercentage
      };
    });

    // Apply filters
    let filteredPackages = packages;

    if (plan !== 'all') {
      filteredPackages = filteredPackages.filter(pkg => pkg.planId === plan);
    }

    if (status !== 'all') {
      filteredPackages = filteredPackages.filter(pkg => {
        const isExpired = new Date(pkg.expiresAt) < now;
        switch (status) {
          case 'active':
            return pkg.isActive && !isExpired;
          case 'expired':
            return isExpired;
          case 'inactive':
            return !pkg.isActive;
          default:
            return true;
        }
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.store.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      packages: filteredPackages,
      currentPage: page,
      totalPages,
      totalCount,
    });

  } catch (error) {
    console.error('Error fetching email packages:', error);
    return apiResponse.serverError();
  }
}

// POST - Update email package for a store (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return apiResponse.forbidden();
    }

    const { storeId, planId, billingCycle, expiresAt, isActive } = await request.json();

    const plan = EMAIL_PLANS[planId.toUpperCase() as keyof typeof EMAIL_PLANS];
    if (!plan) {
      return apiResponse.badRequest('Invalid plan');
    }

    // Update store email package
    await prisma.storeSettings.upsert({
      where: { storeId },
      update: {
        emailSettings: {
          planId,
          planName: plan.name,
          isActive,
          subscribedAt: new Date().toISOString(),
          expiresAt,
          billingCycle,
          monthlyLimit: plan.monthlyLimit,
          price: billingCycle === 'monthly' ? plan.price : plan.price * 10,
          features: plan.features
        }
      },
      create: {
        storeId,
        emailSettings: {
          planId,
          planName: plan.name,
          isActive,
          subscribedAt: new Date().toISOString(),
          expiresAt,
          billingCycle,
          monthlyLimit: plan.monthlyLimit,
          price: billingCycle === 'monthly' ? plan.price : plan.price * 10,
          features: plan.features
        }
      }
    });

    return NextResponse.json({ 
      message: 'Email package updated successfully',
      package: {
        planId,
        planName: plan.name,
        expiresAt,
        billingCycle,
        isActive
      }
    });

  } catch (error) {
    console.error('Error updating email package:', error);
    return apiResponse.serverError();
  }
}