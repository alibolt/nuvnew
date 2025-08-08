'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface VisualRangeOption {
  value: string;
  label: string;
  size: number;
}

interface VisualRangeProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: VisualRangeOption[];
  className?: string;
  disabled?: boolean;
  type?: 'padding' | 'margin' | 'gap';
}

const defaultOptions: VisualRangeOption[] = [
  { value: '0', label: 'None', size: 0 },
  { value: '2', label: 'Small', size: 8 },
  { value: '4', label: 'Medium', size: 16 },
  { value: '6', label: 'Large', size: 24 },
  { value: '8', label: 'Extra Large', size: 32 },
  { value: '10', label: '2X Large', size: 40 },
  { value: '12', label: '3X Large', size: 48 }
];

export const VisualRange = React.memo(({ 
  label, 
  value, 
  onChange,
  options = defaultOptions,
  className,
  disabled = false,
  type = 'padding'
}: VisualRangeProps) => {
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="space-y-2">
        {/* Visual Preview */}
        <div className="relative h-12 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
          <div 
            className={cn(
              "bg-blue-100 border-2 border-dashed border-blue-400 transition-all",
              type === 'gap' ? "flex gap-1" : ""
            )}
            style={{
              padding: type === 'padding' ? `${selectedOption.size / 4}px` : '0',
              margin: type === 'margin' ? `${selectedOption.size / 4}px` : '0',
            }}
          >
            {type === 'gap' ? (
              <>
                <div className="w-8 h-4 bg-blue-300 rounded" />
                <div className="w-8 h-4 bg-blue-300 rounded" style={{ marginLeft: `${selectedOption.size / 4}px` }} />
              </>
            ) : (
              <div className="w-16 h-4 bg-blue-300 rounded" />
            )}
          </div>
        </div>
        
        {/* Options */}
        <div className="flex gap-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={cn(
                "flex-1 px-2 py-1 text-xs rounded border transition-all",
                value === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title={option.label}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

VisualRange.displayName = 'VisualRange';