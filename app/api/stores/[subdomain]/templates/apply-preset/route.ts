import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { applyTemplatePreset } from '@/lib/template-presets';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Verify authentication and store ownership
    const authResult = await verifyAuth(request, subdomain, {
      requireStoreOwnership: true
    });
    
    if (authResult.error) {
      return authResult.error;
    }
    
    const store = authResult.store;
    const { presetId } = await request.json();

    if (!presetId) {
      return errorResponse('Preset ID is required', 400);
    }

    // Check if we should preserve existing templates
    const preserveExisting = request.headers.get('x-preserve-existing') === 'true';
    
    if (!preserveExisting) {
      // Only delete if explicitly requested (first time apply)
      await prisma.storeTemplate.deleteMany({
        where: { storeId: store.id }
      });
    }

    // Preset'i uygula
    await applyTemplatePreset(store.id, presetId, prisma);

    return successResponse({ 
      message: 'Template preset applied successfully',
      redirectTo: `/dashboard/stores/${subdomain}/theme-studio`
    });
  } catch (error) {
    console.error('[APPLY PRESET] Error:', error);
    return errorResponse('Failed to apply template preset', 500);
  }
}