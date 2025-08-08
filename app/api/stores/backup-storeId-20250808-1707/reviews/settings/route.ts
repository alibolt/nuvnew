import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for review settings
const reviewSettingsSchema = z.object({
  // Basic Settings
  enableReviews: z.boolean().default(true),
  moderationEnabled: z.boolean().default(false),
  autoApprove: z.boolean().default(true),
  allowGuestReviews: z.boolean().default(true),
  requirePurchase: z.boolean().default(false),
  
  // Features
  allowImages: z.boolean().default(true),
  maxImages: z.number().min(0).max(10).default(5),
  allowResponses: z.boolean().default(true),
  enableHelpfulVotes: z.boolean().default(true),
  showVerifiedBadge: z.boolean().default(true),
  
  // Display Settings
  reviewsPerPage: z.number().min(5).max(50).default(10),
  defaultSort: z.enum(['newest', 'oldest', 'highest', 'lowest', 'helpful']).default('newest'),
  showRatingDistribution: z.boolean().default(true),
  showReviewSummary: z.boolean().default(true),
  
  // Moderation
  moderationRules: z.object({
    autoRejectSpam: z.boolean().default(true),
    requireMinLength: z.number().min(0).max(500).default(10),
    requireMaxLength: z.number().min(100).max(10000).default(5000),
    bannedWords: z.array(z.string()).default([]),
    requireApprovalFor: z.array(z.enum(['guest', 'customer', 'low_rating', 'first_review'])).default([])
  }).optional(),
  
  // Notifications
  emailNotifications: z.object({
    newReview: z.boolean().default(true),
    moderationNeeded: z.boolean().default(true),
    negativeReview: z.boolean().default(true),
    responsePosted: z.boolean().default(false)
  }).optional(),
  
  // Advanced
  customFields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'boolean', 'select', 'rating']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional()
  })).optional(),
  
  // Review Incentives
  incentives: z.object({
    enableRewards: z.boolean().default(false),
    rewardType: z.enum(['points', 'discount', 'coupon']).optional(),
    rewardValue: z.number().optional(),
    minimumRating: z.number().min(1).max(5).optional()
  }).optional()
});

// GET - Get review settings and analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;

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

    // Get current review settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const reviewSettings = (storeSettings?.reviewSettings as any) || {
      enableReviews: true,
      moderationEnabled: false,
      autoApprove: true,
      allowGuestReviews: true,
      requirePurchase: false,
      allowImages: true,
      maxImages: 5,
      allowResponses: true,
      enableHelpfulVotes: true,
      showVerifiedBadge: true,
      reviewsPerPage: 10,
      defaultSort: 'newest',
      showRatingDistribution: true,
      showReviewSummary: true
    };

    // Get review analytics
    const analytics = await getReviewAnalytics(store.id);

    return NextResponse.json({
      settings: reviewSettings,
      analytics
    });
  } catch (error) {
    console.error('[REVIEW SETTINGS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update review settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();

    // Validate input
    const validation = reviewSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid review settings',
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

    // Update review settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        reviewSettings: validation.data
      },
      create: {
        storeId: store.id,
        reviewSettings: validation.data
      }
    });

    return NextResponse.json({
      message: 'Review settings updated successfully',
      settings: validation.data
    });
  } catch (error) {
    console.error('[REVIEW SETTINGS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to get review analytics
async function getReviewAnalytics(storeId: string) {
  const [
    totalReviews,
    averageRating,
    ratingDistribution,
    recentReviews,
    pendingReviews,
    topRatedProducts,
    reviewTrends
  ] = await Promise.all([
    // Total reviews count
    prisma.productReview.count({
      where: { product: { storeId } }
    }),

    // Average rating across all products
    prisma.productReview.aggregate({
      where: { product: { storeId }, status: 'approved' },
      _avg: { rating: true }
    }),

    // Rating distribution
    prisma.productReview.groupBy({
      by: ['rating'],
      where: { product: { storeId }, status: 'approved' },
      _count: { rating: true }
    }),

    // Recent reviews (last 30 days)
    prisma.productReview.count({
      where: {
        product: { storeId },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    }),

    // Pending reviews
    prisma.productReview.count({
      where: { product: { storeId }, status: 'pending' }
    }),

    // Top rated products
    prisma.product.findMany({
      where: { storeId },
      include: {
        reviews: {
          where: { status: 'approved' },
          select: { rating: true }
        },
        _count: { select: { reviews: true } }
      },
      take: 5
    }).then(products => {
      return products
        .map(product => {
          const ratings = product.reviews.map(r => r.rating);
          const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
            : 0;
          
          return {
            id: product.id,
            name: product.name,
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: product._count.reviews
          };
        })
        .filter(p => p.reviewCount >= 3)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);
    }),

    // Review trends (last 12 months)
    Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        return prisma.productReview.count({
          where: {
            product: { storeId },
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }).then(count => ({
          month: startOfMonth.toISOString().substring(0, 7),
          count
        }));
      })
    ).then(results => results.reverse())
  ]);

  const ratingCounts = ratingDistribution.reduce((acc, item) => {
    acc[item.rating] = item._count.rating;
    return acc;
  }, {} as Record<number, number>);

  return {
    summary: {
      totalReviews,
      averageRating: Math.round((averageRating._avg.rating || 0) * 10) / 10,
      recentReviews,
      pendingReviews,
      responseRate: 0 // Would calculate from actual responses
    },
    distribution: ratingCounts,
    topRatedProducts,
    trends: reviewTrends
  };
}