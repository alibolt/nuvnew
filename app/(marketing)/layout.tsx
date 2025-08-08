import { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/header';
import { SiteFooter } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Nuvi - Create Your Own E-commerce Store in Minutes | No-Code Platform',
  description: 'Build, customize, and scale your online store with Nuvi\'s AI-powered e-commerce platform. No coding required. 50+ templates, secure payments, SEO tools, and 24/7 support.',
  keywords: 'e-commerce platform, online store builder, no-code e-commerce, create online store, e-commerce website builder, AI e-commerce, shopify alternative, woocommerce alternative, online shop creator, e-commerce solution, drag and drop store builder, e-commerce templates',
  openGraph: {
    title: 'Nuvi - Create Your Own E-commerce Store in Minutes',
    description: 'Build professional online stores without coding. AI-powered tools, 50+ templates, secure payments, and everything you need to succeed online.',
    type: 'website',
    locale: 'en_US',
    url: 'https://nuvi.com',
    siteName: 'Nuvi',
    images: [
      {
        url: 'https://nuvi.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nuvi E-commerce Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuvi - Create Your Own E-commerce Store in Minutes',
    description: 'Build professional online stores without coding. AI-powered tools, 50+ templates, and everything you need to succeed.',
    images: ['https://nuvi.com/twitter-image.png'],
    creator: '@nuvi',
  },
  alternates: {
    canonical: 'https://nuvi.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Nuvi",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "AI-powered e-commerce platform for creating online stores without coding",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/PreOrder"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "2847"
            },
            "brand": {
              "@type": "Organization",
              "name": "Nuvi",
              "logo": "https://nuvi.com/nuvi-logo.svg"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Nuvi",
            "url": "https://nuvi.com",
            "logo": "https://nuvi.com/nuvi-logo.svg",
            "sameAs": [
              "https://twitter.com/nuvi",
              "https://facebook.com/nuvi",
              "https://linkedin.com/company/nuvi",
              "https://instagram.com/nuvi"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-555-123-4567",
              "contactType": "customer support",
              "availableLanguage": ["English", "Spanish", "French", "German"],
              "areaServed": "Worldwide"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Do I need technical skills to use Nuvi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, Nuvi is designed for everyone. Our visual builder and AI assistant help you create professional stores without any coding knowledge."
                }
              },
              {
                "@type": "Question",
                "name": "What's included in the pricing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "All plans include hosting, SSL certificate, unlimited bandwidth, customer support, and access to all features. No hidden fees or transaction charges."
                }
              },
              {
                "@type": "Question",
                "name": "Can I migrate my existing store?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We offer free migration assistance for stores coming from Shopify, WooCommerce, and other major platforms."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a free trial?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Early access users get a 30-day free trial with full access to all features. No credit card required to start."
                }
              }
            ]
          })
        }}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}