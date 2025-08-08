import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for bulk operations
const bulkOperationSchema = z.object({
  action: z.enum(['approve', 'reject', 'delete', 'respond']),
  reviewIds: z.array(z.string()).min(1),
  data: z.object({
    moderationNote: z.string().optional(),
    response: z.object({
      content: z.string(),
      authorName: z.string().optional(),
      authorTitle: z.string().optional()
    }).optional()
  }).optional()
});

// GET - Get all reviews for the store with filtering
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
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const productId = searchParams.get('productId');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');
    const verified = searchParams.get('verified');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

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

    // Build where clause
    const where: any = {
      product: { storeId: store.id }
    };

    if (status !== 'all') {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    if (verified === 'true') {
      where.verified = true;
    } else if (verified === 'false') {
      where.verified = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Get total count
    const total = await prisma.productReview.count({ where });

    // Get reviews
    const reviews = await prisma.productReview.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform reviews
    const transformedReviews = reviews.map(review => {
      const images = Array.isArray(review.images) ? review.images : [];
      const attributes = typeof review.attributes === 'object' ? review.attributes : {};
      const helpfulVotes = typeof review.helpfulVotes === 'object' ? review.helpfulVotes : { up: 0, down: 0 };
      const response = typeof review.response === 'object' ? review.response : null;
      
      return {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        status: review.status,
        verified: review.verified,
        verifiedPurchase: review.verifiedPurchase,
        helpful: review.helpful,
        images: images,
        attributes: attributes,
        recommendProduct: review.recommendProduct,
        helpfulVotes: helpfulVotes,
        response: response,
        moderationNote: review.moderationNote,
        moderatedBy: review.moderatedBy,
        moderatedAt: review.moderatedAt,
        product: review.product,
        author: {
          name: review.customer 
            ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() || 'Anonymous'
            : review.authorName || 'Anonymous',
          email: review.customer?.email || review.authorEmail,
          isCustomer: !!review.customer
        },
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    });

    // Get summary statistics
    const [statusCounts, ratingCounts] = await Promise.all([
      prisma.productReview.groupBy({
        by: ['status'],
        where: { product: { storeId: store.id } },
        _count: { status: true }
      }),
      prisma.productReview.groupBy({
        by: ['rating'],
        where: { product: { storeId: store.id }, status: 'approved' },
        _count: { rating: true }
      })
    ]);

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item.status || 'approved'] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const ratingSummary = ratingCounts.reduce((acc, item) => {
      acc[item.rating] = item._count.rating;
      return acc;
    }, {} as Record<number, number>);

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        statusCounts: statusSummary,
        ratingCounts: ratingSummary,
        totalReviews: total
      }
    });
  } catch (error) {
    console.error('[REVIEWS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Bulk operations on reviews
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
    const validation = bulkOperationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid bulk operation data',
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

    const { action, reviewIds, data } = validation.data;

    // Verify all reviews belong to this store
    const reviews = await prisma.productReview.findMany({
      where: {
        id: { in: reviewIds },
        product: { storeId: store.id }
      }
    });

    if (reviews.length !== reviewIds.length) {
      return apiResponse.badRequest('Some reviews not found or do not belong to this store');
    }

    let results: any[] = [];

    switch (action) {
      case 'approve':
        await prisma.productReview.updateMany({
          where: { id: { in: reviewIds } },
          data: {
            status: 'approved',
            moderatedBy: session.user.email,
            moderatedAt: new Date().toISOString(),
            moderationNote: data?.moderationNote
          }
        });
        results = reviewIds.map(id => ({ id, action: 'approved' }));
        break;

      case 'reject':
        await prisma.productReview.updateMany({
          where: { id: { in: reviewIds } },
          data: {
            status: 'rejected',
            moderatedBy: session.user.email,
            moderatedAt: new Date().toISOString(),
            moderationNote: data?.moderationNote
          }
        });
        results = reviewIds.map(id => ({ id, action: 'rejected' }));
        break;

      case 'delete':
        await prisma.productReview.deleteMany({
          where: { id: { in: reviewIds } }
        });
        results = reviewIds.map(id => ({ id, action: 'deleted' }));
        break;

      case 'respond':
        if (!data?.response) {
          return apiResponse.badRequest('Response content is required for respond action');
        }

        for (const reviewId of reviewIds) {
          await prisma.productReview.update({
            where: { id: reviewId },
            data: {
              response: {
                content: data.response.content,
                authorName: data.response.authorName || store.name,
                authorTitle: data.response.authorTitle || 'Store Owner',
                createdAt: new Date().toISOString(),
                createdBy: session.user.email
              }
            }
          });
        }
        results = reviewIds.map(id => ({ id, action: 'responded' }));
        break;

      default:
        return apiResponse.badRequest('Invalid action');
    }

    return NextResponse.json({
      message: `Bulk ${action} operation completed successfully`,
      results
    });
  } catch (error) {
    console.error('[REVIEWS BULK API] POST Error:', error);
    return apiResponse.serverError();
  }
}