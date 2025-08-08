import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET - Get email statistics for admin dashboard
export async function GET(request: NextRequest) {
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

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total stores
    const totalStores = await prisma.store.count();

    // Get active subscriptions (stores with paid email packages)
    const activeSubscriptions = await prisma.storeSettings.count({
      where: {
        emailSettings: {
          path: '$.isActive',
          equals: true
        }
      }
    });

    // Get all store settings with email packages
    const storeSettings = await prisma.storeSettings.findMany({
      where: {
        emailSettings: {
          not: Prisma.JsonNull
        }
      },
      select: {
        emailSettings: true
      }
    });

    // Calculate total revenue and plan distribution
    let totalRevenue = 0;
    const planDistribution: Record<string, number> = {
      free: 0,
      starter: 0,
      professional: 0,
      enterprise: 0
    };

    storeSettings.forEach(setting => {
      const emailPackage = setting.emailSettings as any;
      if (emailPackage) {
        const planId = emailPackage.planId || 'free';
        planDistribution[planId] = (planDistribution[planId] || 0) + 1;
        
        if (emailPackage.isActive && emailPackage.price) {
          totalRevenue += emailPackage.price;
        }
      }
    });

    // Get total emails sent this month
    const totalEmailsSent = await prisma.emailLog.count({
      where: {
        status: 'sent',
        createdAt: {
          gte: monthStart
        }
      }
    });

    // Get monthly email stats for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const emailCount = await prisma.emailLog.count({
        where: {
          status: 'sent',
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      });

      monthlyStats.push({
        month: date.toISOString().substr(0, 7), // YYYY-MM format
        emails: emailCount
      });
    }

    // Get plan distribution with percentages
    const planDistributionWithPercentages = Object.entries(planDistribution).map(([plan, count]) => ({
      plan,
      count,
      percentage: totalStores > 0 ? (count / totalStores) * 100 : 0
    }));

    // Get top stores by email usage this month
    const topStores = await prisma.emailLog.groupBy({
      by: ['storeId'],
      where: {
        status: 'sent',
        createdAt: {
          gte: monthStart
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get store details for top stores
    const topStoresWithDetails = await Promise.all(
      topStores.map(async (store) => {
        const storeDetails = await prisma.store.findUnique({
          where: { id: store.storeId },
          select: { name: true, subdomain: true }
        });
        return {
          storeId: store.storeId,
          storeName: storeDetails?.name || 'Unknown',
          subdomain: storeDetails?.subdomain || 'unknown',
          emailCount: store._count.id
        };
      })
    );

    // Get recent email activity (last 50 emails)
    const recentActivity = await prisma.emailLog.findMany({
      take: 50,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        store: {
          select: {
            name: true,
            subdomain: true
          }
        }
      }
    });

    const recentActivityFormatted = recentActivity.map(log => ({
      id: log.id,
      storeName: log.store.name,
      subdomain: log.store.subdomain,
      to: log.to,
      subject: log.subject,
      status: log.status,
      createdAt: log.createdAt.toISOString()
    }));

    return NextResponse.json({
      totalStores,
      activeSubscriptions,
      totalRevenue,
      totalEmailsSent,
      planDistribution,
      planDistributionWithPercentages,
      monthlyStats,
      topStores: topStoresWithDetails,
      recentActivity: recentActivityFormatted,
      generatedAt: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching email stats:', error);
    return apiResponse.serverError();
  }
}