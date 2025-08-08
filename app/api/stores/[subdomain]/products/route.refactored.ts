import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { verifyAuth } from '@/lib/api/auth';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { 
  validateRequestBody, 
  validateQueryParams, 
  getPaginationParams,
  buildPaginationOptions,
  commonSchemas,
  filterBuilders
} from '@/lib/api/validation';
import { 
  buildSearchWhere, 
  mergeWhereConditions,
  commonIncludes,
  buildPaginationMeta
} from '@/lib/api/database';

// Schema for product query parameters
const productQuerySchema = commonSchemas.pagination.extend({
  category: z.string().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  public: z.coerce.boolean().optional()
});

// Schema for creating product
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: commonSchemas.slug,
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  tags: commonSchemas.tags,
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }).optional(),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string(),
    price: commonSchemas.money,
    compareAtPrice: commonSchemas.money.optional(),
    inventory: z.number().int().min(0).default(0),
    weight: z.number().optional(),
    images: z.array(z.string().url()).optional()
  })).min(1)
});

// GET - List products for a store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Verify authentication and get store
    const { error, store } = await verifyAuth(request, subdomain, { 
      allowPublic: true 
    });
    
    if (error) return error;
    if (!store) return apiResponse.notFound('Store');

    // Validate query parameters
    const { data: queryParams, error: validationError } = validateQueryParams(
      new URL(request.url).searchParams,
      productQuerySchema
    );

    if (validationError) {
      return apiResponse.validationError(validationError.errors);
    }

    const { search, category, active, public: isPublic, ...paginationParams } = queryParams!;

    // Build where clause
    const whereConditions = [
      { storeId: store.id },
      buildSearchWhere(search, ['name', 'description']),
      category ? { categoryId: category } : undefined,
      isPublic ? { isActive: true } : (active !== undefined ? { isActive: active } : undefined)
    ];

    const where = mergeWhereConditions(...whereConditions);

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: isPublic ? commonIncludes.product.minimal : commonIncludes.product.full,
      ...buildPaginationOptions(paginationParams)
    });

    // Transform data for frontend compatibility
    const transformedProducts = products.map(product => ({
      ...product,
      // Calculate aggregated data
      price: product.variants[0]?.price || 0,
      compareAtPrice: product.variants[0]?.compareAtPrice,
      inStock: product.variants.some(v => v.inventory > 0),
      totalInventory: product.variants.reduce((sum, v) => sum + v.inventory, 0),
      averageRating: product.reviews?.length 
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
        : null
    }));

    // Return paginated response
    return apiResponse.paginated(
      transformedProducts,
      buildPaginationMeta(total, paginationParams.page, paginationParams.limit)
    );

  } catch (error) {
    return handleApiError(error, 'PRODUCTS API GET');
  }
}

// POST - Create a new product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Verify authentication and store ownership
    const { error, store, session } = await verifyAuth(request, subdomain);
    
    if (error) return error;
    if (!store) return apiResponse.notFound('Store');

    // Validate request body
    const { data: productData, error: validationError } = await validateRequestBody(
      request,
      createProductSchema
    );

    if (validationError) {
      return apiResponse.validationError(validationError.errors);
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        storeId: store.id,
        slug: productData!.slug
      }
    });

    if (existingProduct) {
      return apiResponse.conflict('A product with this slug already exists');
    }

    // Create product with variants
    const { variants, ...productInfo } = productData!;
    
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        storeId: store.id,
        variants: {
          create: variants.map((variant, index) => ({
            ...variant,
            position: index,
            images: variant.images ? {
              create: variant.images.map((url, imgIndex) => ({
                url,
                position: imgIndex
              }))
            } : undefined
          }))
        }
      },
      include: commonIncludes.product.full
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        storeId: store.id,
        userId: session.user.id,
        action: 'product.created',
        entityType: 'product',
        entityId: product.id,
        details: {
          name: product.name,
          variantCount: variants.length
        }
      }
    });

    return apiResponse.success(product, {
      message: 'Product created successfully'
    });

  } catch (error) {
    return handleApiError(error, 'PRODUCTS API POST');
  }
}