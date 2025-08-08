import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    console.log('[Search API] Request:', { subdomain, query });

    if (!query || query.length < 3) {
      return apiResponse.success({ suggestions: [], products: [], categories: [] });
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });

    console.log('[Search API] Store found:', store);

    if (!store) {
      return apiResponse.success({ suggestions: [], products: [], categories: [] });
    }

    // Get actual products with details
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ]
      },
      select: { 
        id: true,
        name: true,
        slug: true,
        images: true,
        variants: {
          select: { 
            price: true,
            compareAtPrice: true
          },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      take: 5,
      orderBy: {
        name: 'asc'
      }
    });

    console.log('[Search API] Products found:', products.length);

    // Get unique product names as suggestions
    const productSuggestions = products.map(p => p.name);

    // Also search in categories
    const categories = await prisma.category.findMany({
      where: {
        storeId: store.id,
        name: { contains: query }
      },
      select: { 
        id: true,
        name: true,
        slug: true 
      },
      take: 3
    });

    // Format products for response
    const formattedProducts = products.map(product => {
      const images = Array.isArray(product.images) 
        ? product.images 
        : (typeof product.images === 'string' 
            ? JSON.parse(product.images || '[]') 
            : []);
      
      const firstImage = images[0];
      const price = product.variants[0]?.price || 0;
      const compareAtPrice = product.variants[0]?.compareAtPrice;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price,
        compareAtPrice,
        image: typeof firstImage === 'string' ? firstImage : firstImage?.url || null
      };
    });

    // Format categories for response
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      type: 'category'
    }));

    // Create text suggestions from product and category names
    const textSuggestions = [
      ...products.map(p => p.name),
      ...categories.map(c => c.name)
    ];

    // Sort text suggestions by relevance
    const sortedSuggestions = textSuggestions.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const queryLower = query.toLowerCase();

      // Exact match
      if (aLower === queryLower) return -1;
      if (bLower === queryLower) return 1;

      // Starts with
      if (aLower.startsWith(queryLower) && !bLower.startsWith(queryLower)) return -1;
      if (!aLower.startsWith(queryLower) && bLower.startsWith(queryLower)) return 1;

      // Default alphabetical
      return a.localeCompare(b);
    });

    return apiResponse.success({ 
      suggestions: sortedSuggestions.slice(0, 5),
      products: formattedProducts,
      categories: formattedCategories
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return apiResponse.serverError('Search failed: ' + (error as Error).message);
  }
}