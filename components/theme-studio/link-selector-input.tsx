'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Link, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LinkSelector } from '@/components/navigation/link-selector';
import ReactDOM from 'react-dom';

interface LinkSelectorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  subdomain: string;
}

export const LinkSelectorInput = React.memo(({
  label,
  value,
  onChange,
  placeholder = 'Select or enter URL...',
  className,
  disabled = false,
  subdomain
}: LinkSelectorInputProps) => {
  const [showSelector, setShowSelector] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Check if click is inside the portal dropdown
        const dropdownElement = document.querySelector('.link-selector-portal');
        if (dropdownElement && dropdownElement.contains(event.target as Node)) {
          return;
        }
        setShowSelector(false);
      }
    };

    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSelector]);

  useEffect(() => {
    if (showSelector && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 320; // Approximate height of dropdown
      
      let top = rect.bottom + window.scrollY;
      
      // If not enough space below, position above
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        top = rect.top + window.scrollY - dropdownHeight;
      }
      
      setDropdownPosition({
        top,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showSelector]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelectorChange = (url: string, label?: string) => {
    setInputValue(url);
    onChange(url);
    setShowSelector(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  const isExternalLink = inputValue && (inputValue.startsWith('http://') || inputValue.startsWith('https://'));

  return (
    <div className={cn("space-y-0.5 relative", className)} ref={containerRef}>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSelector(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-7 pr-7 py-1 text-xs border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "transition-colors duration-200"
          )}
        />
        
        {/* Icon */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {isExternalLink ? (
            <ExternalLink className="h-3 w-3 text-gray-400" />
          ) : (
            <Link className="h-3 w-3 text-gray-400" />
          )}
        </div>
        
        {/* Clear button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {/* Link Selector Dropdown */}
      {showSelector && !disabled && ReactDOM.createPortal(
        <div 
          className="fixed z-[9999] link-selector-portal"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxWidth: '400px'
          }}
        >
          <LinkSelector
            value={inputValue}
            onChange={handleSelectorChange}
            subdomain={subdomain}
            onClose={() => setShowSelector(false)}
          />
        </div>,
        document.body
      )}
    </div>
  );
});

LinkSelectorInput.displayName = 'LinkSelectorInput';