import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/stores/[subdomain]/products/[productId]/variants/[variantId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; productId: string; variantId: string }> }
) {
  try {
    const { subdomain, productId, variantId } = await params;
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';

    // For public access, don't require authentication
    const session = await getServerSession(authOptions);
    if (!isPublic && !session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // For admin access, verify store ownership
    if (!isPublic && session?.user?.id) {
      const store = await prisma.store.findFirst({
        where: {
          subdomain: subdomain,
          userId: session.user.id,
        },
      });

      if (!store) {
        return apiResponse.notFound('Store ');
      }
    }

    // Get variant
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        product: {
          id: productId,
          store: {
            subdomain
          },
          ...(isPublic && { isActive: true }),
        },
      },
      include: {
        images: true,
        product: true,
      },
    });

    if (!variant) {
      return apiResponse.notFound('Variant ');
    }

    // Transform data for frontend compatibility
    const transformedVariant = {
      id: variant.id,
      title: variant.name,
      sku: variant.sku,
      barcode: variant.barcode,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      cost: variant.cost,
      inventory: variant.stock,
      weight: variant.weight,
      weightUnit: variant.weightUnit,
      trackQuantity: variant.trackQuantity,
      continueSellingWhenOutOfStock: variant.continueSellingWhenOutOfStock,
      options: typeof variant.options === 'string' ? JSON.parse(variant.options) : variant.options,
      images: variant.images.map(img => ({
        id: img.id,
        url: img.url,
      })),
      product: {
        id: variant.product.id,
        title: variant.product.name,
      },
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };

    return NextResponse.json(transformedVariant);
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[subdomain]/products/[productId]/variants/[variantId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; productId: string; variantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, productId, variantId } = await params;
    const body = await request.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const {
      name,
      sku,
      barcode,
      price,
      compareAtPrice,
      cost,
      stock,
      weight,
      weightUnit,
      trackQuantity,
      continueSellingWhenOutOfStock,
      options,
      images,
    } = body;

    // Update variant with images in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the variant
      const variant = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          name,
          sku,
          barcode,
          price,
          compareAtPrice,
          cost,
          stock,
          weight,
          weightUnit,
          trackQuantity,
          continueSellingWhenOutOfStock,
          options: JSON.stringify(options || {}),
        },
      });

      // Handle images if provided
      if (images !== undefined) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { variantId },
        });

        // Create new images
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((image: any) => ({
              url: typeof image === 'string' ? image : image.url,
              variantId,
            })),
          });
        }
      }

      return variant;
    });

    // Fetch complete updated variant
    const completeVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        images: true,
      },
    });

    return NextResponse.json(completeVariant);
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[subdomain]/products/[productId]/variants/[variantId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; productId: string; variantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, productId, variantId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if this is the last variant
    const variantCount = await prisma.productVariant.count({
      where: { productId },
    });

    if (variantCount <= 1) {
      return apiResponse.badRequest('Cannot delete the last variant of a product');
    }

    // Delete variant (cascades to images)
    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}