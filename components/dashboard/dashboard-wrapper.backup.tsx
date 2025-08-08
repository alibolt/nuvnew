'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Session } from 'next-auth';
import { 
  Package, ShoppingCart, DollarSign, Users, TrendingUp, Palette, Puzzle, Settings, BarChart, FileText, Megaphone, BarChart3, FolderTree, Store, Tag, Mail, ChevronDown, UserCog, Plus, LogOut, Command, Search
} from 'lucide-react';
import { CommandPalette } from './command-palette';
import type { Store as StoreType } from '@/types/store';

// Store type imported from @/types/store

// Session interface imported from next-auth

interface DashboardWrapperProps {
  store?: Store; // Make store optional for admin view
  allStores?: Store[]; // Make allStores optional for admin view
  session: Session;
  children: React.ReactNode;
  activeTab?: string;
  hideTabNavigation?: boolean;
}

export function DashboardWrapper({ 
  store, 
  allStores, 
  session, 
  children, 
  activeTab,
  hideTabNavigation = false 
}: DashboardWrapperProps) {
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const isAdmin = session.user.role === 'admin';

  // Add keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdminNav = (path: string) => {
    router.push(path);
  };

  const handleStoreNav = (path: string) => {
    if (store) {
      router.push(`/dashboard/stores/${store.subdomain}/${path}`);
    }
  };

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'stores', label: 'Stores', icon: Store, path: '/admin/stores' },
    { id: 'email-packages', label: 'Email Packages', icon: Mail, path: '/admin/email-packages' },
    { id: 'blog', label: 'Blog', icon: FileText, path: '/admin/blog' },
    { id: 'finance', label: 'Finance', icon: DollarSign, path: '/admin/finance' },
    { id: 'pricing', label: 'Pricing Plans', icon: DollarSign, path: '/admin/pricing' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    // Add other admin tabs here e.g. Stores, Settings
  ];

  const storeTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, action: () => handleStoreNav('overview') },
    { id: 'products', label: 'Products', icon: Package, action: () => handleStoreNav('products') },
    { id: 'categories', label: 'Categories', icon: FolderTree, action: () => handleStoreNav('categories') },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, action: () => handleStoreNav('orders') },
    { id: 'customers', label: 'Customers', icon: Users, action: () => handleStoreNav('customers') },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, action: () => handleStoreNav('marketing') },
    { id: 'content', label: 'Content', icon: FileText, action: () => handleStoreNav('content') },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, action: () => handleStoreNav('analytics') },
    { id: 'themes', label: 'Themes', icon: Palette, action: () => handleStoreNav('themes') },
    { id: 'apps', label: 'Apps', icon: Puzzle, action: () => handleStoreNav('apps') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => handleStoreNav('settings') },
  ];

  return (
    <div className="nuvi-dashboard">
      <div className="nuvi-tabs">
        <div className="nuvi-tabs-list">
          <div className="nuvi-tabs-left">
            {isAdmin ? (
              <div className="nuvi-tabs-left">
                {/* Admin Panel text and its container removed as per user request */}
              </div>
            ) : (
              <div className="nuvi-tabs-left">
                <Select value={store?.subdomain} onValueChange={(value) => {
                  if (value === 'add-store') {
                    router.push('/dashboard/stores/new');
                  } else if (value === 'settings') {
                    router.push('/dashboard/settings');
                  } else if (value === 'signout') {
                    router.push('/api/auth/signout');
                  } else {
                    router.push(`/dashboard/stores/${value}`);
                  }
                }}>
                  <SelectTrigger className="nuvi-select-trigger nuvi-store-selector">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Store className="h-4 w-4" />
                      <span className="nuvi-hidden nuvi-md:inline">{store?.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="nuvi-font-semibold nuvi-px-2 nuvi-py-1.5 nuvi-text-sm nuvi-text-muted nuvi-border-b">
                      Stores
                    </div>
                    {allStores?.map((s) => (
                      <SelectItem key={s.id} value={s.subdomain}>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <Store className="h-4 w-4" />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                    <div className="nuvi-border-t nuvi-mt-1 nuvi-pt-1">
                      <SelectItem value="add-store">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <Plus className="h-4 w-4" />
                          Add New Store
                        </div>
                      </SelectItem>
                    </div>
                    <div className="nuvi-border-t nuvi-mt-1 nuvi-pt-1">
                      <SelectItem value="settings">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <UserCog className="h-4 w-4" />
                          Account Settings
                        </div>
                      </SelectItem>
                      <SelectItem value="signout">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </div>
                      </SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {!hideTabNavigation && (
            <div className="nuvi-tabs-center">
              {isAdmin ? (
                adminTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleAdminNav(tab.path)}
                    className={`nuvi-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="nuvi-tab-label">{tab.label}</span>
                  </button>
                ))
              ) : (
                storeTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={tab.action}
                    className={`nuvi-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="nuvi-tab-label">{tab.label}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Search Button */}
          <div className="nuvi-tabs-right">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-flex nuvi-items-center nuvi-gap-sm"
              title="Quick Search (⌘K)"
            >
              <Search className="h-4 w-4" />
              <span className="nuvi-hidden nuvi-lg:inline nuvi-text-sm">Search</span>
              <kbd className="nuvi-hidden nuvi-lg:inline nuvi-px-sm nuvi-py-xs nuvi-bg-gray-100 nuvi-rounded nuvi-text-xs">⌘K</kbd>
            </button>
          </div>
        </div>
      </div>

      <div className="nuvi-tab-content nuvi-container"> {/* Added nuvi-container here */}
        {children}
      </div>

      {/* Command Palette */}
      {store && (
        <CommandPalette 
          store={store}
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}
    </div>
  );
}