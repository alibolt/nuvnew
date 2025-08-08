import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);
  
  try {
    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });
    
    if (!store) {
      return apiResponse.notFound('Store ');
    }

    let recommendations = [];

    if (productId) {
      // Get the current product to find its category
      const currentProduct = await prisma.product.findFirst({
        where: {
          id: productId,
          storeId: store.id
        },
        include: {
          category: true
        }
      });

      if (currentProduct && currentProduct.categoryId) {
        // Strategy 1: Products from the same category
        const categoryProducts = await prisma.product.findMany({
          where: {
            storeId: store.id,
            categoryId: currentProduct.categoryId,
            id: { not: productId },
            isActive: true
          },
          include: {
            category: true,
            variants: {
              take: 1,
              orderBy: { price: 'asc' }
            }
          },
          take: Math.ceil(limit / 2),
          orderBy: { createdAt: 'desc' }
        });

        recommendations.push(...categoryProducts);
      }

      // Strategy 2: Products frequently bought together (using order data)
      if (recommendations.length < limit) {
        const orderItemsWithProduct = await prisma.orderLineItem.findMany({
          where: {
            order: {
              store: { subdomain }
            },
            productId: productId
          },
          select: {
            orderId: true
          },
          distinct: ['orderId']
        });

        const orderIds = orderItemsWithProduct.map(item => item.orderId);

        if (orderIds.length > 0) {
          const relatedOrderItems = await prisma.orderLineItem.findMany({
            where: {
              orderId: { in: orderIds },
              productId: { not: productId }
            },
            select: {
              productId: true
            },
            distinct: ['productId']
          });

          const relatedProductIds = relatedOrderItems.map(item => item.productId).filter(id => id !== null) as string[];

          if (relatedProductIds.length > 0) {
            const frequentlyBoughtTogether = await prisma.product.findMany({
              where: {
                id: { in: relatedProductIds },
                storeId: store.id,
                isActive: true
              },
              include: {
                category: true,
                variants: {
                  take: 1,
                  orderBy: { price: 'asc' }
                }
              },
              take: limit - recommendations.length
            });

            recommendations.push(...frequentlyBoughtTogether);
          }
        }
      }
    }

    // Strategy 3: Fill with bestsellers if needed
    if (recommendations.length < limit) {
      const bestsellers = await prisma.product.findMany({
        where: {
          storeId: store.id,
          isActive: true,
          id: productId ? { notIn: [productId, ...recommendations.map(p => p.id)] } : undefined
        },
        include: {
          category: true,
          variants: {
            take: 1,
            orderBy: { price: 'asc' }
          },
          _count: {
            select: {
              orderLineItems: true
            }
          }
        },
        orderBy: {
          orderLineItems: {
            _count: 'desc'
          }
        },
        take: limit - recommendations.length
      });

      recommendations.push(...bestsellers);
    }

    // Remove duplicates
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(p => [p.id, p])).values()
    );

    // Transform the products
    const transformedProducts = uniqueRecommendations.slice(0, limit).map(product => {
      // Handle images properly
      let images = [];
      if (product.images && product.images.length > 0) {
        // If images is from the relation (has url property)
        images = product.images.map(img => img.url);
      } else if (product.images) {
        // If images is a JSON field from the product
        try {
          const parsedImages = typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : product.images;
          images = Array.isArray(parsedImages) ? parsedImages : [];
        } catch (e) {
          console.error('Error parsing product images:', e);
          images = [];
        }
      }
      
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.variants?.[0]?.price || 0,
        compareAtPrice: product.variants?.[0]?.compareAtPrice || null,
        images,
        inStock: product.variants?.[0]?.stock > 0,
        category: product.category
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length
    });
  } catch (error) {
    console.error('[RECOMMENDATIONS API] Error:', error);
    console.error('[RECOMMENDATIONS API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch recommendations',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}