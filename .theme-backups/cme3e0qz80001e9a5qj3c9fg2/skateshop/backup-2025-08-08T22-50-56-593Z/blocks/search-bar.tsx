'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  settings?: {
    placeholder?: string;
    buttonText?: string;
    showButton?: boolean;
    size?: 'small' | 'medium' | 'large';
  };
}

export default function SearchBar({ settings = {} }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    placeholder = 'Search products...',
    buttonText = 'Search',
    showButton = true,
    size = 'medium'
  } = settings;

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-5 py-3 text-lg'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${sizeClasses[size]} pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      
      {showButton && (
        <button
          type="submit"
          className={`${sizeClasses[size]} bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium`}
        >
          {buttonText}
        </button>
      )}
    </form>
  );
}

export const schema = {
  name: 'Search Bar',
  type: 'search-bar',
  settings: [
    {
      type: 'text',
      id: 'placeholder',
      label: 'Placeholder Text',
      default: 'Search products...'
    },
    {
      type: 'text',
      id: 'buttonText',
      label: 'Button Text',
      default: 'Search'
    },
    {
      type: 'checkbox',
      id: 'showButton',
      label: 'Show Button',
      default: true
    },
    {
      type: 'select',
      id: 'size',
      label: 'Size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ],
      default: 'medium'
    }
  ]
};