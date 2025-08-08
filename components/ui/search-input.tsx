'use client';

import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface SearchInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  variant?: 'default' | 'rounded' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showClear?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles = {
  default: 'border border-gray-300 overflow-hidden',
  rounded: 'border border-gray-200 overflow-hidden',
  minimal: 'border-b border-gray-300',
};

const sizeStyles = {
  sm: {
    container: 'h-8',
    input: 'text-sm px-3',
    icon: 'w-4 h-4',
    iconPadding: 'pl-8',
    iconLeft: 'left-2',
  },
  md: {
    container: 'h-10',
    input: 'text-base px-4',
    icon: 'w-5 h-5',
    iconPadding: 'pl-10',
    iconLeft: 'left-3',
  },
  lg: {
    container: 'h-12',
    input: 'text-lg px-5',
    icon: 'w-6 h-6',
    iconPadding: 'pl-13',
    iconLeft: 'left-4',
  },
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  value: controlledValue,
  onChange,
  onSubmit,
  onKeyDown: customOnKeyDown,
  placeholder = 'Search...',
  variant = 'default',
  size = 'md',
  showIcon = true,
  showClear = true,
  autoFocus = false,
  className,
  inputClassName,
  iconClassName,
  disabled = false,
  loading = false,
  style,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  
  // Get border radius from theme context
  let borderRadius = '8px';
  try {
    const { borderRadius: themeBorderRadius } = useTheme();
    borderRadius = themeBorderRadius;
    console.log('[SearchInput] Using theme border radius:', borderRadius);
  } catch (error) {
    // Theme context not available, use CSS variable fallback
    console.log('[SearchInput] Theme context not available, using CSS variable fallback');
  }
  
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = ref || internalRef;
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  useEffect(() => {
    if (autoFocus) {
      const input = typeof inputRef === 'object' && inputRef?.current ? inputRef.current : null;
      if (input) {
        input.focus();
      }
    }
  }, [autoFocus, inputRef]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };

  const handleClear = () => {
    const newValue = '';
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    const input = typeof inputRef === 'object' && inputRef?.current ? inputRef.current : null;
    if (input) {
      input.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Call custom onKeyDown first if provided
    if (customOnKeyDown) {
      customOnKeyDown(e);
    }
    
    // Only handle Enter if not prevented by custom handler
    if (!e.defaultPrevented && e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const styles = sizeStyles[size] || sizeStyles.md;
  const variantStyle = variantStyles[variant] || variantStyles.default;

  return (
    <div className={cn('relative flex items-center', styles.container, className)} style={{
      ...style,
      borderRadius: variant === 'minimal' ? '0' : variant === 'rounded' ? '9999px' : borderRadius,
      overflow: variant !== 'minimal' ? 'hidden' : undefined
    }}>
      {showIcon && (
        <div className={cn(
          'absolute pointer-events-none flex items-center justify-center',
          styles.iconLeft,
          loading && 'animate-pulse'
        )}>
          <Search 
            className={cn(
              styles.icon,
              'text-gray-400',
              iconClassName
            )}
          />
        </div>
      )}
      
      <input
        ref={typeof inputRef === 'object' ? inputRef : undefined}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={cn(
          'w-full h-full focus:outline-none focus:ring-2 focus:ring-black/5 transition-all duration-200',
          variantStyle,
          styles.input,
          showIcon && styles.iconPadding,
          showClear && value && 'pr-10',
          disabled && 'opacity-50 cursor-not-allowed',
          inputClassName
        )}
        style={{
          backgroundColor: 'inherit',
          color: 'inherit',
          borderColor: 'inherit',
          borderRadius: variant === 'minimal' ? '0' : variant === 'rounded' ? '9999px' : borderRadius,
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
      />
      
      {showClear && value && !loading && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute right-2.5',
            'text-gray-400 hover:text-gray-600 transition-colors'
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';