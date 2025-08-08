'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, Home, ShoppingBag, Search, User, ShoppingCart, Package, X, LogIn, UserPlus } from 'lucide-react';

interface PageSelectorProps {
  selectedPage: string;
  pages: any[];
  onSelectPage: (pageId: string) => void;
  onClose: () => void;
}

const PAGE_ICONS = {
  homepage: Home,
  product: ShoppingBag,
  collection: Package,
  search: Search,
  account: User,
  cart: ShoppingCart,
  login: LogIn,
  register: UserPlus,
};

const BUILT_IN_PAGES = [
  { id: 'homepage', name: 'Home', type: 'homepage' },
  { id: 'product', name: 'Product', type: 'product' },
  { id: 'collection', name: 'Collection', type: 'collection' },
  { id: 'search', name: 'Search', type: 'search' },
  { id: 'account', name: 'Account', type: 'account' },
  { id: 'cart', name: 'Cart', type: 'cart' },
  { id: 'login', name: 'Login', type: 'login' },
  { id: 'register', name: 'Register', type: 'register' },
];

export function PageSelector({ selectedPage, pages, onSelectPage, onClose }: PageSelectorProps) {
  // Combine built-in pages with custom pages
  const customPages = pages.filter(p => !BUILT_IN_PAGES.find(bp => bp.id === p.id));

  return (
    <div 
      className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 max-h-[400px] overflow-y-auto"
      data-page-selector
    >
      <div className="p-3">
        {/* Built-in Pages */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">System Pages</h4>
          <div className="space-y-1">
            {BUILT_IN_PAGES.map((page) => {
              const Icon = PAGE_ICONS[page.type as keyof typeof PAGE_ICONS] || FileText;
              const isSelected = selectedPage === page.id;

              return (
                <button
                  key={page.id}
                  onClick={() => {
                    onSelectPage(page.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-left",
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{page.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Pages */}
        {customPages.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Custom Pages</h4>
            <div className="space-y-1">
              {customPages.map((page) => {
                const isSelected = selectedPage === page.id;

                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-left",
                      isSelected
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{page.title || page.name}</p>
                      {(page.handle || page.slug) && (
                        <p className="text-xs text-gray-500 truncate">/{page.handle || page.slug}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}