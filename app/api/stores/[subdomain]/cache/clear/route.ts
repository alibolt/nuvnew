import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { globalSectionsLoader } from '@/lib/services/global-sections-loader';
import { apiResponse } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    
    // Clear global sections cache
    globalSectionsLoader.clearCache();
    
    console.log(`[Cache] Cleared global sections cache for ${subdomain}`);
    
    return apiResponse.success({ 
      message: 'Cache cleared successfully',
      subdomain 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return apiResponse.serverError('Failed to clear cache');
  }
}