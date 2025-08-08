import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  pill?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      pill = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = `
      inline-flex items-center justify-center font-medium transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `;

    // Variant styles
    const variants = {
      primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      link: 'text-green-600 underline-offset-4 hover:underline focus:ring-green-500'
    };

    // Size styles
    const sizes = {
      sm: `text-xs ${pill ? 'px-3 py-1.5' : 'px-2.5 py-1.5'} ${pill ? 'rounded-full' : 'rounded-md'}`,
      md: `text-sm ${pill ? 'px-4 py-2' : 'px-3 py-2'} ${pill ? 'rounded-full' : 'rounded-lg'}`,
      lg: `text-base ${pill ? 'px-6 py-3' : 'px-4 py-2.5'} ${pill ? 'rounded-full' : 'rounded-lg'}`,
      xl: `text-lg ${pill ? 'px-8 py-4' : 'px-6 py-3'} ${pill ? 'rounded-full' : 'rounded-xl'}`
    };

    // Icon size based on button size
    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20
    };

    const iconSize = iconSizes[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin mr-2" size={iconSize} />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{React.cloneElement(icon as React.ReactElement, { size: iconSize })}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{React.cloneElement(icon as React.ReactElement, { size: iconSize })}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;