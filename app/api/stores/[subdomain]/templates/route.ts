import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/stores/[subdomain]/templates
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
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get all templates
    const templates = await prisma.storeTemplate.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        sections: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[subdomain]/templates
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
    const { type, name, isDefault, settings } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await prisma.storeTemplate.updateMany({
        where: {
          storeId: store.id,
          templateType: type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create template
    const template = await prisma.storeTemplate.create({
      data: {
        storeId: store.id,
        themeId,
        templateType: type,
        name: name || type,
        isDefault: isDefault || false,
        enabled: true,
        settings: settings || {},
        seoSettings: {}
      },
    });

    // Add default sections for certain templates
    // Global sections (header, footer, announcement-bar) should only be in homepage template
    if (type === 'homepage') {
      const defaultSections = [
        { sectionType: 'header', position: 0, enabled: true, settings: { textColor: '#374151', backgroundColor: '#ffffff' } },
        { sectionType: 'hero', position: 1, enabled: true, settings: {
          title: `Welcome to ${store.name}`,
          subtitle: 'Discover our amazing products',
          showCTA: true,
          ctaText: 'Shop Now',
          ctaLink: '/collections/all'
        }},
        { sectionType: 'featured-products', position: 2, enabled: true, settings: {
          title: 'Featured Products',
          productCount: 6
        }},
        { sectionType: 'footer', position: 3, enabled: true, settings: {} }
      ];

      await prisma.storeSectionInstance.createMany({
        data: defaultSections.map(section => ({
          templateId: template.id,
          ...section
        }))
      });
    } else if (type === 'product') {
      // Product template should not have header/footer - those come from homepage
      const defaultSections = [
        { sectionType: 'product', position: 0, enabled: true, settings: { 
          layout: 'flexible',
          showBreadcrumbs: true
        }},
        { sectionType: 'related-products', position: 1, enabled: true, settings: {
          title: 'You May Also Like',
          maxProducts: 4
        }},
        { sectionType: 'recently-viewed', position: 2, enabled: true, settings: {
          title: 'Recently Viewed',
          maxProducts: 4
        }}
      ];

      await prisma.storeSectionInstance.createMany({
        data: defaultSections.map(section => ({
          templateId: template.id,
          ...section
        }))
      });
    }

    // Return template with sections
    const templateWithSections = await prisma.storeTemplate.findUnique({
      where: { id: template.id },
      include: {
        sections: {
          orderBy: { position: 'asc' }
        }
      }
    });

    return NextResponse.json(templateWithSections);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}