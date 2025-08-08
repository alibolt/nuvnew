import React from 'react';
import { AlertCircle, Check, Eye, EyeOff, Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      icon,
      iconPosition = 'left',
      clearable = false,
      onClear,
      inputSize = 'md',
      variant = 'default',
      className = '',
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    // Size styles
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg'
    };

    // Variant styles
    const variants = {
      default: `
        border border-gray-300 bg-white
        focus:border-green-500 focus:ring-2 focus:ring-green-500/20
        disabled:bg-gray-50 disabled:text-gray-500
      `,
      filled: `
        border border-transparent bg-gray-100
        focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20
        disabled:bg-gray-100 disabled:text-gray-500
      `,
      ghost: `
        border-b border-gray-300 rounded-none px-0
        focus:border-green-500
        disabled:bg-transparent disabled:text-gray-500
      `
    };

    // Error/Success styles
    const stateStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : success
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
      : '';

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {React.cloneElement(icon as React.ReactElement, { size: 18 })}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={`
              w-full rounded-lg transition-all duration-200 outline-none
              ${sizes[inputSize]}
              ${variants[variant]}
              ${stateStyles}
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${clearable || isPassword ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />

          {/* Right Icons Container */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Success Check */}
            {success && !error && (
              <Check className="text-green-500" size={18} />
            )}

            {/* Error Icon */}
            {error && (
              <AlertCircle className="text-red-500" size={18} />
            )}

            {/* Clear Button */}
            {clearable && props.value && !isPassword && (
              <button
                type="button"
                onClick={onClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}

            {/* Password Toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {/* Right Icon */}
            {icon && iconPosition === 'right' && !clearable && !isPassword && (
              <div className="text-gray-400 pointer-events-none">
                {React.cloneElement(icon as React.ReactElement, { size: 18 })}
              </div>
            )}
          </div>
        </div>

        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;