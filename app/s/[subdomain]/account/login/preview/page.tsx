import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '@/app/s/[subdomain]/template-renderer';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

interface PreviewPageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getStore(subdomain: string) {
  try {
    return await prisma.store.findUnique({
      where: { subdomain }
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

async function getLoginTemplate(storeId: string) {
  try {
    // First try to get a specific login template
    let template = await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType: 'login',
        isDefault: true,
      },
      include: {
        sections: {
          orderBy: { position: 'asc' }
        }
      }
    });

    // If no login template exists, create a default one
    if (!template) {
      template = await prisma.storeTemplate.create({
        data: {
          storeId,
          templateType: 'login',
          name: 'Default Login Template',
          isDefault: true,
          enabled: true,
          sections: {
            create: [
              {
                sectionType: 'login-form',
                settings: {
                  title: 'Sign In',
                  subtitle: 'Welcome back! Please sign in to your account.',
                  showRegisterLink: true,
                  registerLinkText: "Don't have an account? Sign up",
                  showForgotPassword: true,
                  forgotPasswordText: 'Forgot your password?',
                },
                enabled: true,
                position: 0
              }
            ]
          }
        },
        include: {
          sections: {
            orderBy: { position: 'asc' }
          }
        }
      });
    }

    return template;
  } catch (error) {
    console.error('Error fetching login template:', error);
    return null;
  }
}

export default async function LoginPreviewPage({ params, searchParams }: PreviewPageProps) {
  const { subdomain } = await params;
  
  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    notFound();
  }

  // Get template
  const template = await getLoginTemplate(store.id);
  if (!template) {
    notFound();
  }
  
  // Get global sections
  const globalSections = await getGlobalSections(subdomain, 'commerce');

  // Prepare page data
  const pageData = {
    type: 'login',
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      description: store.description,
      logo: store.logo,
      email: store.email,
      phone: store.phone,
      address: store.address,
      facebook: store.facebook,
      instagram: store.instagram,
      twitter: store.twitter,
      youtube: store.youtube,
    },
    template,
    searchParams: await searchParams,
  };

  return (
    <TemplateRenderer 
      store={pageData.store}
      sections={template.sections}
      globalSections={globalSections}
      isPreview={true}
      pageData={pageData}
    />
  );
}