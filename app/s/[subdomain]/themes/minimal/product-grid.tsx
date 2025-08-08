
'use client';

import Link from 'next/link';

export function MinimalFashionProductGrid({ products, settings }: any) {
  // Get responsive column settings
  const mobileColumns = settings.productsPerRow?.mobile || 2;
  const tabletColumns = settings.productsPerRow?.tablet || 3;
  const desktopColumns = settings.productsPerRow?.desktop || 4;
  
  // Create grid style object for dynamic columns
  const gridStyle = {
    display: 'grid',
    gap: 'var(--theme-spacing-component-gap-md)',
    gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`
  };
  
  // Limit products based on maxProducts setting
  const displayProducts = products.slice(0, settings.maxProducts || 8);
  
  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-background)',
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      <div 
        className="mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)'
        }}
      >
        {/* Section Title */}
        {settings.title && (
          <h2 
            className="text-center mb-8"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              fontSize: 'var(--theme-text-3xl)',
              fontWeight: 'var(--theme-font-weight-bold)',
              color: 'var(--theme-text)',
              marginBottom: 'var(--theme-spacing-component-gap-lg)'
            }}
          >
            {settings.title}
          </h2>
        )}
        
        {/* Products Grid */}
        <div 
          className="product-grid"
          style={gridStyle}
        >
          {displayProducts.map((product: any) => (
            <Link 
              key={product.id} 
              href={`/products/${product.slug}`} 
              className="group block"
              style={{
                transitionDuration: 'var(--theme-transition-duration)'
              }}
            >
              {/* Product Image */}
              <div 
                className="aspect-square w-full overflow-hidden mb-4"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderRadius: 'var(--theme-radius-lg)'
                }}
              >
                <img
                  src={product.variants[0]?.images[0]?.url || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    transitionDuration: 'var(--theme-transition-duration)'
                  }}
                />
              </div>
              
              {/* Product Info */}
              <div className="space-y-2">
                <h3 
                  className="line-clamp-2"
                  style={{
                    fontSize: 'var(--theme-text-sm)',
                    color: 'var(--theme-text)',
                    fontWeight: 'var(--theme-font-weight-medium)'
                  }}
                >
                  {product.name}
                </h3>
                
                {/* Price - only show if enabled */}
                {settings.showPrice !== false && (
                  <p 
                    style={{
                      fontSize: 'var(--theme-text-lg)',
                      fontWeight: 'var(--theme-font-weight-semibold)',
                      color: 'var(--theme-primary)'
                    }}
                  >
                    ${product.variants[0]?.price}
                  </p>
                )}
                
                {/* Add to Cart Button - only show if enabled */}
                {settings.showAddToCart && (
                  <button 
                    className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: 'var(--theme-primary)',
                      color: 'var(--theme-background)',
                      padding: 'var(--theme-spacing-component-gap-sm) var(--theme-spacing-component-gap-md)',
                      borderRadius: 'var(--theme-radius-md)',
                      fontSize: 'var(--theme-text-sm)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      transitionDuration: 'var(--theme-transition-duration)'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to cart logic here
                    }}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Responsive padding and grid */}
      <style jsx>{`
        @media (min-width: 640px) {
          .product-grid {
            grid-template-columns: repeat(${tabletColumns}, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 768px) {
          section {
            padding: var(--theme-section-padding-tablet) 0;
          }
        }
        @media (min-width: 1024px) {
          section {
            padding: var(--theme-section-padding-desktop) 0;
          }
          .product-grid {
            grid-template-columns: repeat(${desktopColumns}, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </section>
  );
}
