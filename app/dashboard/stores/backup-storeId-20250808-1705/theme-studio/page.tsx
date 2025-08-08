import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ThemeStudioNext } from './theme-studio-next';

export default async function ThemeStudioPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await requireAuth();
  const { storeId } = await params;
  
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { id: storeId, userId: session.user.id },
        { subdomain: storeId, userId: session.user.id }
      ]
    },
  });

  if (!store) {
    redirect('/dashboard');
  }

  return (
    <ThemeStudioNext 
      key={store.id}
      store={{
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
      }} 
    />
  );
}