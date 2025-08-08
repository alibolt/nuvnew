import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { professionalEmailTemplates } from '@/lib/email-templates-professional';

// Schema for email template
const emailTemplateSchema = z.object({
  type: z.enum([
    'order_confirmation',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'order_refunded',
    'welcome_email',
    'password_reset',
    'account_created',
    'newsletter_welcome',
    'abandoned_cart',
    'back_in_stock',
    'low_stock_alert',
    'new_order_notification',
    'custom'
  ]),
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  enabled: z.boolean().default(true),
  variables: z.array(z.string()).optional(),
  blocks: z.string().optional(), // Store blocks as JSON string
});

// Schema for updating template
const updateTemplateSchema = emailTemplateSchema.partial().extend({
  id: z.string().min(1),
  blocks: z.string().optional(), // Allow blocks in updates
});

// Use professional templates from separate file
const defaultTemplates = professionalEmailTemplates;

// GET - Get email templates
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const enabled = searchParams.get('enabled');
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get templates from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let templates = (storeSettings?.emailSettings as any)?.templates || [];

    // Filter by type
    if (type) {
      templates = templates.filter((template: any) => template.type === type);
    }

    // Filter by enabled status
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      templates = templates.filter((template: any) => template.enabled === isEnabled);
    }

    return NextResponse.json({ 
      templates,
      defaultTemplates: Object.keys(defaultTemplates)
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create email template
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
    let body = await request.json();
    
    console.log('[EMAIL TEMPLATES API] POST received - subdomain:', subdomain, 'body:', JSON.stringify(body));
    
    // Check if creating from default template
    if (body.fromTemplate) {
      console.log('[EMAIL TEMPLATES API] Creating from template:', body.fromTemplate);
      const availableTemplates = Object.keys(defaultTemplates);
      console.log('[EMAIL TEMPLATES API] Available templates:', availableTemplates);
      
      const template = defaultTemplates[body.fromTemplate as keyof typeof defaultTemplates];
      
      if (!template) {
        console.error('[EMAIL TEMPLATES API] Template not found:', body.fromTemplate);
        console.error('[EMAIL TEMPLATES API] Available templates:', availableTemplates);
        return NextResponse.json({ 
          error: `Default template not found: ${body.fromTemplate}. Available templates: ${availableTemplates.join(', ')}` 
        }, { status: 400 });
      }
      
      // Override body with template data
      body = {
        ...body,
        type: body.fromTemplate,
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent || '',
        variables: template.variables || [],
        enabled: true
      };
      
      console.log('[EMAIL TEMPLATES API] Body after template merge:', body);
    }

    // Validate input
    const validation = emailTemplateSchema.safeParse(body);
    if (!validation.success) {
      console.error('[EMAIL TEMPLATES API] Validation error:', validation.error.format());
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get or create store settings
    let storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    if (!storeSettings) {
      // Create default store settings if they don't exist
      storeSettings = await prisma.storeSettings.create({
        data: {
          storeId: store.id,
          emailSettings: {
            templates: []
          }
        }
      });
    }

    const templates = (storeSettings?.emailSettings as any)?.templates || [];

    // Check for duplicate type (except for custom templates)
    if (validation.data.type !== 'custom') {
      const existingTemplate = templates.find((template: any) => 
        template.type === validation.data.type && !template.id.startsWith('default_')
      );
      if (existingTemplate) {
        return NextResponse.json({ 
          error: 'A template of this type already exists' 
        }, { status: 400 });
      }
    }

    // Create new template
    const newTemplate = {
      id: `template_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Add to templates
    templates.push(newTemplate);

    // Get current email settings
    const currentSettings = (storeSettings?.emailSettings as any) || {};
    
    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        emailSettings: {
          ...currentSettings,
          templates
        }
      },
      create: {
        storeId: store.id,
        emailSettings: {
          ...currentSettings,
          templates
        }
      }
    });

    return NextResponse.json({ 
      message: 'Email template created successfully',
      template: newTemplate 
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update email template
export async function PUT(
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

    // Validate input
    const validation = updateTemplateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    if (!storeSettings) {
      return apiResponse.notFound('Store settings not found');
    }

    const templates = (storeSettings?.emailSettings as any)?.templates || [];

    // Find and update template
    const templateIndex = templates.findIndex((template: any) => template.id === validation.data.id);
    if (templateIndex === -1) {
      return apiResponse.notFound('Template not found');
    }

    // Update template
    templates[templateIndex] = {
      ...templates[templateIndex],
      ...validation.data,
      updatedAt: new Date().toISOString()
    };

    // Get current email settings
    const currentSettings = (storeSettings?.emailSettings as any) || {};
    
    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        emailSettings: {
          ...currentSettings,
          templates
        }
      }
    });

    return NextResponse.json({ 
      message: 'Email template updated successfully',
      template: templates[templateIndex] 
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Get store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    if (!storeSettings) {
      return apiResponse.notFound('Store settings not found');
    }

    const templates = (storeSettings?.emailSettings as any)?.templates || [];

    // Filter out the template to delete
    const updatedTemplates = templates.filter((template: any) => template.id !== templateId);

    if (templates.length === updatedTemplates.length) {
      return apiResponse.notFound('Template not found');
    }

    // Get current email settings
    const currentSettings = (storeSettings?.emailSettings as any) || {};
    
    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        emailSettings: {
          ...currentSettings,
          templates: updatedTemplates
        }
      }
    });

    return NextResponse.json({ 
      message: 'Email template deleted successfully' 
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}