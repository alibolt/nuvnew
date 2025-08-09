'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';

interface CTAProps {
  settings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    style?: 'minimal' | 'gradient' | 'dark';
    alignment?: 'left' | 'center' | 'right';
    showNewsletter?: boolean;
  };
}

export default function CTA({ settings = {} }: CTAProps) {
  const {
    title = 'Ready to Get Started?',
    subtitle = 'Join thousands of satisfied customers',
    description = 'Sign up today and get exclusive access to new arrivals, special offers, and member-only deals.',
    primaryButtonText = 'Create Account',
    primaryButtonLink = '/register',
    secondaryButtonText = 'Learn More',
    secondaryButtonLink = '/about',
    style = 'gradient',
    alignment = 'center',
    showNewsletter = false
  } = settings;

  const styleClasses = {
    minimal: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
    dark: 'bg-gray-900 text-white'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className={`rounded-2xl p-8 md:p-12 lg:p-16 ${styleClasses[style]} relative overflow-hidden`}>
          {/* Background Pattern */}
          {style === 'gradient' && (
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
          )}

          {/* Decorative Elements */}
          {style === 'gradient' && (
            <>
              <Sparkles className="absolute top-8 right-8 w-8 h-8 text-white/20" />
              <Sparkles className="absolute bottom-8 left-8 w-6 h-6 text-white/20" />
            </>
          )}

          <div className={`max-w-3xl mx-auto flex flex-col ${alignmentClasses[alignment]} relative z-10`}>
            {/* Badge */}
            {subtitle && (
              <span className={`inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full ${
                style === 'gradient' 
                  ? 'bg-white/20 text-white' 
                  : style === 'dark'
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-primary/10 text-primary'
              } ${alignment === 'center' ? 'mx-auto' : ''}`}>
                {subtitle}
              </span>
            )}

            {/* Title */}
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
              style === 'minimal' ? 'text-gray-900' : ''
            }`}>
              {title}
            </h2>

            {/* Description */}
            <p className={`text-lg mb-8 ${
              style === 'gradient' 
                ? 'text-white/90' 
                : style === 'dark'
                ? 'text-gray-300'
                : 'text-gray-600'
            } max-w-2xl ${alignment === 'center' ? 'mx-auto' : ''}`}>
              {description}
            </p>

            {/* Newsletter Form */}
            {showNewsletter ? (
              <form className={`flex flex-col sm:flex-row gap-3 mb-6 max-w-md ${
                alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''
              }`}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    style === 'gradient'
                      ? 'bg-white/20 text-white placeholder-white/70 focus:ring-white/50 border border-white/30'
                      : style === 'dark'
                      ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-gray-600 border border-gray-700'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-primary border border-gray-200'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-6 py-3 font-medium rounded-lg transition-all flex items-center gap-2 ${
                    style === 'gradient'
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : style === 'dark'
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Subscribe
                </button>
              </form>
            ) : (
              /* CTA Buttons */
              <div className={`flex flex-col sm:flex-row gap-4 ${
                alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : ''
              }`}>
                <Link
                  href={primaryButtonLink}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                    style === 'gradient'
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : style === 'dark'
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {primaryButtonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {secondaryButtonText && (
                  <Link
                    href={secondaryButtonLink}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                      style === 'gradient'
                        ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                        : style === 'dark'
                        ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                        : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {secondaryButtonText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const schema = {
  name: 'Call to Action',
  type: 'cta',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Ready to Get Started?'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Join thousands of satisfied customers'
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Sign up today and get exclusive access to new arrivals, special offers, and member-only deals.'
    },
    {
      type: 'text',
      id: 'primaryButtonText',
      label: 'Primary Button Text',
      default: 'Create Account'
    },
    {
      type: 'text',
      id: 'primaryButtonLink',
      label: 'Primary Button Link',
      default: '/register'
    },
    {
      type: 'text',
      id: 'secondaryButtonText',
      label: 'Secondary Button Text',
      default: 'Learn More'
    },
    {
      type: 'text',
      id: 'secondaryButtonLink',
      label: 'Secondary Button Link',
      default: '/about'
    },
    {
      type: 'select',
      id: 'style',
      label: 'Style',
      options: [
        { value: 'minimal', label: 'Minimal' },
        { value: 'gradient', label: 'Gradient' },
        { value: 'dark', label: 'Dark' }
      ],
      default: 'gradient'
    },
    {
      type: 'select',
      id: 'alignment',
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ],
      default: 'center'
    },
    {
      type: 'checkbox',
      id: 'showNewsletter',
      label: 'Show Newsletter Form',
      default: false
    }
  ]
};