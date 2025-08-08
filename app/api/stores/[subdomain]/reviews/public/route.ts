import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/reviews/public
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'approved';
    const featured = searchParams.get('featured') === 'true';
    const minRating = parseInt(searchParams.get('minRating') || '1');
    
    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Build where clause
    const whereClause: any = {
      product: {
        storeId: store.id
      },
      status: status
    };

    // Add featured filter if requested
    if (featured) {
      whereClause.featured = true;
    }

    // Add minimum rating filter
    if (minRating > 1) {
      whereClause.rating = {
        gte: minRating
      };
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Transform reviews to match testimonial format
    const testimonials = reviews.map(review => {
      const customerName = review.customerName || 
        (review.customer ? `${review.customer.firstName} ${review.customer.lastName}`.trim() : 'Anonymous');
      
      // Get initials for avatar fallback
      const initials = customerName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return {
        id: review.id,
        name: customerName,
        role: review.product ? `Purchased ${review.product.name}` : undefined,
        content: review.content,
        rating: review.rating,
        avatar: null, // Could add customer avatar support later
        initials,
        verified: review.verifiedPurchase,
        productId: review.productId,
        productName: review.product?.name,
        productSlug: review.product?.slug,
        createdAt: review.createdAt,
        photos: review.photos || []
      };
    });

    // Get review statistics
    const stats = await prisma.review.aggregate({
      where: {
        product: {
          storeId: store.id
        },
        status: 'approved'
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      testimonials,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.id || 0
      }
    });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}