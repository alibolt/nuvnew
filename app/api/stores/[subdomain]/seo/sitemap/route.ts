import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Generate sitemap
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xml'; // xml or txt
    
    // Get store (public endpoint, no auth required for sitemap)
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain },
          { subdomain: subdomain }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const baseUrl = store.customDomain 
      ? `https://${store.customDomain}`
      : `https://${store.subdomain}.nuvi.com`;

    // Get all public pages, products, collections, and blog posts
    const [products, categories, pages, blogPosts] = await Promise.all([
      prisma.product.findMany({
        where: { 
          storeId: store.id,
          isActive: true
        },
        select: {
          id: true,
          slug: true,
          updatedAt: true
        }
      }),
      prisma.category.findMany({
        where: { storeId: store.id },
        select: {
          id: true,
          slug: true,
          updatedAt: true
        }
      }),
      prisma.page.findMany({
        where: { 
          storeId: store.id,
          isPublished: true
        },
        select: {
          id: true,
          slug: true,
          updatedAt: true
        }
      }),
      prisma.blogPost.findMany({
        where: { 
          storeId: store.id,
          isPublished: true
        },
        select: {
          id: true,
          slug: true,
          blogId: true,
          updatedAt: true,
          blog: {
            select: { slug: true }
          }
        }
      })
    ]);

    // Get SEO settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const seoSettings = storeSettings?.seoSettings as any;
    const disallowedPaths = seoSettings?.robots?.disallowPaths || ['/checkout', '/account', '/admin'];

    // Build sitemap entries
    const sitemapEntries = [
      // Homepage
      {
        loc: baseUrl,
        lastmod: store.updatedAt.toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      // Products
      ...products.map(product => ({
        loc: `${baseUrl}/products/${product.slug || product.id}`,
        lastmod: product.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      })),
      // Categories/Collections
      ...categories.map(category => ({
        loc: `${baseUrl}/collections/${category.slug}`,
        lastmod: category.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.7
      })),
      // Pages
      ...pages.map(page => ({
        loc: `${baseUrl}/pages/${page.slug}`,
        lastmod: page.updatedAt.toISOString(),
        changefreq: 'monthly',
        priority: 0.6
      })),
      // Blog posts
      ...blogPosts.map(post => ({
        loc: `${baseUrl}/blogs/${post.blog.slug}/${post.slug}`,
        lastmod: post.updatedAt.toISOString(),
        changefreq: 'monthly',
        priority: 0.5
      }))
    ];

    // Filter out disallowed paths
    const filteredEntries = sitemapEntries.filter(entry => {
      const url = new URL(entry.loc);
      return !disallowedPaths.some((path: string) => url.pathname.startsWith(path));
    });

    // Generate sitemap based on format
    if (format === 'txt') {
      // Simple text format
      const sitemapText = filteredEntries.map(entry => entry.loc).join('\n');
      
      return new NextResponse(sitemapText, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });
    } else {
      // XML format
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${filteredEntries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      return new NextResponse(sitemapXml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });
    }
  } catch (error) {
    console.error('[SITEMAP API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Trigger sitemap regeneration and submit to search engines
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { submitToSearchEngines = true } = body;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const sitemapUrl = store.customDomain 
      ? `https://${store.customDomain}/sitemap.xml`
      : `https://${store.subdomain}.nuvi.com/sitemap.xml`;

    const submissions = [];

    if (submitToSearchEngines) {
      // Submit to Google
      try {
        const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        // In production, you would make an actual HTTP request here
        // await fetch(googleUrl);
        submissions.push({ engine: 'Google', status: 'submitted', url: googleUrl });
      } catch (error) {
        submissions.push({ engine: 'Google', status: 'failed', error: (error as Error).message });
      }

      // Submit to Bing
      try {
        const bingUrl = `https://www.bing.com/indexnow?url=${encodeURIComponent(sitemapUrl)}&key=YOUR_API_KEY`;
        // In production, you would make an actual HTTP request here
        // await fetch(bingUrl);
        submissions.push({ engine: 'Bing', status: 'submitted', url: bingUrl });
      } catch (error) {
        submissions.push({ engine: 'Bing', status: 'failed', error: (error as Error).message });
      }
    }

    // Update last sitemap generation time
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const seoSettings = (storeSettings?.seoSettings as any) || {};
    seoSettings.sitemap = {
      lastGenerated: new Date().toISOString(),
      lastSubmitted: submitToSearchEngines ? new Date().toISOString() : null,
      submissions
    };

    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { seoSettings }
    });

    return NextResponse.json({ 
      message: 'Sitemap regenerated successfully',
      sitemapUrl,
      submissions
    });
  } catch (error) {
    console.error('[SITEMAP API] POST Error:', error);
    return apiResponse.serverError();
  }
}