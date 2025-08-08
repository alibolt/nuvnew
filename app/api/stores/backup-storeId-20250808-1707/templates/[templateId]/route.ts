import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/stores/[storeId]/templates/[templateId]
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

    // Verify store ownership
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        storeId,
        store: {
          userId: session.user.id,
        },
      },
      include: {
        sections: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[storeId]/templates/[templateId]
export async function PUT(
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

    // Verify store ownership
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
          storeId,
          templateType: template.templateType,
          id: { not: templateId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[storeId]/templates/[templateId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, templateId } = await params;

    // Verify store ownership
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

    // Don't allow deleting default templates
    if (template.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default template' },
        { status: 400 }
      );
    }

    // Delete template (sections will be cascade deleted)
    await prisma.storeTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}