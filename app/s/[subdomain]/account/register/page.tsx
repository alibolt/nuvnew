import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageWithGlobalSections } from '../../page-with-global-sections';

interface RegisterPageProps {
  params: Promise<{
    subdomain: string;
  }>;
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default async function RegisterPage({ params, searchParams }: RegisterPageProps) {
  const { subdomain } = await params;
  const { redirect } = await searchParams;

  // Get store by subdomain
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    notFound();
  }

  // Page template for register
  const pageTemplate = {
    id: 'register-page',
    sections: [
      {
        id: 'register-form',
        sectionType: 'register-form',
        settings: {
          title: 'Create Account',
          subtitle: 'Join us and enjoy exclusive benefits!',
          showLoginLink: true,
          loginLinkText: 'Already have an account? Sign in',
          showMarketingConsent: true,
          marketingConsentText: 'I would like to receive exclusive offers and promotions',
          redirectUrl: redirect || '/account',
        },
        enabled: true,
        position: 0,
      },
    ],
  };

  const pageData = {
    storeSubdomain: subdomain,
    redirectUrl: redirect,
  };

  return (
    <PageWithGlobalSections
      pageData={{ template: pageTemplate, type: "register", ...pageData }}
      store={store}
      subdomain={subdomain}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    return {
      title: 'Register Not Found',
    };
  }

  return {
    title: `Create Account | ${store.name}`,
    description: `Create your account at ${store.name} and enjoy exclusive benefits`,
  };
}