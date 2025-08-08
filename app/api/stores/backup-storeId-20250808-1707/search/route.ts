import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for advanced search request
const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.object({
    categories: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional()
    }).optional(),
    tags: z.array(z.string()).optional(),
    availability: z.enum(['in_stock', 'out_of_stock', 'all']).default('all'),
    productType: z.enum(['physical', 'digital', 'service', 'all']).default('all'),
    rating: z.object({
      min: z.number().min(1).max(5).optional(),
      max: z.number().min(1).max(5).optional()
    }).optional(),
    brands: z.array(z.string()).optional(),
    dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional()
    }).optional()
  }).optional(),
  sort: z.object({
    field: z.enum(['relevance', 'price', 'name', 'created', 'updated', 'rating', 'sales']),
    order: z.enum(['asc', 'desc']).default('desc')
  }).default({ field: 'relevance', order: 'desc' }),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  }).default({ page: 1, limit: 20 }),
  facets: z.boolean().default(false),
  suggestions: z.boolean().default(false)
});

// Schema for search settings
const searchSettingsSchema = z.object({
  searchFields: z.array(z.enum(['name', 'description', 'tags', 'sku', 'category'])).default(['name', 'description', 'tags']),
  searchMode: z.enum(['fuzzy', 'exact', 'prefix']).default('fuzzy'),
  minQueryLength: z.number().min(1).max(10).default(2),
  maxResults: z.number().min(10).max(1000).default(100),
  enableAutocomplete: z.boolean().default(true),
  enableSpellcheck: z.boolean().default(true),
  enableSynonyms: z.boolean().default(false),
  synonyms: z.record(z.array(z.string())).optional(),
  stopWords: z.array(z.string()).optional(),
  boostFields: z.record(z.number()).optional(),
  facetFields: z.array(z.string()).default(['categories', 'tags', 'productType', 'availability']),
  searchHistory: z.boolean().default(true),
  popularSearches: z.boolean().default(true)
});

// Helper function to build search query
function buildSearchQuery(storeId: string, searchParams: any) {
  const { query, filters } = searchParams;
  
  const where: any = {
    storeId,
    isActive: true
  };

  // Text search across multiple fields
  if (query && query.trim()) {
    const searchTerms = query.trim().split(/\s+/);
    const searchConditions = searchTerms.map(term => ({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } }
      ]
    }));
    
    where.AND = searchConditions;
  }

  // Category filter
  if (filters?.categories?.length) {
    where.category = {
      slug: { in: filters.categories }
    };
  }

  // Product type filter
  if (filters?.productType && filters.productType !== 'all') {
    where.productType = filters.productType;
  }

  // Price range filter (using variants)
  if (filters?.priceRange?.min !== undefined || filters?.priceRange?.max !== undefined) {
    const priceFilter: any = {};
    if (filters.priceRange.min !== undefined) priceFilter.gte = filters.priceRange.min;
    if (filters.priceRange.max !== undefined) priceFilter.lte = filters.priceRange.max;
    
    where.variants = {
      some: { price: priceFilter }
    };
  }

  // Date range filter
  if (filters?.dateRange?.from || filters?.dateRange?.to) {
    const dateFilter: any = {};
    if (filters.dateRange.from) dateFilter.gte = new Date(filters.dateRange.from);
    if (filters.dateRange.to) dateFilter.lte = new Date(filters.dateRange.to);
    where.createdAt = dateFilter;
  }

  return where;
}

// Helper function to build sort order
function buildSortOrder(sort: any) {
  switch (sort.field) {
    case 'price':
      return { variants: { _min: { price: sort.order } } };
    case 'name':
      return { name: sort.order };
    case 'created':
      return { createdAt: sort.order };
    case 'updated':
      return { updatedAt: sort.order };
    case 'rating':
      return { reviews: { _avg: { rating: sort.order } } };
    case 'sales':
      return { orderLineItems: { _count: sort.order } };
    default: // relevance
      return { updatedAt: 'desc' };
  }
}

