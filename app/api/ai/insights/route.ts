import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Generate AI-powered insights for the dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Fetch comprehensive analytics data
    const insights = await generateInsights(store.id);
    
    return NextResponse.json(insights);
  } catch (error: any) {
    console.error('[AI Insights] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

async function generateInsights(storeId: string) {
  // Get date ranges
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekAgo = new Date(todayStart);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(todayStart);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const yearAgo = new Date(todayStart);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  // Fetch all necessary data in parallel
  const [
    // Basic counts
    totalProducts,
    activeProducts,
    totalOrders,
    totalCustomers,
    totalCategories,
    
    // Today's metrics
    todayOrders,
    todayRevenue,
    todayCustomers,
    
    // Yesterday's metrics (for comparison)
    yesterdayOrders,
    yesterdayRevenue,
    yesterdayCustomers,
    
    // Week metrics
    weekOrders,
    weekRevenue,
    
    // Month metrics
    monthOrders,
    monthRevenue,
    
    // Product performance
    topProducts,
    lowStockProducts,
    outOfStockProducts,
    
    // Customer insights
    topCustomers,
    repeatCustomers,
    
    // Category performance
    categoryPerformance,
    
    // Recent activity
    recentOrders,
  ] = await Promise.all([
    // Basic counts
    prisma.product.count({ where: { storeId } }),
    prisma.product.count({ where: { storeId, isActive: true } }),
    prisma.order.count({ where: { storeId } }),
    prisma.customer.count({ where: { storeId } }),
    prisma.category.count({ where: { storeId } }),
    
    // Today's metrics
    prisma.order.count({
      where: { storeId, createdAt: { gte: todayStart } }
    }),
    prisma.order.aggregate({
      where: { storeId, createdAt: { gte: todayStart }, status: { not: 'cancelled' } },
      _sum: { totalPrice: true }
    }),
    prisma.customer.count({
      where: { storeId, createdAt: { gte: todayStart } }
    }),
    
    // Yesterday's metrics
    prisma.order.count({
      where: { 
        storeId, 
        createdAt: { gte: yesterdayStart, lt: todayStart } 
      }
    }),
    prisma.order.aggregate({
      where: { 
        storeId, 
        createdAt: { gte: yesterdayStart, lt: todayStart },
        status: { not: 'cancelled' }
      },
      _sum: { totalPrice: true }
    }),
    prisma.customer.count({
      where: { 
        storeId, 
        createdAt: { gte: yesterdayStart, lt: todayStart } 
      }
    }),
    
    // Week metrics
    prisma.order.count({
      where: { storeId, createdAt: { gte: weekAgo } }
    }),
    prisma.order.aggregate({
      where: { storeId, createdAt: { gte: weekAgo }, status: { not: 'cancelled' } },
      _sum: { totalPrice: true }
    }),
    
    // Month metrics
    prisma.order.count({
      where: { storeId, createdAt: { gte: monthAgo } }
    }),
    prisma.order.aggregate({
      where: { storeId, createdAt: { gte: monthAgo }, status: { not: 'cancelled' } },
      _sum: { totalPrice: true }
    }),
    
    // Top selling products (last 30 days)
    prisma.orderLineItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          storeId,
          createdAt: { gte: monthAgo },
          status: { not: 'cancelled' }
        }
      },
      _count: { productId: true },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 5
    }),
    
    // Low stock products
    prisma.productVariant.findMany({
      where: {
        product: { storeId },
        stock: { gt: 0, lte: 5 }
      },
      include: {
        product: { select: { name: true, id: true } }
      },
      orderBy: { stock: 'asc' },
      take: 10
    }),
    
    // Out of stock products
    prisma.productVariant.count({
      where: {
        product: { storeId },
        stock: 0
      }
    }),
    
    // Top customers (by order value)
    prisma.order.groupBy({
      by: ['customerId'],
      where: {
        storeId,
        status: { not: 'cancelled' }
      },
      _sum: { totalPrice: true },
      _count: { customerId: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 5
    }),
    
    // Repeat customers
    prisma.order.groupBy({
      by: ['customerId'],
      where: { storeId },
      having: {
        customerId: { _count: { gt: 1 } }
      },
      _count: { customerId: true }
    }),
    
    // Category performance
    prisma.product.groupBy({
      by: ['categoryId'],
      where: { storeId, categoryId: { not: null } },
      _count: { categoryId: true }
    }),
    
    // Recent orders
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: { select: { email: true, firstName: true, lastName: true } },
        lineItems: { select: { quantity: true, totalPrice: true } }
      }
    })
  ]);

  // Get product details for top products
  const topProductIds = topProducts.map(p => p.productId).filter(Boolean);
  const productDetails = topProductIds.length > 0 ? await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, slug: true }
  }) : [];

  // Get customer details for top customers
  const topCustomerIds = topCustomers.map(c => c.customerId).filter(Boolean);
  const customerDetails = topCustomerIds.length > 0 ? await prisma.customer.findMany({
    where: { id: { in: topCustomerIds } },
    select: { id: true, email: true, firstName: true, lastName: true }
  }) : [];

  // Get category details
  const categoryIds = categoryPerformance.map(c => c.categoryId).filter(Boolean);
  const categoryDetails = categoryIds.length > 0 ? await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true }
  }) : [];

  // Calculate metrics and trends
  const todayRevenueValue = todayRevenue._sum.totalPrice || 0;
  const yesterdayRevenueValue = yesterdayRevenue._sum.totalPrice || 0;
  const weekRevenueValue = weekRevenue._sum.totalPrice || 0;
  const monthRevenueValue = monthRevenue._sum.totalPrice || 0;

  // Calculate growth rates
  const orderGrowth = yesterdayOrders > 0 
    ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1)
    : todayOrders > 0 ? '100' : '0';
    
  const revenueGrowth = yesterdayRevenueValue > 0
    ? ((todayRevenueValue - yesterdayRevenueValue) / yesterdayRevenueValue * 100).toFixed(1)
    : todayRevenueValue > 0 ? '100' : '0';
    
  const customerGrowth = yesterdayCustomers > 0
    ? ((todayCustomers - yesterdayCustomers) / yesterdayCustomers * 100).toFixed(1)
    : todayCustomers > 0 ? '100' : '0';

  // Calculate conversion rate
  const conversionRate = totalCustomers > 0 
    ? ((totalOrders / totalCustomers) * 100).toFixed(2)
    : '0';

  // Average order value
  const averageOrderValue = totalOrders > 0
    ? (monthRevenueValue / monthOrders).toFixed(2)
    : '0';

  // Generate AI recommendations based on data
  const recommendations = generateRecommendations({
    totalProducts,
    activeProducts,
    totalOrders,
    totalCustomers,
    lowStockProducts,
    outOfStockProducts,
    todayOrders,
    weekOrders,
    repeatCustomers,
    conversionRate: parseFloat(conversionRate),
    averageOrderValue: parseFloat(averageOrderValue)
  });

  // Generate actionable insights
  const actionableInsights = generateActionableInsights({
    topProducts: topProducts.map(p => {
      const product = productDetails.find(pd => pd.id === p.productId);
      return {
        ...p,
        name: product?.name || 'Unknown Product'
      };
    }),
    lowStockProducts,
    recentOrders,
    todayRevenueValue,
    weekRevenueValue,
    monthRevenueValue
  });

  return {
    overview: {
      revenue: {
        today: todayRevenueValue,
        yesterday: yesterdayRevenueValue,
        week: weekRevenueValue,
        month: monthRevenueValue,
        growth: revenueGrowth
      },
      orders: {
        today: todayOrders,
        yesterday: yesterdayOrders,
        week: weekOrders,
        month: monthOrders,
        total: totalOrders,
        growth: orderGrowth
      },
      customers: {
        today: todayCustomers,
        yesterday: yesterdayCustomers,
        total: totalCustomers,
        growth: customerGrowth,
        repeatRate: totalCustomers > 0 
          ? ((repeatCustomers.length / totalCustomers) * 100).toFixed(1)
          : '0'
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        outOfStock: outOfStockProducts,
        lowStock: lowStockProducts.length
      }
    },
    
    performance: {
      conversionRate,
      averageOrderValue,
      topProducts: topProducts.map(p => {
        const product = productDetails.find(pd => pd.id === p.productId);
        return {
          id: p.productId,
          name: product?.name || 'Unknown Product',
          unitsSold: p._sum.quantity || 0,
          revenue: p._sum.totalPrice || 0,
          orderCount: p._count.productId
        };
      }),
      topCustomers: topCustomers.map(c => {
        const customer = customerDetails.find(cd => cd.id === c.customerId);
        return {
          id: c.customerId,
          name: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'Guest',
          email: customer?.email || 'N/A',
          totalSpent: c._sum.totalPrice || 0,
          orderCount: c._count.customerId
        };
      }),
      categoryBreakdown: categoryPerformance.map(cp => {
        const category = categoryDetails.find(cd => cd.id === cp.categoryId);
        return {
          id: cp.categoryId,
          name: category?.name || 'Uncategorized',
          productCount: cp._count.categoryId
        };
      })
    },
    
    alerts: {
      critical: [
        ...lowStockProducts.slice(0, 3).map(p => ({
          type: 'low_stock' as const,
          severity: 'critical' as const,
          message: `${p.product.name} (${p.name}) has only ${p.stock} units left`,
          productId: p.product.id,
          action: 'Restock immediately'
        })),
        outOfStockProducts > 0 && {
          type: 'out_of_stock' as const,
          severity: 'critical' as const,
          message: `${outOfStockProducts} product variants are out of stock`,
          action: 'Review and restock'
        }
      ].filter(Boolean),
      
      warnings: [
        parseFloat(conversionRate) < 2 && {
          type: 'low_conversion' as const,
          severity: 'warning' as const,
          message: `Conversion rate is ${conversionRate}% (industry average: 2-3%)`,
          action: 'Review pricing and product descriptions'
        }
      ].filter(Boolean),
      
      info: [
        todayOrders === 0 && new Date().getHours() > 12 && {
          type: 'no_orders' as const,
          severity: 'info' as const,
          message: 'No orders received today yet',
          action: 'Consider running a promotion'
        },
        totalProducts < 10 && {
          type: 'low_inventory' as const,
          severity: 'info' as const,
          message: `Only ${totalProducts} products in catalog`,
          action: 'Add more products to attract customers'
        }
      ].filter(Boolean)
    },
    
    recommendations,
    actionableInsights,
    
    trends: {
      revenue: {
        direction: parseFloat(revenueGrowth) > 0 ? 'up' : parseFloat(revenueGrowth) < 0 ? 'down' : 'stable',
        percentage: Math.abs(parseFloat(revenueGrowth))
      },
      orders: {
        direction: parseFloat(orderGrowth) > 0 ? 'up' : parseFloat(orderGrowth) < 0 ? 'down' : 'stable',
        percentage: Math.abs(parseFloat(orderGrowth))
      },
      customers: {
        direction: parseFloat(customerGrowth) > 0 ? 'up' : parseFloat(customerGrowth) < 0 ? 'down' : 'stable',
        percentage: Math.abs(parseFloat(customerGrowth))
      }
    },
    
    recentActivity: recentOrders.map(order => ({
      id: order.id,
      customer: order.customer?.email || 'Guest',
      total: order.totalPrice || 0,
      items: order.lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
      status: order.status,
      createdAt: order.createdAt
    })),
    
    timestamp: new Date().toISOString()
  };
}

