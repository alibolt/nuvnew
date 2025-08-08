'use client';

import { cn } from '@/lib/utils';

interface CollectionBannerProps {
  collection: any;
  store: any;
  settings: {
    showImage?: boolean;
    showDescription?: boolean;
    overlayEnabled?: boolean;
    height?: 'small' | 'medium' | 'large';
    textAlignment?: 'left' | 'center' | 'right';
  };
}

export function CollectionBanner({ collection, store, settings }: CollectionBannerProps) {
  const showImage = settings.showImage ?? true;
  const showDescription = settings.showDescription ?? true;
  const overlayEnabled = settings.overlayEnabled ?? false;
  const height = settings.height || 'medium';
  const textAlignment = settings.textAlignment || 'center';

  const heightClasses = {
    small: 'h-48 md:h-64',
    medium: 'h-64 md:h-80',
    large: 'h-80 md:h-96'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const justifyClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <section 
      className={cn(
        "relative w-full flex items-center",
        heightClasses[height]
      )}
      style={{
        fontFamily: 'var(--theme-font-body)',
        backgroundColor: showImage ? 'transparent' : 'var(--theme-surface)',
      }}
    >
      {/* Background Image */}
      {showImage && collection.image && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${collection.image})`,
            }}
          />
          {overlayEnabled && (
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              }}
            />
          )}
        </>
      )}

      {/* Content */}
      <div 
        className={cn(
          "relative z-10 w-full flex",
          justifyClasses[textAlignment]
        )}
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          margin: '0 auto',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <div className={cn("max-w-2xl", alignmentClasses[textAlignment])}>
          <h1 
            className="font-bold mb-4"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              fontSize: 'var(--theme-text-4xl)',
              color: showImage && overlayEnabled ? '#ffffff' : 'var(--theme-text)',
              lineHeight: 'var(--theme-line-height-tight)',
            }}
          >
            {collection.name}
          </h1>

          {showDescription && collection.description && (
            <p 
              className="text-lg leading-relaxed mb-6"
              style={{
                fontSize: 'var(--theme-text-lg)',
                color: showImage && overlayEnabled ? '#ffffff' : 'var(--theme-text-muted)',
                lineHeight: 'var(--theme-line-height-relaxed)',
              }}
            >
              {collection.description}
            </p>
          )}

          {/* Product Count */}
          <div 
            className="text-sm opacity-75"
            style={{
              color: showImage && overlayEnabled ? '#ffffff' : 'var(--theme-text-muted)',
              fontSize: 'var(--theme-text-sm)',
            }}
          >
            {collection._count?.products || 0} {(collection._count?.products || 0) === 1 ? 'product' : 'products'}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      {!showImage && (
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      )}
    </section>
  );
}