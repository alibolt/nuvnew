import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageWithGlobalSections } from '../../page-with-global-sections';

interface LoginPageProps {
  params: Promise<{
    subdomain: string;
  }>;
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { subdomain } = await params;
  const { redirect } = await searchParams;

  // Get store by subdomain
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    notFound();
  }

  // Page template for login
  const pageTemplate = {
    id: 'login-page',
    sections: [
      {
        id: 'login-form',
        sectionType: 'login-form',
        settings: {
          title: 'Sign In',
          subtitle: 'Welcome back! Please sign in to your account.',
          showRegisterLink: true,
          registerLinkText: "Don't have an account? Sign up",
          showForgotPassword: true,
          forgotPasswordText: 'Forgot your password?',
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
      pageData={{ template: pageTemplate, type: "login", ...pageData }}
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
      title: 'Login Not Found',
    };
  }

  return {
    title: `Sign In | ${store.name}`,
    description: `Sign in to your account at ${store.name}`,
  };
}