'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { googleFonts, getFontsByCategory, getPopularFonts, buildGoogleFontsUrl } from '@/lib/google-fonts-list';
import { cn } from '@/lib/utils';

interface GoogleFontPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showCategories?: boolean;
  showWeights?: boolean;
  category?: 'all' | 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  compact?: boolean;
}

export function GoogleFontPicker({
  value,
  onChange,
  label,
  showCategories = true,
  showWeights = false,
  category = 'all',
  compact = false
}: GoogleFontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Removed category state - not needed anymore
  // Preview text removed
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Load font preview
  useEffect(() => {
    if (value && !document.querySelector(`link[href*="${value.replace(/ /g, '+')}"]`)) {
      const link = document.createElement('link');
      link.href = buildGoogleFontsUrl([{ name: value }]);
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter fonts
  const filteredFonts = useMemo(() => {
    if (searchQuery) {
      return googleFonts.filter(font => 
        font.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return googleFonts;
  }, [searchQuery]);

  const popularFonts = useMemo(() => getPopularFonts(), []);

  // Categories removed

  return (
    <div className={cn("nuvi-space-y-xs", compact && "nuvi-space-y-1")}>
      {label && (
        <label className={cn(
          "nuvi-font-medium nuvi-text-gray-700",
          compact ? "nuvi-text-xs" : "nuvi-text-xs"
        )}>{label}</label>
      )}
      
      <div className="nuvi-relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (!isOpen && buttonRef.current) {
              const rect = buttonRef.current.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
              });
            }
            setIsOpen(!isOpen);
          }}
          className={cn(
            "nuvi-w-full nuvi-text-left nuvi-bg-white nuvi-border nuvi-border-gray-300 nuvi-rounded hover:nuvi-border-blue-500 nuvi-transition-colors nuvi-flex nuvi-items-center nuvi-justify-between",
            compact ? "nuvi-px-2 nuvi-py-0.5 nuvi-text-xs" : "nuvi-px-sm nuvi-py-xs"
          )}
          style={{ fontFamily: value }}
        >
          <span className={cn(compact ? "nuvi-text-xs" : "nuvi-text-sm")}>{value || 'Select a font'}</span>
          <ChevronDown className={cn(
            "nuvi-transition-transform",
            compact ? "nuvi-w-3 nuvi-h-3" : "nuvi-w-4 nuvi-h-4",
            isOpen && "nuvi-rotate-180"
          )} />
        </button>

        {isOpen && (
          <div 
            ref={dropdownRef}
            className="nuvi-fixed nuvi-z-[9999] nuvi-bg-white nuvi-border nuvi-border-gray-200 nuvi-rounded-lg nuvi-shadow-2xl nuvi-flex nuvi-flex-col" 
            style={{ 
              backgroundColor: 'white',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: compact ? '300px' : '400px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            {/* Search */}
            <div className={cn("nuvi-border-b nuvi-bg-gray-50", compact ? "nuvi-p-2" : "nuvi-p-sm")} style={{ backgroundColor: '#f9fafb' }}>
              <div className="nuvi-relative">
                <Search className={cn(
                  "nuvi-absolute nuvi-left-2 nuvi-top-1/2 -nuvi-translate-y-1/2 nuvi-text-gray-400",
                  compact ? "nuvi-w-3 nuvi-h-3" : "nuvi-w-4 nuvi-h-4"
                )} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fonts..."
                  className={cn(
                    "nuvi-w-full nuvi-bg-white nuvi-rounded-md nuvi-border nuvi-border-gray-200 focus:nuvi-outline-none focus:nuvi-ring-2 focus:nuvi-ring-blue-500",
                    compact ? "nuvi-pl-6 nuvi-pr-6 nuvi-py-1 nuvi-text-xs" : "nuvi-pl-8 nuvi-pr-8 nuvi-py-xs nuvi-text-sm"
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="nuvi-absolute nuvi-right-2 nuvi-top-1/2 -nuvi-translate-y-1/2"
                  >
                    <X className={cn(
                      "nuvi-text-muted hover:nuvi-text-foreground",
                      compact ? "nuvi-w-3 nuvi-h-3" : "nuvi-w-4 nuvi-h-4"
                    )} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories removed */}

            {/* Preview Text removed */}

            {/* Font List */}
            <div className="nuvi-flex-1 nuvi-overflow-y-auto nuvi-bg-white" style={{ backgroundColor: 'white' }}>
              {searchQuery === '' && (
                <div className="nuvi-border-b">
                  <div className={cn(
                    "nuvi-font-medium nuvi-text-gray-600 nuvi-bg-gray-100",
                    compact ? "nuvi-px-2 nuvi-py-1 nuvi-text-xs" : "nuvi-px-sm nuvi-py-xs nuvi-text-xs"
                  )} style={{ backgroundColor: '#f3f4f6' }}>
                    Popular Fonts
                  </div>
                  {popularFonts.map(font => (
                    <FontOption
                      key={font.value}
                      font={font}
                      isSelected={value === font.value}
                      onClick={() => {
                        onChange(font.value);
                        setIsOpen(false);
                      }}
                      compact={compact}
                    />
                  ))}
                </div>
              )}

              <div>
                {filteredFonts.length === 0 ? (
                  <div className="nuvi-p-md nuvi-text-center nuvi-text-sm nuvi-text-gray-500 nuvi-bg-white" style={{ backgroundColor: 'white' }}>
                    No fonts found
                  </div>
                ) : (
                  filteredFonts.map(font => (
                    <FontOption
                      key={font.value}
                      font={font}
                      isSelected={value === font.value}
                      onClick={() => {
                        onChange(font.value);
                        setIsOpen(false);
                      }}
                      compact={compact}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Font Option Component
function FontOption({ 
  font, 
  isSelected, 
  onClick,
  compact = false
}: {
  font: typeof googleFonts[0];
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load font on hover/view
    const link = document.querySelector(`link[href*="${font.value.replace(/ /g, '+')}"]`);
    if (!link) {
      const newLink = document.createElement('link');
      newLink.href = buildGoogleFontsUrl([{ name: font.value, weights: font.weights }]);
      newLink.rel = 'stylesheet';
      newLink.onload = () => setIsLoaded(true);
      document.head.appendChild(newLink);
    } else {
      setIsLoaded(true);
    }
  }, [font]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "nuvi-w-full hover:nuvi-bg-gray-50 nuvi-transition-colors nuvi-text-left nuvi-bg-white",
        compact ? "nuvi-px-2 nuvi-py-1" : "nuvi-px-sm nuvi-py-xs",
        isSelected && "nuvi-bg-blue-50 hover:nuvi-bg-blue-100"
      )}
      style={{ backgroundColor: isSelected ? '#eff6ff' : 'white' }}
    >
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
        <span className={cn(
          "nuvi-font-medium nuvi-text-gray-900",
          compact ? "nuvi-text-xs" : "nuvi-text-sm"
        )} style={{ fontFamily: isLoaded ? font.value : 'inherit' }}>{font.label}</span>
        {isSelected && <Check className={cn(
          "nuvi-text-blue-600",
          compact ? "nuvi-w-3 nuvi-h-3" : "nuvi-w-4 nuvi-h-4"
        )} />}
      </div>
    </button>
  );
}