'use client';

import React from 'react';
import { ArrowRight, ShoppingCart, Heart, Eye, Download } from 'lucide-react';

interface ButtonProps {
  settings: {
    text?: string;
    url?: string;
    style?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: 'none' | 'arrow-right' | 'cart' | 'heart' | 'eye' | 'download';
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    disabled?: boolean;
    target?: '_blank' | '_self';
  };
  onClick?: () => void;
}

export function Button({ settings, onClick }: ButtonProps) {
  const {
    text = 'Button',
    url = '#',
    style = 'primary',
    size = 'md',
    icon = 'none',
    iconPosition = 'right',
    fullWidth = false,
    disabled = false,
    target = '_self'
  } = settings;

  const getIconComponent = () => {
    switch (icon) {
      case 'arrow-right': return ArrowRight;
      case 'cart': return ShoppingCart;
      case 'heart': return Heart;
      case 'eye': return Eye;
      case 'download': return Download;
      default: return null;
    }
  };

  const IconComponent = getIconComponent();

  const getStyleClasses = () => {
    // Map block button styles to theme button classes
    const buttonVariant = style === 'primary' ? 'primary' : 'secondary';
    const baseClasses = `btn btn-${buttonVariant}`;
    
    // Add size classes
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };

    const widthClass = fullWidth ? 'w-full' : '';
    
    return `${baseClasses} ${sizeClasses[size]} ${widthClass}`;
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-5 w-5';
      case 'lg': return 'h-6 w-6';
      case 'xl': return 'h-7 w-7';
      default: return 'h-5 w-5';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const content = (
    <>
      {IconComponent && iconPosition === 'left' && (
        <IconComponent className={`${getIconSize()} mr-2`} />
      )}
      <span>{text}</span>
      {IconComponent && iconPosition === 'right' && (
        <IconComponent className={`${getIconSize()} ml-2`} />
      )}
    </>
  );

  if (onClick || disabled) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={getStyleClasses()}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={url}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={getStyleClasses()}
    >
      {content}
    </a>
  );
}