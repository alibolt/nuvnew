import { Metadata } from 'next';
import SwitchFromShopifyClient from './switch-from-shopify-client';

export const metadata: Metadata = {
  title: 'Switch from Shopify to Nuvi - Save Money, Get More Features',
  description: 'Migrate from Shopify to Nuvi and save up to 70% on fees. Better features, lower costs, and free migration assistance. See why thousands are switching.',
  keywords: 'shopify alternative, migrate from shopify, shopify to nuvi, cheaper than shopify, better than shopify, shopify migration',
  openGraph: {
    title: 'Why 5,000+ Stores Switched from Shopify to Nuvi',
    description: 'Lower fees, better features, and dedicated support. Make the switch today.',
    type: 'website',
    url: 'https://nuvi.com/switch-from-shopify',
    images: [{
      url: 'https://nuvi.com/og-shopify-switch.png',
      width: 1200,
      height: 630,
      alt: 'Switch from Shopify to Nuvi',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/switch-from-shopify',
  },
};

export default function SwitchFromShopifyPage() {
  return <SwitchFromShopifyClient />;
}