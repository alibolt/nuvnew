import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      );
    }

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

    // Get or create default category
    let defaultCategory = await prisma.category.findFirst({
      where: { storeId: storeId, name: 'Imported from Shopify' },
    });

    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          storeId: storeId,
          name: 'Imported from Shopify',
          slug: 'imported-from-shopify',
        },
      });
    }

    // Import products
    const importedProducts = [];
    for (const product of products) {
      try {
        // Create product
        const newProduct = await prisma.product.create({
          data: {
            storeId: storeId,
            categoryId: defaultCategory.id,
            name: product.title,
            slug: product.handle || product.title.toLowerCase().replace(/\s+/g, '-'),
            description: product.description || '',
            productType: product.productType || 'physical',
            isActive: true,
            tags: product.tags || [],
            images: product.images?.map((img: any) => img.url || img) || [],
          },
        });

        // Create variants
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            const variantData = await prisma.productVariant.create({
              data: {
                productId: newProduct.id,
                name: variant.title || 'Default',
                sku: variant.sku || `${newProduct.slug}-${Date.now()}`,
                price: parseFloat(variant.price) || 0,
                compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
                stock: variant.inventory?.quantity || 100,
                trackQuantity: true,
                options: variant.options || variant.selectedOptions || [],
              },
            });

            // Add variant image if available
            if (variant.image) {
              await prisma.productImage.create({
                data: {
                  variantId: variantData.id,
                  url: variant.image.url,
                },
              });
            }
          }
        } else {
          // Create default variant
          await prisma.productVariant.create({
            data: {
              productId: newProduct.id,
              name: 'Default',
              sku: `${newProduct.slug}-${Date.now()}`,
              price: 0,
              stock: 100,
              trackQuantity: true,
              options: [],
            },
          });
        }

        // Add product images
        if (product.images && product.images.length > 0) {
          const defaultVariant = await prisma.productVariant.findFirst({
            where: { productId: newProduct.id },
          });

          if (defaultVariant) {
            for (let i = 0; i < product.images.length; i++) {
              const image = product.images[i];
              await prisma.productImage.create({
                data: {
                  variantId: defaultVariant.id,
                  url: image.url,
                },
              });
            }
          }
        }

        importedProducts.push(newProduct);
      } catch (error) {
        console.error('Error importing product:', product.title, error);
        // Continue with next product
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedProducts.length,
      total: products.length,
      products: importedProducts,
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
}