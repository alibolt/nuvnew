'use client';

import React from 'react';
import Image from 'next/image';

interface ImageBlockProps {
  settings?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  };
}

export default function ImageBlock({ settings = {} }: ImageBlockProps) {
  const {
    src = '/placeholder.png',
    alt = 'Image',
    width = 400,
    height = 300,
    objectFit = 'cover',
    rounded = 'none'
  } = settings;

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  return (
    <div className={`relative overflow-hidden ${roundedClasses[rounded]}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ objectFit }}
        className="w-full h-auto"
      />
    </div>
  );
}

export const schema = {
  name: 'Image',
  type: 'image',
  settings: [
    {
      type: 'image',
      id: 'src',
      label: 'Image Source',
      default: '/placeholder.png'
    },
    {
      type: 'text',
      id: 'alt',
      label: 'Alt Text',
      default: 'Image'
    },
    {
      type: 'number',
      id: 'width',
      label: 'Width',
      default: 400
    },
    {
      type: 'number',
      id: 'height',
      label: 'Height',
      default: 300
    },
    {
      type: 'select',
      id: 'objectFit',
      label: 'Object Fit',
      options: [
        { value: 'contain', label: 'Contain' },
        { value: 'cover', label: 'Cover' },
        { value: 'fill', label: 'Fill' },
        { value: 'none', label: 'None' },
        { value: 'scale-down', label: 'Scale Down' }
      ],
      default: 'cover'
    },
    {
      type: 'select',
      id: 'rounded',
      label: 'Border Radius',
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
        { value: 'full', label: 'Full' }
      ],
      default: 'none'
    }
  ]
};