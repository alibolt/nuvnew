'use client';

import React from 'react';
import { Truck, Shield, CreditCard, Headphones, Package, RefreshCw, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  shield: Shield,
  creditcard: CreditCard,
  headphones: Headphones,
  package: Package,
  refresh: RefreshCw
};

interface FeatureCardProps {
  settings?: {
    icon?: string;
    title?: string;
    description?: string;
    iconStyle?: 'filled' | 'outlined';
  };
}

export default function FeatureCard({ settings = {} }: FeatureCardProps) {
  const {
    icon = 'package',
    title = 'Feature Title',
    description = 'Feature description goes here',
    iconStyle = 'filled'
  } = settings;

  const Icon = iconMap[icon] || Package;

  return (
    <div className="text-center group hover:transform hover:scale-105 transition-transform duration-300">
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${
        iconStyle === 'filled' 
          ? 'bg-gradient-to-br from-primary to-secondary text-white' 
          : 'bg-primary/10 text-primary'
      } group-hover:scale-110 transition-transform`}>
        <Icon className="w-8 h-8" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export const schema = {
  name: 'Feature Card',
  type: 'feature-card',
  settings: [
    {
      type: 'select',
      id: 'icon',
      label: 'Icon',
      options: [
        { value: 'truck', label: 'Truck' },
        { value: 'shield', label: 'Shield' },
        { value: 'creditcard', label: 'Credit Card' },
        { value: 'headphones', label: 'Headphones' },
        { value: 'package', label: 'Package' },
        { value: 'refresh', label: 'Refresh' }
      ],
      default: 'package'
    },
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Feature Title'
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Feature description goes here'
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
    }
  ]
};