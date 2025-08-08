import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/stores/[storeId]/products/[productId]/variants
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';

    // For public access, don't require authentication
    const session = await getServerSession(authOptions);
    if (!isPublic && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For admin access, verify store ownership
    if (!isPublic && session?.user?.id) {
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.user.id,
        },
      });

      if (!store) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 });
      }
    }

    // Get variants for the product
    const variants = await prisma.productVariant.findMany({
      where: {
        product: {
          id: productId,
          storeId,
          ...(isPublic && { isActive: true }),
        },
      },
      include: {
        images: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    // Transform data for frontend compatibility
    const transformedVariants = variants.map(variant => ({
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
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    }));

    return NextResponse.json({ variants: transformedVariants });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[storeId]/products/[productId]/variants
export async function POST(
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

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Verify product exists and belongs to store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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

    // Create variant with images in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the variant
      const variant = await tx.productVariant.create({
        data: {
          productId,
          name: name || 'Default',
          sku,
          barcode,
          price: price || 0,
          compareAtPrice,
          cost,
          stock: stock || 0,
          weight,
          weightUnit,
          trackQuantity: trackQuantity ?? true,
          continueSellingWhenOutOfStock: continueSellingWhenOutOfStock ?? false,
          options: JSON.stringify(options || {}),
        },
      });

      // Create variant images if provided
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((image: any) => ({
            url: typeof image === 'string' ? image : image.url,
            variantId: variant.id,
          })),
        });
      }

      return variant;
    });

    // Fetch complete variant with images
    const completeVariant = await prisma.productVariant.findUnique({
      where: { id: result.id },
      include: {
        images: true,
      },
    });

    return NextResponse.json(completeVariant, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    );
  }
}