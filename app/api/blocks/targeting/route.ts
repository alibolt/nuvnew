import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { BlockTargeting } from '@/lib/block-targeting';
import { z } from 'zod';

// Request validation schemas
const getAvailableBlocksSchema = z.object({
  sectionType: z.string().min(1),
  theme: z.string().optional(),
  category: z.string().optional(),
  existingBlocks: z.string().optional().transform(val => val ? val.split(',') : [])
});

const validateConfigurationSchema = z.object({
  sectionType: z.string().min(1),
  theme: z.string().optional(),
  blocks: z.array(z.object({
    type: z.string().min(1),
    settings: z.record(z.any()).optional()
  }))
});

// GET - Get available blocks for a section
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    
    // Validate query parameters
    const validation = getAvailableBlocksSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { sectionType, theme, category, existingBlocks } = validation.data;

    let availableBlocks: string[];

    if (category) {
      // Get blocks by category
      availableBlocks = BlockTargeting.getBlocksByCategory(sectionType, category, theme);
    } else {
      // Get all available blocks
      availableBlocks = BlockTargeting.getAvailableBlocks(sectionType, theme);
    }

    // Get suggested blocks
    const suggestedBlocks = BlockTargeting.getSuggestedBlocks(sectionType, existingBlocks, theme);

    // Get limits for each block type
    const blockLimits: Record<string, number | null> = {};
    availableBlocks.forEach(blockType => {
      blockLimits[blockType] = BlockTargeting.getBlockLimit(blockType, sectionType);
    });

    return NextResponse.json({
      sectionType,
      theme,
      category,
      availableBlocks,
      suggestedBlocks,
      blockLimits,
      requiredBlocks: BlockTargeting.getRequiredBlocks(sectionType)
    });
  } catch (error) {
    console.error('[BLOCK TARGETING API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Validate block configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const body = await request.json();
    
    // Validate request body
    const validation = validateConfigurationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { sectionType, theme, blocks } = validation.data;

    // Validate block configuration - ensure all blocks have settings
    const blocksWithSettings = blocks.map(block => ({
      ...block,
      settings: block.settings || {}
    }));
    const validationResult = BlockTargeting.validateBlockConfiguration(blocksWithSettings, sectionType);

    // Get additional information
    const availableBlocks = BlockTargeting.getAvailableBlocks(sectionType, theme);
    const suggestedBlocks = BlockTargeting.getSuggestedBlocks(
      sectionType, 
      blocks.map(b => b.type), 
      theme
    );

    return NextResponse.json({
      sectionType,
      theme,
      validation: validationResult,
      availableBlocks,
      suggestedBlocks,
      blockCount: blocks.length
    });
  } catch (error) {
    console.error('[BLOCK TARGETING API] POST Error:', error);
    return apiResponse.serverError();
  }
}