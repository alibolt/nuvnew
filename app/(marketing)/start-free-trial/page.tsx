import { Metadata } from 'next';
import StartFreeTrialClient from './start-free-trial-client';

export const metadata: Metadata = {
  title: 'Start Your Free 30-Day Trial - Nuvi E-commerce Platform',
  description: 'Start your online store with Nuvi\'s 30-day free trial. No credit card required. Get access to all features, 50+ templates, and 24/7 support.',
  keywords: 'free trial, e-commerce free trial, online store trial, nuvi trial, 30 day trial, no credit card',
  openGraph: {
    title: 'Start Your Free Trial - 30 Days, No Credit Card',
    description: 'Build your dream online store with Nuvi. Start free, upgrade anytime.',
    type: 'website',
    url: 'https://nuvi.com/start-free-trial',
    images: [{
      url: 'https://nuvi.com/og-trial.png',
      width: 1200,
      height: 630,
      alt: 'Start Free Trial with Nuvi',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/start-free-trial',
  },
};

export default function StartFreeTrialPage() {
  return <StartFreeTrialClient />;
}