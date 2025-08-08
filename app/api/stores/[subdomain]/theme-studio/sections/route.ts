import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';
import { getGlobalSections } from '@/lib/services/global-sections-loader';
import { nestBlocks } from '@/lib/utils/nest-blocks';

// GET /api/stores/[subdomain]/theme-studio/sections
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
    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get('templateType') || 'homepage';
    const includeGlobal = searchParams.get('includeGlobal') !== 'false';

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const themeCode = 'commerce'; // Default theme code
    
    // Get template sections
    const compiledTemplate = await hybridTemplateLoader.getCompiledTemplate(subdomain, themeCode, templateType);
    
    let sections = [];
    
    if (compiledTemplate) {
      // Get the template with its sections from database
      const templateWithSections = await prisma.storeTemplate.findFirst({
        where: {
          storeId: store.id,
          templateType: templateType,
          isDefault: true,
        },
        include: {
          sections: {
            include: {
              blocks: {
                orderBy: { position: 'asc' }
              }
            },
            orderBy: { position: 'asc' }
          }
        }
      });
      
      if (templateWithSections) {
        sections = templateWithSections.sections.map((section: any) => ({
          id: section.id,
          type: section.sectionType,
          sectionType: section.sectionType,
          title: (section.sectionType || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          settings: section.settings || {},
          enabled: section.enabled !== false,
          position: section.position,
          blocks: nestBlocks(section.blocks || []),
          isGlobal: false
        }));
      }
    }

    // Get global sections if requested
    let globalSections = null;
    if (includeGlobal) {
      globalSections = await getGlobalSections(subdomain, themeCode);
    }
    
    return apiResponse.success({
      sections,
      globalSections,
      templateType
    });
  } catch (error) {
    console.error('Error fetching theme studio sections:', error);
    return handleApiError(error, 'Failed to fetch sections');
  }
}