
'use client';

export function MinimalFashionHero({ store, settings = {} }: any) {
  // Default settings
  const config = {
    image: settings.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d76e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
    title: settings.title || store?.name || 'Welcome to Our Store',
    subtitle: settings.subtitle || store?.description || 'Discover amazing products',
    buttonText: settings.buttonText || 'Shop Now',
    buttonLink: settings.buttonLink || '/collections',
  };

  // Fixed height for minimal theme
  const heightClass = 'h-[60vh] sm:h-[70vh] md:h-[80vh]';
  
  // Fixed center alignment for minimal theme
  const alignmentClass = 'items-center text-center';
  
  return (
    <section 
      className={`relative bg-cover bg-center ${heightClass}`}
      style={{ 
        backgroundImage: `url(${config.image})`,
        padding: `var(--theme-section-padding-mobile) 0`,
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: 0.3 }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div 
          className="container mx-auto px-4"
          style={{ 
            maxWidth: 'var(--theme-container-max-width)',
            padding: '0 var(--theme-container-padding)'
          }}
        >
          <div className={`flex flex-col ${alignmentClass}`}>
            {/* Title */}
            <h1 
              className="font-bold mb-4 text-white"
              style={{
                fontFamily: 'var(--theme-font-heading)',
                fontSize: 'var(--theme-text-5xl)',
                lineHeight: 'var(--theme-line-height-tight, 1.25)',
                fontWeight: 'var(--theme-font-weight-bold, 700)',
                marginBottom: 'var(--theme-spacing-component-gap-md, 2rem)'
              }}
            >
              {config.title}
            </h1>
            
            {/* Subtitle */}
            {config.subtitle && (
              <p 
                className="max-w-2xl mb-8 text-white opacity-90"
                style={{
                  fontSize: 'var(--theme-text-xl)',
                  lineHeight: 'var(--theme-line-height-relaxed, 1.75)',
                  marginBottom: 'var(--theme-spacing-component-gap-lg, 3rem)'
                }}
              >
                {config.subtitle}
              </p>
            )}
            
            {/* CTA Button */}
            {config.buttonText && (
              <a
                href={config.buttonLink}
                className="inline-flex items-center justify-center font-medium transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-background)',
                  padding: 'var(--theme-button-padding-lg, 1rem 2rem)',
                  fontSize: 'var(--theme-button-font-size-lg, 1.125rem)',
                  borderRadius: 'var(--theme-radius-md)',
                  fontWeight: 'var(--theme-font-weight-semibold, 600)',
                  transitionDuration: 'var(--theme-transition-duration, 300ms)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
                }}
              >
                {config.buttonText}
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Responsive padding using CSS media queries */}
      <style jsx>{`
        @media (min-width: 768px) {
          section {
            padding: var(--theme-section-padding-tablet, 4rem) 0;
          }
        }
        @media (min-width: 1024px) {
          section {
            padding: var(--theme-section-padding-desktop, 5rem) 0;
          }
        }
      `}</style>
    </section>
  );
}
