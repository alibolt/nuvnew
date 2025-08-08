import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '../../../template-renderer';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface PreviewPageProps {
  params: Promise<{ subdomain: string }>;
}

// Sample page content for different page types
const samplePages = {
  about: {
    id: 'page-about',
    title: 'About Us',
    slug: 'about',
    content: `<h2>Our Story</h2>
<p>Founded in 2020, we started with a simple mission: to create high-quality, sustainable products that people love. What began as a small workshop has grown into a thriving business serving customers worldwide.</p>

<h3>Our Values</h3>
<ul>
  <li><strong>Quality First:</strong> We never compromise on the quality of our materials or craftsmanship.</li>
  <li><strong>Sustainability:</strong> Every decision we make considers its environmental impact.</li>
  <li><strong>Customer Focus:</strong> Your satisfaction is our top priority.</li>
  <li><strong>Innovation:</strong> We're constantly improving and evolving our products.</li>
</ul>

<h3>Meet the Team</h3>
<p>Our team of 25 passionate individuals works tirelessly to bring you the best shopping experience. From our designers to our customer service team, everyone shares the same commitment to excellence.</p>

<h3>Looking Forward</h3>
<p>As we continue to grow, our commitment to quality, sustainability, and customer satisfaction remains unchanged. We're excited about the future and grateful for your support on this journey.</p>`,
  },
  contact: {
    id: 'page-contact',
    title: 'Contact Us',
    slug: 'contact',
    content: `<p>We'd love to hear from you! Whether you have a question about our products, need assistance with an order, or just want to say hello, we're here to help.</p>

<h3>Get in Touch</h3>
<p><strong>Email:</strong> support@example.com<br>
<strong>Phone:</strong> +1 (555) 123-4567<br>
<strong>Hours:</strong> Monday - Friday, 9AM - 6PM EST</p>

<h3>Visit Our Store</h3>
<p>123 Main Street<br>
Suite 100<br>
New York, NY 10001<br>
United States</p>

<h3>Follow Us</h3>
<p>Stay connected and get the latest updates on new products and promotions:</p>
<ul>
  <li>Instagram: @ourstore</li>
  <li>Facebook: /ourstore</li>
  <li>Twitter: @ourstore</li>
</ul>`,
  },
  faq: {
    id: 'page-faq',
    title: 'Frequently Asked Questions',
    slug: 'faq',
    content: `<h3>Shipping & Delivery</h3>
<p><strong>Q: How long does shipping take?</strong><br>
A: Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 day delivery.</p>

<p><strong>Q: Do you ship internationally?</strong><br>
A: Yes! We ship to over 50 countries worldwide. International shipping times vary by location.</p>

<p><strong>Q: Is shipping free?</strong><br>
A: We offer free standard shipping on orders over $100 within the United States.</p>

<h3>Returns & Exchanges</h3>
<p><strong>Q: What is your return policy?</strong><br>
A: We accept returns within 30 days of purchase for a full refund. Items must be unworn and in original condition.</p>

<p><strong>Q: How do I exchange an item?</strong><br>
A: Contact our customer service team to initiate an exchange. We'll provide a prepaid shipping label.</p>

<h3>Products & Care</h3>
<p><strong>Q: How should I care for my products?</strong><br>
A: Care instructions vary by product. Check the product page or care label for specific instructions.</p>

<p><strong>Q: Are your products sustainable?</strong><br>
A: Yes! We use eco-friendly materials and sustainable manufacturing processes whenever possible.</p>

<h3>Orders & Payment</h3>
<p><strong>Q: What payment methods do you accept?</strong><br>
A: We accept all major credit cards, PayPal, Apple Pay, and Google Pay.</p>

<p><strong>Q: Can I modify or cancel my order?</strong><br>
A: Orders can be modified or cancelled within 1 hour of placement. Contact us immediately if you need to make changes.</p>`,
  },
  'terms-of-service': {
    id: 'page-terms',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `<p>Last updated: January 1, 2024</p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h3>2. Use License</h3>
<p>Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</p>

<h3>3. Disclaimer</h3>
<p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

<h3>4. Limitations</h3>
<p>In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.</p>

<h3>5. Privacy Policy</h3>
<p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information.</p>

<h3>6. Governing Law</h3>
<p>These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>`,
  },
  'privacy-policy': {
    id: 'page-privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `<p>Last updated: January 1, 2024</p>

<h3>Information We Collect</h3>
<p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>

<h3>How We Use Your Information</h3>
<p>We use the information we collect to:</p>
<ul>
  <li>Process your orders and payments</li>
  <li>Communicate with you about your orders</li>
  <li>Send you marketing communications (with your consent)</li>
  <li>Improve our products and services</li>
</ul>

<h3>Information Sharing</h3>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h3>Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h3>Your Rights</h3>
<p>You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time.</p>

<h3>Contact Us</h3>
<p>If you have questions about this Privacy Policy, please contact us at privacy@example.com.</p>`,
  },
};

export default async function PagePreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = await params;
  const { subdomain } = resolvedParams;

  const store = await prisma.store.findUnique({
    where: { subdomain }
  });

  if (!store) {
    notFound();
  }

  // Get page template (use 'page' type for static pages)
  const template = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      templateType: 'page',
      isDefault: true,
    },
    include: {
      sections: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  const sections = template?.sections || [];

  // Load global sections
  const themeCode = store.themeCode || 'commerce';
  const globalSections = await getGlobalSections(subdomain, themeCode);

  // Randomly select a sample page for preview
  const pageTypes = Object.keys(samplePages);
  const randomPageType = pageTypes[Math.floor(Math.random() * pageTypes.length)];
  const samplePage = samplePages[randomPageType as keyof typeof samplePages];

  // Pass sample data through page props
  const pageData = {
    page: samplePage,
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: samplePage.title, href: '#' },
    ],
  };

  return (
    <TemplateRenderer
      store={store}
      sections={sections}
      globalSections={globalSections}
      isPreview={true}
      pageData={pageData}
    />
  );
}