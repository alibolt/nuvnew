import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// PUT /api/stores/[storeId]/templates/[templateId]/sections/[sectionId]
export async function PUT(
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
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        templateId,
        template: {
          storeId,
          store: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Update section
    const updatedSection = await prisma.storeSectionInstance.update({
      where: { id: sectionId },
      data: body,
    });

    // Format section for UI consistency
    const formattedSection = {
      id: updatedSection.id,
      type: updatedSection.sectionType,
      sectionType: updatedSection.sectionType,
      title: updatedSection.sectionType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      settings: updatedSection.settings || {},
      enabled: updatedSection.enabled,
      position: updatedSection.position
    };

    return NextResponse.json(formattedSection);
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
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        templateId,
        template: {
          storeId,
          store: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Delete section
    await prisma.storeSectionInstance.delete({
      where: { id: sectionId },
    });

    // Reorder remaining sections
    const remainingSections = await prisma.storeSectionInstance.findMany({
      where: {
        templateId,
        position: { gt: section.position }
      },
      orderBy: { position: 'asc' }
    });

    // Update positions
    for (const remainingSection of remainingSections) {
      await prisma.storeSectionInstance.update({
        where: { id: remainingSection.id },
        data: { position: remainingSection.position - 1 }
      });
    }

    // Check if this was the last section
    const sectionCount = await prisma.storeSectionInstance.count({
      where: { templateId }
    });

    // Update template flag if all sections are deleted
    if (sectionCount === 0) {
      await prisma.storeTemplate.update({
        where: { id: templateId },
        data: { hasEmptySections: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}