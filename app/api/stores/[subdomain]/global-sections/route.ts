import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { globalSectionsLoader } from '@/lib/services/global-sections-loader';

// GET /api/stores/[subdomain]/global-sections
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

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const themeCode = 'default';
    const globalSections = await globalSectionsLoader.getGlobalSections(subdomain, themeCode);

    return NextResponse.json({
      announcementBar: globalSections.announcementBar,
      header: globalSections.header,
      footer: globalSections.footer,
      themeCode
    });
  } catch (error) {
    console.error('[Global Sections API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load global sections' },
      { status: 500 }
    );
  }
}

