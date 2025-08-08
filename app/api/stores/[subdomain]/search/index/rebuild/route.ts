import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { SearchIndexingService } from '@/lib/services/search-indexing.service';

export async function POST(
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
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Rebuild the search index
    const result = await SearchIndexingService.rebuildIndex(store.id);

    return NextResponse.json({
      success: true,
      message: 'Search index rebuilt successfully',
      totalIndexed: result.products + result.categories + result.pages + result.blogPosts,
      details: result
    });
  } catch (error) {
    console.error('Error rebuilding search index:', error);
    return NextResponse.json(
      { error: 'Failed to rebuild search index' },
      { status: 500 }
    );
  }
}