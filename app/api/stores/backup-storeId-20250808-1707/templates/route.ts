import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/stores/[storeId]/templates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get all templates
    const templates = await prisma.storeTemplate.findMany({
      where: {
        storeId,
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

// POST /api/stores/[storeId]/templates
export async function POST(
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
    const { type, name, isDefault, settings } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
      include: {
        activeTheme: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await prisma.storeTemplate.updateMany({
        where: {
          storeId,
          templateType: type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Get default theme if store doesn't have active theme
    let themeId = store.activeThemeId;
    if (!themeId) {
      const defaultTheme = await prisma.theme.findFirst({
        where: { code: 'minimal' }
      });
      themeId = defaultTheme?.id || '';
      
      // Update store with default theme
      if (defaultTheme) {
        await prisma.store.update({
          where: { id: storeId },
          data: { activeThemeId: defaultTheme.id }
        });
      }
    }

    // Create template
    const template = await prisma.storeTemplate.create({
      data: {
        storeId,
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
    if (type === 'homepage') {
      const defaultSections = [
        { sectionType: 'header', position: 0, enabled: true, settings: {} },
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
      const defaultSections = [
        { sectionType: 'header', position: 0, enabled: true, settings: {} },
        { sectionType: 'product-gallery', position: 1, enabled: true, settings: {} },
        { sectionType: 'product-info', position: 2, enabled: true, settings: {} },
        { sectionType: 'product-description', position: 3, enabled: true, settings: {} },
        { sectionType: 'product-reviews', position: 4, enabled: true, settings: {} },
        { sectionType: 'related-products', position: 5, enabled: true, settings: {
          title: 'You May Also Like',
          maxProducts: 4
        }},
        { sectionType: 'recently-viewed', position: 6, enabled: true, settings: {
          title: 'Recently Viewed',
          maxProducts: 4
        }},
        { sectionType: 'footer', position: 7, enabled: true, settings: {} }
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