// GET /api/stores/[storeId]/search - Basic search and autocomplete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action') || 'search';
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const sort = searchParams.get('sort') || 'relevance';
    const type = searchParams.get('type') || 'all';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    
    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId },
          { subdomain: storeId }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    if (action === 'autocomplete') {
      const q = query.toLowerCase();
      if (q.length < 2) {
        return NextResponse.json({ suggestions: [] });
      }

      // Get autocomplete suggestions
      const [products, categories] = await Promise.all([
        prisma.product.findMany({
          where: {
            storeId: store.id,
            isActive: true,
            name: { contains: q, mode: 'insensitive' }
          },
          select: { name: true, slug: true },
          take: 5
        }),
        prisma.category.findMany({
          where: {
            storeId: store.id,
            name: { contains: q, mode: 'insensitive' }
          },
          select: { name: true, slug: true },
          take: 3
        })
      ]);

      const suggestions = [
        ...products.map(p => ({ type: 'product', text: p.name, slug: p.slug })),
        ...categories.map(c => ({ type: 'category', text: c.name, slug: c.slug }))
      ];

      return NextResponse.json({ suggestions });
    }

    if (action === 'settings') {
      const storeSettings = await prisma.storeSettings.findUnique({
        where: { storeId: store.id }
      });

      const searchSettings = (storeSettings?.searchSettings as any) || {
        searchFields: ['name', 'description', 'tags'],
        searchMode: 'fuzzy',
        minQueryLength: 2,
        enableAutocomplete: true,
        enableSpellcheck: true
      };

      return NextResponse.json({ settings: searchSettings });
    }

    if (!query.trim()) {
      return NextResponse.json({
        query: '',
        results: {
          products: [],
          collections: []
        },
        pagination: {
          currentPage: 1,
          totalResults: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: { sort, type, minPrice, maxPrice }
      });
    }

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query } },
      ]
    };

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
          return { createdAt: 'desc' as const };
        case 'relevance':
        default:
          // For relevance, we'll use created date as fallback
          return { createdAt: 'desc' as const };
      }
    };

    let results: any = {
      products: [],
      collections: []
    };

    // Search products
    if (type === 'all' || type === 'products') {
      let productWhere: any = {
        storeId,
        ...searchConditions
      };

      // Add price filters using variants
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceFilter: any = {};
        if (minPrice !== undefined) priceFilter.gte = minPrice;
        if (maxPrice !== undefined) priceFilter.lte = maxPrice;
        
        productWhere.variants = {
          some: { price: priceFilter }
        };
      }

      const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          include: {
            category: {
              select: { name: true, slug: true }
            },
            variants: {
              select: {
                id: true,
                price: true,
                compareAtPrice: true,
                stock: true,
                sku: true,
                options: true
              }
            },
            reviews: {
              select: { rating: true }
            },
            _count: {
              select: {
                orderLineItems: true,
                reviews: true
              }
            }
          },
          orderBy: getOrderBy(sort),
          skip: type === 'products' ? skip : 0,
          take: type === 'products' ? limit : 12, // Limit products in 'all' search
        }),
        prisma.product.count({ where: productWhere })
      ]);

      results.products = products.map(product => {
        const variants = product.variants;
        const reviews = product.reviews;
        
        const minPrice = Math.min(...variants.map(v => v.price));
        const maxPrice = Math.max(...variants.map(v => v.price));
        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          slug: product.slug,
          productType: product.productType,
          images: product.images,
          tags: product.tags,
          category: product.category,
          price: {
            min: minPrice,
            max: maxPrice,
            display: minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`
          },
          stock: {
            total: totalStock,
            available: totalStock > 0,
            trackQuantity: product.trackQuantity
          },
          rating: {
            average: Math.round(avgRating * 10) / 10,
            count: reviews.length
          },
          sales: {
            count: product._count.orderLineItems
          },
          variants: variants,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        };
      });

      results.totalProducts = totalProducts;
    }

    // Search collections
    if (type === 'all' || type === 'collections') {
      const collectionWhere = {
        storeId,
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ]
      };

      const [collections, totalCollections] = await Promise.all([
        prisma.category.findMany({
          where: collectionWhere,
          include: {
            _count: {
              select: { products: true }
            },
            products: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              },
              take: 4, // Preview products
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { name: 'asc' },
          skip: type === 'collections' ? skip : 0,
          take: type === 'collections' ? limit : 6, // Limit collections in 'all' search
        }),
        prisma.category.count({ where: collectionWhere })
      ]);

      results.collections = collections.map(collection => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        productCount: collection._count.products,
        previewProducts: collection.products,
        createdAt: collection.createdAt,
      }));

      results.totalCollections = totalCollections;
    }

    const totalResults = (results.totalProducts || 0) + (results.totalCollections || 0);
    const totalPages = Math.ceil(totalResults / limit);

    const response = {
      query,
      results,
      pagination: {
        currentPage: page,
        totalResults,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        sort,
        type,
        minPrice,
        maxPrice,
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

// POST - Advanced search with filters and facets
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = searchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid search parameters', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId },
          { subdomain: storeId }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { query, filters, sort, pagination, facets, suggestions } = validation.data;
    
    // Build search query
    const where = buildSearchQuery(store.id, validation.data);
    const orderBy = buildSortOrder(sort);
    
    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Main search query
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { name: true, slug: true }
          },
          variants: {
            select: {
              id: true,
              price: true,
              compareAtPrice: true,
              stock: true,
              sku: true,
              options: true
            }
          },
          reviews: {
            select: { rating: true }
          },
          _count: {
            select: {
              orderLineItems: true,
              reviews: true
            }
          }
        },
        orderBy,
        skip,
        take: pagination.limit
      }),
      prisma.product.count({ where })
    ]);

    // Calculate aggregated data for each product
    const searchResults = products.map(product => {
      const variants = product.variants;
      const reviews = product.reviews;
      
      const minPrice = Math.min(...variants.map(v => v.price));
      const maxPrice = Math.max(...variants.map(v => v.price));
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        slug: product.slug,
        productType: product.productType,
        images: product.images,
        tags: product.tags,
        category: product.category,
        price: {
          min: minPrice,
          max: maxPrice,
          display: minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`
        },
        stock: {
          total: totalStock,
          available: totalStock > 0,
          trackQuantity: product.trackQuantity
        },
        rating: {
          average: Math.round(avgRating * 10) / 10,
          count: reviews.length
        },
        sales: {
          count: product._count.orderLineItems
        },
        variants: variants,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    // Build faceted search results if requested
    let facetResults = null;
    if (facets) {
      const [categoryFacets, typeFacets, priceFacets] = await Promise.all([
        // Category facets
        prisma.product.groupBy({
          by: ['categoryId'],
          where: { ...where, categoryId: { not: null } },
          _count: true,
          orderBy: { _count: { categoryId: 'desc' } }
        }).then(async (results) => {
          const categoryIds = results.map(r => r.categoryId).filter(Boolean);
          const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, slug: true }
          });
          
          return results.map(r => ({
            ...categories.find(c => c.id === r.categoryId),
            count: r._count
          })).filter(Boolean);
        }),
        
        // Product type facets
        prisma.product.groupBy({
          by: ['productType'],
          where,
          _count: true,
          orderBy: { _count: { productType: 'desc' } }
        }).then(results => results.map(r => ({
          type: r.productType,
          count: r._count
        }))),
        
        // Price range facets
        prisma.productVariant.aggregate({
          where: {
            product: where
          },
          _min: { price: true },
          _max: { price: true }
        }).then(result => ({
          min: result._min.price || 0,
          max: result._max.price || 0
        }))
      ]);

      facetResults = {
        categories: categoryFacets,
        productTypes: typeFacets,
        priceRange: priceFacets
      };
    }

    // Generate search suggestions if requested
    let searchSuggestions = null;
    if (suggestions && query) {
      const suggestionQuery = query.trim().toLowerCase();
      
      const [productSuggestions, categorySuggestions] = await Promise.all([
        prisma.product.findMany({
          where: {
            storeId: store.id,
            isActive: true,
            name: { contains: suggestionQuery, mode: 'insensitive' }
          },
          select: { name: true },
          take: 5
        }),
        prisma.category.findMany({
          where: {
            storeId: store.id,
            name: { contains: suggestionQuery, mode: 'insensitive' }
          },
          select: { name: true },
          take: 3
        })
      ]);

      searchSuggestions = {
        products: productSuggestions.map(p => p.name),
        categories: categorySuggestions.map(c => c.name),
        queries: []
      };
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pagination.limit);
    const hasNext = pagination.page < totalPages;
    const hasPrev = pagination.page > 1;

    return NextResponse.json({
      results: searchResults,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalCount,
        pages: totalPages,
        hasNext,
        hasPrev
      },
      facets: facetResults,
      suggestions: searchSuggestions,
      query: {
        text: query,
        filters,
        sort,
        executedAt: new Date().toISOString(),
        resultCount: searchResults.length
      }
    });
  } catch (error) {
    console.error('[ADVANCED SEARCH API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update search settings
export async function PUT(
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
    
    // Validate input
    const validation = searchSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid search settings', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Update search settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        searchSettings: validation.data
      },
      create: {
        storeId: store.id,
        searchSettings: validation.data
      }
    });

    return NextResponse.json({ 
      message: 'Search settings updated successfully',
      settings: validation.data
    });
  } catch (error) {
    console.error('[SEARCH SETTINGS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}