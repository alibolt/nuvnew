import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { BLOCK_PRESETS, getPresetsByCategory, getAllPresets, getPresetById } from '@/lib/block-presets';
import { z } from 'zod';

// Request validation schemas
const getPresetsSchema = z.object({
  category: z.string().optional(),
  blockType: z.string().optional()
});

// GET - Get block presets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    
    // Validate query parameters
    const validation = getPresetsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { category, blockType } = validation.data;

    let presets = getAllPresets();

    // Filter by category
    if (category) {
      presets = getPresetsByCategory(category);
    }

    // Filter by block type
    if (blockType) {
      presets = presets.filter(preset => preset.blockType === blockType);
    }

    return NextResponse.json({
      presets,
      total: presets.length,
      categories: Object.keys(BLOCK_PRESETS)
    });
  } catch (error) {
    console.error('[BLOCK PRESETS API] GET Error:', error);
    return apiResponse.serverError();
  }
}