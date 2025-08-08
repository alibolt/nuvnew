import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

// GET /api/stores/[storeId]/templates/by-type/[type]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; type: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, type } = await params;
    console.log('[TEMPLATE BY TYPE API] Request for:', { storeId, type });
    console.log('[TEMPLATE BY TYPE API] Session user ID:', session.user.id);

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
      include: {
        activeTheme: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Use hybrid template loader
    const themeCode = store.activeTheme?.code || 'minimal';
    console.log('[TEMPLATE BY TYPE API] Using theme:', themeCode);
    const compiledTemplate = await hybridTemplateLoader.getCompiledTemplate(storeId, themeCode, type);
    console.log('[TEMPLATE BY TYPE API] Compiled template sections:', compiledTemplate?.sections?.length || 0);

    if (compiledTemplate) {
      // Get or create DB template record
      let dbTemplate = await prisma.storeTemplate.findFirst({
        where: {
          storeId,
          templateType: type,
          isDefault: true,
        }
      });

      if (!dbTemplate) {
        // Create if doesn't exist
        dbTemplate = await prisma.storeTemplate.create({
          data: {
            storeId,
            themeId: store.activeThemeId || '',
            templateType: type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            isDefault: true,
            enabled: true,
            settings: {}
          }
        });
        
        // Create StoreSectionInstance records from the template JSON only for new templates
        const existingSections = await prisma.storeSectionInstance.count({
          where: { templateId: dbTemplate.id }
        });
        
        // Check if this template ever had sections (by checking updatedAt vs createdAt)
        const templateAge = new Date().getTime() - new Date(dbTemplate.createdAt).getTime();
        const isNewTemplate = templateAge < 60000; // Less than 1 minute old
        
        // Only auto-create sections for brand new templates, not for templates where user deleted all sections
        if (existingSections === 0 && isNewTemplate && compiledTemplate.sections && compiledTemplate.sections.length > 0) {
          const sectionInstances = compiledTemplate.sections.map((section, index) => ({
            templateId: dbTemplate.id,
            sectionType: section.type,
            position: index,
            enabled: true,
            settings: section.settings || {}
          }));
          
          await prisma.storeSectionInstance.createMany({
            data: sectionInstances
          });
          
          console.log(`[TEMPLATE API] Created ${sectionInstances.length} section instances for new template ${dbTemplate.id}`);
        } else if (existingSections === 0) {
          console.log(`[TEMPLATE API] Template ${dbTemplate.id} has no sections (user may have deleted them all)`);
        } else {
          console.log(`[TEMPLATE API] Template ${dbTemplate.id} already has ${existingSections} sections`);
        }
      }

      // Get the template with its sections from database
      const templateWithSections = await prisma.storeTemplate.findUnique({
        where: { id: dbTemplate.id },
        include: {
          sections: {
            orderBy: { position: 'asc' }
          }
        }
      });
      
      // If we have DB sections, use those; otherwise use compiled sections
      let sections = templateWithSections?.sections && templateWithSections.sections.length > 0
        ? templateWithSections.sections
        : compiledTemplate.sections;
      
      // Ensure sections have all required properties for the UI
      sections = sections.map((section: any) => ({
        id: section.id,
        type: section.type || section.sectionType,
        sectionType: section.sectionType || section.type,
        title: (section.sectionType || section.type || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        settings: section.settings || {},
        enabled: section.enabled !== false,
        position: section.position
      }));
      
      console.log('[TEMPLATE BY TYPE API] Returning sections:', sections?.length || 0, 'from', 
        templateWithSections?.sections?.length ? 'database' : 'JSON template');
      console.log('[TEMPLATE BY TYPE API] First section example:', sections?.[0]);
      
      // Return template with sections
      const responseData = {
        id: dbTemplate.id,
        storeId: dbTemplate.storeId,
        templateType: dbTemplate.templateType,
        name: dbTemplate.name,
        isDefault: dbTemplate.isDefault,
        enabled: dbTemplate.enabled,
        sections: sections
      };
      
      console.log('[TEMPLATE BY TYPE API] Final response data:', {
        ...responseData,
        sectionsCount: responseData.sections?.length || 0
      });
      
      return NextResponse.json(responseData);
    }

    // Fallback to DB-only template
    const template = await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType: type,
        isDefault: true,
      },
      include: {
        sections: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!template) {
      console.log('[TEMPLATE BY TYPE API] No template found in database');
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    console.log('[TEMPLATE BY TYPE API] Fallback to DB template with sections:', template.sections?.length || 0);

    // Ensure sections have all required properties for the UI
    const mappedSections = template.sections.map((section: any) => ({
      id: section.id,
      type: section.type || section.sectionType,
      sectionType: section.sectionType || section.type,
      title: (section.sectionType || section.type || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      settings: section.settings || {},
      enabled: section.enabled !== false,
      position: section.position
    }));

    return NextResponse.json({
      ...template,
      sections: mappedSections
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}