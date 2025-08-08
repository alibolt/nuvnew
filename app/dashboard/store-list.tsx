'use client';

import Link from 'next/link';
import { Store } from '@prisma/client';
import { useState } from 'react';

export function StoreList({ stores }: { stores: Store[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (subdomain: string) => {
    if (!confirm('Are you sure you want to delete this store?')) {
      return;
    }

    setDeletingId(subdomain);
    try {
      const response = await fetch(`/api/stores/${subdomain}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete store');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-md sm:nuvi-grid-cols-2 lg:nuvi-grid-cols-3">
      {stores.map((store) => (
        <div
          key={store.id}
          className="nuvi-card nuvi-transition-shadow hover:nuvi-shadow-lg"
        >
          <div className="nuvi-card-content">
            <h3 className="nuvi-text-lg nuvi-font-medium nuvi-text-foreground">{store.name}</h3>
            <p className="nuvi-mt-xs nuvi-text-sm nuvi-text-secondary">
              {store.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
            </p>
            {store.customDomain && (
              <p className="nuvi-mt-xs nuvi-text-sm nuvi-text-secondary">{store.customDomain}</p>
            )}
            <div className="nuvi-mt-md nuvi-flex nuvi-flex-wrap nuvi-gap-sm">
              <Link
                href={`http://${store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`}
                target="_blank"
                className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline nuvi-font-medium"
              >
                Visit Store →
              </Link>
              <Link
                href={`/dashboard/stores/${store.subdomain}/products`}
                className="nuvi-text-sm nuvi-text-secondary hover:nuvi-text-foreground"
              >
                Products
              </Link>
              <Link
                href={`/dashboard/stores/${store.subdomain}/content/pages`}
                className="nuvi-text-sm nuvi-text-secondary hover:nuvi-text-foreground"
              >
                Pages
              </Link>
              <Link
                href={`/dashboard/stores/${store.subdomain}/content/blogs`}
                className="nuvi-text-sm nuvi-text-secondary hover:nuvi-text-foreground"
              >
                Blogs
              </Link>
              <Link
                href={`/dashboard/stores/${store.subdomain}/settings`}
                className="nuvi-text-sm nuvi-text-secondary hover:nuvi-text-foreground"
              >
                Settings
              </Link>
              <button
                onClick={() => handleDelete(store.subdomain)}
                disabled={deletingId === store.subdomain}
                className="nuvi-text-sm nuvi-text-destructive hover:nuvi-text-destructive/80 disabled:nuvi-opacity-50"
              >
                {deletingId === store.subdomain ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}