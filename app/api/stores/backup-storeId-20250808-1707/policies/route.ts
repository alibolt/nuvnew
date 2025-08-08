import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for policy page
const policySchema = z.object({
  type: z.enum([
    'privacy_policy', 
    'terms_of_service', 
    'refund_policy', 
    'shipping_policy', 
    'cookie_policy',
    'about_us',
    'contact_us',
    'faq'
  ]),
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  published: z.boolean().default(true),
  showInFooter: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// Schema for updating policy
const updatePolicySchema = policySchema.partial().extend({
  id: z.string().min(1)
});

// Default policy templates
const defaultPolicies = {
  privacy_policy: {
    title: 'Privacy Policy',
    content: `# Privacy Policy

Last updated: [Date]

## Information We Collect

We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.

## How We Use Your Information

We use the information we collect to:
- Process transactions
- Send you order confirmations
- Respond to your comments and questions
- Provide customer service

## Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties.

## Data Security

We implement appropriate security measures to protect your personal information.

## Contact Us

If you have questions about this Privacy Policy, please contact us at [email].`,
    slug: 'privacy-policy'
  },
  terms_of_service: {
    title: 'Terms of Service',
    content: `# Terms of Service

Last updated: [Date]

## Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.

## Products and Services

All products and services are subject to availability.

## Payment Terms

Payment is due at the time of purchase. We accept major credit cards and PayPal.

## Shipping and Delivery

We ship to addresses within [Country/Region]. Delivery times may vary.

## Returns and Refunds

Please see our Refund Policy for information about returns and refunds.

## Contact Information

For questions about these Terms of Service, contact us at [email].`,
    slug: 'terms-of-service'
  },
  refund_policy: {
    title: 'Refund Policy',
    content: `# Refund Policy

Last updated: [Date]

## Return Period

You may return items within 30 days of purchase for a full refund.

## Return Conditions

Items must be:
- In original condition
- Unworn and unwashed
- With original tags attached
- In original packaging

## How to Return

1. Contact our customer service team
2. Pack the item securely
3. Include your order number
4. Ship to our returns address

## Processing Time

Refunds will be processed within 5-10 business days after we receive your return.

## Contact Us

For return questions, email us at [email] or call [phone].`,
    slug: 'refund-policy'
  },
  shipping_policy: {
    title: 'Shipping Policy',
    content: `# Shipping Policy

Last updated: [Date]

## Shipping Methods

We offer the following shipping options:
- Standard Shipping (5-7 business days)
- Express Shipping (2-3 business days)
- Overnight Shipping (1 business day)

## Shipping Costs

Shipping costs are calculated at checkout based on your location and order total.

## Free Shipping

Free standard shipping on orders over $[amount].

## International Shipping

We currently ship to [list of countries].

## Processing Time

Orders are processed within 1-2 business days.

## Contact Us

For shipping questions, contact us at [email].`,
    slug: 'shipping-policy'
  }
};

// GET - Get store policies
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const published = searchParams.get('published');
    
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

    // Get policies from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let policies = storeSettings?.policies as any[] || [];

    // Filter by type
    if (type) {
      policies = policies.filter(policy => policy.type === type);
    }

    // Filter by published status
    if (published !== null) {
      const isPublished = published === 'true';
      policies = policies.filter(policy => policy.published === isPublished);
    }

    return NextResponse.json({ 
      policies,
      defaultTemplates: Object.keys(defaultPolicies)
    });
  } catch (error) {
    console.error('[POLICIES API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create policy
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
    
    // Check if creating from template
    if (body.fromTemplate && defaultPolicies[body.fromTemplate as keyof typeof defaultPolicies]) {
      const template = defaultPolicies[body.fromTemplate as keyof typeof defaultPolicies];
      body.title = template.title;
      body.content = template.content;
      body.slug = template.slug;
      body.type = body.fromTemplate;
    }

    // Validate input
    const validation = policySchema.safeParse(body);
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

    // Get current policies
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const policies = storeSettings?.policies as any[] || [];

    // Check for duplicate slug
    const existingPolicy = policies.find(policy => policy.slug === validation.data.slug);
    if (existingPolicy) {
      return NextResponse.json({ 
        error: 'A policy with this slug already exists' 
      }, { status: 400 });
    }

    // Create new policy
    const newPolicy = {
      id: `policy_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Add to policies
    policies.push(newPolicy);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        policies
      },
      create: {
        storeId: store.id,
        policies
      }
    });

    return NextResponse.json({ 
      message: 'Policy created successfully',
      policy: newPolicy 
    });
  } catch (error) {
    console.error('[POLICIES API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update policy
export async function PUT(
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
    const validation = updatePolicySchema.safeParse(body);
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

    // Get current policies
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const policies = storeSettings?.policies as any[] || [];
    const policyIndex = policies.findIndex(policy => policy.id === validation.data.id);

    if (policyIndex === -1) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Check for duplicate slug if slug is being changed
    if (validation.data.slug && validation.data.slug !== policies[policyIndex].slug) {
      const duplicateSlug = policies.find(
        policy => policy.slug === validation.data.slug && policy.id !== validation.data.id
      );
      
      if (duplicateSlug) {
        return NextResponse.json({ 
          error: 'A policy with this slug already exists' 
        }, { status: 400 });
      }
    }

    // Update policy
    const { id, ...updateData } = validation.data;
    policies[policyIndex] = {
      ...policies[policyIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        policies
      }
    });

    return NextResponse.json({ 
      message: 'Policy updated successfully',
      policy: policies[policyIndex]
    });
  } catch (error) {
    console.error('[POLICIES API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete policy
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
    const { searchParams } = new URL(request.url);
    const policyId = searchParams.get('policyId');
    
    if (!policyId) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
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

    // Get current policies
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const policies = storeSettings?.policies as any[] || [];
    const filteredPolicies = policies.filter(policy => policy.id !== policyId);

    if (filteredPolicies.length === policies.length) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        policies: filteredPolicies
      }
    });

    return NextResponse.json({ 
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('[POLICIES API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}