import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for email campaign
const emailCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  previewText: z.string().optional(),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional(),
  content: z.object({
    html: z.string().min(1),
    text: z.string().optional()
  }),
  audience: z.object({
    type: z.enum(['all', 'segment', 'custom']),
    segmentId: z.string().optional(),
    customerIds: z.array(z.string()).optional(),
    filters: z.object({
      acceptsMarketing: z.boolean().optional(),
      orderCount: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      totalSpent: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      lastOrderDate: z.object({
        after: z.string().datetime().optional(),
        before: z.string().datetime().optional()
      }).optional(),
      tags: z.array(z.string()).optional()
    }).optional()
  }),
  schedule: z.object({
    type: z.enum(['immediate', 'scheduled']),
    date: z.string().optional(),
    timezone: z.string().optional()
  }),
  tracking: z.object({
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    googleAnalytics: z.boolean().default(false)
  }).optional(),
  testEmails: z.array(z.string().email()).optional()
});

// Schema for SMS campaign
const smsCampaignSchema = z.object({
  name: z.string().min(1),
  message: z.string().min(1).max(160), // SMS character limit
  fromNumber: z.string().optional(),
  audience: z.object({
    type: z.enum(['all', 'segment', 'custom']),
    segmentId: z.string().optional(),
    customerIds: z.array(z.string()).optional(),
    filters: z.object({
      smsMarketing: z.boolean().optional(),
      hasPhone: z.boolean().default(true)
    }).optional()
  }),
  schedule: z.object({
    type: z.enum(['immediate', 'scheduled']),
    date: z.string().optional(),
    timezone: z.string().optional()
  })
});

// GET - List campaigns
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
    
    const type = searchParams.get('type'); // email, sms
    const status = searchParams.get('status'); // draft, scheduled, sent, failed
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    
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

    // Get campaigns from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Ensure campaigns is an array
    let campaigns = Array.isArray(storeSettings?.marketingCampaigns) 
      ? (storeSettings.marketingCampaigns as any[]) 
      : [];

    // Apply filters
    if (type) {
      campaigns = campaigns.filter(c => c.type === type);
    }
    
    if (status) {
      campaigns = campaigns.filter(c => c.status === status);
    }

    // Sort by creation date (newest first)
    campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = campaigns.length;
    const startIndex = (page - 1) * limit;
    const paginatedCampaigns = campaigns.slice(startIndex, startIndex + limit);

    // Calculate campaign metrics
    const metrics = {
      total: campaigns.length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      scheduled: campaigns.filter(c => c.status === 'scheduled').length,
      sent: campaigns.filter(c => c.status === 'sent').length,
      failed: campaigns.filter(c => c.status === 'failed').length
    };

    return NextResponse.json({
      campaigns: paginatedCampaigns,
      metrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[MARKETING CAMPAIGNS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create campaign
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
    
    // Determine campaign type and validate
    const campaignType = body.type || 'email';
    let validation;
    
    if (campaignType === 'email') {
      validation = emailCampaignSchema.safeParse(body);
    } else if (campaignType === 'sms') {
      validation = smsCampaignSchema.safeParse(body);
    } else {
      return apiResponse.badRequest('Invalid campaign type. Must be email or sms');
    }
    
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

    // Calculate audience size
    const audienceSize = await calculateAudienceSize(store.id, validation.data.audience);

    // Create campaign
    const newCampaign = {
      id: `campaign_${Date.now()}`,
      type: campaignType,
      ...validation.data,
      status: validation.data.schedule.type === 'immediate' ? 'sending' : 'scheduled',
      audienceSize,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        failed: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Get current campaigns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const campaigns = (storeSettings?.marketingCampaigns as any[]) || [];
    campaigns.push(newCampaign);

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { marketingCampaigns: campaigns },
      create: {
        storeId: store.id,
        marketingCampaigns: campaigns
      }
    });

    // If immediate sending, process the campaign
    if (validation.data.schedule.type === 'immediate') {
      // TODO: Queue campaign for immediate sending
      // This would typically integrate with an email service like SendGrid, Mailgun, etc.
    }

    return NextResponse.json({ 
      message: 'Campaign created successfully',
      campaign: newCampaign
    });
  } catch (error) {
    console.error('[MARKETING CAMPAIGNS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// Helper function to calculate audience size
async function calculateAudienceSize(storeId: string, audience: any): Promise<number> {
  if (audience.type === 'custom' && audience.customerIds) {
    return audience.customerIds.length;
  }
  
  if (audience.type === 'all') {
    return await prisma.customer.count({
      where: { 
        storeId,
        acceptsMarketing: true 
      }
    });
  }
  
  // For segment-based or filtered audiences
  const where: any = { storeId };
  
  if (audience.filters) {
    const filters = audience.filters;
    
    if (filters.acceptsMarketing !== undefined) {
      where.acceptsMarketing = filters.acceptsMarketing;
    }
    
    if (filters.orderCount) {
      if (filters.orderCount.min !== undefined) {
        where.ordersCount = { gte: filters.orderCount.min };
      }
      if (filters.orderCount.max !== undefined) {
        where.ordersCount = { ...where.ordersCount, lte: filters.orderCount.max };
      }
    }
    
    if (filters.totalSpent) {
      if (filters.totalSpent.min !== undefined) {
        where.totalSpent = { gte: filters.totalSpent.min };
      }
      if (filters.totalSpent.max !== undefined) {
        where.totalSpent = { ...where.totalSpent, lte: filters.totalSpent.max };
      }
    }
    
    if (filters.lastOrderDate) {
      if (filters.lastOrderDate.after) {
        where.lastOrderAt = { gte: new Date(filters.lastOrderDate.after) };
      }
      if (filters.lastOrderDate.before) {
        where.lastOrderAt = { ...where.lastOrderAt, lte: new Date(filters.lastOrderDate.before) };
      }
    }
  }
  
  return await prisma.customer.count({ where });
}