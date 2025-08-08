import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getPresetById } from '@/lib/block-presets';

// GET - Get single preset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ presetId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { presetId } = await params;

    const preset = getPresetById(presetId);
    if (!preset) {
      return apiResponse.notFound('Preset ');
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error('[BLOCK PRESETS API] GET Error:', error);
    return apiResponse.serverError();
  }
}