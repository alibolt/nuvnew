import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for domain configuration
const domainSchema = z.object({
  domain: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, 'Invalid domain format'),
  type: z.enum(['primary', 'redirect']),
  sslEnabled: z.boolean().default(true),
  verificationStatus: z.enum(['pending', 'verified', 'failed']).optional()
});

// GET - Get domain settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    
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

    // Get current domains
    const domains = [];
    
    // Add subdomain
    domains.push({
      domain: `${store.subdomain}.usenuvi.com`,
      type: 'subdomain',
      sslEnabled: true,
      verificationStatus: 'verified',
      isPrimary: !store.customDomain
    });

    // Add custom domain if exists
    if (store.customDomain) {
      domains.push({
        domain: store.customDomain,
        type: 'primary',
        sslEnabled: true,
        verificationStatus: 'verified', // TODO: Implement actual verification
        isPrimary: true
      });
    }

    // DNS records for custom domain setup
    const dnsRecords = store.customDomain ? [
      {
        type: 'A',
        name: '@',
        value: '76.76.21.21', // Example Vercel IP
        description: 'Points your domain to our servers'
      },
      {
        type: 'CNAME',
        name: 'www',
        value: 'cname.usenuvi.com',
        description: 'Points www subdomain to our servers'
      }
    ] : [];

    return NextResponse.json({ 
      domains,
      dnsRecords,
      defaultDomain: `${store.subdomain}.usenuvi.com`
    });
  } catch (error) {
    console.error('[DOMAINS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Add custom domain
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = domainSchema.safeParse(body);
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

    // Check if domain is already in use
    const existingStore = await prisma.store.findFirst({
      where: {
        customDomain: validation.data.domain,
        NOT: { id: store.id }
      }
    });

    if (existingStore) {
      return NextResponse.json({ 
        error: 'Domain is already in use by another store' 
      }, { status: 400 });
    }

    // Update store with custom domain
    await prisma.store.update({
      where: { id: store.id },
      data: {
        customDomain: validation.data.domain
      }
    });

    // TODO: Trigger domain verification process
    // This would typically involve:
    // 1. Creating DNS verification records
    // 2. Setting up SSL certificate
    // 3. Configuring CDN/proxy

    return NextResponse.json({ 
      message: 'Domain added successfully. Please update your DNS records.',
      domain: {
        domain: validation.data.domain,
        type: 'primary',
        sslEnabled: true,
        verificationStatus: 'pending'
      },
      dnsRecords: [
        {
          type: 'A',
          name: '@',
          value: '76.76.21.21',
          description: 'Points your domain to our servers'
        },
        {
          type: 'CNAME',
          name: 'www',
          value: 'cname.usenuvi.com',
          description: 'Points www subdomain to our servers'
        }
      ]
    });
  } catch (error) {
    console.error('[DOMAINS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove custom domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    
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

    if (!store.customDomain) {
      return NextResponse.json({ 
        error: 'No custom domain to remove' 
      }, { status: 400 });
    }

    // Remove custom domain
    await prisma.store.update({
      where: { id: store.id },
      data: {
        customDomain: null
      }
    });

    return NextResponse.json({ 
      message: 'Custom domain removed successfully',
      defaultDomain: `${store.subdomain}.usenuvi.com`
    });
  } catch (error) {
    console.error('[DOMAINS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}