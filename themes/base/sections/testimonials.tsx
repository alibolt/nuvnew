'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsProps {
  settings?: {
    title?: string;
    subtitle?: string;
    layout?: 'carousel' | 'grid' | 'masonry';
    showRating?: boolean;
    showQuotes?: boolean;
    autoPlay?: boolean;
    backgroundColor?: string;
  };
}

export default function Testimonials({ settings = {} }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    title = 'What Our Customers Say',
    subtitle = 'Real reviews from real customers',
    layout = 'carousel',
    showRating = true,
    showQuotes = true,
    autoPlay = false,
    backgroundColor = 'gray'
  } = settings;

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Verified Buyer',
      content: 'Amazing products and excellent customer service! The shipping was fast and the quality exceeded my expectations. Will definitely shop here again.',
      rating: 5
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Regular Customer',
      content: 'I\'ve been shopping here for over a year now. The product selection is great and the prices are very competitive. Highly recommended!',
      rating: 5
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'First Time Buyer',
      content: 'Super impressed with my first order. The checkout process was smooth, and the product arrived exactly as described. Five stars!',
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50'
  };

  return (
    <section className={`py-16 ${bgClasses[backgroundColor as keyof typeof bgClasses] || bgClasses.gray}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Testimonials */}
        {layout === 'carousel' ? (
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              {showQuotes && (
                <Quote className="w-12 h-12 text-primary/20 mb-6" />
              )}

              {/* Rating */}
              {showRating && (
                <div className="flex justify-center mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonials[currentIndex].rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Content */}
              <p className="text-lg md:text-xl text-gray-700 text-center mb-8 leading-relaxed">
                "{testimonials[currentIndex].content}"
              </p>

              {/* Author */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[currentIndex].name.charAt(0)}
                </div>
                <p className="font-semibold text-gray-900">
                  {testimonials[currentIndex].name}
                </p>
                {testimonials[currentIndex].role && (
                  <p className="text-sm text-gray-500">
                    {testimonials[currentIndex].role}
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Grid Layout */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
                {showQuotes && (
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                )}

                {showRating && (
                  <div className="flex mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="text-xs text-gray-500">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const schema = {
  name: 'Testimonials',
  type: 'testimonials',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'What Our Customers Say'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Real reviews from real customers'
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'carousel', label: 'Carousel' },
        { value: 'grid', label: 'Grid' },
        { value: 'masonry', label: 'Masonry' }
      ],
      default: 'carousel'
    },
    {
      type: 'checkbox',
      id: 'showRating',
      label: 'Show Rating',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showQuotes',
      label: 'Show Quote Icon',
      default: true
    },
    {
      type: 'checkbox',
      id: 'autoPlay',
      label: 'Auto Play (Carousel)',
      default: false
    },
    {
      type: 'select',
      id: 'backgroundColor',
      label: 'Background Color',
      options: [
        { value: 'white', label: 'White' },
        { value: 'gray', label: 'Gray' },
        { value: 'gradient', label: 'Gradient' }
      ],
      default: 'gray'
    }
  ]
};