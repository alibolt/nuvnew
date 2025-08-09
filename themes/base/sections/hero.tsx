'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShoppingBag, Shield } from 'lucide-react';

interface HeroProps {
  settings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    backgroundImage?: string;
    backgroundGradient?: boolean;
    showFeatures?: boolean;
    alignment?: 'left' | 'center' | 'right';
    height?: 'small' | 'medium' | 'large' | 'full';
  };
  store?: any;
  blocks?: any[];
}

export default function Hero({ settings = {}, store, blocks = [] }: HeroProps) {
  const {
    title = 'Your One-Stop Shop for Everything Tech',
    subtitle = 'Welcome to the Future',
    description = 'Discover the latest gadgets and tech accessories at unbeatable prices',
    primaryButtonText = 'Shop Now',
    primaryButtonLink = '/shop',
    secondaryButtonText = 'View Showcase',
    secondaryButtonLink = '/showcase',
    backgroundGradient = true,
    showFeatures = true,
    alignment = 'center',
    height = 'large'
  } = settings;

  const heightClasses = {
    small: 'py-16',
    medium: 'py-24',
    large: 'py-32',
    full: 'min-h-screen flex items-center'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  const features = [
    { icon: ShoppingBag, text: 'Free Shipping' },
    { icon: Shield, text: '24/7 Support' },
    { icon: Star, text: 'Best Prices' }
  ];

  return (
    <section 
      className={`relative overflow-hidden ${heightClasses[height]} ${backgroundGradient ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-white'}`}
    >
      {/* Background Pattern */}
      {backgroundGradient && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`max-w-2xl ${alignmentClasses[alignment]}`}>
            {subtitle && (
              <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
                {subtitle}
              </span>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {title}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className={`flex gap-4 mb-8 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : ''}`}>
              <Link
                href={primaryButtonLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                {primaryButtonText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href={secondaryButtonLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
              >
                {secondaryButtonText}
              </Link>
            </div>

            {/* Features */}
            {showFeatures && (
              <div className={`flex gap-6 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : ''}`}>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-gray-600">Featured Products</p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 blur-2xl" />
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
      default: 'Your One-Stop Shop for Everything Tech'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Welcome to the Future'
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Discover the latest gadgets and tech accessories at unbeatable prices'
    },
    {
      type: 'text',
      id: 'primaryButtonText',
      label: 'Primary Button Text',
      default: 'Shop Now'
    },
    {
      type: 'text',
      id: 'primaryButtonLink',
      label: 'Primary Button Link',
      default: '/shop'
    },
    {
      type: 'text',
      id: 'secondaryButtonText',
      label: 'Secondary Button Text',
      default: 'View Showcase'
    },
    {
      type: 'text',
      id: 'secondaryButtonLink',
      label: 'Secondary Button Link',
      default: '/showcase'
    },
    {
      type: 'checkbox',
      id: 'backgroundGradient',
      label: 'Show Background Gradient',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showFeatures',
      label: 'Show Features',
      default: true
    },
    {
      type: 'select',
      id: 'alignment',
      label: 'Content Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ],
      default: 'center'
    },
    {
      type: 'select',
      id: 'height',
      label: 'Section Height',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'full', label: 'Full Screen' }
      ],
      default: 'large'
    }
  ]
};