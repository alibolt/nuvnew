'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  settings?: {
    logo?: string;
    logoText?: string;
    showSearch?: boolean;
    showCart?: boolean;
    showAccount?: boolean;
    sticky?: boolean;
    transparent?: boolean;
    announcement?: {
      enabled?: boolean;
      text?: string;
      backgroundColor?: string;
      textColor?: string;
    };
  };
  store?: any;
  blocks?: any[];
}

export default function Header({ settings = {}, store, blocks = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    logoText = store?.name || 'Store',
    showSearch = true,
    showCart = true,
    showAccount = true,
    sticky = true,
    transparent = false,
    announcement = {}
  } = settings;

  const navItems = [
    { label: 'Shop', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <>
      {/* Announcement Bar */}
      {announcement.enabled && announcement.text && (
        <div 
          className="text-center py-2 px-4 text-sm"
          style={{
            backgroundColor: announcement.backgroundColor || '#6366f1',
            color: announcement.textColor || '#ffffff'
          }}
        >
          {announcement.text}
        </div>
      )}

      {/* Main Header */}
      <header 
        className={`
          ${sticky ? 'sticky top-0 z-50' : ''} 
          ${transparent ? 'bg-transparent' : 'bg-white border-b'}
          transition-all duration-300
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {logoText}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Account */}
              {showAccount && (
                <Link
                  href="/account"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Cart */}
              {showCart && (
                <Link
                  href="/cart"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="py-4 border-t">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="container mx-auto px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export const schema = {
  name: 'Header',
  type: 'header',
  settings: [
    {
      type: 'heading',
      label: 'Logo'
    },
    {
      type: 'text',
      id: 'logoText',
      label: 'Logo Text',
      default: 'Store'
    },
    {
      type: 'heading',
      label: 'Layout & Style'
    },
    {
      type: 'select',
      id: 'header_style',
      label: 'Header Style',
      default: 'classic',
      options: [
        { value: 'classic', label: 'Classic' },
        { value: 'centered', label: 'Centered' },
        { value: 'minimal', label: 'Minimal' }
      ]
    },
    {
      type: 'checkbox',
      id: 'sticky',
      label: 'Sticky Header',
      default: true
    },
    {
      type: 'checkbox',
      id: 'transparent',
      label: 'Transparent Background',
      default: false
    },
    {
      type: 'heading',
      label: 'Components'
    },
    {
      type: 'checkbox',
      id: 'showSearch',
      label: 'Show Search',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showCart',
      label: 'Show Cart',
      default: true
    },
    {
      type: 'checkbox',
      id: 'show_cart_count',
      label: 'Show Cart Count',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showAccount',
      label: 'Show Account',
      default: true
    },
    {
      type: 'heading',
      label: 'Announcement Bar'
    },
    {
      type: 'checkbox',
      id: 'announcement.enabled',
      label: 'Enable Announcement',
      default: false
    },
    {
      type: 'text',
      id: 'announcement.text',
      label: 'Announcement Text',
      default: 'Free shipping on orders over $50!'
    },
    {
      type: 'color',
      id: 'announcement.backgroundColor',
      label: 'Background Color',
      default: '#6366f1'
    },
    {
      type: 'color',
      id: 'announcement.textColor',
      label: 'Text Color',
      default: '#ffffff'
    }
  ]
};