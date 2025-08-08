import Stripe from 'stripe';

// Platform-level Stripe instance for webhook handling
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Helper to create store-specific Stripe instance
export function createStoreStripe(secretKey: string) {
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
  });
}
