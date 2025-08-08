import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

// GET /api/stores/[storeId]/templates/[templateId]/sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, templateId } = await params;

    // Verify store ownership and template
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        storeId,
        store: {
          userId: session.user.id,
        },
      },
      include: {
        store: {
          include: {
            activeTheme: true
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Use hybrid loader to get sections
    const themeCode = template.store.activeTheme?.code || 'minimal';
    const compiledTemplate = await hybridTemplateLoader.getCompiledTemplate(
      storeId, 
      themeCode, 
      template.templateType
    );

    if (compiledTemplate) {
      // Return sections from hybrid system
      return NextResponse.json(compiledTemplate.sections);
    }

    // Fallback to database sections
    const sections = await prisma.storeSectionInstance.findMany({
      where: { templateId },
      orderBy: { position: 'asc' }
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[storeId]/templates/[templateId]/sections
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, templateId } = await params;
    const body = await request.json();
    const { type: sectionType, title, settings, position, enabled } = body;

    // Verify store ownership and template
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        storeId,
        store: {
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create section customization in database
    const section = await prisma.storeSectionInstance.create({
      data: {
        templateId,
        sectionType,
        position: position !== undefined ? position : 0,
        enabled: enabled !== undefined ? enabled : true,
        settings: settings || {},
      },
    });

    // Reset hasEmptySections flag when user adds a section
    await prisma.storeTemplate.update({
      where: { id: templateId },
      data: { hasEmptySections: false }
    });

    // Save template customization state
    await hybridTemplateLoader.saveTemplateCustomization(
      storeId,
      template.templateType,
      'add',
      section
    );

    // Format section for UI consistency
    const formattedSection = {
      id: section.id,
      type: section.sectionType,
      sectionType: section.sectionType,
      title: section.sectionType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      settings: section.settings || {},
      enabled: section.enabled,
      position: section.position
    };

    return NextResponse.json(formattedSection);
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// PATCH /api/stores/[storeId]/templates/[templateId]/sections/[sectionId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; templateId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, templateId, sectionId } = await params;
    const body = await request.json();

    // Verify ownership
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        storeId,
        store: {
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Update section
    const updatedSection = await prisma.storeSectionInstance.update({
      where: { 
        id: sectionId,
        templateId 
      },
      data: body
    });

    // Save template customization state
    await hybridTemplateLoader.saveTemplateCustomization(
      storeId,
      template.templateType,
      'update',
      updatedSection
    );

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[storeId]/templates/[templateId]/sections/[sectionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; templateId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, templateId, sectionId } = await params;

    // Verify ownership
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        storeId,
        store: {
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Delete section
    await prisma.storeSectionInstance.delete({
      where: { 
        id: sectionId,
        templateId 
      },
    });

    // Save template customization state
    await hybridTemplateLoader.saveTemplateCustomization(
      storeId,
      template.templateType,
      'remove',
      { id: sectionId }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}