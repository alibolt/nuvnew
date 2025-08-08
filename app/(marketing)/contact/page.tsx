import { Metadata } from 'next';
import ContactPageClient from './contact-client';

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Contact Nuvi - Get in Touch With Our Team',
  description: 'Have questions about Nuvi? Contact our sales and support team. We\'re here to help you succeed with your e-commerce business.',
  keywords: 'contact nuvi, e-commerce support, nuvi help, customer service, sales contact',
  openGraph: {
    title: 'Contact Nuvi - We\'re Here to Help',
    description: 'Get in touch with our team for sales inquiries, support, or general questions.',
    type: 'website',
    url: 'https://nuvi.com/contact',
  },
  alternates: {
    canonical: 'https://nuvi.com/contact',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}