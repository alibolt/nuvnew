import { NextRequest, NextResponse } from 'next/server';
import { createNuviCheckoutSession } from '@/lib/stripe-connect';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, productName } = await request.json();

    // Create line items for checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: productName || 'Test Product',
          description: 'Testing Nuvi Payment Integration',
        },
        unit_amount: Math.round(amount * 100), // Convert to cents
      },
      quantity: 1,
    }];

    // Create checkout session
    const session = await createNuviCheckoutSession({
      amount: amount,
      currency: 'USD',
      customerEmail: 'test@example.com',
      metadata: {
        test: 'true',
        store_id: 'test-store',
        order_type: 'nuvi_payment_test',
      },
      lineItems,
      successUrl: `${process.env.NEXTAUTH_URL}/test-nuvi-payment/success`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/test-nuvi-payment`,
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Test checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session: ' + (error as Error).message },
      { status: 500 }
    );
  }
}