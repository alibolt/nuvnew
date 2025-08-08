'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, ChevronRight, ChevronDown, Home, Package, Folder, FileText, 
  Users, ShoppingBag, Store, Truck, CreditCard, Shield,
  HelpCircle, Mail, ExternalLink, Hash, Link as LinkIcon, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkSelectorProps {
  value: string;
  onChange: (value: string, label?: string) => void;
  subdomain: string;
  onClose?: () => void;
}

interface LinkOption {
  label: string;
  value: string;
  type: 'page' | 'collection' | 'product' | 'external' | 'home' | 'custom';
  icon?: React.ReactNode;
  description?: string;
}

interface LinkGroup {
  title: string;
  items: LinkOption[];
  loading?: boolean;
}

export function LinkSelector({ value, onChange, subdomain, onClose }: LinkSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [linkGroups, setLinkGroups] = useState<LinkGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Main Pages': true // Only Main Pages is expanded by default
  });
  const [customUrl, setCustomUrl] = useState(value || '');
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch available links
  useEffect(() => {
    fetchAvailableLinks();
  }, [subdomain]);

  const fetchAvailableLinks = async () => {
    setLoading(true);
    try {
      // Fetch collections, pages, and products in parallel
      const [collectionsRes, pagesRes, productsRes] = await Promise.all([
        fetch(`/api/stores/${subdomain}/categories`),
        fetch(`/api/stores/${subdomain}/pages`),
        fetch(`/api/stores/${subdomain}/products?limit=20`)
      ]);

      // Handle API response formats
      const collectionsData = collectionsRes.ok ? await collectionsRes.json() : [];
      const collections = Array.isArray(collectionsData) ? collectionsData : (collectionsData.data || []);
      
      const pagesData = pagesRes.ok ? await pagesRes.json() : { data: [] };
      const pages = Array.isArray(pagesData) ? pagesData : (pagesData.data || []);
      
      const productsData = productsRes.ok ? await productsRes.json() : { data: [] };
      const products = Array.isArray(productsData) ? productsData : (productsData.data || []);

      // Build link groups
      const groups: LinkGroup[] = [
        {
          title: 'Main Pages',
          items: [
            { label: 'Home', value: '/', type: 'home', icon: <Home className="h-3.5 w-3.5" /> },
            { label: 'All Products', value: '/products', type: 'page', icon: <Package className="h-3.5 w-3.5" /> },
            { label: 'Collections', value: '/collections', type: 'page', icon: <Folder className="h-3.5 w-3.5" /> },
            { label: 'Search', value: '/search', type: 'page', icon: <Search className="h-3.5 w-3.5" /> },
            { label: 'Cart', value: '/cart', type: 'page', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
            { label: 'Account', value: '/account', type: 'page', icon: <Users className="h-3.5 w-3.5" /> },
          ]
        },
        {
          title: 'Collections',
          items: Array.isArray(collections) ? collections.map((collection: any) => ({
            label: collection.name,
            value: `/collections/${collection.slug}`,
            type: 'collection' as const,
            icon: <Folder className="h-3.5 w-3.5" />
          })) : []
        },
        {
          title: 'Pages',
          items: Array.isArray(pages) ? pages.map((page: any) => ({
            label: page.title,
            value: `/pages/${page.slug}`,
            type: 'page' as const,
            icon: <FileText className="h-3.5 w-3.5" />
          })) : []
        },
        {
          title: 'Products',
          items: Array.isArray(products) ? products.slice(0, 10).map((product: any) => ({
            label: product.name,
            value: `/products/${product.slug}`,
            type: 'product' as const,
            icon: <Package className="h-3.5 w-3.5" />,
            description: product.price ? `$${product.price}` : ''
          })) : []
        },
        {
          title: 'Policies',
          items: [
            { label: 'Privacy Policy', value: '/policies/privacy', type: 'page', icon: <Shield className="h-3.5 w-3.5" /> },
            { label: 'Terms of Service', value: '/policies/terms', type: 'page', icon: <FileText className="h-3.5 w-3.5" /> },
            { label: 'Refund Policy', value: '/policies/refund', type: 'page', icon: <CreditCard className="h-3.5 w-3.5" /> },
            { label: 'Shipping Policy', value: '/policies/shipping', type: 'page', icon: <Truck className="h-3.5 w-3.5" /> },
          ]
        },
        {
          title: 'Other',
          items: [
            { label: 'Contact', value: '/contact', type: 'page', icon: <Mail className="h-3.5 w-3.5" /> },
            { label: 'About Us', value: '/about', type: 'page', icon: <Store className="h-3.5 w-3.5" /> },
            { label: 'FAQ', value: '/faq', type: 'page', icon: <HelpCircle className="h-3.5 w-3.5" /> },
            { label: 'Blog', value: '/blog', type: 'page', icon: <FileText className="h-3.5 w-3.5" /> },
          ]
        }
      ];

      setLinkGroups(groups.filter(group => group.items.length > 0));
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search
  const getFilteredItems = () => {
    if (!searchTerm) return linkGroups;

    return linkGroups.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.items.length > 0);
  };

  const handleSelectLink = (link: string, label?: string) => {
    onChange(link, label);
    onClose?.();
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredGroups = getFilteredItems();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Search Header */}
      <div className="p-1.5 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-7 pr-2 py-1 text-xs border-0 bg-transparent
                     focus:outline-none focus:ring-0 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin h-5 w-5 border-2 border-gray-300 rounded-full border-t-transparent"></div>
            <p className="mt-2 text-xs text-gray-500">Loading...</p>
          </div>
        ) : (
          <>

            {/* All Groups with Collapsible Headers */}
            {filteredGroups.map((group, index) => {
              const isExpanded = expandedGroups[group.title] || false;
              
              return (
                <div key={group.title} className={cn(
                  index > 0 && "border-t border-gray-200 dark:border-gray-700",
                  group.items.length === 0 && "hidden"
                )}>
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {group.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-2 pb-2">
                      <div className="max-h-32 overflow-y-auto">
                        {group.items.map((item) => (
                          <button
                            key={item.value}
                            onClick={() => handleSelectLink(item.value, item.label)}
                            className={cn(
                              "w-full px-2 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left transition-colors",
                              value === item.value && "bg-blue-50 dark:bg-blue-900/20"
                            )}
                          >
                            <span className="text-gray-400 flex-shrink-0">{item.icon}</span>
                            <span className="text-sm truncate">{item.label}</span>
                            {item.description && (
                              <span className="text-xs text-gray-400 ml-auto">{item.description}</span>
                            )}
                            {value === item.value && <Check className="h-3 w-3 text-blue-500 ml-auto flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredGroups.length === 0 && searchTerm && (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No pages found matching "{searchTerm}"</p>
              </div>
            )}

            {/* Custom URL - Inline Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-1.5">
              <div className="flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3 text-gray-400 flex-shrink-0 ml-0.5" />
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customUrl) {
                        // Extract a label from the URL (last segment without extension)
                        const segments = customUrl.split('/').filter(s => s);
                        const lastSegment = segments[segments.length - 1] || 'Custom Link';
                        const label = lastSegment.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
                        const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
                        
                        handleSelectLink(customUrl, formattedLabel);
                      }
                    }
                  }}
                  placeholder="Custom URL..."
                  className="flex-1 px-1.5 py-0.5 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                />
                {customUrl && (
                  <button
                    onClick={() => {
                      // Extract a label from the URL (last segment without extension)
                      const segments = customUrl.split('/').filter(s => s);
                      const lastSegment = segments[segments.length - 1] || 'Custom Link';
                      const label = lastSegment.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
                      const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
                      
                      handleSelectLink(customUrl, formattedLabel);
                    }}
                    className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded text-[10px] hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}