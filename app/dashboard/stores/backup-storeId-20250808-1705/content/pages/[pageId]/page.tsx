import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageEditor from './page-editor';

export default async function EditPagePage({
  params
}: {
  params: Promise<{ storeId: string; pageId: string }>;
}) {
  const session = await requireAuth();
  if (!session) {
    redirect('/login');
  }

  const { storeId, pageId } = await params;
  
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
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
          <PageEditor storeId={storeId} pageId={null} />
        </Suspense>
      </div>
    );
  }

  // Fetch existing page
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      storeId
    }
  });

  if (!page) {
    redirect(`/dashboard/stores/${storeId}/content/pages`);
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Suspense fallback={<div>Loading...</div>}>
        <PageEditor storeId={storeId} pageId={pageId} initialData={page} />
      </Suspense>
    </div>
  );
}