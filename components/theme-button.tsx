'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ThemeButtonProps {
  variant?: 'primary' | 'secondary';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function ThemeButton({
  variant = 'primary',
  href,
  onClick,
  disabled = false,
  loading = false,
  children,
  className,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left'
}: ThemeButtonProps) {
  // Use CSS classes defined by theme settings
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  const buttonClasses = cn(
    'btn',
    variantClass,
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {content}
    </button>
  );
}