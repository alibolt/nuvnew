'use client';

import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { cn } from '@/lib/utils';

interface ProductMainProps {
  product: any;
  store: any;
  settings: {
    layout?: 'default' | 'sticky-gallery' | 'wide';
    galleryPosition?: 'left' | 'right';
    gallerySettings?: any;
    infoSettings?: any;
  };
}

export function ProductMain({ product, store, settings }: ProductMainProps) {
  const layout = settings.layout || 'default';
  const galleryPosition = settings.galleryPosition || 'left';
  const gallerySettings = settings.gallerySettings || {};
  const infoSettings = settings.infoSettings || {};

  return (
    <section 
      className="product-main"
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
        {/* Breadcrumbs */}
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

        {/* Main Layout */}
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12",
          layout === 'wide' && 'xl:gap-16'
        )}>
          {/* Gallery */}
          <div className={cn(
            "lg:col-span-7",
            galleryPosition === 'right' && 'lg:order-2',
            layout === 'sticky-gallery' && 'lg:sticky lg:top-24 lg:h-fit'
          )}>
            <ProductGallery 
              product={product} 
              settings={gallerySettings}
            />
          </div>

          {/* Info */}
          <div className={cn(
            "lg:col-span-5",
            galleryPosition === 'right' && 'lg:order-1',
            layout === 'default' && 'lg:sticky lg:top-24 lg:h-fit'
          )}>
            <ProductInfo 
              product={product} 
              store={store}
              settings={infoSettings}
            />
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
      `}</style>
    </section>
  );
}