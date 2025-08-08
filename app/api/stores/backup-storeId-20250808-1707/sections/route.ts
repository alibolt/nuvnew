
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { defaultSectionSettings } from '@/lib/section-settings-schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
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
    const sections = await prisma.storeSectionInstance.findMany({
      where: { storeId: storeId },
      orderBy: { position: 'asc' },
    });

    // Transform data to match UI expectations
    const transformedSections = sections.map(section => {
      const sectionType = section.sectionType;
      const defaultSettings = defaultSectionSettings[sectionType as keyof typeof defaultSectionSettings] || {};
      
      return {
        id: section.id,
        type: sectionType, // UI expects 'type'
        sectionType: sectionType, // Keep for backward compatibility
        title: getSectionTitle(sectionType),
        settings: {
          ...defaultSettings,
          ...section.settings
        },
        enabled: section.enabled,
        position: section.position
      };
    });

    return NextResponse.json(transformedSections);
  } catch (error) {
    console.error('Failed to get sections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    'recently-viewed': 'Recently Viewed'
  };
  
  return titles[sectionType] || sectionType.charAt(0).toUpperCase() + sectionType.slice(1).replace(/-/g, ' ');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
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
    const { type, title, settings } = await request.json();
    
    // Get the highest position to add new section at the end
    const lastSection = await prisma.storeSectionInstance.findFirst({
      where: { storeId: storeId },
      orderBy: { position: 'desc' },
    });
    
    // Apply default settings for new sections
    const defaultSettings = defaultSectionSettings[type as keyof typeof defaultSectionSettings] || {};
    const mergedSettings = {
      ...defaultSettings,
      ...settings
    };
    
    const newSection = await prisma.storeSectionInstance.create({
      data: {
        storeId: storeId,
        sectionType: type,
        settings: mergedSettings,
        position: (lastSection?.position || 0) + 1,
        enabled: true,
      },
    });

    // Transform the response to match UI expectations
    const transformedSection = {
      id: newSection.id,
      type: newSection.sectionType,
      sectionType: newSection.sectionType,
      title: getSectionTitle(newSection.sectionType),
      settings: newSection.settings,
      enabled: newSection.enabled,
      position: newSection.position
    };

    return NextResponse.json(transformedSection, { status: 201 });
  } catch (error) {
    console.error('Failed to create section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
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
    const { id, settings, enabled, position } = await request.json();
    
    const updatedSection = await prisma.storeSectionInstance.update({
      where: { 
        id: id,
        storeId: storeId 
      },
      data: {
        ...(settings !== undefined && { settings }),
        ...(enabled !== undefined && { enabled }),
        ...(position !== undefined && { position })
      },
    });

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

    return NextResponse.json(transformedSection);
  } catch (error) {
    console.error('Failed to update section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
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
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('id');
    
    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }
    
    await prisma.storeSectionInstance.delete({
      where: { 
        id: sectionId,
        storeId: storeId 
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
