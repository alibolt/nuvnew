import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { HybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

export async function POST(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const { subdomain } = params;
    
    if (!subdomain) {
      return apiResponse.badRequest('Subdomain is required');
    }

    // Get request body
    const body = await request.json();
    const { templateType = 'homepage', themeCode = 'brand' } = body;

    console.log(`[API] Syncing template: ${themeCode}/${templateType} for store: ${subdomain}`);

    const loader = new HybridTemplateLoader();
    
    // Load template definition
    const templateDefinition = await loader.loadTemplateDefinition(themeCode, templateType);
    
    if (!templateDefinition) {
      return NextResponse.json({ 
        error: `Template not found: ${themeCode}/${templateType}` 
      }, { status: 404 });
    }

    // Sync template to database
    await loader.syncTemplateToDatabase(subdomain, themeCode, templateType, templateDefinition);

    return NextResponse.json({ 
      success: true, 
      message: `Template ${templateType} synced successfully`,
      sectionsCount: templateDefinition.sections?.length || 0
    });

  } catch (error) {
    console.error('[API] Template sync error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}