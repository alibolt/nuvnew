'use client';

import React from 'react';
import Link from 'next/link';

interface LogoBlockProps {
  settings?: {
    text?: string;
    logoUrl?: string;
    linkTo?: string;
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
  };
  store?: any;
}

export default function LogoBlock({ settings = {}, store }: LogoBlockProps) {
  const {
    text = store?.name || 'Store',
    linkTo = '/',
    size = 'medium',
    showText = true
  } = settings;

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <Link href={linkTo} className="inline-flex items-center space-x-2">
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${sizeClasses[size]}`}>
          {text}
        </span>
      )}
    </Link>
  );
}

export const schema = {
  name: 'Logo',
  type: 'logo',
  settings: [
    {
      type: 'text',
      id: 'text',
      label: 'Logo Text',
      default: 'Store'
    },
    {
      type: 'text',
      id: 'linkTo',
      label: 'Link URL',
      default: '/'
    },
    {
      type: 'select',
      id: 'size',
      label: 'Size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ],
      default: 'medium'
    },
    {
      type: 'checkbox',
      id: 'showText',
      label: 'Show Text',
      default: true
    }
  ]
};