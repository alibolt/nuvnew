'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
// BlockRenderer removed - not needed for commerce theme

interface TestimonialsProps {
  settings: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'carousel' | 'single' | 'masonry';
    columns?: string;
    showNavigation?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    backgroundColor?: string;
    textColor?: string;
    titleColor?: string;
    cardBackgroundColor?: string;
    cardStyle?: 'simple' | 'bordered' | 'elevated' | 'quote';
  };
  blocks?: any[];
  isPreview?: boolean;
  store?: any;
}

export function Testimonials({ settings, blocks = [], isPreview, store }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    title = 'What Our Customers Say',
    subtitle = 'Read testimonials from our happy customers',
    layout = 'grid',
    columns = '3',
    showNavigation = true,
    autoplay = false,
    autoplaySpeed = 5000,
    backgroundColor = '#f9fafb',
    textColor = '#111827',
    titleColor,
    cardBackgroundColor = '#ffffff',
    cardStyle = 'elevated'
  } = settings;

  // Mock testimonials for preview
  const mockTestimonialBlocks = [
    {
      id: '1',
      type: 'testimonial',
      enabled: true,
      position: 0,
      settings: {
        content: 'The quality of the products exceeded my expectations. Fast shipping and excellent customer service. Will definitely order again!',
        author: 'Sarah Johnson',
        role: 'Verified Buyer',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        showRating: true,
        showImage: true,
        showQuoteIcon: true,
        imagePosition: 'top',
        imageSize: 'medium',
        textAlign: 'left'
      }
    },
    {
      id: '2',
      type: 'testimonial',
      enabled: true,
      position: 1,
      settings: {
        content: 'Amazing shopping experience! The website is easy to navigate and the checkout process was smooth. Highly recommend!',
        author: 'Michael Chen',
        role: 'Regular Customer',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        showRating: true,
        showImage: true,
        showQuoteIcon: true,
        imagePosition: 'top',
        imageSize: 'medium',
        textAlign: 'left'
      }
    },
    {
      id: '3',
      type: 'testimonial',
      enabled: true,
      position: 2,
      settings: {
        content: 'Love the variety of products available. Found exactly what I was looking for at a great price. Customer support was very helpful too.',
        author: 'Emily Rodriguez',
        role: 'First Time Buyer',
        rating: 4,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        showRating: true,
        showImage: true,
        showQuoteIcon: true,
        imagePosition: 'top',
        imageSize: 'medium',
        textAlign: 'left'
      }
    }
  ];

  // Filter only testimonial blocks
  const testimonialBlocks = blocks && blocks.length > 0 
    ? blocks.filter(block => block.type === 'testimonial' && block.enabled !== false)
    : isPreview ? mockTestimonialBlocks : [];

  React.useEffect(() => {
    if (autoplay && layout === 'carousel' && testimonialBlocks.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonialBlocks.length);
      }, autoplaySpeed);
      return () => clearInterval(interval);
    }
  }, [autoplay, autoplaySpeed, layout, testimonialBlocks.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonialBlocks.length) % testimonialBlocks.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialBlocks.length);
  };

  const getColumnsClass = () => {
    switch (columns) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-1 md:grid-cols-2';
      case '4': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getCardStyleClass = () => {
    switch (cardStyle) {
      case 'bordered': return 'border border-gray-200';
      case 'elevated': return 'shadow-lg hover:shadow-xl transition-shadow';
      case 'quote': return 'border-l-4 border-blue-500 pl-6';
      default: return '';
    }
  };

  if (testimonialBlocks.length === 0 && !isPreview) {
    return null;
  }

  // Single testimonial layout
  if (layout === 'single') {
    const testimonial = testimonialBlocks[0];
    return (
      <section className="py-16" style={{ backgroundColor, color: textColor }}>
        <div 
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-12" style={{ color: titleColor || textColor }}>
                {title}
              </h2>
            )}
            
            {testimonial && (
              <div 
                className={`p-8 rounded-lg ${getCardStyleClass()}`}
                style={{ backgroundColor: cardBackgroundColor }}
              >
                {/* Testimonial content */}
                <div className="space-y-4">
                  <Quote className="w-8 h-8 opacity-20" />
                  <p className="text-lg italic">"This is an amazing product! Highly recommend to everyone."</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-sm opacity-70">CEO, Example Corp</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Carousel layout
  if (layout === 'carousel') {
    return (
      <section className="py-16" style={{ backgroundColor, color: textColor }}>
        <div 
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: titleColor || textColor }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg opacity-80 max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>
          )}

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonialBlocks.map((block) => (
                  <div key={block.id} className="w-full flex-shrink-0 px-4">
                    <div 
                      className={`p-8 rounded-lg text-center ${getCardStyleClass()}`}
                      style={{ backgroundColor: cardBackgroundColor }}
                    >
                      {/* Testimonial content */}
                      <div className="space-y-4">
                        <Quote className="w-8 h-8 opacity-20" />
                        <p className="text-lg italic">"Great experience with this service!"</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold">Jane Smith</p>
                          <p className="text-sm opacity-70">Marketing Director</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            {showNavigation && testimonialBlocks.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonialBlocks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-gray-800' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Grid layout (default)
  return (
    <section className="py-16" style={{ backgroundColor, color: textColor }}>
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: titleColor || textColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg opacity-80 max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}

        <div className={`grid ${getColumnsClass()} gap-8`}>
          {testimonialBlocks.map((block) => (
            <div
              key={block.id}
              className={`p-6 rounded-lg ${getCardStyleClass()}`}
              style={{ backgroundColor: cardBackgroundColor }}
            >
              {/* Testimonial content */}
              <div className="space-y-4">
                <Quote className="w-8 h-8 opacity-20" />
                <p className="text-lg italic">"Excellent quality and fast delivery!"</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">Customer Name</p>
                  <p className="text-sm opacity-70">Title</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
