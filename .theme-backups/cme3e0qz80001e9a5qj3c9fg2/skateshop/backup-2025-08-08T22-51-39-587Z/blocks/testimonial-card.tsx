'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
  settings?: {
    name?: string;
    role?: string;
    content?: string;
    rating?: number;
    showQuote?: boolean;
  };
}

export default function TestimonialCard({ settings = {} }: TestimonialCardProps) {
  const {
    name = 'John Doe',
    role = 'Customer',
    content = 'Great product and excellent service!',
    rating = 5,
    showQuote = true
  } = settings;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
      {showQuote && (
        <Quote className="w-8 h-8 text-primary/20 mb-4" />
      )}

      {/* Rating */}
      <div className="flex mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-4">"{content}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          {role && (
            <p className="text-xs text-gray-500">{role}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export const schema = {
  name: 'Testimonial Card',
  type: 'testimonial-card',
  settings: [
    {
      type: 'text',
      id: 'name',
      label: 'Name',
      default: 'John Doe'
    },
    {
      type: 'text',
      id: 'role',
      label: 'Role',
      default: 'Customer'
    },
    {
      type: 'textarea',
      id: 'content',
      label: 'Testimonial Content',
      default: 'Great product and excellent service!'
    },
    {
      type: 'range',
      id: 'rating',
      label: 'Rating',
      min: 1,
      max: 5,
      default: 5
    },
    {
      type: 'checkbox',
      id: 'showQuote',
      label: 'Show Quote Icon',
      default: true
    }
  ]
};