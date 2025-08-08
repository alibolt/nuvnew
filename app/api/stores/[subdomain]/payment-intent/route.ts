import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NUVI_CONNECTED_ACCOUNT_ID } from '@/lib/stripe-connect';
import Stripe from 'stripe';

// Create payment intent for embedded checkout
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { 
      cartItems, 
      shippingAddress, 
      billingAddress,
      customer,
      paymentMethod,
      discountCode,
      shippingRate,
      metadata 
    } = await request.json();

    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        storeSettings: true,
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get payment settings
    const paymentMethods = store.storeSettings?.paymentMethods as any || {};

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of cartItems) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });

      if (!variant) continue;

      const itemTotal = variant.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        name: variant.product.name,
        description: variant.name !== 'Default Title' ? variant.name : undefined,
        amount: Math.round(variant.price * 100),
        quantity: item.quantity,
        images: variant.product.images as string[],
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    if (discountCode) {
      // Discount logic here
    }

    // Calculate shipping, tax, and total
    const shippingAmount = shippingRate?.rate || 0; // Use selected shipping rate
    const taxRate = 0.08; // 8% tax
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const total = subtotal - discountAmount + taxAmount + shippingAmount;

    if (paymentMethod === 'nuvi') {
      const nuviSettings = paymentMethods.nuvi;
      if (!nuviSettings?.enabled) {
        return NextResponse.json({ error: 'Nuvi payment not enabled' }, { status: 400 });
      }

      // Initialize Stripe with platform account
      const stripe = new Stripe(process.env.PLATFORM_STRIPE_SECRET_KEY || '', {
        apiVersion: '2024-11-20.acacia',
      });

      // Calculate platform fees
      const commission = nuviSettings.settings?.commission || 5.9;
      const fixedFee = nuviSettings.settings?.fixedFee || 0.50;
      const platformFee = Math.round((total * commission / 100 + fixedFee) * 100);
      const merchantPayout = total - (platformFee / 100);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: store.currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          storeId: store.id,
          subdomain: store.subdomain,
          paymentMethod: 'nuvi',
          platformFee: platformFee.toString(),
          merchantPayout: merchantPayout.toFixed(2),
          cartItems: JSON.stringify(cartItems),
          customerEmail: customer.email,
          customerName: customer.name,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(billingAddress || shippingAddress),
          discount: discountCode ? JSON.stringify({ code: discountCode, amount: discountAmount }) : undefined,
          ...metadata,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total,
        currency: store.currency,
        platformFee: platformFee / 100,
        merchantPayout,
      });

    } else if (paymentMethod === 'stripe') {
      const stripeSettings = paymentMethods.stripe;
      const secretKey = stripeSettings?.settings?.secretKey || stripeSettings?.settings?.secretKey;
      
      if (!stripeSettings?.enabled || !secretKey) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
      }

      // Initialize Stripe with store's account
      const storeStripe = new Stripe(secretKey, {
        apiVersion: '2024-11-20.acacia',
      });

      // Create payment intent with store's Stripe account
      const paymentIntent = await storeStripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: store.currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          storeId: store.id,
          subdomain: store.subdomain,
          cartItems: JSON.stringify(cartItems),
          customerEmail: customer.email,
          customerName: customer.name,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(billingAddress || shippingAddress),
          discount: discountCode ? JSON.stringify({ code: discountCode, amount: discountAmount }) : undefined,
          ...metadata,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total,
        currency: store.currency,
      });
    } else if (paymentMethod === 'manual') {
      // For manual/bank transfer payments, we don't create a Stripe payment intent
      // Instead, we'll create the order directly with 'pending' status
      const manualSettings = paymentMethods.manual;
      
      if (!manualSettings?.enabled) {
        return NextResponse.json({ error: 'Manual payment not enabled' }, { status: 400 });
      }

      // Generate a unique order ID for manual payment
      const orderId = `MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return NextResponse.json({
        clientSecret: null, // No Stripe client secret for manual payments
        paymentIntentId: orderId,
        amount: total,
        currency: store.currency,
        paymentMethod: 'manual',
        instructions: manualSettings.settings?.instructions || 'Please transfer the payment to our bank account. Your order will be processed once payment is received.',
      });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}