import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for health check configuration
const healthCheckConfigSchema = z.object({
  enabledChecks: z.array(z.enum([
    'uptime',
    'performance',
    'seo',
    'security',
    'content',
    'commerce',
    'technical'
  ])).default(['uptime', 'performance', 'seo', 'commerce']),
  checkFrequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
  alertThresholds: z.object({
    uptimeThreshold: z.number().min(0).max(100).default(99),
    performanceThreshold: z.number().min(0).default(3000), // ms
    conversionRateThreshold: z.number().min(0).max(100).default(2),
    errorRateThreshold: z.number().min(0).max(100).default(5)
  }).optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    webhook: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    alertEmails: z.array(z.string().email()).optional()
  }).optional()
});

// Helper function to check store uptime and performance
async function checkStoreUptime(store: any): Promise<any> {
  const baseUrl = store.customDomain 
    ? `https://${store.customDomain}`
    : `https://${store.subdomain}.nuvi.com`;

  try {
    const startTime = Date.now();
    const response = await fetch(baseUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    const responseTime = Date.now() - startTime;

    return {
      status: 'up',
      responseTime,
      httpStatus: response.status,
      url: baseUrl,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'down',
      error: (error as Error).message,
      url: baseUrl,
      checkedAt: new Date().toISOString()
    };
  }
}

// Helper function to analyze store SEO health
async function analyzeSEOHealth(store: any): Promise<any> {
  const issues: any[] = [];
  const recommendations: any[] = [];
  let score = 100;

  // Check basic SEO fields
  if (!store.metaTitle) {
    issues.push('Missing store meta title');
    score -= 10;
  }
  
  if (!store.metaDescription) {
    issues.push('Missing store meta description');
    score -= 10;
  }

  if (!store.keywords) {
    issues.push('Missing keywords');
    score -= 5;
  }

  // Get store settings for additional SEO checks
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId: store.id }
  });

  const seoSettings = storeSettings?.seoSettings as any;
  
  if (!seoSettings?.googleAnalyticsId) {
    recommendations.push('Add Google Analytics tracking');
    score -= 5;
  }

  if (!seoSettings?.sitemapEnabled) {
    recommendations.push('Enable sitemap generation');
    score -= 5;
  }

  // Check product SEO
  const productsWithoutSEO = await prisma.product.count({
    where: {
      storeId: store.id,
      OR: [
        { metaTitle: null },
        { metaDescription: null },
        { slug: null }
      ]
    }
  });

  if (productsWithoutSEO > 0) {
    issues.push(`${productsWithoutSEO} products missing SEO data`);
    score -= Math.min(20, productsWithoutSEO * 2);
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    checkedAt: new Date().toISOString()
  };
}

// Helper function to analyze commerce health
async function analyzeCommerceHealth(store: any): Promise<any> {
  const issues: any[] = [];
  const recommendations: any[] = [];
  let score = 100;

  // Check product inventory
  const [
    totalProducts,
    outOfStockProducts,
    productsWithoutImages,
    productsWithoutDescriptions,
    activeOrders,
    pendingOrders
  ] = await Promise.all([
    prisma.product.count({
      where: { storeId: store.id, isActive: true }
    }),
    prisma.product.count({
      where: {
        storeId: store.id,
        isActive: true,
        variants: {
          every: { stock: 0 }
        }
      }
    }),
    prisma.product.count({
      where: {
        storeId: store.id,
        isActive: true,
        images: { equals: [] }
      }
    }),
    prisma.product.count({
      where: {
        storeId: store.id,
        isActive: true,
        OR: [
          { description: null },
          { description: '' }
        ]
      }
    }),
    prisma.order.count({
      where: {
        storeId: store.id,
        status: { in: ['open', 'pending'] }
      }
    }),
    prisma.order.count({
      where: {
        storeId: store.id,
        financialStatus: 'pending'
      }
    })
  ]);

  if (totalProducts === 0) {
    issues.push('No active products in store');
    score -= 50;
  }

  if (outOfStockProducts > totalProducts * 0.2) {
    issues.push(`${outOfStockProducts} products out of stock (${Math.round(outOfStockProducts/totalProducts*100)}%)`);
    score -= 15;
  }

  if (productsWithoutImages > 0) {
    issues.push(`${productsWithoutImages} products missing images`);
    score -= Math.min(10, productsWithoutImages);
  }

  if (productsWithoutDescriptions > 0) {
    issues.push(`${productsWithoutDescriptions} products missing descriptions`);
    score -= Math.min(10, productsWithoutDescriptions);
  }

  if (pendingOrders > 10) {
    recommendations.push(`${pendingOrders} orders pending payment - follow up required`);
  }

  // Check payment methods
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId: store.id }
  });

  const paymentMethods = storeSettings?.paymentMethods as any;
  if (!paymentMethods || Object.keys(paymentMethods).length === 0) {
    issues.push('No payment methods configured');
    score -= 30;
  }

  // Check shipping zones
  const shippingZones = storeSettings?.shippingZones as any;
  if (!shippingZones || shippingZones.length === 0) {
    issues.push('No shipping zones configured');
    score -= 20;
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    metrics: {
      totalProducts,
      outOfStockProducts,
      productsWithoutImages,
      productsWithoutDescriptions,
      activeOrders,
      pendingOrders
    },
    checkedAt: new Date().toISOString()
  };
}

