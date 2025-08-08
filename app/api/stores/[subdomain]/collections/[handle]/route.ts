import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/collections/[handle]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; handle: string }> }
) {
  try {
    const { subdomain, handle } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const sort = searchParams.get('sort') || 'created';
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    
    // Advanced filters
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
    
    const skip = (page - 1) * limit;

    // Get store by subdomain
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Build where clause for products
    let productWhere: any = {};
    
    // Search filter
    if (search) {
      productWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      productWhere.price = {};
      if (minPrice !== undefined) productWhere.price.gte = minPrice * 100; // Convert to cents
      if (maxPrice !== undefined) productWhere.price.lte = maxPrice * 100;
    }

    // Brand filter (assuming brand is stored in tags or as a separate field)
    if (brands.length > 0) {
      if (productWhere.OR) {
        productWhere.AND = [
          { OR: productWhere.OR },
          { OR: brands.map(brand => ({ tags: { has: brand } })) }
        ];
        delete productWhere.OR;
      } else {
        productWhere.OR = brands.map(brand => ({ tags: { has: brand } }));
      }
    }

    // Size and Color filters - need to check variants
    if (sizes.length > 0 || colors.length > 0) {
      const variantFilters: any = {};
      
      if (sizes.length > 0) {
        variantFilters.OR = variantFilters.OR || [];
        variantFilters.OR.push(...sizes.map(size => ({
          options: {
            path: ['size'],
            equals: size
          }
        })));
      }
      
      if (colors.length > 0) {
        if (variantFilters.OR) {
          variantFilters.AND = [{
            OR: variantFilters.OR
          }, {
            OR: colors.map(color => ({
              options: {
                path: ['color'],
                equals: color
              }
            }))
          }];
          delete variantFilters.OR;
        } else {
          variantFilters.OR = colors.map(color => ({
            options: {
              path: ['color'],
              equals: color
            }
          }));
        }
      }
      
      // Add variant filter to product where clause
      productWhere.variants = {
        some: variantFilters
      };
    }

    // Get order by clause
    const getOrderBy = (sort: string) => {
      switch (sort) {
        case 'price-asc':
          return { price: 'asc' as const };
        case 'price-desc':
          return { price: 'desc' as const };
        case 'name':
          return { name: 'asc' as const };
        case 'created':
        default:
          return { createdAt: 'desc' as const };
      }
    };

    // Get collection with products
    const collection = await prisma.category.findFirst({
      where: {
        slug: handle,
        storeId: store.id,
      },
      include: {
        products: {
          where: productWhere,
          include: {
            variants: {
              include: {
                images: true
              }
            },
          },
          orderBy: getOrderBy(sort),
          skip,
          take: limit,
        },
        _count: {
          select: { 
            products: {
              where: productWhere
            }
          }
        }
      },
    });

    if (!collection) {
      return apiResponse.notFound('Collection ');
    }

    // Get all products in collection to extract available filters
    const allCollectionProducts = await prisma.product.findMany({
      where: {
        categoryId: collection.id,
      },
      include: {
        variants: true,
      },
    });

    // Extract available filter options
    const availableSizes = new Set<string>();
    const availableColors = new Set<string>();
    const availableBrands = new Set<string>();
    let lowestPrice = Infinity;
    let highestPrice = 0;

    allCollectionProducts.forEach(product => {
      // Extract brands from tags (assuming brands are tagged)
      (product.tags as string[] || []).forEach((tag: string) => {
        if (tag.toLowerCase().includes('brand:')) {
          availableBrands.add(tag.replace('brand:', '').trim());
        }
      });

      // Track price range from variants
      product.variants.forEach(variant => {
        if (variant.price < lowestPrice) lowestPrice = variant.price;
        if (variant.price > highestPrice) highestPrice = variant.price;
        
        // Extract sizes and colors from variant options
        const options = variant.options as any;
        if (options?.size) availableSizes.add(options.size);
        if (options?.color) availableColors.add(options.color);
      });
    });

    // Format response
    const response = {
      collection: {
        id: collection.id,
        name: collection.name,
        handle: collection.slug,
        description: collection.description,
        image: collection.image,
      },
      products: collection.products.map(product => ({
        id: product.id,
        name: product.name,
        handle: product.slug,
        description: product.description,
        price: product.variants[0]?.price || 0,
        compareAtPrice: product.variants[0]?.compareAtPrice || null,
        images: product.images,
        variants: product.variants,
        tags: product.tags,
        createdAt: product.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalProducts: collection._count.products,
        totalPages: Math.ceil(collection._count.products / limit),
        hasNextPage: page * limit < collection._count.products,
        hasPrevPage: page > 1,
      },
      filters: {
        applied: {
          sort,
          search,
          minPrice,
          maxPrice,
          sizes,
          colors,
          brands,
        },
        available: {
          sizes: Array.from(availableSizes).sort(),
          colors: Array.from(availableColors).sort(),
          brands: Array.from(availableBrands).sort(),
          priceRange: {
            min: lowestPrice / 100,
            max: highestPrice / 100,
          }
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}