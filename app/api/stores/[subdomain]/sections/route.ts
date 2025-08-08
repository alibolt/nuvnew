
import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
// Default section settings
const defaultSectionSettings = {
  // Add default settings if needed
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return apiResponse.unauthorized();
  }
  
  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });
  
  if (!store) {
    return apiResponse.notFound('Store not found or unauthorized');
  }

  try {
    // Get sections through template relationship
    const sections = await prisma.storeSectionInstance.findMany({
      where: { 
        template: {
          store: {
            subdomain: subdomain
          }
        }
      },
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
          ...(section.settings as any || {})
        },
        enabled: section.enabled,
        position: section.position
      };
    });

    return apiResponse.success(transformedSections);
  } catch (error) {
    console.error('Failed to get sections:', error);
    return apiResponse.serverError();
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
    'product': 'Product',
    'related-products': 'Related Products',
    'recently-viewed': 'Recently Viewed'
  };
  
  return titles[sectionType] || sectionType.charAt(0).toUpperCase() + sectionType.slice(1).replace(/-/g, ' ');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return apiResponse.unauthorized();
  }
  
  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });
  
  if (!store) {
    return apiResponse.notFound('Store not found or unauthorized');
  }

  try {
    const { type, title, settings } = await request.json();
    
    // Get the highest position to add new section at the end
    const lastSection = await prisma.storeSectionInstance.findFirst({
      where: { 
        template: {
          store: {
            subdomain: subdomain
          }
        }
      },
      orderBy: { position: 'desc' },
    });
    
    // Apply default settings for new sections
    const defaultSettings = defaultSectionSettings[type as keyof typeof defaultSectionSettings] || {};
    const mergedSettings = {
      ...defaultSettings,
      ...settings
    };
    
    // Get the homepage template for this store
    const homepageTemplate = await prisma.storeTemplate.findFirst({
      where: {
        store: {
          subdomain: subdomain
        },
        templateType: 'homepage'
      }
    });

    if (!homepageTemplate) {
      return apiResponse.notFound('Homepage template ');
    }

    const newSection = await prisma.storeSectionInstance.create({
      data: {
        templateId: homepageTemplate.id,
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

    return apiResponse.success(transformedSection);
  } catch (error) {
    console.error('Failed to create section:', error);
    return apiResponse.serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return apiResponse.unauthorized();
  }
  
  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });
  
  if (!store) {
    return apiResponse.notFound('Store not found or unauthorized');
  }

  try {
    const { id, settings, enabled, position } = await request.json();
    
    const updatedSection = await prisma.storeSectionInstance.update({
      where: { 
        id: id,
        template: {
          store: {
            subdomain: subdomain
          }
        }
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

    return apiResponse.success(transformedSection);
  } catch (error) {
    console.error('Failed to update section:', error);
    return apiResponse.serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return apiResponse.unauthorized();
  }
  
  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });
  
  if (!store) {
    return apiResponse.notFound('Store not found or unauthorized');
  }

  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('id');
    
    if (!sectionId) {
      return apiResponse.badRequest('Section ID is required');
    }
    
    await prisma.storeSectionInstance.delete({
      where: { 
        id: sectionId,
        template: {
          store: {
            subdomain: subdomain
          }
        }
      },
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Failed to delete section:', error);
    return apiResponse.serverError();
  }
}
