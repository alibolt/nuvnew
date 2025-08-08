import Stripe from 'stripe';

// Initialize Stripe with platform account
const stripe = new Stripe(process.env.PLATFORM_STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Nuvi Software Limited connected account ID
export const NUVI_CONNECTED_ACCOUNT_ID = process.env.NUVI_STRIPE_ACCOUNT_ID || '';

export interface CreateConnectedPaymentParams {
  amount: number;
  currency: string;
  customerEmail: string;
  metadata: Record<string, string>;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  shippingOptions?: Stripe.Checkout.SessionCreateParams.ShippingOption[];
  shippingAddressCollection?: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection;
}

/**
 * Create a checkout session on behalf of Nuvi Software Limited
 * This allows the platform to process payments through Nuvi's Stripe account
 */
export async function createNuviCheckoutSession(params: CreateConnectedPaymentParams) {
  const {
    amount,
    currency,
    customerEmail,
    metadata,
    lineItems,
    successUrl,
    cancelUrl,
    shippingOptions,
    shippingAddressCollection
  } = params;

  try {
    // Create checkout session directly on the platform account
    // Since we're logged in as Nuvi Software Limited, we use the platform key
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      shipping_address_collection: shippingAddressCollection,
      shipping_options: shippingOptions,
      metadata: {
        ...metadata,
        processed_by: 'nuvi_platform',
      },
      allow_promotion_codes: true,
      invoice_creation: {
        enabled: true,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating Nuvi checkout session:', error);
    throw error;
  }
}

/**
 * Create a transfer to merchant's bank account after deducting fees
 */
export async function createMerchantPayout(
  orderId: string,
  amount: number,
  currency: string,
  merchantBankAccount: {
    accountNumber: string;
    routingNumber?: string;
    iban?: string;
    swiftCode?: string;
  }
) {
  try {
    // Create a payout to the merchant's bank account
    const payout = await stripe.payouts.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      method: 'standard',
      metadata: {
        order_id: orderId,
        type: 'merchant_payout',
      },
      destination: merchantBankAccount.iban || merchantBankAccount.accountNumber,
    }, {
      stripeAccount: NUVI_CONNECTED_ACCOUNT_ID,
    });

    return payout;
  } catch (error) {
    console.error('Error creating merchant payout:', error);
    throw error;
  }
}

/**
 * Retrieve a checkout session from the Nuvi account
 */
export async function retrieveNuviCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving Nuvi checkout session:', error);
    throw error;
  }
}

/**
 * Create a refund on the connected account
 */
export async function createNuviRefund(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
    }, {
      stripeAccount: NUVI_CONNECTED_ACCOUNT_ID,
    });
    return refund;
  } catch (error) {
    console.error('Error creating Nuvi refund:', error);
    throw error;
  }
}

export { stripe as platformStripe };