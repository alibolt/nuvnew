import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageEditor from './page-editor';

export default async function EditPagePage({
  params
}: {
  params: Promise<{ subdomain: string; pageId: string }>;
}) {
  const session = await requireAuth();
  if (!session) {
    redirect('/login');
  }

  const { subdomain, pageId } = await params;
  
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id,
    },
  });

  if (!store) {
    redirect('/dashboard');
  }

  // Special case for "new" page
  if (pageId === 'new') {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Suspense fallback={<div>Loading...</div>}>
          <PageEditor subdomain={subdomain} pageId={null} />
        </Suspense>
      </div>
    );
  }

  // Fetch existing page
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      storeId: store.id
    }
  });

  if (!page) {
    redirect(`/dashboard/stores/${subdomain}/content/pages`);
  }

  // Format the page data for the editor
  const pageData = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    isPublished: page.isPublished
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Suspense fallback={<div>Loading...</div>}>
        <PageEditor subdomain={subdomain} pageId={pageId} initialData={pageData} />
      </Suspense>
    </div>
  );
}