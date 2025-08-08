'use client';

export function TechStoreHero({ store, settings }: any) {
  const getHeightClass = () => {
    switch (settings.height) {
      case 'small': return 'h-[40vh] sm:h-[45vh]';
      case 'medium': return 'h-[50vh] sm:h-[60vh]';
      case 'large': return 'h-[60vh] sm:h-[70vh] md:h-[80vh]';
      case 'fullscreen': return 'h-screen';
      default: return 'h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]';
    }
  };
  
  const getAlignmentClass = () => {
    switch (settings.contentAlignment) {
      case 'left': return 'items-start text-left';
      case 'right': return 'items-end text-right';
      case 'center':
      default: return 'items-center text-center';
    }
  };
  
  const overlayOpacity = settings.overlayOpacity || 40;
  
  return (
    <section 
      className={`relative bg-cover bg-center ${getHeightClass()}`}
      style={{ 
        backgroundImage: `url(${settings.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=2832&q=80'})`,
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      {/* Tech pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90" 
           style={{ opacity: overlayOpacity / 100 }}>
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             }}
        />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div 
          className="container mx-auto px-4"
          style={{ 
            maxWidth: 'var(--theme-container-max-width)',
            padding: '0 var(--theme-container-padding)'
          }}
        >
          <div className={`flex flex-col ${getAlignmentClass()}`}>
            {/* Tech accent */}
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-200 uppercase tracking-wider">
                Latest Technology
              </span>
            </div>
            
            {/* Title */}
            <h1 
              className="font-bold mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
              style={{
                fontFamily: 'var(--theme-font-heading)',
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                lineHeight: '1.1',
                fontWeight: '800',
                marginBottom: 'var(--theme-spacing-component-gap-md, 2rem)'
              }}
            >
              {settings.title || 'Tech That Defines Tomorrow'}
            </h1>
            
            {/* Subtitle */}
            {(settings.subtitle || store.description) && (
              <p 
                className="max-w-2xl mb-8 text-white/90"
                style={{
                  fontSize: 'var(--theme-text-xl)',
                  lineHeight: 'var(--theme-line-height-relaxed, 1.75)',
                  marginBottom: 'var(--theme-spacing-component-gap-lg, 3rem)'
                }}
              >
                {settings.subtitle || store.description}
              </p>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              {settings.buttonText && (
                <button 
                  className="inline-flex items-center justify-center font-medium transition-all duration-300 
                             bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                             transform hover:scale-105 hover:shadow-xl"
                  style={{
                    color: 'white',
                    padding: '1rem 2.5rem',
                    fontSize: 'var(--theme-button-font-size-lg, 1.125rem)',
                    borderRadius: '9999px',
                    fontWeight: 'var(--theme-font-weight-semibold, 600)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.5)'
                  }}
                >
                  {settings.buttonText || 'Explore Products'}
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
              
              {/* Secondary button */}
              <button 
                className="inline-flex items-center justify-center font-medium transition-all duration-300 
                           border-2 border-white/30 hover:border-white hover:bg-white/10 backdrop-blur-sm"
                style={{
                  color: 'white',
                  padding: '0.875rem 2rem',
                  fontSize: 'var(--theme-text-base)',
                  borderRadius: '9999px',
                  fontWeight: 'var(--theme-font-weight-medium, 500)',
                }}
              >
                View Catalog
              </button>
            </div>
            
            {/* Feature badges */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Free Shipping', '2 Year Warranty', '24/7 Support'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
      
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