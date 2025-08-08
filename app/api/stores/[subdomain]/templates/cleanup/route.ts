import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { HybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

export async function POST(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = params;
    
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

    const body = await request.json();
    const { 
      action = 'cleanup', // 'cleanup' or 'reset'
      templateType,
      dryRun = false 
    } = body;

    console.log(`[API] Template cleanup requested for ${subdomain}:`, { action, templateType, dryRun });

    // Analyze current state
    const analysis = await analyzeTemplateState(store.id, templateType);
    
    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: 'Dry run completed',
        analysis,
        wouldCleanup: analysis.duplicates > 0
      });
    }

    let cleanupResults = {
      duplicatesRemoved: 0,
      sectionsRemoved: 0,
      templatesReset: 0,
      templatesSynced: 0
    };

    // Perform cleanup based on action
    if (action === 'cleanup') {
      cleanupResults = await cleanupDuplicates(store.id, templateType);
    } else if (action === 'reset') {
      cleanupResults = await fullTemplateReset(store.id, subdomain, templateType);
    }

    // Re-sync templates after cleanup
    const syncResults = await resyncTemplates(subdomain, templateType);
    cleanupResults.templatesSynced = syncResults.synced;

    return NextResponse.json({
      success: true,
      message: `Template ${action} completed successfully`,
      analysis,
      results: cleanupResults
    });

  } catch (error) {
    console.error('[API] Template cleanup error:', error);
    return NextResponse.json({
      error: 'Template cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function analyzeTemplateState(storeId: string, templateType?: string) {
  const whereClause = templateType 
    ? { storeId, templateType }
    : { storeId };

  const templates = await prisma.storeTemplate.findMany({
    where: whereClause,
    include: {
      sections: {
        include: {
          blocks: true
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  let totalSections = 0;
  let totalBlocks = 0;
  let duplicates = 0;
  const duplicateDetails: Array<{
    templateName: string;
    sectionType: string;
    position: number;
    count: number;
  }> = [];

  for (const template of templates) {
    totalSections += template.sections.length;
    
    // Check for section duplicates by type and position
    const sectionGroups = template.sections.reduce((acc, section) => {
      const key = `${section.sectionType}-${section.position}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(section);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [key, sections] of Object.entries(sectionGroups)) {
      if (sections.length > 1) {
        const [sectionType, position] = key.split('-');
        duplicates += sections.length - 1;
        duplicateDetails.push({
          templateName: template.name,
          sectionType,
          position: parseInt(position),
          count: sections.length
        });
      }
    }

    // Count blocks
    for (const section of template.sections) {
      totalBlocks += section.blocks.length;
    }
  }

  return {
    templates: templates.length,
    totalSections,
    totalBlocks,
    duplicates,
    duplicateDetails
  };
}

async function cleanupDuplicates(storeId: string, templateType?: string) {
  const whereClause = templateType 
    ? { storeId, templateType }
    : { storeId };

  const templates = await prisma.storeTemplate.findMany({
    where: whereClause,
    include: {
      sections: {
        include: {
          blocks: true
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  let duplicatesRemoved = 0;
  let sectionsRemoved = 0;

  for (const template of templates) {
    // Group sections by type and position
    const sectionGroups = template.sections.reduce((acc, section) => {
      const key = `${section.sectionType}-${section.position}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(section);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [key, sections] of Object.entries(sectionGroups)) {
      if (sections.length > 1) {
        // Keep the first one (usually the original), delete the rest
        const sectionsToDelete = sections.slice(1);
        
        for (const section of sectionsToDelete) {
          // Delete section and its blocks (cascading delete)
          await prisma.storeSectionInstance.delete({
            where: { id: section.id }
          });
          duplicatesRemoved++;
          sectionsRemoved++;
        }
      }
    }
  }

  return {
    duplicatesRemoved,
    sectionsRemoved,
    templatesReset: 0,
    templatesSynced: 0
  };
}

async function fullTemplateReset(storeId: string, subdomain: string, templateType?: string) {
  const whereClause = templateType 
    ? { storeId, templateType }
    : { storeId };

  // Get templates to delete
  const templates = await prisma.storeTemplate.findMany({
    where: whereClause,
    select: { id: true, name: true, templateType: true }
  });

  let templatesReset = 0;
  let sectionsRemoved = 0;

  // Delete all sections and blocks (cascading)
  for (const template of templates) {
    // Count sections before deletion
    const sectionCount = await prisma.storeSectionInstance.count({
      where: { templateId: template.id }
    });
    
    await prisma.storeSectionInstance.deleteMany({
      where: { templateId: template.id }
    });
    
    await prisma.storeTemplate.delete({
      where: { id: template.id }
    });
    
    templatesReset++;
    sectionsRemoved += sectionCount;
  }

  return {
    duplicatesRemoved: 0,
    sectionsRemoved,
    templatesReset,
    templatesSynced: 0
  };
}

async function resyncTemplates(subdomain: string, templateType?: string) {
  const loader = new HybridTemplateLoader();
  const themeCode = 'brand'; // Update based on your theme
  
  // Define template types to sync
  const templateTypes = templateType ? [templateType] : ['homepage', 'product', 'collection', 'page'];
  
  let synced = 0;
  
  for (const type of templateTypes) {
    try {
      // Load template definition
      const definition = await loader.loadTemplateDefinition(themeCode, type);
      
      if (!definition) {
        console.log(`Template definition not found: ${themeCode}/${type}`);
        continue;
      }
      
      // Sync to database
      await loader.syncTemplateToDatabase(subdomain, themeCode, type, definition);
      synced++;
      
    } catch (error) {
      console.log(`Error syncing template ${type}:`, error);
    }
  }

  return { synced };
}

// GET endpoint to analyze template state without making changes
export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = params;
    
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

    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get('templateType') || undefined;

    // Analyze current state
    const analysis = await analyzeTemplateState(store.id, templateType);
    
    return NextResponse.json({
      success: true,
      analysis,
      recommendations: {
        needsCleanup: analysis.duplicates > 0,
        needsReset: analysis.duplicates > analysis.totalSections * 0.5, // More than 50% duplicates
        templateType: templateType || 'all'
      }
    });

  } catch (error) {
    console.error('[API] Template analysis error:', error);
    return NextResponse.json({
      error: 'Template analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}