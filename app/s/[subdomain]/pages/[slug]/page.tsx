import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '../../page-renderer';
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}): Promise<Metadata> {
  const { subdomain, slug } = await params;
  
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    return { title: 'Page Not Found' };
  }

  const page = await prisma.page.findUnique({
    where: {
      storeId_slug: {
        storeId: store.id,
        slug
      }
    }
  });

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || '',
  };
}

export default async function StorePage({
  params
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain, slug } = await params;
  
  const store = await prisma.store.findUnique({
    where: { subdomain }
  });

  if (!store) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: {
      storeId: store.id,
      slug,
      isPublished: true
    }
  });

  if (!page) {
    notFound();
  }

  // Determine page template based on slug or page settings
  const getPageTemplate = (slug: string) => {
    // Special templates for common pages
    switch (slug) {
      case 'contact':
        return 'contact';
      case 'faq':
        return 'faq';
      case 'about':
      case 'about-us':
        return 'about';
      default:
        return 'default';
    }
  };

  const templateType = getPageTemplate(slug);

  // Build page template with sections
  const pageTemplate = {
    id: `static-page-${slug}`,
    sections: [
      {
        id: 'page-content',
        sectionType: templateType === 'contact' ? 'contact-page' :
                     templateType === 'faq' ? 'faq-page' :
                     templateType === 'about' ? 'about-page' :
                     'page-content',
        settings: {
          title: page.title,
          content: page.content,
          showTitle: true,
          containerWidth: 'narrow', // narrow, medium, wide, full
        },
        enabled: true,
        position: 0,
      },
    ],
  };

  // Additional sections for specific page types
  if (templateType === 'contact') {
    pageTemplate.sections.push({
      id: 'contact-form',
      sectionType: 'contact-form',
      settings: {
        title: 'Send us a message',
        subtitle: 'We\'ll get back to you as soon as possible.',
        showPhone: true,
        showEmail: true,
        showAddress: true,
      },
      enabled: true,
      position: 1,
    });
  }

  const pageData = {
    page,
    storeSubdomain: subdomain,
  };

  return (
    <PageRenderer
      pageTemplate={pageTemplate}
      store={store}
      pageData={pageData}
      pageType="static"
    />
  );
}