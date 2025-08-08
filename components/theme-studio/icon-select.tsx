'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Columns2, Columns3, Square, LayoutGrid, ArrowRight, ArrowDown,
  AlignHorizontalSpaceBetween, AlignHorizontalSpaceAround, Maximize,
  Minimize2, Maximize2, RectangleHorizontal, RectangleVertical
} from 'lucide-react';

interface IconOption {
  value: string;
  icon: React.ReactNode;
  label: string;
}

interface IconSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: IconOption[];
  className?: string;
  disabled?: boolean;
}

export const IconSelect = React.memo(({ 
  label, 
  value, 
  onChange, 
  options,
  className,
  disabled = false
}: IconSelectProps) => (
  <div className={cn("space-y-0.5", className)}>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="flex gap-0.5 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
          className={cn(
            "p-1 rounded border transition-all",
            value === option.value
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-300 bg-white text-gray-600 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  </div>
));

IconSelect.displayName = 'IconSelect';

// Predefined icon options for common use cases
export const alignmentOptions: IconOption[] = [
  { value: 'left', icon: <AlignLeft size={14} />, label: 'Left' },
  { value: 'center', icon: <AlignCenter size={14} />, label: 'Center' },
  { value: 'right', icon: <AlignRight size={14} />, label: 'Right' },
  { value: 'justify', icon: <AlignJustify size={14} />, label: 'Justify' }
];

export const verticalAlignmentOptions: IconOption[] = [
  { value: 'start', icon: <AlignStartVertical size={14} />, label: 'Top' },
  { value: 'center', icon: <AlignCenterVertical size={14} />, label: 'Center' },
  { value: 'end', icon: <AlignEndVertical size={14} />, label: 'Bottom' }
];

export const layoutOptions: IconOption[] = [
  { value: 'single', icon: <Square size={14} />, label: 'Single Column' },
  { value: 'two-column', icon: <Columns2 size={14} />, label: 'Two Columns' },
  { value: 'three-column', icon: <Columns3 size={14} />, label: 'Three Columns' },
  { value: 'grid', icon: <LayoutGrid size={14} />, label: 'Grid' }
];

export const containerLayoutOptions: IconOption[] = [
  { value: 'horizontal', icon: <ArrowRight size={14} />, label: 'Horizontal' },
  { value: 'vertical', icon: <ArrowDown size={14} />, label: 'Vertical' }
];

export const containerAlignmentOptions: IconOption[] = [
  { value: 'left', icon: <AlignLeft size={14} />, label: 'Left' },
  { value: 'center', icon: <AlignCenter size={14} />, label: 'Center' },
  { value: 'right', icon: <AlignRight size={14} />, label: 'Right' },
  { value: 'between', icon: <AlignHorizontalSpaceBetween size={14} />, label: 'Space Between' },
  { value: 'around', icon: <AlignHorizontalSpaceAround size={14} />, label: 'Space Around' },
  { value: 'stretch', icon: <Maximize size={14} />, label: 'Stretch' }
];

export const imageFitOptions: IconOption[] = [
  { value: 'contain', icon: <Minimize2 size={14} />, label: 'Contain' },
  { value: 'cover', icon: <Maximize2 size={14} />, label: 'Cover' },
  { value: 'fill', icon: <RectangleHorizontal size={14} />, label: 'Fill' },
  { value: 'none', icon: <RectangleVertical size={14} />, label: 'None' }
];

export const mobileLayoutOptions: IconOption[] = [
  { value: 'stacked', icon: <Columns2 size={14} className="rotate-90" />, label: 'Stacked' },
  { value: 'horizontal', icon: <Columns2 size={14} />, label: 'Keep Horizontal' }
];

// Border radius visual icons
const BorderRadiusIcon = ({ radius }: { radius: string }) => {
  const radiusMap: Record<string, string> = {
    'none': '0',
    'sm': '2px',
    'md': '4px',
    'lg': '6px',
    'xl': '8px',
    '2xl': '12px',
    'full': '50%'
  };
  
  return (
    <div 
      className="w-4 h-4 bg-gray-400" 
      style={{ borderRadius: radiusMap[radius] || '0' }}
    />
  );
};

export const borderRadiusOptions: IconOption[] = [
  { value: 'none', icon: <BorderRadiusIcon radius="none" />, label: 'None' },
  { value: 'sm', icon: <BorderRadiusIcon radius="sm" />, label: 'Small' },
  { value: 'md', icon: <BorderRadiusIcon radius="md" />, label: 'Medium' },
  { value: 'lg', icon: <BorderRadiusIcon radius="lg" />, label: 'Large' },
  { value: 'xl', icon: <BorderRadiusIcon radius="xl" />, label: 'Extra Large' },
  { value: '2xl', icon: <BorderRadiusIcon radius="2xl" />, label: '2X Large' },
  { value: 'full', icon: <BorderRadiusIcon radius="full" />, label: 'Full' }
];