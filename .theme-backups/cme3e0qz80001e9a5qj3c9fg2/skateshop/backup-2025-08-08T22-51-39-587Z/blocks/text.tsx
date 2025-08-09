'use client';

import React from 'react';

interface TextBlockProps {
  settings?: {
    content?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    align?: 'left' | 'center' | 'right';
    color?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  };
}

export default function TextBlock({ settings = {} }: TextBlockProps) {
  const {
    content = 'Sample text content',
    size = 'medium',
    align = 'left',
    fontWeight = 'normal',
    tag = 'p'
  } = settings;

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const className = `${sizeClasses[size]} ${alignClasses[align]} ${weightClasses[fontWeight]}`;
  
  const Tag = tag as keyof JSX.IntrinsicElements;

  return <Tag className={className}>{content}</Tag>;
}

export const schema = {
  name: 'Text',
  type: 'text',
  settings: [
    {
      type: 'textarea',
      id: 'content',
      label: 'Text Content',
      default: 'Sample text content'
    },
    {
      type: 'select',
      id: 'size',
      label: 'Size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'xlarge', label: 'Extra Large' }
      ],
      default: 'medium'
    },
    {
      type: 'select',
      id: 'align',
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ],
      default: 'left'
    },
    {
      type: 'select',
      id: 'fontWeight',
      label: 'Font Weight',
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'medium', label: 'Medium' },
        { value: 'semibold', label: 'Semibold' },
        { value: 'bold', label: 'Bold' }
      ],
      default: 'normal'
    },
    {
      type: 'select',
      id: 'tag',
      label: 'HTML Tag',
      options: [
        { value: 'p', label: 'Paragraph' },
        { value: 'h1', label: 'H1' },
        { value: 'h2', label: 'H2' },
        { value: 'h3', label: 'H3' },
        { value: 'h4', label: 'H4' },
        { value: 'h5', label: 'H5' },
        { value: 'h6', label: 'H6' },
        { value: 'span', label: 'Span' }
      ],
      default: 'p'
    }
  ]
};