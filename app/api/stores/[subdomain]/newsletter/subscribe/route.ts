import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional().default('website'),
  tags: z.array(z.string()).optional().default([])
});

// POST /api/stores/[subdomain]/newsletter/subscribe
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = subscribeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, source, tags } = validationResult.data;
    
    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { 
        id: true,
        name: true,
        emailSettings: true
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if email already exists for this store
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: email
        }
      }
    });

    if (existingSubscriber) {
      // Update existing subscriber
      if (existingSubscriber.status === 'unsubscribed') {
        await prisma.newsletterSubscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            status: 'active',
            resubscribedAt: new Date(),
            tags: [...new Set([...existingSubscriber.tags, ...tags])]
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
          isResubscribed: true
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Already subscribed to newsletter',
        isExisting: true
      });
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        source,
        tags,
        status: 'active',
        storeId: store.id,
        subscribedAt: new Date()
      }
    });

    // TODO: Send welcome email if email settings are configured
    // This would integrate with the store's email provider (SendGrid, etc.)
    /*
    if (store.emailSettings?.welcomeEmailEnabled) {
      await sendWelcomeEmail({
        to: email,
        storeName: store.name,
        template: store.emailSettings.welcomeEmailTemplate
      });
    }
    */

    // Track the subscription event
    await prisma.event.create({
      data: {
        type: 'newsletter_subscription',
        data: {
          email,
          source,
          tags
        },
        storeId: store.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

// GET /api/stores/[subdomain]/newsletter/subscribe - Check subscription status
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return apiResponse.badRequest('Email parameter is required');
    }
    
    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }
    
    // Check subscription status
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: email
        }
      }
    });
    
    if (!subscriber) {
      return NextResponse.json({
        isSubscribed: false,
        status: 'not_subscribed'
      });
    }
    
    return NextResponse.json({
      isSubscribed: subscriber.status === 'active',
      status: subscriber.status,
      subscribedAt: subscriber.subscribedAt,
      tags: subscriber.tags
    });
  } catch (error) {
    console.error('Newsletter status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}