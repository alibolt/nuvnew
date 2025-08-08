import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST - Duplicate campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; campaignId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, campaignId } = await params;

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

    // Get current campaigns
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const campaigns = (storeSettings?.marketingCampaigns as any[]) || [];
    const originalCampaign = campaigns.find(c => c.id === campaignId);

    if (!originalCampaign) {
      return apiResponse.notFound('Campaign ');
    }

    // Create duplicate campaign
    const duplicatedCampaign = {
      ...originalCampaign,
      id: `campaign_${Date.now()}`,
      name: `${originalCampaign.name} (Copy)`,
      status: 'draft',
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
      createdBy: session.user.email,
      sentAt: null,
      scheduledAt: null
    };

    campaigns.push(duplicatedCampaign);

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { marketingCampaigns: campaigns }
    });

    return NextResponse.json({
      message: 'Campaign duplicated successfully',
      campaign: duplicatedCampaign
    });
  } catch (error) {
    console.error('[CAMPAIGN DUPLICATE API] Error:', error);
    return apiResponse.serverError();
  }
}