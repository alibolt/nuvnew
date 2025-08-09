'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Package } from 'lucide-react';

interface HeaderProps {
  settings?: {
    logo?: string;
    logoText?: string;
    showSearch?: boolean;
    showCart?: boolean;
    showAccount?: boolean;
    sticky?: boolean;
  };
  store?: any;
}

export default function Header({ settings = {}, store }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const {
    logoText = store?.name || 'Skateshop',
    showSearch = true,
    showCart = true,
    showAccount = true,
    sticky = true
  } = settings;

  const categories = [
    { name: 'Skateboards', href: '/categories/skateboards' },
    { name: 'Clothing', href: '/categories/clothing' },
    { name: 'Shoes', href: '/categories/shoes' },
    { name: 'Accessories', href: '/categories/accessories' }
  ];

  return (
    <header className={`${sticky ? 'sticky top-0 z-50' : ''} bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Package className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {logoText}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 200)}
                  className="flex items-center gap-1 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Categories
                  <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/products"
                className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Products
              </Link>

              <Link
                href="/build-a-board"
                className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Build a Board
              </Link>

              <Link
                href="/about"
                className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {showSearch && (
              <>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {searchOpen && (
                  <div className="absolute top-16 left-0 right-0 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="container mx-auto">
                      <div className="relative max-w-2xl mx-auto">
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-full px-4 py-2 pr-10 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
                          autoFocus
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Account */}
            {showAccount && (
              <Link
                href="/sign-in"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            {showCart && (
              <Link
                href="/cart"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  0
                </span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <nav className="container mx-auto px-4 py-4">
            <div className="space-y-1">
              <div className="py-2">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Categories
                </p>
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2">
                <Link
                  href="/products"
                  className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/build-a-board"
                  className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Build a Board
                </Link>
                <Link
                  href="/about"
                  className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
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
      default: 'Skateshop'
    },
    {
      type: 'select',
      id: 'logo_style',
      label: 'Logo Style',
      default: 'text',
      options: [
        { value: 'text', label: 'Text Only' },
        { value: 'icon', label: 'Icon Only' },
        { value: 'both', label: 'Icon + Text' }
      ]
    },
    {
      type: 'heading',
      label: 'Layout & Style'
    },
    {
      type: 'select',
      id: 'header_style',
      label: 'Header Style',
      default: 'minimal',
      options: [
        { value: 'minimal', label: 'Minimal' },
        { value: 'bold', label: 'Bold' },
        { value: 'transparent', label: 'Transparent' }
      ]
    },
    {
      type: 'checkbox',
      id: 'sticky',
      label: 'Sticky Header',
      default: false
    },
    {
      type: 'heading',
      label: 'Navigation'
    },
    {
      type: 'select',
      id: 'menu_style',
      label: 'Menu Style',
      default: 'dropdown',
      options: [
        { value: 'dropdown', label: 'Dropdown' },
        { value: 'mega', label: 'Mega Menu' },
        { value: 'sidebar', label: 'Sidebar' }
      ]
    },
    {
      type: 'checkbox',
      id: 'show_categories',
      label: 'Show Categories Dropdown',
      default: true
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
      id: 'show_announcement',
      label: 'Show Announcement Bar',
      default: true
    },
    {
      type: 'text',
      id: 'announcement_text',
      label: 'Announcement Text',
      default: 'Free shipping on orders over $100! 🛹'
    }
  ]
};