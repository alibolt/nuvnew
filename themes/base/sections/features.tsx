'use client';

import React from 'react';
import { Truck, Shield, CreditCard, Headphones, Package, RefreshCw } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface FeaturesProps {
  settings?: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'carousel' | 'centered';
    columns?: number;
    iconStyle?: 'filled' | 'outlined';
    backgroundColor?: string;
  };
}

export default function Features({ settings = {} }: FeaturesProps) {
  const {
    title = 'Why Choose Us',
    subtitle = 'Experience the best in online shopping',
    layout = 'grid',
    columns = 3,
    iconStyle = 'filled',
    backgroundColor = 'white'
  } = settings;

  const features: Feature[] = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders over $50. Fast and reliable shipping worldwide.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Your payment information is safe with us. SSL encrypted checkout.'
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day return policy. Not satisfied? Return it hassle-free.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you anytime.'
    },
    {
      icon: Package,
      title: 'Quality Products',
      description: 'Carefully curated products from trusted brands.'
    },
    {
      icon: CreditCard,
      title: 'Flexible Payment',
      description: 'Multiple payment options including Buy Now, Pay Later.'
    }
  ];

  const gridColumns = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    6: 'md:grid-cols-2 lg:grid-cols-3'
  };

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50'
  };

  return (
    <section className={`py-16 ${bgClasses[backgroundColor as keyof typeof bgClasses] || bgClasses.white}`}>
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

        {/* Features Grid */}
        <div className={`grid gap-8 ${gridColumns[columns as keyof typeof gridColumns]}`}>
          {features.slice(0, columns).map((feature, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-transform duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${
                iconStyle === 'filled' 
                  ? 'bg-gradient-to-br from-primary to-secondary text-white' 
                  : 'bg-primary/10 text-primary'
              } group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const schema = {
  name: 'Features',
  type: 'features',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Why Choose Us'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Experience the best in online shopping'
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' },
        { value: 'centered', label: 'Centered' }
      ],
      default: 'grid'
    },
    {
      type: 'range',
      id: 'columns',
      label: 'Number of Features',
      min: 2,
      max: 6,
      default: 3
    },
    {
      type: 'select',
      id: 'iconStyle',
      label: 'Icon Style',
      options: [
        { value: 'filled', label: 'Filled' },
        { value: 'outlined', label: 'Outlined' }
      ],
      default: 'filled'
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
      default: 'white'
    }
  ]
};