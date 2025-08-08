'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { IconSelect, alignmentOptions, verticalAlignmentOptions, layoutOptions, containerLayoutOptions, containerAlignmentOptions, imageFitOptions, mobileLayoutOptions, borderRadiusOptions } from './icon-select';
import { ColumnRatioSelect } from './column-ratio-select';
import { VisualRange } from './visual-range';
import { EnhancedColorPicker } from '@/components/ui/enhanced-color-picker';
import { EnhancedTypographyPicker } from '@/components/ui/enhanced-typography-picker';
import { LinkSelectorInput } from './link-selector-input';

interface BaseInputProps {
  label: string;
  value: any;
  onChange: (value: any, skipHistory?: boolean) => void;
  className?: string;
  disabled?: boolean;
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'number' | 'email' | 'url' | 'tel';
  placeholder?: string;
  skipHistory?: boolean;
}

interface TextAreaProps extends BaseInputProps {
  placeholder?: string;
  rows?: number;
}

interface SelectProps extends BaseInputProps {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface ToggleProps extends BaseInputProps {
  description?: string;
}

interface ColorPickerProps extends BaseInputProps {
  showHex?: boolean;
}

interface RangeProps extends BaseInputProps {
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

/**
 * Reusable form input components for Theme Studio
 * Eliminates duplication across inspector components
 */

export const TextInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  skipHistory = false,
  className,
  disabled = false
}: TextInputProps) => (
  <div className={cn("space-y-0.5", className)}>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value, skipHistory)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full px-2 py-1 text-xs border border-gray-300 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        "transition-colors duration-200"
      )}
    />
  </div>
));

TextInput.displayName = 'TextInput';

export const TextArea = React.memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  className,
  disabled = false
}: TextAreaProps) => (
  <div className={cn("space-y-0.5", className)}>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        "w-full px-2 py-1 text-xs border border-gray-300 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        "resize-none transition-colors duration-200"
      )}
    />
  </div>
));

TextArea.displayName = 'TextArea';

export const Select = React.memo(({ 
  label, 
  value, 
  onChange, 
  options,
  placeholder,
  className,
  disabled = false
}: SelectProps) => (
  <div className={cn("space-y-0.5", className)}>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "w-full px-2 py-1 text-xs border border-gray-300 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        "transition-colors duration-200"
      )}
    >
      {placeholder && (
        <option value="" disabled>{placeholder}</option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));

Select.displayName = 'Select';

export const Toggle = React.memo(({ 
  label, 
  value, 
  onChange,
  description,
  className,
  disabled = false
}: ToggleProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onChange(!value);
    }
  }, [value, onChange, disabled]);

  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600">{label}</label>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full",
            "border-2 border-transparent transition-colors duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            value ? "bg-blue-600" : "bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          role="switch"
          aria-checked={value}
          aria-label={label}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full",
              "bg-white shadow ring-0 transition duration-200 ease-in-out",
              value ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
});

Toggle.displayName = 'Toggle';

export const ColorPicker = React.memo(({ 
  label, 
  value, 
  onChange,
  showHex = true,
  className,
  disabled = false
}: ColorPickerProps) => (
  <div className={cn("space-y-0.5", className)}>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="flex gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-8 h-8 border border-gray-300 rounded-md cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
      {showHex && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          disabled={disabled}
          className={cn(
            "flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          )}
        />
      )}
    </div>
  </div>
));

ColorPicker.displayName = 'ColorPicker';

export const Range = React.memo(({ 
  label, 
  value, 
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  className,
  disabled = false
}: RangeProps) => (
  <div className={cn("space-y-0.5", className)}>
    <div className="flex justify-between items-center">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <span className="text-xs text-gray-500">
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value || min}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className={cn(
        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "[&::-webkit-slider-thumb]:appearance-none",
        "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
        "[&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full",
        "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer",
        "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
        "[&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:rounded-full",
        "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-sm",
        "[&::-moz-range-thumb]:cursor-pointer"
      )}
    />
  </div>
));

Range.displayName = 'Range';

// Compound exports for convenience
export const FormInputs = {
  Text: TextInput,
  TextArea,
  Select,
  Toggle,
  Color: EnhancedColorPicker,
  ColorBasic: ColorPicker, // Keep old one as backup
  Typography: EnhancedTypographyPicker,
  Range,
  Link: LinkSelectorInput,
  IconSelect,
  ColumnRatio: ColumnRatioSelect,
  VisualRange
};

// Export icon options for easy access
export { 
  alignmentOptions, 
  verticalAlignmentOptions, 
  layoutOptions, 
  containerLayoutOptions, 
  containerAlignmentOptions,
  imageFitOptions,
  mobileLayoutOptions,
  borderRadiusOptions 
} from './icon-select';