'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Github, Zap, Shield, Star } from 'lucide-react';

interface HeroProps {
  settings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    backgroundStyle?: 'gradient' | 'dots' | 'grid' | 'solid';
    alignment?: 'left' | 'center';
    showFeatures?: boolean;
  };
  store?: any;
}

export default function Hero({ settings = {}, store }: HeroProps) {
  const {
    title = 'Skateshop',
    subtitle = 'An open source e-commerce skateshop',
    description = 'Built with everything new in Next.js. Buy and sell skateboarding gears from independent brands and stores.',
    primaryButtonText = 'Buy now',
    primaryButtonLink = '/products',
    secondaryButtonText = 'Sell now',
    secondaryButtonLink = '/dashboard/stores',
    backgroundStyle = 'dots',
    alignment = 'center',
    showFeatures = true
  } = settings;

  const features = [
    { icon: Zap, text: 'Fast Shipping' },
    { icon: Shield, text: 'Secure Checkout' },
    { icon: Star, text: 'Premium Quality' }
  ];

  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900',
    dots: 'bg-white dark:bg-neutral-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]',
    grid: 'bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]',
    solid: 'bg-white dark:bg-neutral-950'
  };

  return (
    <section className={`relative overflow-hidden ${backgroundClasses[backgroundStyle]} py-20 md:py-32`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-300 dark:bg-purple-900 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-300 dark:bg-blue-900 opacity-20 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className={`max-w-5xl ${alignment === 'center' ? 'mx-auto text-center' : ''}`}>
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-full ${alignment === 'center' ? 'mx-auto' : ''}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            New products added daily
          </div>

          {/* Main content */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-4 font-medium">
            {subtitle}
          </p>

          <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-500 mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-12 ${alignment === 'center' ? 'justify-center' : ''}`}>
            <Link
              href={primaryButtonLink}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all transform hover:scale-105 shadow-lg"
            >
              {primaryButtonText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={secondaryButtonLink}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
            >
              {secondaryButtonText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Features */}
          {showFeatures && (
            <div className={`flex flex-wrap gap-6 ${alignment === 'center' ? 'justify-center' : ''}`}>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <feature.icon className="w-4 h-4" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Decorative skateboard illustration */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-950 via-transparent to-transparent z-10" />
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const schema = {
  name: 'Hero',
  type: 'hero',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Skateshop'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'An open source e-commerce skateshop'
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Built with everything new in Next.js'
    },
    {
      type: 'text',
      id: 'primaryButtonText',
      label: 'Primary Button Text',
      default: 'Buy now'
    },
    {
      type: 'text',
      id: 'primaryButtonLink',
      label: 'Primary Button Link',
      default: '/products'
    },
    {
      type: 'text',
      id: 'secondaryButtonText',
      label: 'Secondary Button Text',
      default: 'Sell now'
    },
    {
      type: 'text',
      id: 'secondaryButtonLink',
      label: 'Secondary Button Link',
      default: '/dashboard/stores'
    },
    {
      type: 'select',
      id: 'backgroundStyle',
      label: 'Background Style',
      options: [
        { value: 'gradient', label: 'Gradient' },
        { value: 'dots', label: 'Dots Pattern' },
        { value: 'grid', label: 'Grid Pattern' },
        { value: 'solid', label: 'Solid Color' }
      ],
      default: 'dots'
    },
    {
      type: 'select',
      id: 'alignment',
      label: 'Content Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' }
      ],
      default: 'center'
    },
    {
      type: 'checkbox',
      id: 'showFeatures',
      label: 'Show Features',
      default: true
    }
  ]
};