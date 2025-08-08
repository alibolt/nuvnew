import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { StoreList } from './store-list';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await requireAuth();
  
  const stores = await prisma.store.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Eğer kullanıcının tek store'u varsa direkt oraya yönlendir
  if (stores.length === 1) {
    redirect(`/dashboard/stores/${stores[0].subdomain}`);
  }

  return (
    <div className="nuvi-min-h-screen nuvi-bg-background">
      <div className="nuvi-bg-background nuvi-border-b">
        <div className="nuvi-max-w-7xl nuvi-mx-auto nuvi-px-md">
          <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-py-lg">
            <h1 className="nuvi-text-3xl nuvi-font-bold nuvi-text-foreground nuvi-font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Stores</h1>
            <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
              <span className="nuvi-text-sm nuvi-text-secondary">
                Welcome, {session.user.name || session.user.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="nuvi-text-sm nuvi-text-muted hover:nuvi-text-secondary"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="nuvi-max-w-7xl nuvi-mx-auto nuvi-px-md nuvi-py-xl">
        {stores.length === 0 ? (
          <div className="nuvi-text-center nuvi-py-xl">
            <svg
              className="nuvi-mx-auto nuvi-h-12 nuvi-w-12 nuvi-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="nuvi-mt-sm nuvi-text-sm nuvi-font-medium nuvi-text-foreground">No stores</h3>
            <p className="nuvi-mt-xs nuvi-text-sm nuvi-text-secondary">
              Get started by creating a new store.
            </p>
            <div className="nuvi-mt-lg">
              <Link
                href="/dashboard/stores/new"
                className="nuvi-btn nuvi-btn-primary"
              >
                Create New Store
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
              <p className="nuvi-text-secondary">
                You have {stores.length} {stores.length === 1 ? 'store' : 'stores'}
              </p>
              <Link
                href="/dashboard/stores/new"
                className="nuvi-btn nuvi-btn-primary"
              >
                Create New Store
              </Link>
            </div>
            <StoreList stores={stores} />
          </div>
        )}
      </div>
    </div>
  );
}