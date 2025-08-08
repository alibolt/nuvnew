import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get store from query params
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

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

    // Check templates in database
    const templates = await prisma.storeTemplate.findMany({
      where: { storeId },
      include: {
        sections: {
          orderBy: { position: 'asc' }
        }
      }
    });

    // Check section instances directly
    const allSections = await prisma.storeSectionInstance.findMany({
      where: {
        template: {
          storeId
        }
      },
      include: {
        template: true
      }
    });

    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        activeTheme: store.activeTheme?.code || 'minimal'
      },
      templates: templates.map(t => ({
        id: t.id,
        type: t.templateType,
        name: t.name,
        sectionsCount: t.sections.length,
        sections: t.sections.map(s => ({
          id: s.id,
          type: s.sectionType,
          position: s.position,
          enabled: s.enabled
        }))
      })),
      totalSections: allSections.length,
      sectionsByTemplate: allSections.reduce((acc, section) => {
        const templateType = section.template.templateType;
        if (!acc[templateType]) acc[templateType] = 0;
        acc[templateType]++;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Failed to test theme studio' },
      { status: 500 }
    );
  }
}