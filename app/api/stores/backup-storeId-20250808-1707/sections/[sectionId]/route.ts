import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

// Helper function to generate section titles
function getSectionTitle(sectionType: string): string {
  const titles: Record<string, string> = {
    'hero': 'Hero Section',
    'product-grid': 'Product Grid',
    'featured-products': 'Featured Products',
    'newsletter': 'Newsletter',
    'header': 'Header',
    'footer': 'Footer',
    'announcement-bar': 'Announcement Bar',
    'image-text': 'Image with Text',
    'testimonials': 'Testimonials',
    'collections': 'Collections',
    'logo-list': 'Logo List',
    'rich-text': 'Rich Text',
    'instagram': 'Instagram Feed',
    'contact-form': 'Contact Form',
    'product-gallery': 'Product Gallery',
    'product-info': 'Product Info',
    'product-description': 'Product Description',
    'product-reviews': 'Product Reviews',
    'related-products': 'Related Products',
    'recently-viewed': 'Recently Viewed',
    'product-main': 'Product Main Section'
  };
  
  return titles[sectionType] || sectionType.charAt(0).toUpperCase() + sectionType.slice(1).replace(/-/g, ' ');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string, sectionId: string }> }
) {
  const { storeId, sectionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id
    }
  });

  if (!store) {
    return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
  }

  try {
    const body = await request.json();
    console.log('Update section request:', { sectionId, body });
    
    const updateData: any = {};
    if (body.settings !== undefined) updateData.settings = body.settings;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    
    const updatedSection = await prisma.storeSectionInstance.update({
      where: { id: sectionId },
      data: updateData,
    });

    // Get the template this section belongs to
    const template = await prisma.storeTemplate.findFirst({
      where: {
        sections: {
          some: { id: sectionId }
        }
      }
    });

    if (template) {
      // Track customization in hybrid system
      await hybridTemplateLoader.saveTemplateCustomization(
        storeId,
        template.templateType,
        'update',
        updatedSection
      );
    }
    
    // Transform the response to match UI expectations
    const transformedSection = {
      id: updatedSection.id,
      type: updatedSection.sectionType,
      sectionType: updatedSection.sectionType,
      title: getSectionTitle(updatedSection.sectionType),
      settings: updatedSection.settings,
      enabled: updatedSection.enabled,
      position: updatedSection.position
    };
    
    console.log('Section updated successfully:', transformedSection);
    return NextResponse.json(transformedSection);
  } catch (error) {
    console.error('Failed to update section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string, sectionId: string }> }
) {
  const { storeId, sectionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id
    }
  });

  if (!store) {
    return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
  }

  try {
    // Get the template this section belongs to before deleting
    const template = await prisma.storeTemplate.findFirst({
      where: {
        sections: {
          some: { id: sectionId }
        }
      }
    });

    await prisma.storeSectionInstance.delete({
      where: { id: sectionId },
    });

    if (template) {
      // Track customization in hybrid system
      await hybridTemplateLoader.saveTemplateCustomization(
        storeId,
        template.templateType,
        'remove',
        { id: sectionId }
      );
    }

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Failed to delete section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}