// Helper function to check security health
async function analyzeSecurityHealth(store: any): Promise<any> {
  const issues: any[] = [];
  const recommendations: any[] = [];
  let score = 100;

  // Check SSL/HTTPS
  if (store.customDomain) {
    // In a real implementation, you would check SSL certificate validity
    recommendations.push('Verify SSL certificate is valid and up to date');
  }

  // Check store settings for security features
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId: store.id }
  });

  if (storeSettings?.enablePasswordProtection === false) {
    recommendations.push('Consider enabling password protection for development stores');
  }

  if (!storeSettings?.gdprEnabled) {
    recommendations.push('Enable GDPR compliance features');
    score -= 5;
  }

  if (!storeSettings?.cookieBannerEnabled) {
    recommendations.push('Enable cookie banner for compliance');
    score -= 5;
  }

  // Check for admin users with weak security
  const staffMembers = storeSettings?.staffMembers as any[];
  if (staffMembers?.length) {
    const membersWithoutTwoFactor = staffMembers.filter(staff => 
      !staff.twoFactorAuth?.enabled
    );
    
    if (membersWithoutTwoFactor.length > 0) {
      recommendations.push(`${membersWithoutTwoFactor.length} staff members should enable two-factor authentication`);
      score -= membersWithoutTwoFactor.length * 2;
    }
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    checkedAt: new Date().toISOString()
  };
}

// Helper function to check content health
async function analyzeContentHealth(store: any): Promise<any> {
  const issues: any[] = [];
  const recommendations: any[] = [];
  let score = 100;

  // Check pages
  const [
    totalPages,
    publishedPages,
    totalBlogPosts,
    publishedBlogPosts,
    categories,
    menus
  ] = await Promise.all([
    prisma.page.count({
      where: { storeId: store.id }
    }),
    prisma.page.count({
      where: { storeId: store.id, isPublished: true }
    }),
    prisma.blogPost.count({
      where: { storeId: store.id }
    }),
    prisma.blogPost.count({
      where: { storeId: store.id, isPublished: true }
    }),
    prisma.category.count({
      where: { storeId: store.id }
    }),
    prisma.menu.count({
      where: { storeId: store.id }
    })
  ]);

  if (publishedPages === 0) {
    recommendations.push('Create essential pages (About, Contact, Privacy Policy, Terms of Service)');
    score -= 15;
  }

  if (categories === 0) {
    recommendations.push('Create product categories for better organization');
    score -= 10;
  }

  if (menus === 0) {
    recommendations.push('Create navigation menus for better user experience');
    score -= 10;
  }

  if (publishedBlogPosts === 0) {
    recommendations.push('Start a blog to improve SEO and customer engagement');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    metrics: {
      totalPages,
      publishedPages,
      totalBlogPosts,
      publishedBlogPosts,
      categories,
      menus
    },
    checkedAt: new Date().toISOString()
  };
}

