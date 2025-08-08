import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for SEO settings
const seoSettingsSchema = z.object({
  global: z.object({
    defaultTitle: z.string().min(1).max(60),
    titleTemplate: z.string().optional(), // e.g., "%s | Store Name"
    defaultDescription: z.string().min(1).max(160),
    defaultKeywords: z.array(z.string()).optional(),
    defaultImage: z.string().url().optional(),
    favicon: z.string().url().optional(),
    locale: z.string().default('en_US'),
    siteUrl: z.string().url(),
    twitterHandle: z.string().optional(),
    facebookAppId: z.string().optional()
  }),
  pages: z.object({
    home: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      image: z.string().url().optional(),
      noindex: z.boolean().default(false),
      nofollow: z.boolean().default(false)
    }),
    products: z.object({
      titleTemplate: z.string().default('%product_name% - %store_name%'),
      descriptionTemplate: z.string().optional(),
      includePrice: z.boolean().default(true),
      includeAvailability: z.boolean().default(true),
      includeBrand: z.boolean().default(true)
    }),
    collections: z.object({
      titleTemplate: z.string().default('%collection_name% - %store_name%'),
      descriptionTemplate: z.string().optional(),
      includeProductCount: z.boolean().default(true)
    }),
    blog: z.object({
      titleTemplate: z.string().default('%post_title% - %blog_name%'),
      includeAuthor: z.boolean().default(true),
      includePublishDate: z.boolean().default(true)
    })
  }),
  robots: z.object({
    allowCrawling: z.boolean().default(true),
    crawlDelay: z.number().min(0).max(60).optional(),
    disallowPaths: z.array(z.string()).default(['/checkout', '/account', '/admin']),
    sitemapPath: z.string().default('/sitemap.xml')
  }),
  structuredData: z.object({
    organization: z.object({
      enabled: z.boolean().default(true),
      name: z.string().optional(),
      logo: z.string().url().optional(),
      contactPoint: z.object({
        telephone: z.string().optional(),
        contactType: z.string().default('customer service'),
        areaServed: z.array(z.string()).optional(),
        availableLanguage: z.array(z.string()).optional()
      }).optional()
    }),
    breadcrumbs: z.object({
      enabled: z.boolean().default(true),
      homeLabel: z.string().default('Home')
    }),
    searchBox: z.object({
      enabled: z.boolean().default(true),
      searchUrl: z.string().optional()
    })
  }),
  socialMedia: z.object({
    openGraph: z.object({
      enabled: z.boolean().default(true),
      type: z.enum(['website', 'article', 'product']).default('website'),
      siteName: z.string().optional()
    }),
    twitter: z.object({
      enabled: z.boolean().default(true),
      cardType: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
      site: z.string().optional(),
      creator: z.string().optional()
    })
  })
});

// Schema for URL redirect
const urlRedirectSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  type: z.enum(['301', '302', '307', '308']).default('301'),
  enabled: z.boolean().default(true),
  note: z.string().optional()
});

// GET - Get SEO settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    
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

    // Get SEO settings from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const seoSettings = storeSettings?.seoSettings || {
      global: {
        defaultTitle: store.name,
        defaultDescription: store.description || `Welcome to ${store.name}`,
        siteUrl: `https://${store.subdomain}.nuvi.com`,
        locale: 'en_US'
      },
      pages: {
        home: {},
        products: {
          titleTemplate: '%product_name% - %store_name%',
          includePrice: true,
          includeAvailability: true,
          includeBrand: true
        },
        collections: {
          titleTemplate: '%collection_name% - %store_name%',
          includeProductCount: true
        },
        blog: {
          titleTemplate: '%post_title% - %blog_name%',
          includeAuthor: true,
          includePublishDate: true
        }
      },
      robots: {
        allowCrawling: true,
        disallowPaths: ['/checkout', '/account', '/admin'],
        sitemapPath: '/sitemap.xml'
      },
      structuredData: {
        organization: {
          enabled: true,
          name: store.name
        },
        breadcrumbs: {
          enabled: true,
          homeLabel: 'Home'
        },
        searchBox: {
          enabled: true
        }
      },
      socialMedia: {
        openGraph: {
          enabled: true,
          type: 'website',
          siteName: store.name
        },
        twitter: {
          enabled: true,
          cardType: 'summary_large_image'
        }
      }
    };

    const urlRedirects = storeSettings?.urlRedirects || [];

    return NextResponse.json({ 
      seoSettings,
      urlRedirects,
      analytics: {
        indexedPages: 0, // Would come from Google Search Console API
        avgPosition: 0,
        impressions: 0,
        clicks: 0
      }
    });
  } catch (error) {
    console.error('[SEO API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update SEO settings
export async function PUT(
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
    
    // Validate input
    const validation = seoSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

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

    // Update SEO settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        seoSettings: validation.data
      },
      create: {
        storeId: store.id,
        seoSettings: validation.data
      }
    });

    // Log activity
    const activityLog = {
      id: `log_${Date.now()}`,
      action: 'setting.updated',
      resourceType: 'setting',
      resourceId: 'seo',
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      description: 'SEO settings updated',
      timestamp: new Date().toISOString()
    };

    // Update activity logs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });
    
    const activityLogs = (storeSettings?.activityLogs as any[]) || [];
    activityLogs.push(activityLog);
    
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { activityLogs }
    });

    return NextResponse.json({ 
      message: 'SEO settings updated successfully',
      seoSettings: validation.data
    });
  } catch (error) {
    console.error('[SEO API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Add URL redirect
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
    
    // Validate input
    const validation = urlRedirectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

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

    // Get current redirects
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const urlRedirects = (storeSettings?.urlRedirects as any[]) || [];

    // Check for duplicate
    const existingRedirect = urlRedirects.find(r => r.from === validation.data.from);
    if (existingRedirect) {
      return apiResponse.badRequest('A redirect for this URL already exists');
    }

    // Add new redirect
    const newRedirect = {
      id: `redirect_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
      createdBy: session.user.email,
      hits: 0
    };

    urlRedirects.push(newRedirect);

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { urlRedirects }
    });

    return NextResponse.json({ 
      message: 'URL redirect created successfully',
      redirect: newRedirect
    });
  } catch (error) {
    console.error('[SEO API] POST Error:', error);
    return apiResponse.serverError();
  }
}