import type { Metadata } from 'next';
import { montserrat, playfairDisplay } from './fonts';
import Providers from './providers';
import './globals.css';
import './styles/admin-theme.css';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Nuvi - Create Your Own E-commerce Store',
  description: 'Set up your own online store in minutes with Nuvi. List your products, make sales, and grow your brand.',
  keywords: 'e-commerce, online store, create store, sell online, nuvi, e-commerce platform, saas, store builder',
  authors: [{ name: 'Nuvi' }],
  creator: 'Nuvi',
  publisher: 'Nuvi',
  metadataBase: new URL('https://nuvi.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nuvi.com',
    siteName: 'Nuvi',
    title: 'Nuvi - Create Your Own E-commerce Store',
    description: 'Set up your own online store in minutes with Nuvi. List your products, make sales, and grow your brand.',
    images: [
      {
        url: '/nuvi-logo.svg',
        width: 400,
        height: 400,
        alt: 'Nuvi Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuvi - Create Your Own E-commerce Store',
    description: 'Set up your own online store in minutes with Nuvi. List your products, make sales, and grow your brand.',
    images: ['/nuvi-logo.svg'],
    creator: '@nuvi',
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
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isImpersonating = !!cookieStore.get('impersonator_admin_id');

  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <Providers isImpersonating={isImpersonating}>{children}</Providers>
      </body>
    </html>
  );
}