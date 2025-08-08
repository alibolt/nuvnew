import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for campaign update
const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  content: z.object({
    html: z.string().min(1),
    text: z.string().optional()
  }).optional(),
  scheduling: z.object({
    type: z.enum(['immediate', 'scheduled']),
    scheduledAt: z.string().datetime().optional(),
    timezone: z.string().optional()
  }).optional(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled']).optional()
});

// GET - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; campaignId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, campaignId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get campaign
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const campaigns = (storeSettings?.marketingCampaigns as any[]) || [];
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('[CAMPAIGN API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; campaignId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, campaignId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = updateCampaignSchema.safeParse(body);
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
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current campaigns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const campaigns = (storeSettings?.marketingCampaigns as any[]) || [];
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = campaigns[campaignIndex];

    // Check if campaign can be edited
    if (['sending', 'sent'].includes(campaign.status)) {
      return NextResponse.json({ 
        error: 'Cannot edit campaign that has been sent or is sending' 
      }, { status: 400 });
    }

    // Update campaign
    const updatedCampaign = {
      ...campaign,
      ...validation.data,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    };

    campaigns[campaignIndex] = updatedCampaign;

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { marketingCampaigns: campaigns }
    });

    return NextResponse.json({ 
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('[CAMPAIGN API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; campaignId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, campaignId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current campaigns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const campaigns = (storeSettings?.marketingCampaigns as any[]) || [];
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = campaigns[campaignIndex];

    // Check if campaign can be deleted
    if (['sending', 'sent'].includes(campaign.status)) {
      return NextResponse.json({ 
        error: 'Cannot delete campaign that has been sent or is sending' 
      }, { status: 400 });
    }

    // Remove campaign
    campaigns.splice(campaignIndex, 1);

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { marketingCampaigns: campaigns }
    });

    return NextResponse.json({ 
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('[CAMPAIGN API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}