import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X, ChevronsUpDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
  maxHeight?: number;
  className?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderValue?: (value: string | string[], options: SelectOption[]) => React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'md',
  variant = 'default',
  maxHeight = 300,
  className = '',
  renderOption,
  renderValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected options
  const getSelectedOptions = (): SelectOption[] => {
    if (!value) return [];
    if (multiple) {
      return options.filter(opt => (value as string[]).includes(opt.value));
    }
    return options.filter(opt => opt.value === value);
  };

  const selectedOptions = getSelectedOptions();

  // Handle option selection
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = (value as string[]) || [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange?.(newValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

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
      hover:border-gray-400
      focus:border-green-500 focus:ring-2 focus:ring-green-500/20
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    `,
    filled: `
      border border-transparent bg-gray-100
      hover:bg-gray-150
      focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20
      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    `,
    ghost: `
      border-b border-gray-300 rounded-none px-0
      hover:border-gray-400
      focus:border-green-500
      disabled:bg-transparent disabled:text-gray-500 disabled:cursor-not-allowed
    `
  };

  // Error styles
  const errorStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : '';

  // Render the selected value(s)
  const renderSelectedValue = () => {
    if (renderValue) {
      return renderValue(value || (multiple ? [] : ''), options);
    }

    if (selectedOptions.length === 0) {
      return <span className="text-gray-400">{placeholder}</span>;
    }

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-sm rounded"
            >
              {option.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option);
                }}
                className="hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      );
    }

    return <span>{selectedOptions[0].label}</span>;
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        {/* Select Button */}
        <button
          ref={inputRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full rounded-lg transition-all duration-200 outline-none
            flex items-center justify-between
            ${sizes[size]}
            ${variants[variant]}
            ${errorStyles}
            ${isOpen ? 'ring-2 ring-green-500/20 border-green-500' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex-1 text-left truncate">
            {renderSelectedValue()}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {clearable && selectedOptions.length > 0 && (
              <button
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{ maxHeight }}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <ul
              className="overflow-y-auto"
              style={{ maxHeight: searchable ? maxHeight - 50 : maxHeight }}
              role="listbox"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? (value as string[])?.includes(option.value)
                    : value === option.value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={option.value}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`
                        flex items-center justify-between px-4 py-2 cursor-pointer transition-colors
                        ${isHighlighted ? 'bg-gray-100' : ''}
                        ${isSelected ? 'bg-green-50' : ''}
                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                      `}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                    >
                      <div className="flex items-center gap-3">
                        {multiple && (
                          <div className={`
                            w-4 h-4 border-2 rounded
                            ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'}
                          `}>
                            {isSelected && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                        )}
                        {option.icon && (
                          <span className="flex-shrink-0">
                            {option.icon}
                          </span>
                        )}
                        <div>
                          {renderOption ? (
                            renderOption(option)
                          ) : (
                            <>
                              <div className="text-sm font-medium">{option.label}</div>
                              {option.description && (
                                <div className="text-xs text-gray-500">{option.description}</div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {!multiple && isSelected && (
                        <Check size={16} className="text-green-600" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Combobox Component (Searchable Select with input)
export const Combobox: React.FC<SelectProps> = (props) => {
  return <Select {...props} searchable clearable />;
};

// Multi-Select Component
export const MultiSelect: React.FC<Omit<SelectProps, 'multiple'>> = (props) => {
  return <Select {...props} multiple searchable />;
};

export default Select;