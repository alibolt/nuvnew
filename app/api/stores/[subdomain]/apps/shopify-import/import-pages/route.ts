import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();
    const { pages } = body;

    if (!pages || !Array.isArray(pages)) {
      return apiResponse.badRequest('Pages array is required');
    }

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

    // Import pages
    const importedPages = [];
    for (const page of pages) {
      try {
        const newPage = await prisma.page.create({
          data: {
            storeId: store.id,
            title: page.title,
            slug: page.handle || page.title.toLowerCase().replace(/\s+/g, '-'),
            content: page.content || page.body_html || '',
            isPublished: true,
            seoTitle: page.metaTitle || page.title,
            seoDescription: page.metaDescription || null,
            publishedAt: page.published_at ? new Date(page.published_at) : new Date(),
          },
        });

        importedPages.push(newPage);
      } catch (error) {
        console.error('Error importing page:', page.title, error);
        // Continue with next page
      }
    }

    return apiResponse.success({
      imported: importedPages.length,
      total: pages.length,
      pages: importedPages,
    });
  } catch (error) {
    console.error('Error importing pages:', error);
    return handleApiError(error);
  }
}