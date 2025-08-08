'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Package, ShoppingCart, Users, FileText, Settings,
  Palette, BarChart, Megaphone, FolderTree, Puzzle, Store,
  Command, X, ArrowRight, Clock, Hash, Mail, CreditCard,
  Globe, Shield, Truck, Gift, Languages, MapPin, Receipt,
  UserCog, Building, Tag, DollarSign, TrendingUp, Edit3
} from 'lucide-react';

interface CommandPaletteProps {
  store?: {
    id: string;
    name: string;
    subdomain: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({ store, isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any>({
    products: [],
    customers: [],
    orders: []
  });
  const [isSearching, setIsSearching] = useState(false);

  // Load recent commands from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCommands');
    if (saved) {
      setRecentCommands(JSON.parse(saved));
    }
  }, []);

  // Search for products, customers, orders
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults({ products: [], customers: [], orders: [] });
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        console.log('Searching for:', searchQuery, 'in store:', store?.subdomain);
        
        // Search products
        const productsRes = await fetch(`/api/stores/${store?.subdomain}/products?search=${searchQuery}&limit=5`, {
          credentials: 'include'
        });
        
        let productsData = { products: [] };
        
        if (productsRes.ok) {
          productsData = await productsRes.json();
        } else {
          const errorData = await productsRes.json();
          console.error('Products API error:', productsRes.status, errorData);
          // If unauthorized, still continue with empty results
          if (productsRes.status === 401) {
            console.warn('Products search unauthorized - continuing with empty results');
          }
        }
        
        console.log('Products response:', productsData);
        
        // Search customers
        const customersRes = await fetch(`/api/stores/${store?.subdomain}/customers?search=${searchQuery}&limit=5`, {
          credentials: 'include'
        });
        const customersData = await customersRes.json();
        
        // Search orders
        const ordersRes = await fetch(`/api/stores/${store?.subdomain}/orders?search=${searchQuery}&limit=5`, {
          credentials: 'include'
        });
        const ordersData = await ordersRes.json();

        console.log('API Responses:', {
          productsRes: { ok: productsRes.ok, status: productsRes.status },
          customersRes: { ok: customersRes.ok, status: customersRes.status },
          ordersRes: { ok: ordersRes.ok, status: ordersRes.status }
        });

        console.log('Search Results:', {
          products: productsData.products || [],
          customers: customersData.customers || [],
          orders: ordersData.orders || []
        });
        
        setSearchResults({
          products: productsData.products || [],
          customers: customersData.customers || [],
          orders: ordersData.orders || []
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, store?.subdomain]);

  // Define all available commands
  const commands: CommandItem[] = store ? [
    // Navigation
    { 
      id: 'nav-overview',
      label: 'Go to Overview',
      icon: BarChart,
      category: 'Navigation',
      shortcut: '⌘O',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/overview`),
      keywords: ['dashboard', 'home', 'stats']
    },
    { 
      id: 'nav-products',
      label: 'Go to Products',
      icon: Package,
      category: 'Navigation',
      shortcut: '⌘P',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/products`),
      keywords: ['items', 'inventory', 'catalog']
    },
    { 
      id: 'nav-orders',
      label: 'Go to Orders',
      icon: ShoppingCart,
      category: 'Navigation',
      shortcut: '⌘D',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/orders`),
      keywords: ['sales', 'purchases', 'transactions']
    },
    { 
      id: 'nav-customers',
      label: 'Go to Customers',
      icon: Users,
      category: 'Navigation',
      shortcut: '⌘U',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/customers`),
      keywords: ['users', 'clients', 'buyers']
    },
    { 
      id: 'nav-marketing',
      label: 'Go to Marketing',
      icon: Megaphone,
      category: 'Navigation',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/marketing`),
      keywords: ['campaigns', 'email', 'promotions']
    },
    { 
      id: 'nav-analytics',
      label: 'Go to Analytics',
      icon: TrendingUp,
      category: 'Navigation',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/analytics`),
      keywords: ['reports', 'stats', 'metrics']
    },
    { 
      id: 'nav-theme-studio',
      label: 'Open Theme Studio',
      icon: Edit3,
      category: 'Navigation',
      shortcut: '⌘T',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/theme-studio`),
      keywords: ['design', 'customize', 'editor']
    },
    { 
      id: 'nav-design',
      label: 'Go to Design Center',
      icon: Palette,
      category: 'Navigation',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/design`),
      keywords: ['themes', 'templates', 'appearance']
    },

    // Quick Actions
    { 
      id: 'action-add-product',
      label: 'Add New Product',
      description: 'Create a new product listing',
      icon: Package,
      category: 'Quick Actions',
      shortcut: '⌘N',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/products?view=create`),
      keywords: ['new', 'create', 'add']
    },
    { 
      id: 'action-create-order',
      label: 'Create Manual Order',
      description: 'Create an order manually',
      icon: ShoppingCart,
      category: 'Quick Actions',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/orders/create`),
      keywords: ['manual', 'new']
    },
    { 
      id: 'action-add-customer',
      label: 'Add New Customer',
      description: 'Register a new customer',
      icon: Users,
      category: 'Quick Actions',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/customers/new`),
      keywords: ['register', 'user']
    },
    { 
      id: 'action-create-campaign',
      label: 'Create Marketing Campaign',
      description: 'Start a new marketing campaign',
      icon: Megaphone,
      category: 'Quick Actions',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/marketing?tab=campaigns&view=create`),
      keywords: ['email', 'promotion']
    },

    // Settings
    { 
      id: 'settings-general',
      label: 'General Settings',
      icon: Settings,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings`),
      keywords: ['store', 'config']
    },
    { 
      id: 'settings-payments',
      label: 'Payment Settings',
      icon: CreditCard,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/payments`),
      keywords: ['stripe', 'checkout']
    },
    { 
      id: 'settings-shipping',
      label: 'Shipping Settings',
      icon: Truck,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/shipping`),
      keywords: ['delivery', 'zones']
    },
    { 
      id: 'settings-taxes',
      label: 'Tax Settings',
      icon: Receipt,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/taxes`),
      keywords: ['vat', 'rates']
    },
    { 
      id: 'settings-domains',
      label: 'Domain Settings',
      icon: Globe,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/domains`),
      keywords: ['url', 'custom']
    },
    { 
      id: 'settings-emails',
      label: 'Email Settings',
      icon: Mail,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/emails`),
      keywords: ['smtp', 'templates']
    },
    { 
      id: 'settings-custom-data',
      label: 'Custom Data Settings',
      icon: FileText,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/custom-data`),
      keywords: ['fields', 'metadata', 'custom fields', 'attributes']
    },
    { 
      id: 'settings-checkout',
      label: 'Checkout Settings',
      icon: CreditCard,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/checkout`),
      keywords: ['cart', 'payment', 'checkout process']
    },
    { 
      id: 'settings-currency',
      label: 'Currency Settings',
      icon: DollarSign,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/currency`),
      keywords: ['money', 'exchange', 'rates']
    },
    { 
      id: 'settings-languages',
      label: 'Language Settings',
      icon: Languages,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/languages`),
      keywords: ['translation', 'locale', 'i18n']
    },
    { 
      id: 'settings-locations',
      label: 'Location Settings',
      icon: MapPin,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/locations`),
      keywords: ['warehouse', 'store locations', 'address']
    },
    { 
      id: 'settings-policies',
      label: 'Store Policies',
      icon: Shield,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/policies`),
      keywords: ['privacy', 'terms', 'refund', 'legal']
    },
    { 
      id: 'settings-gift-cards',
      label: 'Gift Card Settings',
      icon: Gift,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/gift-cards`),
      keywords: ['voucher', 'coupon', 'gift']
    },
    { 
      id: 'settings-users',
      label: 'Users & Permissions',
      icon: UserCog,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/users`),
      keywords: ['staff', 'permissions', 'roles', 'access']
    },
    { 
      id: 'settings-plan',
      label: 'Plan & Billing',
      icon: CreditCard,
      category: 'Settings',
      action: () => router.push(`/dashboard/stores/${store.subdomain}/settings/plan`),
      keywords: ['subscription', 'billing', 'upgrade', 'plan']
    },

    // View Store
    { 
      id: 'view-store',
      label: 'View Live Store',
      description: 'Open your store in a new tab',
      icon: Store,
      category: 'Quick Actions',
      shortcut: '⌘L',
      action: () => window.open(`http://localhost:3000/s/${store.subdomain}`, '_blank'),
      keywords: ['preview', 'live', 'website']
    },
  ] : [];

  // Filter commands based on search
  const filteredCommands = commands.filter(cmd => {
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query) ||
      cmd.keywords?.some(k => k.includes(query))
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Get recent commands
  const recentCommandItems = recentCommands
    .map(id => commands.find(cmd => cmd.id === id))
    .filter(Boolean) as CommandItem[];

  // Handle command execution
  const executeCommand = useCallback((cmd: CommandItem) => {
    // Save to recent commands
    const newRecent = [cmd.id, ...recentCommands.filter(id => id !== cmd.id)].slice(0, 5);
    setRecentCommands(newRecent);
    localStorage.setItem('recentCommands', JSON.stringify(newRecent));
    
    // Execute action and close
    cmd.action();
    onClose();
    setSearchQuery('');
    setSelectedIndex(0);
  }, [recentCommands, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const allCommands = filteredCommands.length > 0 ? filteredCommands : recentCommandItems;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % allCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + allCommands.length) % allCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (allCommands[selectedIndex]) {
            executeCommand(allCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, recentCommandItems, selectedIndex, executeCommand, onClose]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
        onClick={onClose}
      />
      
      {/* Command Palette Modal */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          zIndex: 1001,
          overflow: 'hidden',
        }}
      >
        {/* Search Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type a command or search..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {/* Loading State */}
          {isSearching && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
              Searching...
            </div>
          )}

          {/* Search Results - Products */}
          {searchQuery && searchResults.products.length > 0 && (
            <div style={{ padding: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', padding: '8px 12px' }}>
                PRODUCTS
              </div>
              {searchResults.products.map((product: any, index: number) => (
                <div
                  key={`product-${product.id}`}
                  onClick={() => {
                    router.push(`/dashboard/stores/${store?.subdomain}/products/${product.id}/edit`);
                    onClose();
                  }}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Package size={16} style={{ color: '#6B7280' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{product.title || product.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      ${product.variants?.[0]?.price || product.price || 0} • {product.variants?.[0]?.inventory || product.inventory || 0} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results - Customers */}
          {searchQuery && searchResults.customers.length > 0 && (
            <div style={{ padding: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', padding: '8px 12px' }}>
                CUSTOMERS
              </div>
              {searchResults.customers.map((customer: any, index: number) => (
                <div
                  key={`customer-${customer.id}`}
                  onClick={() => {
                    router.push(`/dashboard/stores/${store?.subdomain}/customers/${customer.id}`);
                    onClose();
                  }}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Users size={16} style={{ color: '#6B7280' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{customer.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results - Orders */}
          {searchQuery && searchResults.orders.length > 0 && (
            <div style={{ padding: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', padding: '8px 12px' }}>
                ORDERS
              </div>
              {searchResults.orders.map((order: any, index: number) => (
                <div
                  key={`order-${order.id}`}
                  onClick={() => {
                    router.push(`/dashboard/stores/${store?.subdomain}/orders/${order.id}`);
                    onClose();
                  }}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ShoppingCart size={16} style={{ color: '#6B7280' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      Order #{order.orderNumber || order.id}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      ${order.totalPrice || order.total || 0} • {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Commands */}
          {searchQuery === '' && recentCommandItems.length > 0 && (
            <div style={{ padding: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', padding: '8px 12px' }}>
                RECENT
              </div>
              {recentCommandItems.map((cmd, index) => (
                <CommandButton
                  key={cmd.id}
                  command={cmd}
                  isSelected={index === selectedIndex}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                />
              ))}
            </div>
          )}

          {/* Command Categories */}
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} style={{ padding: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', padding: '8px 12px' }}>
                {category.toUpperCase()}
              </div>
              {cmds.map((cmd, index) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                return (
                  <CommandButton
                    key={cmd.id}
                    command={cmd}
                    isSelected={globalIndex === selectedIndex}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  />
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
              No commands found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Command Button Component
function CommandButton({ 
  command, 
  isSelected, 
  onClick, 
  onMouseEnter 
}: { 
  command: CommandItem;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  const Icon = command.icon;
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        width: '100%',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isSelected ? '#F3F4F6' : 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#F9FAFB';
        }
      }}
      onMouseOut={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon size={18} style={{ color: '#6B7280' }} />
        <span style={{ fontSize: '14px' }}>{command.label}</span>
      </div>
      {command.shortcut && (
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{command.shortcut}</span>
      )}
    </button>
  );
}