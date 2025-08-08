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
    const { theme, sections } = body;

    if (!theme) {
      return apiResponse.badRequest('Theme data is required');
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

    // Extract theme settings
    const themeSettings = {
      name: theme.name || 'Imported Theme',
      colors: theme.colors || {},
      fonts: theme.fonts || {},
      socialLinks: theme.socialLinks || {},
      announcement: theme.announcement || {},
      footer: theme.footer || {},
    };

    // Process sections
    const importedSections = sections?.map((section: any, index: number) => ({
      type: section.type,
      content: section.content,
      position: index,
    })) || [];

    // Return summary
    return apiResponse.success({
      theme: themeSettings,
      sectionsImported: importedSections.length,
      message: 'Theme data processed successfully. In production, this would be saved to the database.',
    });
  } catch (error) {
    console.error('Error importing theme:', error);
    return handleApiError(error);
  }
}