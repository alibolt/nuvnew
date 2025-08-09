'use client';

import React from 'react';
import Link from 'next/link';

interface NavigationBlockProps {
  settings?: {
    items?: Array<{
      label: string;
      href: string;
    }>;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
  };
}

export default function NavigationBlock({ settings = {} }: NavigationBlockProps) {
  const {
    items = [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/shop' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ],
    layout = 'horizontal',
    align = 'left'
  } = settings;

  const layoutClasses = {
    horizontal: 'flex flex-row space-x-6',
    vertical: 'flex flex-col space-y-2'
  };

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <nav className={`${layoutClasses[layout]} ${alignClasses[align]}`}>
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="text-gray-700 hover:text-primary transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export const schema = {
  name: 'Navigation',
  type: 'navigation',
  settings: [
    {
      type: 'list',
      id: 'items',
      label: 'Navigation Items',
      default: [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/shop' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ]
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' }
      ],
      default: 'horizontal'
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
    }
  ]
};