import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '../page-renderer';
import { getCompiledTemplate } from '@/lib/services/hybrid-template-loader';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface SearchPageProps {
  params: Promise<{
    subdomain: string;
  }>;
  searchParams: Promise<{
    q?: string;
    query?: string;
    page?: string;
    sort?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

async function getStore(subdomain: string) {
  try {
    return await prisma.store.findUnique({
      where: { subdomain },
      include: {
        products: {
          include: {
            category: true,
            variants: {
              include: {
                images: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        templates: {
          where: { enabled: true },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

async function getSearchTemplate(storeId: string) {
  try {
    return await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType: 'search',
        isDefault: true,
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            blocks: {
              where: {
                enabled: true,
              },
              orderBy: {
                position: 'asc',
              },
            },
          },
        }
      }
    });
  } catch (error) {
    console.error('Error fetching search template:', error);
    return null;
  }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { subdomain } = await params;
  const searchParamsResolved = await searchParams;
  
  console.log('[Search Page] Raw searchParams:', searchParamsResolved);
  
  // Extract search query
  const searchQuery = searchParamsResolved.q || searchParamsResolved.query || '';
  
  console.log('[Search Page] Extracted query:', searchQuery);

  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    notFound();
  }

  // Use hybrid template loader
  const themeCode = store.themeCode || 'commerce';
  const [compiledTemplate, globalSections] = await Promise.all([
    getCompiledTemplate(subdomain, themeCode, 'search'),
    getGlobalSections(subdomain, themeCode)
  ]);
  
  let template;
  
  if (compiledTemplate) {
    // Create template structure from compiled template
    template = {
      id: 'search-hybrid',
      sections: compiledTemplate.sections,
      templateType: 'search',
    };
  } else {
    // Fallback to database template
    template = await getSearchTemplate(store.id);
    if (!template) {
      console.error('No search template found for store:', store.id);
      notFound();
    }
  }

  // Get theme settings from store template
  let themeSettings = {};
  if (store.templates?.[0]?.settings) {
    // Settings might be a JSON string or already an object
    if (typeof store.templates[0].settings === 'string') {
      try {
        themeSettings = JSON.parse(store.templates[0].settings);
      } catch (error) {
        console.error('Failed to parse theme settings:', error);
        themeSettings = {};
      }
    } else {
      themeSettings = store.templates[0].settings;
    }
  }
  
  // Convert flat settings to nested object
  const nestedSettings: any = {};
  Object.entries(themeSettings).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = nestedSettings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  });
  
  // Fetch search results if query exists
  let searchResults = null;
  let totalResults = 0;
  let searchFilters = null;
  
  console.log('[Search Page] Search query:', searchQuery);
  
  if (searchQuery) {
    try {
      // Use absolute URL for server-side fetch
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const searchUrl = new URL(`${baseUrl}/api/stores/${subdomain}/search`);
      searchUrl.searchParams.set('query', searchQuery);
      searchUrl.searchParams.set('page', searchParamsResolved.page || '1');
      searchUrl.searchParams.set('sort', searchParamsResolved.sort || 'relevance');
      searchUrl.searchParams.set('type', searchParamsResolved.type || 'all');
      
      if (searchParamsResolved.minPrice) {
        searchUrl.searchParams.set('minPrice', searchParamsResolved.minPrice);
      }
      if (searchParamsResolved.maxPrice) {
        searchUrl.searchParams.set('maxPrice', searchParamsResolved.maxPrice);
      }
      
      console.log('[Search Page] Fetching from:', searchUrl.toString());
      
      const response = await fetch(searchUrl.toString(), {
        next: { revalidate: 60 } // Cache for 1 minute
      });
      
      console.log('[Search Page] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Search Page] API Response:', {
          hasResults: !!data.results,
          productsCount: data.results?.products?.length || 0,
          totalResults: data.pagination?.totalResults || 0,
          firstProduct: data.results?.products?.[0]?.name,
          filters: data.filters
        });
        searchResults = data.results;
        totalResults = data.pagination?.totalResults || 0;
        searchFilters = data.filters;
      } else {
        const errorText = await response.text();
        console.error('[Search Page] API Error:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    }
  } else {
    console.log('[Search Page] No search query provided');
  }

  // Prepare page data
  const pageData = {
    type: 'search',
    query: searchQuery,
    searchParams: searchParamsResolved,
    searchResults,
    totalResults,
    results: searchResults, // For compatibility
    filters: searchFilters, // Add filters to page data
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      description: store.description,
      logo: store.logo,
      // primaryColor removed - use theme settings colors.primary instead
      email: store.email,
      phone: store.phone,
      address: store.address,
      facebook: store.facebook,
      instagram: store.instagram,
      twitter: store.twitter,
      youtube: store.youtube,
    },
    template,
  };

  return (
    <PageRenderer 
      pageData={pageData}
      store={store}
      themeCode={themeCode}
      globalSections={globalSections}
      themeSettings={nestedSettings}
    />
  );
}

export async function generateMetadata({ params, searchParams }: SearchPageProps) {
  const { subdomain } = await params;
  const { q, query } = await searchParams;
  const searchQuery = q || query || '';
  
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    return {
      title: 'Search Not Found',
    };
  }

  return {
    title: searchQuery 
      ? `Search results for "${searchQuery}" | ${store.name}`
      : `Search | ${store.name}`,
    description: searchQuery 
      ? `Find products and collections matching "${searchQuery}" at ${store.name}`
      : `Search for products and collections at ${store.name}`,
  };
}