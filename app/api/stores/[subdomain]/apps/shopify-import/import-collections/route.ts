import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { downloadImage } from '@/lib/image-downloader';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await context.params;
    const { collections } = await request.json();

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

    // Import collections as categories
    const importedCategories = [];
    const errors = [];

    for (const collection of collections) {
      try {
        // Check if category already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            storeId: store.id,
            OR: [
              { slug: collection.handle },
              { name: collection.title }
            ]
          }
        });

        // Download collection image if available
        let downloadedImageUrl = null;
        const imageUrl = collection.image?.src || collection.image;
        if (imageUrl) {
          downloadedImageUrl = await downloadImage(imageUrl, subdomain);
        }

        if (existingCategory) {
          // Update existing category
          const updated = await prisma.category.update({
            where: { id: existingCategory.id },
            data: {
              name: collection.title,
              description: collection.description || '',
              image: downloadedImageUrl || existingCategory.image,
              updatedAt: new Date(),
            },
            include: {
              _count: {
                select: { products: true }
              }
            }
          });
          importedCategories.push(updated);
        } else {
          // Create new category
          const created = await prisma.category.create({
            data: {
              storeId: store.id,
              name: collection.title,
              slug: collection.handle || collection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: collection.description || '',
              image: downloadedImageUrl,
            },
            include: {
              _count: {
                select: { products: true }
              }
            }
          });
          importedCategories.push(created);
        }

        // Link products to categories based on collection products
        if (collection.products && collection.products.length > 0) {
          for (const productHandle of collection.products) {
            try {
              // Find product by handle or title
              const product = await prisma.product.findFirst({
                where: {
                  storeId: store.id,
                  OR: [
                    { slug: productHandle },
                    { name: productHandle }
                  ]
                }
              });

              if (product) {
                // Update product with category
                await prisma.product.update({
                  where: { id: product.id },
                  data: {
                    category: {
                      connect: { id: importedCategories[importedCategories.length - 1].id }
                    }
                  }
                });
              }
            } catch (err) {
              console.error(`Error linking product ${productHandle}:`, err);
            }
          }
        }
      } catch (error) {
        console.error(`Error importing collection ${collection.title}:`, error);
        errors.push({
          collection: collection.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return apiResponse.success({
      imported: importedCategories.length,
      categories: importedCategories,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Import collections error:', error);
    return handleApiError(error);
  }
}