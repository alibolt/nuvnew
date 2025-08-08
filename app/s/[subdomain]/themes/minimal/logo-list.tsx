'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons/minimal-icons';

export function LogoList({ settings }: any) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Get settings from section configuration
  const layout = settings.layout || 'carousel';
  const title = settings.title || 'As Featured In';
  const mobileColumns = settings.columns?.mobile || 3;
  const tabletColumns = settings.columns?.tablet || 5;
  const desktopColumns = settings.columns?.desktop || 6;
  
  // Default logos if none provided
  const logos = settings.logos?.length > 0 ? settings.logos : [
    { 
      id: '1', 
      image: 'https://tailwindui.com/img/logos/tuple-logo-gray-400.svg', 
      alt: 'Tuple',
      link: 'https://tuple.app'
    },
    { 
      id: '2', 
      image: 'https://tailwindui.com/img/logos/mirage-logo-gray-400.svg', 
      alt: 'Mirage',
      link: 'https://mirage.com'
    },
    { 
      id: '3', 
      image: 'https://tailwindui.com/img/logos/statickit-logo-gray-400.svg', 
      alt: 'StaticKit',
      link: 'https://statickit.com'
    },
    { 
      id: '4', 
      image: 'https://tailwindui.com/img/logos/transistor-logo-gray-400.svg', 
      alt: 'Transistor',
      link: 'https://transistor.fm'
    },
    { 
      id: '5', 
      image: 'https://tailwindui.com/img/logos/workcation-logo-gray-400.svg', 
      alt: 'Workcation',
      link: 'https://workcation.com'
    },
    { 
      id: '6', 
      image: 'https://tailwindui.com/img/logos/tuple-logo-gray-400.svg', 
      alt: 'Brand Six',
      link: '#'
    },
  ];

  // Grid classes for responsive columns
  const getGridClass = () => {
    return `grid-cols-${mobileColumns} sm:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns}`;
  };

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(logos.length / desktopColumns));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(logos.length / desktopColumns)) % Math.ceil(logos.length / desktopColumns));
  };

  // Auto-play for carousel
  useEffect(() => {
    if (layout === 'carousel') {
      const interval = setInterval(nextSlide, 4000);
      return () => clearInterval(interval);
    }
  }, [layout]);

  // Render logo item
  const renderLogoItem = (logo: any) => {
    const logoContent = (
      <div 
        className="flex items-center justify-center transition-all duration-300 hover:scale-105 hover:opacity-80"
        style={{
          padding: 'var(--theme-spacing-component-gap-sm)',
          borderRadius: 'var(--theme-radius-md)',
          backgroundColor: 'var(--theme-surface)',
          boxShadow: layout === 'grid' ? 'var(--theme-shadow-sm)' : 'none',
          height: '80px',
        }}
      >
        <img
          src={logo.image || logo.src}
          alt={logo.alt}
          className="max-h-12 max-w-full object-contain transition-all duration-300"
          style={{
            filter: 'grayscale(100%) opacity(0.6)',
            transitionDuration: 'var(--theme-transition-duration)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'grayscale(0%) opacity(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'grayscale(100%) opacity(0.6)';
          }}
        />
      </div>
    );

    // Wrap in link if provided
    if (logo.link && logo.link !== '#') {
      return (
        <a
          key={logo.id}
          href={logo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {logoContent}
        </a>
      );
    }

    return (
      <div key={logo.id}>
        {logoContent}
      </div>
    );
  };

  // Render based on layout type
  const renderContent = () => {
    switch (layout) {
      case 'carousel':
        const itemsPerSlide = desktopColumns;
        const totalSlides = Math.ceil(logos.length / itemsPerSlide);
        
        return (
          <div className="relative">
            <div 
              ref={carouselRef}
              className="overflow-hidden"
              style={{
                borderRadius: 'var(--theme-radius-lg)',
              }}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div 
                    key={slideIndex}
                    className={`w-full flex-shrink-0 grid ${getGridClass()}`}
                    style={{
                      gap: 'var(--theme-spacing-component-gap-md)',
                      padding: '0 1rem',
                    }}
                  >
                    {logos
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((logo: any) => renderLogoItem(logo))}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text-muted)',
                    borderRadius: 'var(--theme-radius-full)',
                    boxShadow: 'var(--theme-shadow-md)',
                    zIndex: 10,
                  }}
                >
                  <ArrowLeftIcon size={16} />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text-muted)',
                    borderRadius: 'var(--theme-radius-full)',
                    boxShadow: 'var(--theme-shadow-md)',
                    zIndex: 10,
                  }}
                >
                  <ArrowRightIcon size={16} />
                </button>
              </>
            )}

            {/* Navigation dots */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: index === currentSlide ? 'var(--theme-primary)' : 'var(--theme-border)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'grid':
      default:
        return (
          <div 
            className={`grid ${getGridClass()}`}
            style={{
              gap: 'var(--theme-spacing-component-gap-md)',
            }}
          >
            {logos.map((logo: any) => renderLogoItem(logo))}
          </div>
        );
    }
  };

  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-surface)',
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
        {/* Section Title */}
        {title && (
          <h2 
            className="text-center mb-12"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              fontSize: 'var(--theme-text-lg)',
              fontWeight: 'var(--theme-font-weight-semibold)',
              color: 'var(--theme-text-muted)',
              marginBottom: 'var(--theme-spacing-component-gap-lg)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </h2>
        )}

        {/* Logos Content */}
        {renderContent()}
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