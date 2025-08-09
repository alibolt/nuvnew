'use client';

import React from 'react';
import { Truck, Shield, RefreshCw, CreditCard } from 'lucide-react';

interface FeaturesProps {
  settings?: {
    title?: string;
    subtitle?: string;
    features?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  store?: any;
}

export default function Features({ settings = {}, store }: FeaturesProps) {
  const {
    title = 'Why Choose Skateshop',
    subtitle = 'Premium quality and service you can trust',
    features = [
      {
        title: 'Free Shipping',
        description: 'Free shipping on orders over $100',
        icon: 'truck'
      },
      {
        title: 'Secure Payment',
        description: '100% secure payment processing',
        icon: 'shield'
      },
      {
        title: 'Easy Returns',
        description: '30-day return policy',
        icon: 'refresh'
      },
      {
        title: 'Multiple Payment Options',
        description: 'Pay with card, PayPal, or crypto',
        icon: 'credit-card'
      }
    ]
  } = settings;

  const iconMap: { [key: string]: React.ComponentType<any> } = {
    truck: Truck,
    shield: Shield,
    refresh: RefreshCw,
    'credit-card': CreditCard
  };

  return (
    <section className="w-full py-14 md:py-20 lg:py-24 bg-muted/50">
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

          {/* Features Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon] || Shield;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
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
      default: 'Why Choose Skateshop'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Premium quality and service you can trust'
    }
  ]
};