function generateRecommendations(data: any): string[] {
  const recommendations = [];
  
  // Product recommendations
  if (data.totalProducts < 10) {
    recommendations.push('🛍️ Add more products to your catalog to increase sales opportunities');
  }
  
  if (data.activeProducts < data.totalProducts * 0.8) {
    recommendations.push('📦 You have many inactive products. Consider activating them or removing them');
  }
  
  if (data.outOfStockProducts > 0) {
    recommendations.push(`🚨 ${data.outOfStockProducts} products are out of stock. Restock to avoid losing sales`);
  }
  
  if (data.lowStockProducts.length > 0) {
    recommendations.push(`⚠️ ${data.lowStockProducts.length} products are running low on stock. Plan your restocking`);
  }
  
  // Sales recommendations
  if (data.todayOrders === 0 && new Date().getHours() > 15) {
    recommendations.push('💰 No sales today. Consider running a flash sale or sending a promotional email');
  }
  
  if (data.weekOrders < 7) {
    recommendations.push('📈 Low order volume this week. Try social media marketing or paid ads');
  }
  
  // Customer recommendations
  if (data.conversionRate < 2) {
    recommendations.push('🎯 Your conversion rate is below average. Improve product descriptions and images');
  }
  
  if (data.averageOrderValue < 50) {
    recommendations.push('💸 Low average order value. Consider bundling products or offering free shipping thresholds');
  }
  
  
  if (data.repeatCustomers.length < data.totalCustomers * 0.2) {
    recommendations.push('🔄 Low repeat customer rate. Start a loyalty program or send follow-up emails');
  }
  
  // Growth recommendations
  if (data.totalOrders === 0) {
    recommendations.push('🚀 Get your first sale! Share your store on social media and with friends');
  } else if (data.totalOrders < 10) {
    recommendations.push('🌱 Early stage store. Focus on getting reviews and building trust');
  } else if (data.totalOrders < 100) {
    recommendations.push('📊 Growing store. Time to invest in SEO and email marketing');
  }
  
  return recommendations.slice(0, 5); // Return top 5 recommendations
}

