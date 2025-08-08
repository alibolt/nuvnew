'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Session } from 'next-auth';
import { 
  Package, ShoppingCart, DollarSign, Users, TrendingUp, Palette, Puzzle, Settings, 
  BarChart, FileText, Megaphone, BarChart3, FolderTree, Store, Tag, Mail, 
  ChevronDown, UserCog, Plus, LogOut, Command, Search, Menu, X
} from 'lucide-react';
import { CommandPalette } from './command-palette';
import type { Store as StoreType } from '@/types/store';

interface DashboardWrapperProps {
  store?: Store;
  allStores?: Store[];
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
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    setMobileSidebarOpen(false);
  };

  const handleStoreNav = (path: string) => {
    if (store) {
      router.push(`/dashboard/stores/${store.subdomain}/${path}`);
      setMobileSidebarOpen(false);
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

  // Determine active tab based on pathname
  const currentTab = pathname.split('/').pop() || 'overview';

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <aside 
        style={{
          width: sidebarCollapsed ? '64px' : '240px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          position: 'relative',
        }}
      >
        {/* Store Selector */}
        {!isAdmin && (
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {!sidebarCollapsed ? (
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
                <SelectTrigger className="nuvi-select-trigger" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={16} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{store?.name}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div style={{ fontWeight: '600', padding: '6px 8px', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                    STORES
                  </div>
                  {allStores?.map((s) => (
                    <SelectItem key={s.id} value={s.subdomain}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Store size={14} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '4px', paddingTop: '4px' }}>
                    <SelectItem value="add-store">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={14} />
                        Add New Store
                      </div>
                    </SelectItem>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '4px', paddingTop: '4px' }}>
                    <SelectItem value="settings">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCog size={14} />
                        Account Settings
                      </div>
                    </SelectItem>
                    <SelectItem value="signout">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={14} />
                        Sign Out
                      </div>
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
            ) : (
              <Store size={20} style={{ color: '#6b7280' }} />
            )}
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {isAdmin ? (
            adminTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleAdminNav(tab.path)}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '12px' : '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={sidebarCollapsed ? tab.label : undefined}
              >
                <tab.icon size={20} style={{ color: activeTab === tab.id ? '#111827' : '#6b7280', flexShrink: 0 }} />
                {!sidebarCollapsed && (
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: activeTab === tab.id ? '500' : '400',
                    color: activeTab === tab.id ? '#111827' : '#374151'
                  }}>
                    {tab.label}
                  </span>
                )}
              </button>
            ))
          ) : (
            storeTabs.map(tab => (
              <button
                key={tab.id}
                onClick={tab.action}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '12px' : '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: 'none',
                  backgroundColor: currentTab === tab.id ? '#f3f4f6' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (currentTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={sidebarCollapsed ? tab.label : undefined}
              >
                <tab.icon size={20} style={{ color: currentTab === tab.id ? '#111827' : '#6b7280', flexShrink: 0 }} />
                {!sidebarCollapsed && (
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: currentTab === tab.id ? '500' : '400',
                    color: currentTab === tab.id ? '#111827' : '#374151'
                  }}>
                    {tab.label}
                  </span>
                )}
              </button>
            ))
          )}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ChevronDown 
            size={14} 
            style={{ 
              transform: sidebarCollapsed ? 'rotate(-90deg)' : 'rotate(90deg)',
              transition: 'transform 0.2s'
            }} 
          />
        </button>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          height: '56px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="nuvi-lg:hidden"
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb or Page Title */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              {!isAdmin && store ? store.name : 'Admin Dashboard'}
            </h1>
          </div>

          {/* Search Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#6b7280',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <Search size={16} />
            <span className="nuvi-hidden nuvi-md:inline">Search</span>
            <kbd style={{
              padding: '2px 6px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}>
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
        }}>
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 40,
            }}
            onClick={() => setMobileSidebarOpen(false)}
            className="nuvi-lg:hidden"
          />
          <aside
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: '240px',
              backgroundColor: 'white',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
            }}
            className="nuvi-lg:hidden"
          >
            {/* Mobile sidebar content - same as desktop */}
            <div style={{ 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Menu</h2>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  padding: '4px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
              {/* Same navigation items as desktop */}
              {(isAdmin ? adminTabs : storeTabs).map(tab => (
                <button
                  key={tab.id}
                  onClick={isAdmin ? () => handleAdminNav(tab.path) : tab.action}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: 'none',
                    backgroundColor: (isAdmin ? activeTab : currentTab) === tab.id ? '#f3f4f6' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                  }}
                >
                  <tab.icon size={20} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px' }}>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}

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