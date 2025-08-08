import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for sending campaign
const sendCampaignSchema = z.object({
  testMode: z.boolean().default(false),
  testEmails: z.array(z.string().email()).optional()
});

// POST - Send campaign
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
    const body = await request.json();
    
    // Validate input
    const validation = sendCampaignSchema.safeParse(body);
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

    // Get campaign
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const campaigns = (storeSettings?.marketingCampaigns as any[]) || [];
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1) {
      return apiResponse.notFound('Campaign ');
    }

    const campaign = campaigns[campaignIndex];

    // Validate campaign status
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return apiResponse.badRequest('Campaign cannot be sent in current status');
    }

    // Handle test mode
    if (validation.data.testMode) {
      const testEmails = validation.data.testEmails || [];
      if (testEmails.length === 0) {
        return apiResponse.badRequest('Test emails are required for test mode');
      }

      // TODO: Send test emails
      // This would integrate with your email service provider
      
      return NextResponse.json({ 
        message: `Test campaign sent to ${testEmails.length} email(s)`,
        testEmails
      });
    }

    // Get campaign recipients
    const recipients = await getCampaignRecipients(store.id, campaign.audience);
    
    if (recipients.length === 0) {
      return apiResponse.badRequest('No recipients found for this campaign');
    }

    // Update campaign status
    const updatedCampaign = {
      ...campaign,
      status: 'sending',
      sentAt: new Date().toISOString(),
      audienceSize: recipients.length,
      updatedAt: new Date().toISOString(),
      sentBy: session.user.email
    };

    campaigns[campaignIndex] = updatedCampaign;

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { marketingCampaigns: campaigns }
    });

    // TODO: Queue campaign for sending
    // This would typically:
    // 1. Queue each recipient for sending
    // 2. Process the queue with your email service provider
    // 3. Update campaign stats as emails are sent/delivered/opened/clicked
    
    // For demonstration, we'll simulate the sending process
    setTimeout(async () => {
      // Simulate campaign completion
      const updatedCampaigns = [...campaigns];
      const finalCampaign = updatedCampaigns[campaignIndex];
      
      finalCampaign.status = 'sent';
      finalCampaign.stats = {
        sent: recipients.length,
        delivered: Math.floor(recipients.length * 0.95), // 95% delivery rate
        opened: Math.floor(recipients.length * 0.25), // 25% open rate
        clicked: Math.floor(recipients.length * 0.05), // 5% click rate
        bounced: Math.floor(recipients.length * 0.03), // 3% bounce rate
        unsubscribed: Math.floor(recipients.length * 0.01), // 1% unsubscribe rate
        failed: Math.floor(recipients.length * 0.02) // 2% failure rate
      };
      finalCampaign.completedAt = new Date().toISOString();

      await prisma.storeSettings.update({
        where: { storeId: store.id },
        data: { marketingCampaigns: updatedCampaigns }
      });
    }, 5000); // Simulate 5 second processing time

    return NextResponse.json({ 
      message: 'Campaign sending initiated',
      campaign: updatedCampaign,
      recipients: recipients.length
    });
  } catch (error) {
    console.error('[CAMPAIGN SEND API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// Helper function to get campaign recipients
async function getCampaignRecipients(subdomain: string, audience: any) {
  const where: any = { subdomain };
  
  if (audience.type === 'custom' && audience.customerIds) {
    where.id = { in: audience.customerIds };
  } else if (audience.type === 'all') {
    where.acceptsMarketing = true;
  } else if (audience.filters) {
    // Apply audience filters
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
  
  return await prisma.customer.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true
    }
  });
}