function generateActionableInsights(data: any): any[] {
  const insights = [];
  
  // Revenue insights
  if (data.todayRevenueValue > data.weekRevenueValue / 7 * 1.5) {
    insights.push({
      type: 'success',
      title: 'Strong Sales Day',
      message: `Today's revenue is ${((data.todayRevenueValue / (data.weekRevenueValue / 7) - 1) * 100).toFixed(0)}% above daily average`,
      action: 'Analyze what worked today and replicate'
    });
  }
  
  // Product insights
  if (data.topProducts.length > 0) {
    const topProduct = data.topProducts[0];
    insights.push({
      type: 'info',
      title: 'Best Seller',
      message: `"${topProduct.name}" is your top product with ${topProduct._count.productId} sales`,
      action: 'Feature it prominently on your homepage'
    });
  }
  
  // Stock insights
  if (data.lowStockProducts.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${data.lowStockProducts.length} products need restocking soon`,
      action: 'Review inventory and place orders',
      products: data.lowStockProducts.slice(0, 3).map((p: any) => ({
        name: p.product.name,
        variant: p.name,
        stock: p.stock
      }))
    });
  }
  
  
  // Order insights
  if (data.recentOrders.length > 0) {
    const pendingOrders = data.recentOrders.filter((o: any) => o.status === 'pending').length;
    if (pendingOrders > 0) {
      insights.push({
        type: 'action',
        title: 'Orders Need Processing',
        message: `${pendingOrders} orders are waiting to be processed`,
        action: 'Review and fulfill pending orders'
      });
    }
  }
  
  return insights;
}