// GET - Get comprehensive store health report
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
    const checks = searchParams.get('checks')?.split(',') || ['all'];

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

    const healthReport: any = {
      storeId: store.id,
      storeName: store.name,
      checkedAt: new Date().toISOString(),
      overallScore: 0,
      status: 'healthy'
    };

    const checkPromises = [];

    // Run health checks based on requested checks
    if (checks.includes('all') || checks.includes('uptime')) {
      checkPromises.push(
        checkStoreUptime(store).then(result => ({ type: 'uptime', ...result }))
      );
    }

    if (checks.includes('all') || checks.includes('seo')) {
      checkPromises.push(
        analyzeSEOHealth(store).then(result => ({ type: 'seo', ...result }))
      );
    }

    if (checks.includes('all') || checks.includes('commerce')) {
      checkPromises.push(
        analyzeCommerceHealth(store).then(result => ({ type: 'commerce', ...result }))
      );
    }

    if (checks.includes('all') || checks.includes('security')) {
      checkPromises.push(
        analyzeSecurityHealth(store).then(result => ({ type: 'security', ...result }))
      );
    }

    if (checks.includes('all') || checks.includes('content')) {
      checkPromises.push(
        analyzeContentHealth(store).then(result => ({ type: 'content', ...result }))
      );
    }

    // Execute all checks
    const checkResults = await Promise.all(checkPromises);

    // Process results
    const healthChecks: any = {};
    let totalScore = 0;
    let scoreCount = 0;
    let criticalIssues = 0;
    let totalIssues = 0;
    let totalRecommendations = 0;

    checkResults.forEach((result: any) => {
      const { type, ...checkData } = result;
      healthChecks[type] = checkData;

      if (type === 'uptime') {
        // Uptime doesn't have a score, but affects overall health
        if (checkData.status === 'down') {
          criticalIssues++;
          healthReport.status = 'critical';
        }
      } else {
        // Add scores for other checks
        if (checkData.score !== undefined) {
          totalScore += checkData.score;
          scoreCount++;
        }

        if (checkData.issues) {
          totalIssues += checkData.issues.length;
          // Critical issues are those that significantly impact functionality
          if (type === 'commerce' && checkData.score < 50) {
            criticalIssues++;
          }
        }

        if (checkData.recommendations) {
          totalRecommendations += checkData.recommendations.length;
        }
      }
    });

    // Calculate overall score
    healthReport.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 100;

    // Determine overall status
    if (criticalIssues > 0 || healthReport.overallScore < 50) {
      healthReport.status = 'critical';
    } else if (healthReport.overallScore < 80 || totalIssues > 5) {
      healthReport.status = 'warning';
    } else {
      healthReport.status = 'healthy';
    }

    healthReport.summary = {
      overallScore: healthReport.overallScore,
      status: healthReport.status,
      criticalIssues,
      totalIssues,
      totalRecommendations,
      checksPerformed: checkResults.length
    };

    healthReport.checks = healthChecks;

    // Get historical health data for trends
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const healthHistory = (storeSettings?.healthHistory as any[]) || [];
    
    // Add current check to history
    const currentCheck = {
      timestamp: new Date().toISOString(),
      overallScore: healthReport.overallScore,
      status: healthReport.status,
      criticalIssues,
      totalIssues
    };

    // Keep last 30 entries
    const updatedHistory = [currentCheck, ...healthHistory.slice(0, 29)];

    // Update health history
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { healthHistory: updatedHistory },
      create: { storeId: store.id, healthHistory: updatedHistory }
    });

    // Calculate trends
    const trends = calculateHealthTrends(updatedHistory);
    healthReport.trends = trends;

    return NextResponse.json(healthReport);
  } catch (error) {
    console.error('[STORE HEALTH API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Update health check configuration
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
    const validation = healthCheckConfigSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid health check configuration',
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

    // Update health check configuration
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        healthCheckConfig: validation.data,
        updatedAt: new Date()
      },
      create: {
        storeId: store.id,
        healthCheckConfig: validation.data
      }
    });

    return NextResponse.json({
      message: 'Health check configuration updated successfully',
      config: validation.data
    });
  } catch (error) {
    console.error('[STORE HEALTH CONFIG API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// Helper function to calculate health trends
function calculateHealthTrends(history: any[]): any {
  if (history.length < 2) {
    return {
      scoreChange: 0,
      statusChange: 'stable',
      issuesChange: 0,
      trend: 'stable'
    };
  }

  const latest = history[0];
  const previous = history[1];
  
  const scoreChange = latest.overallScore - previous.overallScore;
  const issuesChange = latest.totalIssues - previous.totalIssues;
  
  let trend = 'stable';
  if (scoreChange > 5 && issuesChange <= 0) {
    trend = 'improving';
  } else if (scoreChange < -5 || issuesChange > 0) {
    trend = 'declining';
  }

  let statusChange = 'stable';
  if (latest.status !== previous.status) {
    if (latest.status === 'healthy' && previous.status !== 'healthy') {
      statusChange = 'improved';
    } else if (latest.status === 'critical' && previous.status !== 'critical') {
      statusChange = 'degraded';
    } else {
      statusChange = 'changed';
    }
  }

  return {
    scoreChange,
    statusChange,
    issuesChange,
    trend,
    weeklyAverage: history.slice(0, 7).reduce((sum, h) => sum + h.overallScore, 0) / Math.min(7, history.length)
  };
}