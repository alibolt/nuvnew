import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { TemplateService } from '@/lib/services/template-service';
import { prisma } from '@/lib/prisma';

// GET /api/templates - List templates for the current store
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiResponse.unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true }
    });

    if (!user?.store?.[0]) {
      return NextResponse.json({ error: 'No store found' }, { status: 404 });
    }

    const storeId = user.store[0].id;
    const searchParams = req.nextUrl.searchParams;
    const templateType = searchParams.get('templateType');
    const enabled = searchParams.get('enabled');

    const templateService = new TemplateService(prisma);
    const templates = await templateService.listTemplates(storeId, {
      templateType: templateType || undefined,
      enabled: enabled ? enabled === 'true' : undefined
    });

    return apiResponse.success(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiResponse.unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true }
    });

    if (!user?.store?.[0]) {
      return NextResponse.json({ error: 'No store found' }, { status: 404 });
    }

    const storeId = user.store[0].id;
    // Use a fixed theme ID for now - commerce theme
    const themeId = 'commerce';

    const data = await req.json();
    const templateService = new TemplateService(prisma);

    const template = await templateService.createTemplate({
      storeId,
      themeId,
      templateType: data.templateType,
      name: data.name,
      description: data.description,
      isDefault: data.isDefault || false,
      enabled: data.enabled !== false,
      settings: data.settings || {},
      seoSettings: data.seoSettings || {}
    });

    return apiResponse.success(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}