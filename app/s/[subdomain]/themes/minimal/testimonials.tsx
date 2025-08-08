'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, StarIcon } from '@/components/icons/minimal-icons';

export function Testimonials({ settings }: any) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Get settings from section configuration
  const layout = settings.layout || 'grid';
  const title = settings.title || 'What Our Customers Say';
  const mobileColumns = settings.columns?.mobile || 1;
  const tabletColumns = settings.columns?.tablet || 2;
  const desktopColumns = settings.columns?.desktop || 3;
  
  // Default testimonials if none provided
  const testimonials = settings.testimonials?.length > 0 ? settings.testimonials : [
    {
      id: '1',
      quote: 'This is the best online store I have ever seen. The products are amazing and the customer service is excellent.',
      author: 'Jane Doe',
      role: 'Fashion Blogger',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      quote: 'I love the quality of the products. I will definitely be a returning customer.',
      author: 'John Smith',
      role: 'Style Enthusiast',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      quote: 'The shipping was so fast! I received my order in just two days. Highly recommended.',
      author: 'Sarah Wilson',
      role: 'Regular Customer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '4',
      quote: 'Exceptional quality and style. Every piece I\'ve purchased has exceeded my expectations.',
      author: 'Michael Chen',
      role: 'Designer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
  ];

  // Grid classes for responsive columns
  const getGridClass = () => {
    return `grid-cols-${mobileColumns} sm:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns}`;
  };

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-play for carousel
  useEffect(() => {
    if (layout === 'carousel') {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [layout]);

  // Render testimonial card
  const renderTestimonialCard = (testimonial: any, index: number) => (
    <div
      key={testimonial.id}
      className={`flex flex-col text-center transition-all duration-300 ${
        layout === 'carousel' && index !== currentSlide ? 'opacity-50 scale-95' : ''
      }`}
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderRadius: 'var(--theme-radius-lg)',
        padding: 'var(--theme-spacing-component-gap-lg)',
        boxShadow: 'var(--theme-shadow-md)',
      }}
    >
      {/* Stars */}
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            size={16}
            filled={true}
            color="var(--theme-accent)"
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote 
        className="mb-6 flex-1"
        style={{
          fontSize: 'var(--theme-text-base)',
          lineHeight: 'var(--theme-line-height-relaxed)',
          color: 'var(--theme-text-muted)',
          fontStyle: 'italic',
        }}
      >
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="space-y-2">
        {testimonial.image && (
          <div className="flex justify-center">
            <img
              src={testimonial.image}
              alt={testimonial.author}
              className="w-12 h-12 object-cover"
              style={{
                borderRadius: 'var(--theme-radius-full)',
                border: '2px solid var(--theme-border)',
              }}
            />
          </div>
        )}
        
        <div>
          <p 
            className="font-semibold"
            style={{
              fontSize: 'var(--theme-text-base)',
              color: 'var(--theme-text)',
              fontWeight: 'var(--theme-font-weight-semibold)',
            }}
          >
            {testimonial.author}
          </p>
          
          {testimonial.role && (
            <p 
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: 'var(--theme-text-muted)',
              }}
            >
              {testimonial.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render based on layout type
  const renderContent = () => {
    switch (layout) {
      case 'single':
        return (
          <div className="max-w-2xl mx-auto">
            {renderTestimonialCard(testimonials[currentSlide], currentSlide)}
            
            {/* Navigation dots */}
            {testimonials.length > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_: any, index: number) => (
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

      case 'carousel':
        return (
          <div className="relative max-w-4xl mx-auto">
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
                {testimonials.map((testimonial: any, index: number) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    {renderTestimonialCard(testimonial, index)}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 transition-colors hover:opacity-70"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text)',
                    borderRadius: 'var(--theme-radius-full)',
                    boxShadow: 'var(--theme-shadow-md)',
                  }}
                >
                  <ArrowLeftIcon size={20} />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-colors hover:opacity-70"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    color: 'var(--theme-text)',
                    borderRadius: 'var(--theme-radius-full)',
                    boxShadow: 'var(--theme-shadow-md)',
                  }}
                >
                  <ArrowRightIcon size={20} />
                </button>
              </>
            )}

            {/* Navigation dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_: any, index: number) => (
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
            {testimonials.map((testimonial: any, index: number) => 
              renderTestimonialCard(testimonial, index)
            )}
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

        {/* Testimonials Content */}
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