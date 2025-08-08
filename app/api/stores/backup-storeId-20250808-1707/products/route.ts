import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET - List products for a store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const active = searchParams.get('active');
    const isPublic = searchParams.get('public') === 'true';

    // For public access (storefront), don't require authentication
    if (!isPublic && (!session?.user?.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For admin access, verify store ownership
    if (!isPublic) {
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

    // Build where clause
    const where: any = { storeId };
    
    // For public access, only show active products
    if (isPublic) {
      where.isActive = true;
    } else if (active !== null) {
      where.isActive = active === 'true';
    }
    
    if (category) {
      where.categoryId = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with variants and images
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          include: {
            images: true,
          },
          orderBy: {
            price: 'asc'
          }
        },
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data for frontend compatibility
    const transformedProducts = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      slug: product.slug,
      tags: Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags as string || '[]'),
      images: Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]'),
      productType: product.productType,
      isActive: product.isActive,
      requiresShipping: product.requiresShipping,
      trackQuantity: product.trackQuantity,
      weight: product.weight,
      weightUnit: product.weightUnit,
      dimensions: product.dimensions,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      } : null,
      variants: product.variants.map(variant => ({
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
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[PRODUCTS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Zod schema for validation
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  productType: z.enum(['physical', 'digital', 'service']).default('physical'),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  requiresShipping: z.boolean().optional(),
  weight: z.number().optional(),
  weightUnit: z.string().optional(),
  dimensions: z.object({
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    unit: z.string().optional()
  }).optional(),
  trackQuantity: z.boolean().default(true),
  continueSellingWhenOutOfStock: z.boolean().default(false),
  variants: z.array(z.object({
    name: z.string(),
    price: z.number().min(0, "Price must be a positive number"),
    compareAtPrice: z.number().min(0).optional().nullable(),
    cost: z.number().min(0).optional().nullable(),
    stock: z.number().int().min(0, "Stock must be a positive integer"),
    sku: z.string().optional().nullable(),
    barcode: z.string().optional().nullable(),
    trackQuantity: z.boolean().default(true),
    continueSellingWhenOutOfStock: z.boolean().default(false),
    weight: z.number().min(0).optional().nullable(),
    weightUnit: z.string().optional(),
    options: z.record(z.string()).optional(),
    images: z.array(z.string()).optional(),
  })).min(1, "At least one variant is required"),
});

// POST - Create a new product with variants
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const store = await prisma.store.findFirst({
      where: { id: storeId, userId: session.user.id },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const { 
      name, description, productType, categoryId, metaTitle, metaDescription, 
      slug, isActive, tags, images, requiresShipping, weight, weightUnit, 
      dimensions, trackQuantity, continueSellingWhenOutOfStock, variants 
    } = validation.data;

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          description,
          productType,
          storeId,
          categoryId,
          metaTitle,
          metaDescription,
          slug,
          isActive,
          tags: JSON.stringify(tags || []),
          images: JSON.stringify(images || []),
          requiresShipping: requiresShipping || (productType === 'physical'),
          weight,
          weightUnit,
          dimensions,
          trackQuantity,
          continueSellingWhenOutOfStock,
        },
      });

      // Create variants with images
      for (const variant of variants) {
        const newVariant = await tx.productVariant.create({
          data: {
            name: variant.name,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            cost: variant.cost,
            stock: variant.stock,
            sku: variant.sku,
            barcode: variant.barcode,
            trackQuantity: variant.trackQuantity,
            continueSellingWhenOutOfStock: variant.continueSellingWhenOutOfStock,
            weight: variant.weight,
            weightUnit: variant.weightUnit,
            options: variant.options || {},
            productId: newProduct.id,
          },
        });

        // Create variant images if provided
        if (variant.images && variant.images.length > 0) {
          await tx.productImage.createMany({
            data: variant.images.map((url) => ({
              url,
              variantId: newVariant.id,
            })),
          });
        }
      }

      return newProduct;
    });

    // Fetch complete product with relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        variants: {
          include: {
            images: true
          }
        }
      }
    });

    return NextResponse.json(completeProduct, { status: 201 });

  } catch (error: any) {
    console.error('[PRODUCTS API] POST Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0] || 'field';
      return NextResponse.json({ 
        error: `Unique constraint failed: This ${target} is already in use.` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
