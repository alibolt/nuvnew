import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for automation update
const updateAutomationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  trigger: z.object({
    type: z.enum([
      'welcome_new_customer',
      'abandoned_cart',
      'post_purchase',
      'win_back',
      'birthday',
      'product_restock',
      'review_request',
      'customer_milestone'
    ]).optional(),
    conditions: z.any().optional()
  }).optional(),
  actions: z.array(z.any()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// GET - Get single automation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; automationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, automationId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get automations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const automations = Array.isArray(storeSettings?.marketingAutomations) 
      ? (storeSettings.marketingAutomations as any[]) 
      : [];
    
    const automation = automations.find(a => a.id === automationId);

    if (!automation) {
      return apiResponse.notFound('Automation ');
    }

    return NextResponse.json({ automation });
  } catch (error) {
    console.error('[AUTOMATION API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update automation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; automationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, automationId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = updateAutomationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current automations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const automations = Array.isArray(storeSettings?.marketingAutomations)
      ? (storeSettings.marketingAutomations as any[])
      : [];
    
    const automationIndex = automations.findIndex(a => a.id === automationId);

    if (automationIndex === -1) {
      return apiResponse.notFound('Automation ');
    }

    // Update automation
    const updatedAutomation = {
      ...automations[automationIndex],
      ...validation.data,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    };

    automations[automationIndex] = updatedAutomation;

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { marketingAutomations: automations }
    });

    return NextResponse.json({ 
      message: 'Automation updated successfully',
      automation: updatedAutomation
    });
  } catch (error) {
    console.error('[AUTOMATION API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete automation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; automationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, automationId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current automations
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const automations = Array.isArray(storeSettings?.marketingAutomations)
      ? (storeSettings.marketingAutomations as any[])
      : [];
    
    const filteredAutomations = automations.filter(a => a.id !== automationId);

    if (filteredAutomations.length === automations.length) {
      return apiResponse.notFound('Automation ');
    }

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { marketingAutomations: filteredAutomations }
    });

    return apiResponse.success({ message: 'Automation deleted successfully' });
  } catch (error) {
    console.error('[AUTOMATION API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}