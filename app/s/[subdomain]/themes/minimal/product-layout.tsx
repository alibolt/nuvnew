'use client';

import { cn } from '@/lib/utils';

interface ProductLayoutProps {
  product: any;
  store: any;
  settings: {
    layout?: 'default' | 'sticky-info' | 'wide-gallery';
    galleryPosition?: 'left' | 'right';
    galleryWidth?: number; // percentage
    spacing?: 'compact' | 'normal' | 'spacious';
    showBreadcrumbs?: boolean;
  };
  gallery: React.ReactNode;
  info: React.ReactNode;
}

export function ProductLayout({ product, store, settings, gallery, info }: ProductLayoutProps) {
  const layout = settings.layout || 'default';
  const galleryPosition = settings.galleryPosition || 'left';
  const galleryWidth = settings.galleryWidth || 55;
  const spacing = settings.spacing || 'normal';
  const showBreadcrumbs = settings.showBreadcrumbs ?? true;
  
  const spacingClasses = {
    compact: 'gap-4 md:gap-6 lg:gap-8',
    normal: 'gap-6 md:gap-8 lg:gap-12',
    spacious: 'gap-8 md:gap-12 lg:gap-16'
  };

  const layoutClasses = {
    default: 'grid grid-cols-1 lg:grid-cols-12',
    'sticky-info': 'grid grid-cols-1 lg:grid-cols-12',
    'wide-gallery': 'grid grid-cols-1 xl:grid-cols-12'
  };

  // Calculate column spans based on gallery width
  const gallerySpan = Math.round((galleryWidth / 100) * 12);
  const infoSpan = 12 - gallerySpan;

  // Breadcrumbs
  const Breadcrumbs = () => (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <a 
            href={`/s/${store.subdomain}`}
            className="hover:opacity-70 transition-opacity"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Home
          </a>
        </li>
        <li style={{ color: 'var(--theme-text-muted)' }}>/</li>
        {product.category && (
          <>
            <li>
              <a 
                href={`/s/${store.subdomain}/collections/${product.category.slug}`}
                className="hover:opacity-70 transition-opacity"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {product.category.name}
              </a>
            </li>
            <li style={{ color: 'var(--theme-text-muted)' }}>/</li>
          </>
        )}
        <li style={{ color: 'var(--theme-text)' }}>{product.title}</li>
      </ol>
    </nav>
  );

  return (
    <section 
      className="product-layout"
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
        {showBreadcrumbs && <Breadcrumbs />}

        <div className={cn(layoutClasses[layout], spacingClasses[spacing])}>
          {/* Gallery */}
          <div 
            className={cn(
              `lg:col-span-${gallerySpan}`,
              galleryPosition === 'right' && 'lg:order-2',
              layout === 'sticky-info' && 'lg:sticky lg:top-24 lg:h-fit'
            )}
          >
            {gallery}
          </div>

          {/* Info */}
          <div 
            className={cn(
              `lg:col-span-${infoSpan}`,
              galleryPosition === 'right' && 'lg:order-1',
              layout === 'default' && 'lg:sticky lg:top-24 lg:h-fit'
            )}
          >
            {info}
          </div>
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

        /* Dynamic column spans */
        .lg\\:col-span-${gallerySpan} {
          grid-column: span ${gallerySpan} / span ${gallerySpan};
        }
        .lg\\:col-span-${infoSpan} {
          grid-column: span ${infoSpan} / span ${infoSpan};
        }
      `}</style>
    </section>
  );
}