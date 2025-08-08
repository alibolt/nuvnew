'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CollectionGridProps {
  collections: any[];
  store: any;
  settings: {
    columnsDesktop?: number;
    columnsTablet?: number;
    columnsMobile?: number;
    showDescription?: boolean;
    showProductCount?: boolean;
  };
}

export function CollectionGrid({ collections, store, settings }: CollectionGridProps) {
  const columnsDesktop = settings.columnsDesktop || 3;
  const columnsTablet = settings.columnsTablet || 2;
  const columnsMobile = settings.columnsMobile || 1;
  const showDescription = settings.showDescription ?? true;
  const showProductCount = settings.showProductCount ?? true;

  if (!collections || collections.length === 0) {
    return (
      <div 
        className="text-center py-16"
        style={{
          fontFamily: 'var(--theme-font-body)',
          color: 'var(--theme-text-muted)',
        }}
      >
        <p>No collections found.</p>
      </div>
    );
  }

  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-background)',
        fontFamily: 'var(--theme-font-body)',
      }}
    >
      <div 
        className="mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <div 
          className={cn(
            "grid gap-8",
            `grid-cols-${columnsMobile}`,
            `md:grid-cols-${columnsTablet}`,
            `lg:grid-cols-${columnsDesktop}`
          )}
        >
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/s/${store.subdomain}/collections/${collection.slug}`}
              className="group block"
            >
              <div className="space-y-4">
                {/* Collection Image */}
                <div 
                  className="aspect-square w-full overflow-hidden group-hover:opacity-75 transition-opacity"
                  style={{
                    borderRadius: 'var(--theme-radius-lg)',
                    backgroundColor: 'var(--theme-surface)',
                  }}
                >
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div 
                      className="h-full w-full flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        color: 'var(--theme-text-muted)',
                      }}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collection Info */}
                <div className="space-y-2">
                  <h3 
                    className="font-semibold group-hover:underline"
                    style={{
                      fontSize: 'var(--theme-text-lg)',
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--theme-font-heading)',
                    }}
                  >
                    {collection.name}
                  </h3>

                  {showDescription && collection.description && (
                    <p 
                      className="line-clamp-2"
                      style={{
                        fontSize: 'var(--theme-text-sm)',
                        color: 'var(--theme-text-muted)',
                        lineHeight: 'var(--theme-line-height-relaxed)',
                      }}
                    >
                      {collection.description}
                    </p>
                  )}

                  {showProductCount && (
                    <p 
                      className="text-sm"
                      style={{
                        color: 'var(--theme-text-muted)',
                        fontSize: 'var(--theme-text-xs)',
                      }}
                    >
                      {collection._count?.products || 0} {(collection._count?.products || 0) === 1 ? 'product' : 'products'}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive padding */}
      <style jsx>{`
        @media (min-width: 768px) {
          section {
            padding: var(--theme-section-padding-tablet) 0;
          }
        }
        @media (min-width: 1024px) {
          section {
            padding: var(--theme-section-padding-desktop) 0;
          }
        }
      `}</style>
    </section>
  );
}