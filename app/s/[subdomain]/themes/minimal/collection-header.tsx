'use client';

import { useTheme } from '../../theme-provider';

interface CollectionHeaderProps {
  collection: {
    name: string;
    description?: string | null;
  };
  productCount: number;
  settings?: {
    title?: string;
    description?: string;
    showProductCount?: boolean;
  };
}

export function CollectionHeader({ collection, productCount, settings }: CollectionHeaderProps) {
  const { settings: themeSettings } = useTheme();
  
  const title = settings?.title || collection.name;
  const description = settings?.description || collection.description;
  const showProductCount = settings?.showProductCount ?? true;

  return (
    <div 
      className="py-16 text-center"
      style={{
        backgroundColor: 'var(--theme-background)',
        color: 'var(--theme-text)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        {/* Collection Title */}
        <h1 
          className="mb-6 uppercase tracking-wider"
          style={{
            fontSize: 'var(--theme-text-4xl)',
            fontFamily: 'var(--theme-font-heading)',
            fontWeight: 'var(--theme-font-weight-light, 300)',
            color: 'var(--theme-text)',
          }}
        >
          {title}
        </h1>

        {/* Collection Description */}
        {description && (
          <p 
            className="mb-6 opacity-80 max-w-2xl mx-auto leading-relaxed"
            style={{
              fontSize: 'var(--theme-text-lg)',
              color: 'var(--theme-text)',
              lineHeight: 'var(--theme-line-height-relaxed)',
            }}
          >
            {description}
          </p>
        )}

        {/* Product Count */}
        {showProductCount && (
          <p 
            className="opacity-60"
            style={{
              fontSize: 'var(--theme-text-sm)',
              color: 'var(--theme-text)',
              fontWeight: 'var(--theme-font-weight-medium)',
            }}
          >
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </p>
        )}
      </div>
    </div>
  );
}