import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/sections/available
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get theme code from store
    const themeCode = store.themeCode || 'base';
    
    // Use server-side theme registry to get available sections
    const { getThemeAvailableSections } = await import('@/lib/theme-registry/server-theme-registry');
    let availableSections = [];
    
    try {
      // Load available sections using server registry
      availableSections = await getThemeAvailableSections(themeCode) || [];
      
      console.log(`[Available Sections] Loaded ${availableSections.length} sections from theme: ${themeCode}`);
    } catch (error) {
      console.error(`[Available Sections] Failed to load from theme ${themeCode}, using fallback:`, error);
      
      // Fallback to a minimal set of sections
      availableSections = [
        {
          id: 'header',
          type: 'header',
          name: 'Header',
          description: 'Site header with navigation',
          category: 'header',
          icon: 'Layout',
          presets: [],
          settings: []
        },
        {
          id: 'hero',
          type: 'hero',
          name: 'Hero',
          description: 'Large hero section',
          category: 'hero',
          icon: 'Square',
          presets: [],
          settings: []
        },
        {
          id: 'footer',
          type: 'footer',
          name: 'Footer',
          description: 'Site footer',
          category: 'footer',
          icon: 'Layout',
          presets: [],
          settings: []
        }
      ];
    }

    // Sort by category and name
    availableSections.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    return apiResponse.success(availableSections);
  } catch (error) {
    return handleApiError(error, 'available-sections');
  }
}