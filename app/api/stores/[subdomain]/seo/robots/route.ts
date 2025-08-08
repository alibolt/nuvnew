import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// GET - Generate robots.txt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Get store (public endpoint, no auth required for robots.txt)
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

    // Get SEO settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const seoSettings = storeSettings?.seoSettings as any;
    const robotsSettings = seoSettings?.robots || {
      allowCrawling: true,
      disallowPaths: ['/checkout', '/account', '/admin', '/cart'],
      crawlDelay: 0,
      sitemapPath: '/sitemap.xml'
    };

    const baseUrl = store.customDomain 
      ? `https://${store.customDomain}`
      : `https://${store.subdomain}.nuvi.com`;

    // Generate robots.txt content
    let robotsContent = '';

    if (robotsSettings.allowCrawling) {
      // Allow crawling with specific disallow paths
      robotsContent += 'User-agent: *\n';
      
      if (robotsSettings.crawlDelay && robotsSettings.crawlDelay > 0) {
        robotsContent += `Crawl-delay: ${robotsSettings.crawlDelay}\n`;
      }
      
      if (robotsSettings.disallowPaths && robotsSettings.disallowPaths.length > 0) {
        robotsSettings.disallowPaths.forEach((path: string) => {
          robotsContent += `Disallow: ${path}\n`;
        });
      } else {
        robotsContent += 'Allow: /\n';
      }
      
      // Add sitemap
      if (robotsSettings.sitemapPath) {
        robotsContent += `\nSitemap: ${baseUrl}${robotsSettings.sitemapPath}\n`;
      }
      
      // Specific rules for search engine bots
      robotsContent += '\n# Googlebot\n';
      robotsContent += 'User-agent: Googlebot\n';
      robotsContent += 'Allow: /\n';
      robotsContent += 'Disallow: /admin\n';
      robotsContent += 'Disallow: /checkout\n';
      robotsContent += 'Disallow: /cart\n';
      robotsContent += 'Disallow: /account\n';
      
      robotsContent += '\n# Bingbot\n';
      robotsContent += 'User-agent: Bingbot\n';
      robotsContent += 'Allow: /\n';
      robotsContent += 'Disallow: /admin\n';
      robotsContent += 'Disallow: /checkout\n';
      robotsContent += 'Disallow: /cart\n';
      robotsContent += 'Disallow: /account\n';
      
      // Block bad bots
      robotsContent += '\n# Block bad bots\n';
      const badBots = ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot'];
      badBots.forEach(bot => {
        robotsContent += `User-agent: ${bot}\n`;
        robotsContent += 'Disallow: /\n\n';
      });
      
    } else {
      // Disallow all crawling
      robotsContent = 'User-agent: *\nDisallow: /\n';
    }

    return new NextResponse(robotsContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error('[ROBOTS API] GET Error:', error);
    
    // Return a basic robots.txt on error
    const fallbackRobots = 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\n';
    
    return new NextResponse(fallbackRobots, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
}