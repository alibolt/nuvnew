import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { ProductFormV2 } from './product-form-v2';

interface NewProductPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function NewProductPage({ params }: NewProductPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { subdomain } = await params;
  
  // Verify the store belongs to the user
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
    <div className="container mx-auto py-6">
      <ProductFormV2 
        subdomain={subdomain}
        isEdit={false}
      />
    </div>
  );
}