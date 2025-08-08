import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for recording discount usage
const recordUsageSchema = z.object({
  discountId: z.string(),
  orderId: z.string(),
  customerId: z.string().optional(),
  discountAmount: z.number().min(0),
  originalAmount: z.number().min(0),
  currency: z.string().default('USD'),
  appliedAt: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    discountApplied: z.number().min(0)
  })).optional()
});

// Schema for bulk usage analytics request
const usageAnalyticsSchema = z.object({
  discountIds: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.string(),
    to: z.string()
  }).optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  metrics: z.array(z.enum(['usage', 'savings', 'orders', 'customers'])).default(['usage', 'savings'])
});

// POST - Record discount usage
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
    const validation = recordUsageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid usage data',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const { discountId, orderId, customerId, discountAmount, originalAmount, currency, items } = validation.data;

    // Get current discounts
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const discounts = (storeSettings?.discounts as any[]) || [];
    const discountIndex = discounts.findIndex(d => d.id === discountId);

    if (discountIndex === -1) {
      return apiResponse.notFound('Discount ');
    }

    const discount = discounts[discountIndex];

    // Create usage record
    const usageRecord = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      customerId,
      discountAmount,
      originalAmount,
      currency,
      appliedAt: validation.data.appliedAt || new Date().toISOString(),
      items: items || [],
      recordedAt: new Date().toISOString(),
      recordedBy: session.user.email
    };

    // Update discount with new usage
    const updatedDiscount = {
      ...discount,
      currentUsage: (discount.currentUsage || 0) + 1,
      totalSavings: (discount.totalSavings || 0) + discountAmount,
      totalOrderValue: (discount.totalOrderValue || 0) + originalAmount,
      customerUsage: {
        ...discount.customerUsage,
        ...(customerId && {
          [customerId]: (discount.customerUsage?.[customerId] || 0) + 1
        })
      },
      lastUsed: new Date().toISOString(),
      usageHistory: [...(discount.usageHistory || []), usageRecord]
    };

    // Update discount in array
    discounts[discountIndex] = updatedDiscount;

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { discounts }
    });

    return NextResponse.json({
      message: 'Discount usage recorded successfully',
      usage: {
        discountId,
        orderId,
        discountAmount,
        currentUsage: updatedDiscount.currentUsage,
        remainingUses: discount.usageLimit ? 
          Math.max(0, discount.usageLimit - updatedDiscount.currentUsage) : null
      }
    });
  } catch (error) {
    console.error('[DISCOUNT USAGE API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// GET - Get discount usage analytics
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
    
    const discountId = searchParams.get('discountId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const groupBy = (searchParams.get('groupBy') as 'day' | 'week' | 'month') || 'day';

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const discounts = (storeSettings?.discounts as any[]) || [];

    if (discountId) {
      // Get analytics for specific discount
      const discount = discounts.find(d => d.id === discountId);
      
      if (!discount) {
        return apiResponse.notFound('Discount ');
      }

      let usageHistory = discount.usageHistory || [];

      // Apply date filters
      if (dateFrom || dateTo) {
        usageHistory = usageHistory.filter((usage: any) => {
          const usageDate = new Date(usage.appliedAt);
          if (dateFrom && usageDate < new Date(dateFrom)) return false;
          if (dateTo && usageDate > new Date(dateTo)) return false;
          return true;
        });
      }

      // Group usage data
      const groupedUsage = groupUsageData(usageHistory, groupBy);

      // Calculate detailed analytics
      const analytics = {
        totalUsage: usageHistory.length,
        totalSavings: usageHistory.reduce((sum: number, u: any) => sum + u.discountAmount, 0),
        totalOrderValue: usageHistory.reduce((sum: number, u: any) => sum + u.originalAmount, 0),
        uniqueCustomers: new Set(usageHistory.filter((u: any) => u.customerId).map((u: any) => u.customerId)).size,
        averageDiscount: usageHistory.length > 0 ? 
          usageHistory.reduce((sum: number, u: any) => sum + u.discountAmount, 0) / usageHistory.length : 0,
        averageOrderValue: usageHistory.length > 0 ? 
          usageHistory.reduce((sum: number, u: any) => sum + u.originalAmount, 0) / usageHistory.length : 0,
        conversionRate: discount.views > 0 ? (usageHistory.length / discount.views * 100) : 0,
        usageByPeriod: groupedUsage,
        topCustomers: getTopCustomers(usageHistory),
        peakUsageDays: getPeakUsageDays(usageHistory),
        recentUsage: usageHistory
          .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
          .slice(0, 10)
      };

      return NextResponse.json({
        discount: {
          id: discount.id,
          code: discount.code,
          name: discount.name,
          type: discount.type,
          status: discount.status
        },
        analytics
      });
    } else {
      // Get analytics for all discounts
      const overallAnalytics = {
        totalDiscounts: discounts.length,
        activeDiscounts: discounts.filter(d => d.status === 'active').length,
        totalUsage: discounts.reduce((sum, d) => sum + (d.currentUsage || 0), 0),
        totalSavings: discounts.reduce((sum, d) => sum + (d.totalSavings || 0), 0),
        totalOrderValue: discounts.reduce((sum, d) => sum + (d.totalOrderValue || 0), 0),
        averageSavingsPerOrder: 0,
        topPerformingDiscounts: discounts
          .filter(d => d.currentUsage > 0)
          .sort((a, b) => (b.currentUsage || 0) - (a.currentUsage || 0))
          .slice(0, 10)
          .map(d => ({
            id: d.id,
            code: d.code,
            name: d.name,
            type: d.type,
            usage: d.currentUsage,
            savings: d.totalSavings,
            conversionRate: d.views > 0 ? ((d.currentUsage / d.views) * 100) : 0
          })),
        leastPerformingDiscounts: discounts
          .filter(d => d.status === 'active' && (d.views || 0) > 10)
          .sort((a, b) => {
            const aConversion = a.views > 0 ? (a.currentUsage / a.views) : 0;
            const bConversion = b.views > 0 ? (b.currentUsage / b.views) : 0;
            return aConversion - bConversion;
          })
          .slice(0, 5)
          .map(d => ({
            id: d.id,
            code: d.code,
            name: d.name,
            views: d.views,
            usage: d.currentUsage,
            conversionRate: d.views > 0 ? ((d.currentUsage / d.views) * 100) : 0
          })),
        usageByType: discounts.reduce((acc, d) => {
          if (!acc[d.type]) {
            acc[d.type] = { count: 0, usage: 0, savings: 0 };
          }
          acc[d.type].count++;
          acc[d.type].usage += d.currentUsage || 0;
          acc[d.type].savings += d.totalSavings || 0;
          return acc;
        }, {}),
        monthlyTrends: getMonthlyTrends(discounts)
      };

      // Calculate average savings per order
      if (overallAnalytics.totalUsage > 0) {
        overallAnalytics.averageSavingsPerOrder = overallAnalytics.totalSavings / overallAnalytics.totalUsage;
      }

      return apiResponse.success({ analytics: overallAnalytics });
    }
  } catch (error) {
    console.error('[DISCOUNT USAGE API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// Helper function to group usage data by time period
function groupUsageData(usageHistory: any[], groupBy: 'day' | 'week' | 'month') {
  const grouped: any = {};
  
  usageHistory.forEach(usage => {
    const date = new Date(usage.appliedAt);
    let key: string;
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        const week = getWeekNumber(date);
        key = `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        usage: 0,
        savings: 0,
        orderValue: 0,
        customers: new Set()
      };
    }
    
    grouped[key].usage++;
    grouped[key].savings += usage.discountAmount;
    grouped[key].orderValue += usage.originalAmount;
    if (usage.customerId) {
      grouped[key].customers.add(usage.customerId);
    }
  });
  
  // Convert to array and add customer count
  return Object.values(grouped).map((period: any) => ({
    ...period,
    uniqueCustomers: period.customers.size,
    customers: undefined // Remove Set object
  }));
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Helper function to get top customers
function getTopCustomers(usageHistory: any[]) {
  const customerStats: any = {};
  
  usageHistory.forEach(usage => {
    if (usage.customerId) {
      if (!customerStats[usage.customerId]) {
        customerStats[usage.customerId] = {
          customerId: usage.customerId,
          usage: 0,
          savings: 0,
          orderValue: 0
        };
      }
      
      customerStats[usage.customerId].usage++;
      customerStats[usage.customerId].savings += usage.discountAmount;
      customerStats[usage.customerId].orderValue += usage.originalAmount;
    }
  });
  
  return Object.values(customerStats)
    .sort((a: any, b: any) => b.savings - a.savings)
    .slice(0, 10);
}

// Helper function to get peak usage days
function getPeakUsageDays(usageHistory: any[]) {
  const dailyUsage: any = {};
  
  usageHistory.forEach(usage => {
    const date = new Date(usage.appliedAt).toISOString().split('T')[0];
    if (!dailyUsage[date]) {
      dailyUsage[date] = 0;
    }
    dailyUsage[date]++;
  });
  
  return Object.entries(dailyUsage)
    .map(([date, count]) => ({ date, usage: count }))
    .sort((a: any, b: any) => b.usage - a.usage)
    .slice(0, 10);
}

// Helper function to get monthly trends
function getMonthlyTrends(discounts: any[]) {
  const trends = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    let monthlyUsage = 0;
    let monthlySavings = 0;
    
    discounts.forEach(discount => {
      const history = discount.usageHistory || [];
      history.forEach((usage: any) => {
        const usageDate = new Date(usage.appliedAt);
        const usageMonthKey = `${usageDate.getFullYear()}-${(usageDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (usageMonthKey === monthKey) {
          monthlyUsage++;
          monthlySavings += usage.discountAmount;
        }
      });
    });
    
    trends.push({
      month: monthKey,
      usage: monthlyUsage,
      savings: monthlySavings
    });
  }
  
  return trends;
}