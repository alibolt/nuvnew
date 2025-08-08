'use client';

export function FreshMarketHero({ store, settings }: any) {
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
  
  const overlayOpacity = settings.overlayOpacity || 20;
  
  return (
    <section 
      className={`relative bg-cover bg-center ${getHeightClass()} overflow-hidden`}
      style={{ 
        backgroundImage: `url(${settings.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2874&q=80'})`,
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      {/* Colorful gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 via-yellow-500/60 to-orange-500/80" 
           style={{ opacity: overlayOpacity / 100 }}>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-400 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
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
            {/* Fresh accent */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.1s' }}>🥬</span>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🥕</span>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.3s' }}>🍎</span>
            </div>
            
            {/* Title */}
            <h1 
              className="font-bold mb-4 text-white drop-shadow-lg"
              style={{
                fontFamily: 'var(--theme-font-heading)',
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                lineHeight: '1.1',
                fontWeight: '800',
                marginBottom: 'var(--theme-spacing-component-gap-md, 2rem)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {settings.title || 'Fresh From Farm to Table'}
            </h1>
            
            {/* Subtitle */}
            {(settings.subtitle || store.description) && (
              <p 
                className="max-w-2xl mb-8 text-white font-medium"
                style={{
                  fontSize: 'var(--theme-text-xl)',
                  lineHeight: 'var(--theme-line-height-relaxed, 1.75)',
                  marginBottom: 'var(--theme-spacing-component-gap-lg, 3rem)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {settings.subtitle || 'Organic • Local • Sustainable'}
              </p>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              {settings.buttonText && (
                <button 
                  className="inline-flex items-center justify-center font-bold transition-all duration-300 
                             bg-white text-green-700 hover:bg-green-50 transform hover:scale-105 hover:shadow-2xl
                             hover:rotate-1"
                  style={{
                    padding: '1.25rem 3rem',
                    fontSize: 'var(--theme-button-font-size-lg, 1.125rem)',
                    borderRadius: '9999px',
                    fontWeight: '700',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {settings.buttonText || 'Shop Fresh'}
                  <span className="ml-2 text-2xl">🛒</span>
                </button>
              )}
              
              {/* Secondary button */}
              <button 
                className="inline-flex items-center justify-center font-semibold transition-all duration-300 
                           bg-yellow-400 text-green-800 hover:bg-yellow-300 transform hover:scale-105"
                style={{
                  padding: '1.125rem 2.5rem',
                  fontSize: 'var(--theme-text-base)',
                  borderRadius: '9999px',
                  fontWeight: '600',
                }}
              >
                Today\'s Deals
                <span className="ml-2 text-xl">✨</span>
              </button>
            </div>
            
            {/* Feature badges */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { icon: '🚚', text: 'Same Day Delivery' },
                { icon: '🌱', text: '100% Organic' },
                { icon: '♻️', text: 'Eco Friendly' }
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full
                                          transform transition-all hover:scale-105 hover:rotate-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-semibold text-green-800">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white">
          <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
      
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