// Nuvi Button Component - Uses Nuvi Admin Theme System
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  asChild?: boolean;
}

// Map shadcn variants to Nuvi button classes
const variantMap = {
  default: 'nuvi-btn-primary',
  destructive: 'nuvi-btn-danger',
  outline: 'nuvi-btn-outline',
  secondary: 'nuvi-btn-secondary',
  ghost: 'nuvi-btn-ghost',
  link: 'nuvi-btn-plain',
};

const sizeMap = {
  default: 'nuvi-btn-md',
  sm: 'nuvi-btn-sm',
  lg: 'nuvi-btn-lg',
  icon: 'nuvi-btn-icon-only nuvi-btn-sm',
};

function Button({
  children,
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  asChild = false,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    'nuvi-btn',
    variantMap[variant],
    sizeMap[size],
    loading && 'nuvi-btn-loading',
    className
  );

  if (asChild) {
    return React.Children.only(children) ? 
      React.cloneElement(children as React.ReactElement, {
        className: cn(buttonClassName, (children as React.ReactElement).props.className),
        disabled: disabled || loading,
        ...props
      }) : null;
  }

  return (
    <button
      className={buttonClassName}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  );
}

// Legacy export for compatibility
const buttonVariants = () => '';

export { Button, buttonVariants };
