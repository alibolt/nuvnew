import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { DashboardSettingsContent } from './settings-content';

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    }
  });

  if (!user) {
    notFound();
  }

  // Get user's stores
  const stores = await prisma.store.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      subdomain: true,
      customDomain: true,
      plan: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          products: true,
          orders: true,
          customers: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="nuvi-container nuvi-py-lg">
      <DashboardSettingsContent 
        user={user} 
        stores={stores}
        session={session}
      />
    </div>
  );
}