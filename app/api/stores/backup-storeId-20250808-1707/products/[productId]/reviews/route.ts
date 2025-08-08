import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { z } from 'zod';

// Schema for creating/updating reviews
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(5000),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional(),
  customerId: z.string().optional(),
  images: z.array(z.string().url()).max(5).optional(), // Review images
  attributes: z.record(z.string()).optional(), // Custom attributes like pros/cons
  recommendProduct: z.boolean().optional(),
  verifiedPurchase: z.boolean().optional()
});

// Schema for review response (store owner response)
const reviewResponseSchema = z.object({
  content: z.string().min(1).max(2000),
  authorName: z.string().optional(),
  authorTitle: z.string().optional() // e.g., "Store Owner", "Customer Service"
});

// Schema for review moderation
const moderationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'spam']),
  moderationNote: z.string().optional(),
  moderatedBy: z.string().optional()
});

// GET /api/stores/[storeId]/products/[productId]/reviews
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, rating, helpful, verified
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status') || 'approved'; // all, pending, approved, rejected
    const verified = searchParams.get('verified'); // true, false
    const withImages = searchParams.get('withImages'); // true, false
    const search = searchParams.get('search'); // Search in title/content

    // Build where clause
    const where: any = {
      productId,
      product: {
        storeId,
      },
    };

    if (rating) {
      where.rating = parseInt(rating);
    }

    if (status !== 'all') {
      where.status = status;
    }

    if (verified === 'true') {
      where.verified = true;
    } else if (verified === 'false') {
      where.verified = false;
    }

    if (withImages === 'true') {
      where.images = { not: null };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const total = await prisma.productReview.count({ where });

    // Get reviews with enhanced data
    const reviews = await prisma.productReview.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get store settings for review configuration
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId }
    });
    
    const reviewSettings = (storeSettings?.reviewSettings as any) || {};

    // Transform data for frontend with enhanced fields
    const transformedReviews = reviews.map(review => {
      // Parse JSON fields safely
      const images = Array.isArray(review.images) ? review.images : [];
      const attributes = typeof review.attributes === 'object' ? review.attributes : {};
      const helpfulVotes = typeof review.helpfulVotes === 'object' ? review.helpfulVotes : { up: 0, down: 0 };
      const response = typeof review.response === 'object' ? review.response : null;
      
      return {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        verified: review.verified,
        helpful: review.helpful,
        status: review.status || 'approved',
        images: images,
        attributes: attributes,
        recommendProduct: review.recommendProduct,
        verifiedPurchase: review.verifiedPurchase || false,
        helpfulVotes: helpfulVotes,
        response: response,
        author: {
          name: review.customer 
            ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() || 'Anonymous'
            : review.authorName || 'Anonymous',
          email: review.customer?.email || review.authorEmail,
          isCustomer: !!review.customer
        },
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

    // Get rating summary
    const ratingSummary = await prisma.productReview.groupBy({
      by: ['rating'],
      where: {
        productId,
        product: {
          storeId,
        },
      },
      _count: {
        rating: true,
      },
    });

    const ratingCounts = ratingSummary.reduce((acc, item) => {
      acc[item.rating] = item._count.rating;
      return acc;
    }, {} as Record<number, number>);

    // Calculate average rating
    const allRatings = await prisma.productReview.findMany({
      where: {
        productId,
        product: {
          storeId,
        },
      },
      select: {
        rating: true,
      },
    });

    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

    // Get additional analytics
    const analytics = {
      totalReviews: allRatings.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCounts,
      verifiedCount: await prisma.productReview.count({
        where: { productId, verified: true, product: { storeId } }
      }),
      withImagesCount: await prisma.productReview.count({
        where: { productId, images: { not: null }, product: { storeId } }
      }),
      statusCounts: await prisma.productReview.groupBy({
        by: ['status'],
        where: { productId, product: { storeId } },
        _count: { status: true }
      }).then(results => results.reduce((acc, item) => {
        acc[item.status || 'approved'] = item._count.status;
        return acc;
      }, {} as Record<string, number>))
    };

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: analytics,
      settings: {
        moderationEnabled: reviewSettings.moderationEnabled || false,
        allowGuestReviews: reviewSettings.allowGuestReviews !== false,
        requirePurchase: reviewSettings.requirePurchase || false,
        allowImages: reviewSettings.allowImages !== false,
        autoApprove: reviewSettings.autoApprove !== false
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[storeId]/products/[productId]/reviews
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { storeId, productId } = await params;
    const body = await request.json();

    // Validate input
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid review data',
        details: validation.error.format()
      }, { status: 400 });
    }

    const reviewData = validation.data;

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId }
    });
    
    const reviewSettings = (storeSettings?.reviewSettings as any) || {};

    // Verify product exists and belongs to store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate business rules
    if (!reviewSettings.allowGuestReviews && !reviewData.customerId) {
      return NextResponse.json(
        { error: 'Only registered customers can leave reviews' },
        { status: 400 }
      );
    }

    // Check if customer already reviewed this product
    if (reviewData.customerId) {
      const existingReview = await prisma.productReview.findFirst({
        where: {
          productId,
          customerId: reviewData.customerId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    }

    // Check if purchase is required and verify purchase
    let verifiedPurchase = false;
    if (reviewSettings.requirePurchase && reviewData.customerId) {
      const purchaseExists = await prisma.orderLineItem.findFirst({
        where: {
          productId,
          order: {
            customerId: reviewData.customerId,
            financialStatus: 'paid'
          }
        }
      });
      
      if (!purchaseExists) {
        return NextResponse.json(
          { error: 'You must purchase this product before reviewing it' },
          { status: 400 }
        );
      }
      
      verifiedPurchase = true;
    }

    // Determine review status based on settings
    const status = reviewSettings.moderationEnabled 
      ? (reviewSettings.autoApprove ? 'approved' : 'pending')
      : 'approved';

    // Create review with enhanced data
    const review = await prisma.productReview.create({
      data: {
        productId,
        customerId: reviewData.customerId || undefined,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        authorName: reviewData.authorName || undefined,
        authorEmail: reviewData.authorEmail || undefined,
        verified: !!reviewData.customerId,
        verifiedPurchase,
        images: reviewData.images || [],
        attributes: reviewData.attributes || {},
        recommendProduct: reviewData.recommendProduct,
        status,
        helpfulVotes: { up: 0, down: 0 },
        submittedAt: new Date().toISOString()
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          },
        },
      },
    });

    // Transform response with enhanced data
    const transformedReview = {
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      verified: review.verified,
      verifiedPurchase: review.verifiedPurchase,
      helpful: review.helpful,
      status: review.status,
      images: review.images || [],
      attributes: review.attributes || {},
      recommendProduct: review.recommendProduct,
      helpfulVotes: review.helpfulVotes || { up: 0, down: 0 },
      author: {
        name: review.customer 
          ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() || 'Anonymous'
          : review.authorName || 'Anonymous',
        email: review.customer?.email || review.authorEmail,
        isCustomer: !!review.customer
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    // Send notification if review needs moderation
    if (status === 'pending') {
      // TODO: Send notification to store owner about pending review
    }

    return NextResponse.json(transformedReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT - Update review (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, productId } = await params;
    const body = await request.json();
    const { reviewId, action, ...data } = body;

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

    // Verify review exists and belongs to this product
    const review = await prisma.productReview.findFirst({
      where: {
        id: reviewId,
        productId,
        product: { storeId: store.id }
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    let updatedReview;

    switch (action) {
      case 'moderate':
        const moderationValidation = moderationSchema.safeParse(data);
        if (!moderationValidation.success) {
          return NextResponse.json({
            error: 'Invalid moderation data',
            details: moderationValidation.error.format()
          }, { status: 400 });
        }

        updatedReview = await prisma.productReview.update({
          where: { id: reviewId },
          data: {
            status: moderationValidation.data.status,
            moderationNote: moderationValidation.data.moderationNote,
            moderatedBy: session.user.email,
            moderatedAt: new Date().toISOString()
          }
        });
        break;

      case 'respond':
        const responseValidation = reviewResponseSchema.safeParse(data);
        if (!responseValidation.success) {
          return NextResponse.json({
            error: 'Invalid response data',
            details: responseValidation.error.format()
          }, { status: 400 });
        }

        updatedReview = await prisma.productReview.update({
          where: { id: reviewId },
          data: {
            response: {
              content: responseValidation.data.content,
              authorName: responseValidation.data.authorName || store.name,
              authorTitle: responseValidation.data.authorTitle || 'Store Owner',
              createdAt: new Date().toISOString(),
              createdBy: session.user.email
            }
          }
        });
        break;

      case 'helpful':
        const { helpful, userId } = data;
        const currentVotes = review.helpfulVotes as any || { up: 0, down: 0, users: [] };
        const userVotes = currentVotes.users || [];
        
        // Remove existing vote from this user
        const existingVoteIndex = userVotes.findIndex((v: any) => v.userId === userId);
        if (existingVoteIndex !== -1) {
          const existingVote = userVotes[existingVoteIndex];
          if (existingVote.helpful) {
            currentVotes.up = Math.max(0, currentVotes.up - 1);
          } else {
            currentVotes.down = Math.max(0, currentVotes.down - 1);
          }
          userVotes.splice(existingVoteIndex, 1);
        }

        // Add new vote
        if (helpful) {
          currentVotes.up = (currentVotes.up || 0) + 1;
        } else {
          currentVotes.down = (currentVotes.down || 0) + 1;
        }
        
        userVotes.push({ userId, helpful, votedAt: new Date().toISOString() });
        currentVotes.users = userVotes;

        updatedReview = await prisma.productReview.update({
          where: { id: reviewId },
          data: {
            helpfulVotes: currentVotes,
            helpful: currentVotes.up - currentVotes.down
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('[REVIEW UPDATE API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete review (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, productId } = await params;
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
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

    // Verify review exists and belongs to this product
    const review = await prisma.productReview.findFirst({
      where: {
        id: reviewId,
        productId,
        product: { storeId: store.id }
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Delete the review
    await prisma.productReview.delete({
      where: { id: reviewId }
    });

    return NextResponse.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('[REVIEW DELETE API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}