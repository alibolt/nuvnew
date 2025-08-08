import Stripe from 'stripe';
import { prisma } from './prisma';
import { decrypt } from './crypto';

// Factory function to create Stripe instance with store-specific keys
export async function getStripeClient(storeId: string): Promise<Stripe | null> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { paymentSettings: true }
    });

    if (!store?.paymentSettings) {
      console.error('Payment settings not found');
      return null;
    }

    const settings = store.paymentSettings;

    if (!settings.stripeEnabled || !settings.stripeSecretKey) {
      console.error('Stripe is not enabled or secret key is missing');
      return null;
    }

    // Decrypt the secret key
    const secretKey = decrypt(settings.stripeSecretKey);
    if (!secretKey) {
      console.error('Failed to decrypt Stripe secret key');
      return null;
    }

    return new Stripe(secretKey, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    });
  } catch (error) {
    console.error('Error creating Stripe client:', error);
    return null;
  }
}

// Get publishable key for a store
export async function getStripePublishableKey(storeId: string): Promise<string | null> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { paymentSettings: true }
    });

    if (!store?.paymentSettings) {
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
    }

    const settings = store.paymentSettings;

    if (!settings.stripeEnabled || !settings.stripePublicKey) {
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
    }

    return settings.stripePublicKey;
  } catch (error) {
    console.error('Error getting Stripe publishable key:', error);
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
  }
}