'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonBlockProps {
  settings?: {
    text?: string;
    link?: string;
    style?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
  };
}

export default function ButtonBlock({ settings = {} }: ButtonBlockProps) {
  const {
    text = 'Click Me',
    link = '#',
    style = 'primary',
    size = 'medium',
    fullWidth = false,
    iconPosition = 'right'
  } = settings;

  const styleClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-primary hover:bg-primary/10'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const className = `
    inline-flex items-center justify-center gap-2 
    font-medium rounded-lg transition-all
    ${styleClasses[style]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
  `;

  const ButtonContent = () => (
    <>
      {text}
    </>
  );

  if (link && link !== '#') {
    return (
      <Link href={link} className={className}>
        <ButtonContent />
      </Link>
    );
  }

  return (
    <button className={className}>
      <ButtonContent />
    </button>
  );
}

export const schema = {
  name: 'Button',
  type: 'button',
  settings: [
    {
      type: 'text',
      id: 'text',
      label: 'Button Text',
      default: 'Click Me'
    },
    {
      type: 'text',
      id: 'link',
      label: 'Link URL',
      default: '#'
    },
    {
      type: 'select',
      id: 'style',
      label: 'Button Style',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
        { value: 'ghost', label: 'Ghost' }
      ],
      default: 'primary'
    },
    {
      type: 'select',
      id: 'size',
      label: 'Button Size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ],
      default: 'medium'
    },
    {
      type: 'checkbox',
      id: 'fullWidth',
      label: 'Full Width',
      default: false
    }
  ]
};