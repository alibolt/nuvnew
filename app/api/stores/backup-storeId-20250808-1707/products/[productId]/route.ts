import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    
    // For public access (storefront), don't require authentication
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

    // Build where clause
    const where: any = {
      id: productId,
      storeId,
    };

    // For public access, only show active products
    if (isPublic) {
      where.isActive = true;
    }
    
    const product = await prisma.product.findFirst({
      where,
      include: {
        category: true,
        variants: {
          include: {
            images: true
          },
          orderBy: {
            price: 'asc'
          }
        },
        template: true,
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Transform data for frontend compatibility
    const transformedProduct = {
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
      vendor: 'Store', // Default vendor
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
      template: product.template,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('[PRODUCT API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Zod schema for update validation
const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  productType: z.enum(['physical', 'digital', 'service']).optional(),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    price: z.number().min(0, "Price must be a positive number"),
    stock: z.number().int().min(0, "Stock must be a positive integer"),
    sku: z.string().optional(),
    options: z.record(z.string()).optional(),
    images: z.array(z.string()).optional(),
  })).min(1, "At least one variant is required"),
});

// Zod schema for partial update (auto-save)
const patchProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  productType: z.enum(['physical', 'digital', 'service']).optional(),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// PATCH - Partial update product (auto-save)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, productId } = await params;
    
    // Verify store ownership
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
        store: {
          userId: session.user.id
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const validation = patchProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;
    
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.productType !== undefined && { productType: data.productType }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.tags !== undefined && { tags: data.tags }),
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[PRODUCT API] PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update product
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
    
    // Verify store ownership and product exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
        store: {
          userId: session.user.id
        }
      },
      include: {
        variants: {
          include: {
            images: true
          }
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const { name, description, productType, categoryId, metaTitle, metaDescription, slug, isActive, tags, variants } = validation.data;

    const product = await prisma.$transaction(async (tx) => {
      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          productType: productType || existingProduct.productType,
          categoryId,
          metaTitle,
          metaDescription,
          slug,
          isActive: isActive !== undefined ? isActive : existingProduct.isActive,
          tags: tags !== undefined ? tags : existingProduct.tags as any
        }
      });

      // Handle variants
      const existingVariantIds = existingProduct.variants.map(v => v.id);
      const incomingVariantIds = variants.filter(v => v.id).map(v => v.id!);
      const variantsToDelete = existingVariantIds.filter(id => !incomingVariantIds.includes(id));

      // Delete removed variants
      if (variantsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: {
            id: { in: variantsToDelete }
          }
        });
      }

      // Update or create variants
      for (const variant of variants) {
        if (variant.id) {
          // Update existing variant
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              name: variant.name,
              price: variant.price,
              stock: variant.stock,
              sku: variant.sku,
              options: variant.options || {}
            }
          });

          // Handle variant images
          if (variant.images) {
            // Delete existing images
            await tx.productImage.deleteMany({
              where: { variantId: variant.id }
            });

            // Create new images
            if (variant.images.length > 0) {
              await tx.productImage.createMany({
                data: variant.images.map((url, index) => ({
                  url,
                  variantId: variant.id!,
                  order: index
                }))
              });
            }
          }
        } else {
          // Create new variant
          const newVariant = await tx.productVariant.create({
            data: {
              name: variant.name,
              price: variant.price,
              stock: variant.stock,
              sku: variant.sku,
              options: variant.options || {},
              productId
            }
          });

          // Create variant images
          if (variant.images && variant.images.length > 0) {
            await tx.productImage.createMany({
              data: variant.images.map((url, index) => ({
                url,
                variantId: newVariant.id,
                order: index
              }))
            });
          }
        }
      }

      return updatedProduct;
    });

    // Fetch complete updated product
    const completeProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          include: {
            images: true
          }
        }
      }
    });

    return NextResponse.json(completeProduct);
  } catch (error) {
    console.error('[PRODUCT API] PUT Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete product
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
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[PRODUCT API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}