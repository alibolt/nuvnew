import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/stores/[subdomain]/templates/[templateId]
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

    // Verify store ownership
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        store: {
          subdomain,
          userId: session.user.id,
        },
      },
      include: {
        sections: {
          orderBy: {
            position: 'asc',
          },
          include: {
            blocks: {
              orderBy: {
                position: 'asc',
              },
            },
          },
        },
      },
    });

    if (!template) {
      return apiResponse.notFound('Template ');
    }

    return apiResponse.success(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return handleApiError(error, 'Failed to fetch template');
  }
}

// PUT /api/stores/[subdomain]/templates/[templateId]
export async function PUT(
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

    // Verify store ownership
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

    // Update template
    const updatedTemplate = await prisma.storeTemplate.update({
      where: { id: templateId },
      data: {
        name: body.name,
        settings: body.settings,
        isDefault: body.isDefault,
      },
    });

    // If setting as default, unset other defaults of same type
    if (body.isDefault) {
      await prisma.storeTemplate.updateMany({
        where: {
          storeId: template.storeId,
          templateType: template.templateType,
          id: { not: templateId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return apiResponse.success(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return handleApiError(error, 'Failed to update template');
  }
}

// DELETE /api/stores/[subdomain]/templates/[templateId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId } = await params;

    // Verify store ownership
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

    // Don't allow deleting default templates
    if (template.isDefault) {
      return apiResponse.badRequest('Cannot delete default template');
    }

    // Delete template (sections will be cascade deleted)
    await prisma.storeTemplate.delete({
      where: { id: templateId },
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return handleApiError(error, 'Failed to delete template');
  }
}