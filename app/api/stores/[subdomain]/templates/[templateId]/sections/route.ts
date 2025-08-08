import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

// GET /api/stores/[subdomain]/templates/[templateId]/sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId } = await params;

    // Verify store ownership and template
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        store: {
          subdomain,
          userId: session.user.id,
        },
      },
      include: {
        store: true
      }
    });

    if (!template) {
      return apiResponse.notFound('Template ');
    }

    // Use hybrid loader to get sections - using 'default' theme
    const themeCode = 'default';
    const compiledTemplate = await hybridTemplateLoader.getCompiledTemplate(
      subdomain, 
      themeCode, 
      template.templateType
    );

    if (compiledTemplate) {
      // Return sections from hybrid system
      return apiResponse.success(compiledTemplate.sections);
    }

    // Fallback to database sections
    const sections = await prisma.storeSectionInstance.findMany({
      where: { templateId },
      include: {
        blocks: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { position: 'asc' }
    });

    return apiResponse.success(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return handleApiError(error, 'Failed to fetch sections');
  }
}

// POST /api/stores/[subdomain]/templates/[templateId]/sections
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId } = await params;
    const body = await request.json();
    const { type: sectionType, title, settings, position, enabled } = body;

    // Verify store ownership and template
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        store: {
          subdomain,
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      return apiResponse.notFound('Template ');
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
      subdomain,
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

    return apiResponse.success(formattedSection);
  } catch (error) {
    console.error('Error creating section:', error);
    return handleApiError(error, 'Failed to create section');
  }
}

// PATCH /api/stores/[subdomain]/templates/[templateId]/sections/[sectionId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId, sectionId } = await params;
    const body = await request.json();

    // Verify ownership
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        store: {
          subdomain,
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      return apiResponse.notFound('Template ');
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
      subdomain,
      template.templateType,
      'update',
      updatedSection
    );

    return apiResponse.success(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    return handleApiError(error, 'Failed to update section');
  }
}

// DELETE /api/stores/[subdomain]/templates/[templateId]/sections/[sectionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId, sectionId } = await params;

    // Verify ownership
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        store: {
          subdomain,
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      return apiResponse.notFound('Template ');
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
      subdomain,
      template.templateType,
      'remove',
      { id: sectionId }
    );

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return handleApiError(error, 'Failed to delete section');
  }
}