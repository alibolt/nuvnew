'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ColumnRatioOption {
  value: string;
  label: string;
  left: number;
  right: number;
}

interface ColumnRatioSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const columnRatioOptions: ColumnRatioOption[] = [
  { value: '50-50', label: '50/50', left: 50, right: 50 },
  { value: '30-70', label: '30/70', left: 30, right: 70 },
  { value: '40-60', label: '40/60', left: 40, right: 60 },
  { value: '60-40', label: '60/40', left: 60, right: 40 },
  { value: '70-30', label: '70/30', left: 70, right: 30 },
  { value: '25-75', label: '25/75', left: 25, right: 75 },
  { value: '75-25', label: '75/25', left: 75, right: 25 },
  { value: '33-67', label: '33/67', left: 33, right: 67 },
  { value: '67-33', label: '67/33', left: 67, right: 33 }
];

export const ColumnRatioSelect = React.memo(({ 
  label, 
  value, 
  onChange, 
  className,
  disabled = false
}: ColumnRatioSelectProps) => {
  const selectedOption = columnRatioOptions.find(opt => opt.value === value) || columnRatioOptions[0];
  
  return (
    <div className={cn("space-y-0.5", className)}>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2 items-center">
        {/* Visual preview */}
        <div className="flex h-6 w-20 rounded border border-gray-300 overflow-hidden">
          <div 
            className="bg-blue-200 transition-all"
            style={{ width: `${selectedOption.left}%` }}
          />
          <div 
            className="bg-blue-300 transition-all"
            style={{ width: `${selectedOption.right}%` }}
          />
        </div>
        {/* Dropdown */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "transition-colors duration-200"
          )}
        >
          {columnRatioOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

ColumnRatioSelect.displayName = 'ColumnRatioSelect';