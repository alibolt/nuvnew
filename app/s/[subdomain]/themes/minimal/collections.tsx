'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons/minimal-icons';

export function MinimalFashionCollections({ collections, store, settings }: any) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Get settings from section configuration
  const layout = settings.layout || 'grid';
  const title = settings.title || 'Shop by Collection';
  const mobileColumns = settings.columns?.mobile || 2;
  const tabletColumns = settings.columns?.tablet || 3;
  const desktopColumns = settings.columns?.desktop || 4;
  
  // Use provided collections or fallback to defaults
  const collectionsData = collections?.length > 0 ? collections : [
    { 
      id: '1', 
      title: 'New Arrivals', 
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1099&q=80',
      link: '/collections/new-arrivals'
    },
    { 
      id: '2', 
      title: 'Best Sellers', 
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
      link: '/collections/best-sellers'
    },
    { 
      id: '3', 
      title: 'Sale Items', 
      image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
      link: '/collections/sale'
    },
    { 
      id: '4', 
      title: 'Accessories', 
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      link: '/collections/accessories'
    },
  ];

  // Grid classes for responsive columns
  const getGridClass = () => {
    return `grid-cols-${mobileColumns} sm:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns}`;
  };

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(collectionsData.length / desktopColumns));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(collectionsData.length / desktopColumns)) % Math.ceil(collectionsData.length / desktopColumns));
  };

  // Auto-play for carousel
  useEffect(() => {
    if (layout === 'carousel') {
      const interval = setInterval(nextSlide, 6000);
      return () => clearInterval(interval);
    }
  }, [layout]);

  // Render collection card
  const renderCollectionCard = (collection: any) => (
    <Link
      key={collection.id}
      href={collection.link || `/s/${store.subdomain}/collections/${collection.slug}`}
      className="group relative block overflow-hidden transition-all duration-300 hover:scale-105"
      style={{
        borderRadius: 'var(--theme-radius-lg)',
        boxShadow: 'var(--theme-shadow-md)',
      }}
    >
      {/* Collection Image */}
      <div 
        className="aspect-square w-full overflow-hidden relative"
        style={{
          borderRadius: 'var(--theme-radius-lg)',
        }}
      >
        <img
          src={collection.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1099&q=80'}
          alt={collection.name || collection.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{
            opacity: 0.4,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 
            className="font-bold text-white mb-2 transition-transform duration-300 group-hover:translate-y-[-4px]"
            style={{
              fontSize: 'var(--theme-text-xl)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-font-weight-bold)',
            }}
          >
            {collection.name || collection.title}
          </h3>
          
          {/* Shop Now Button */}
          <div 
            className="inline-flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            style={{
              fontSize: 'var(--theme-text-sm)',
              fontWeight: 'var(--theme-font-weight-medium)',
            }}
          >
            <span>Shop Now</span>
            <ArrowRightIcon size={16} />
          </div>
        </div>
      </div>
    </Link>
  );

  // Render based on layout type
  const renderContent = () => {
    switch (layout) {
      case 'carousel':
        const itemsPerSlide = desktopColumns;
        const totalSlides = Math.ceil(collectionsData.length / itemsPerSlide);
        
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
                    {collectionsData
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((collection: any) => renderCollectionCard(collection))}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-3 transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text)',
                    borderRadius: 'var(--theme-radius-full)',
                    boxShadow: 'var(--theme-shadow-lg)',
                    zIndex: 10,
                  }}
                >
                  <ArrowLeftIcon size={20} />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text)',
                    borderRadius: 'var(--theme-radius-full)',
                    boxShadow: 'var(--theme-shadow-lg)',
                    zIndex: 10,
                  }}
                >
                  <ArrowRightIcon size={20} />
                </button>
              </>
            )}

            {/* Navigation dots */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="w-3 h-3 rounded-full transition-all"
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
            {collectionsData.map((collection: any) => renderCollectionCard(collection))}
          </div>
        );
    }
  };

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
        {/* Section Title */}
        {title && (
          <h2 
            className="text-center mb-12"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              fontSize: 'var(--theme-text-3xl)',
              fontWeight: 'var(--theme-font-weight-bold)',
              color: 'var(--theme-text)',
              marginBottom: 'var(--theme-spacing-component-gap-lg)',
            }}
          >
            {title}
          </h2>
        )}

        {/* Collections Content */}
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