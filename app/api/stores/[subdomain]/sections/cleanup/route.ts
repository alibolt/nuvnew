import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api/response';

// POST /api/stores/[subdomain]/sections/cleanup
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
    const { sectionTypes = [], globalSections = false } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
      include: {
        templates: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    let deletedCount = 0;

    // Delete specific section types from all templates
    if (sectionTypes.length > 0) {
      const result = await prisma.storeSectionInstance.deleteMany({
        where: {
          templateId: {
            in: store.templates.map(t => t.id)
          },
          sectionType: {
            in: sectionTypes
          }
        }
      });
      deletedCount += result.count;
    }

    // Delete global sections if requested
    if (globalSections) {
      // Delete announcement bar
      const announcementResult = await prisma.storeSectionInstance.deleteMany({
        where: {
          templateId: {
            in: store.templates.map(t => t.id)
          },
          sectionType: {
            in: ['announcement-bar', 'announcementBar']
          }
        }
      });
      deletedCount += announcementResult.count;

      // Also delete from GlobalSection table if it exists
      try {
        await prisma.$executeRaw`
          DELETE FROM "GlobalSection" 
          WHERE "storeId" = ${store.id} 
          AND "sectionType" IN ('announcement-bar', 'announcementBar')
        `;
      } catch (error) {
        console.log('GlobalSection table might not exist:', error);
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} sections`
    });
  } catch (error) {
    console.error('[Section Cleanup API] Error:', error);
    return apiResponse.serverError('Failed to cleanup sections');
  }
}

// GET /api/stores/[subdomain]/sections/cleanup - List all section types
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
      },
      include: {
        templates: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get all unique section types
    const sections = await prisma.storeSectionInstance.findMany({
      where: {
        templateId: {
          in: store.templates.map(t => t.id)
        }
      },
      select: {
        sectionType: true,
        template: {
          select: {
            templateType: true
          }
        }
      },
      distinct: ['sectionType']
    });

    // Group by section type
    const sectionTypes = sections.reduce((acc, section) => {
      if (!acc[section.sectionType]) {
        acc[section.sectionType] = {
          type: section.sectionType,
          templates: []
        };
      }
      acc[section.sectionType].templates.push(section.template.templateType);
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      sectionTypes: Object.values(sectionTypes),
      totalTypes: Object.keys(sectionTypes).length
    });
  } catch (error) {
    console.error('[Section Cleanup API] Error:', error);
    return apiResponse.serverError('Failed to list sections');
  }
}