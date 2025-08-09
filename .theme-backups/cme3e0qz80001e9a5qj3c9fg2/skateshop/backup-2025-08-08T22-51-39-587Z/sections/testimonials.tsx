'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialsProps {
  settings?: {
    title?: string;
    subtitle?: string;
    testimonials?: Array<{
      name: string;
      role: string;
      content: string;
      rating: number;
      avatar?: string;
    }>;
  };
  store?: any;
}

export default function Testimonials({ settings = {}, store }: TestimonialsProps) {
  const {
    title = 'What Our Customers Say',
    subtitle = 'Trusted by thousands of skaters worldwide',
    testimonials = [
      {
        name: 'Alex Rodriguez',
        role: 'Professional Skater',
        content: 'Best skateboard shop online! Quality products and super fast shipping.',
        rating: 5,
        avatar: ''
      },
      {
        name: 'Sarah Johnson',
        role: 'Skateboard Enthusiast',
        content: 'Amazing selection of decks and wheels. Customer service is top-notch!',
        rating: 5,
        avatar: ''
      },
      {
        name: 'Mike Chen',
        role: 'Street Skater',
        content: 'Found exactly what I needed. Prices are competitive and quality is excellent.',
        rating: 5,
        avatar: ''
      }
    ]
  } = settings;

  return (
    <section className="w-full py-14 md:py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          {(title || subtitle) && (
            <div className="mb-10 text-center">
              {title && (
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Testimonials Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                {/* Rating */}
                <div className="mb-4 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="mb-4 text-sm text-muted-foreground">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="mr-3 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      default: 'Trusted by thousands of skaters worldwide'
    }
  ]
};