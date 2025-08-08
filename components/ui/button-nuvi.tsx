'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success' | 'outline' | 'plain';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'micro' | 'slim';
  loading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  asChild?: boolean;
}

export function ButtonNuvi({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconOnly = false,
  disabled,
  asChild = false,
  ...props
}: ButtonProps) {
  const baseClasses = 'nuvi-btn';
  
  const variantClasses = {
    primary: 'nuvi-btn-primary',
    secondary: 'nuvi-btn-secondary',
    tertiary: 'nuvi-btn-tertiary',
    ghost: 'nuvi-btn-ghost',
    danger: 'nuvi-btn-danger',
    success: 'nuvi-btn-success',
    outline: 'nuvi-btn-outline',
    plain: 'nuvi-btn-plain',
  };
  
  const sizeClasses = {
    xs: 'nuvi-btn-xs',
    sm: 'nuvi-btn-sm',
    md: 'nuvi-btn-md',
    lg: 'nuvi-btn-lg',
    micro: 'nuvi-btn-micro',
    slim: 'nuvi-btn-slim',
  };
  
  const buttonClassName = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loading && 'nuvi-btn-loading',
    fullWidth && 'nuvi-btn-full',
    iconOnly && 'nuvi-btn-icon-only',
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

// Export for backward compatibility and easier migration
export const Button = ButtonNuvi;
export default ButtonNuvi;