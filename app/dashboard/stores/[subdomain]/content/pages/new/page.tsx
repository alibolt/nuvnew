import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageEditor from '../[pageId]/page-editor';

export default async function NewPagePage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const session = await requireAuth();
  if (!session) {
    redirect('/login');
  }

  const { subdomain } = await params;
  
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id,
    },
  });

  if (!store) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Suspense fallback={<div>Loading...</div>}>
        <PageEditor subdomain={subdomain} pageId="new" isNew={true} />
      </Suspense>
    </div>
  );
}