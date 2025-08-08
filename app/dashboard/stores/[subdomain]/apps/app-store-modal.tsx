'use client';

import { useState } from 'react';
import { X, Search, Star, Users, Download, Check, TrendingUp, Zap, Shield, Globe, Package, Mail, BarChart, MessageSquare, Truck, CreditCard, Tags, Database, FileSearch } from 'lucide-react';
import { toast } from 'sonner';

interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: (appId: string) => void;
  installedApps: string[];
  subdomain: string;
}

interface AppListing {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  developer: string;
  rating: number;
  installs: string;
  price: string;
  features: string[];
}

const categories = [
  { id: 'all', name: 'All Apps', icon: Package },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  { id: 'analytics', name: 'Analytics', icon: BarChart },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck },
  { id: 'payments', name: 'Payments', icon: CreditCard },
  { id: 'inventory', name: 'Inventory', icon: Database },
  { id: 'loyalty', name: 'Loyalty & Rewards', icon: Tags },
  { id: 'search', name: 'Search & Discovery', icon: FileSearch },
];

const appListings: AppListing[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp Integration',
    description: 'Connect your store with Mailchimp for email marketing campaigns',
    category: 'marketing',
    icon: Mail,
    developer: 'Mailchimp',
    rating: 4.8,
    installs: '10K+',
    price: 'Free - $299/mo',
    features: ['Email campaigns', 'Customer segmentation', 'Automation', 'Analytics']
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track your store performance with Google Analytics',
    category: 'analytics',
    icon: BarChart,
    developer: 'Google',
    rating: 4.9,
    installs: '50K+',
    price: 'Free',
    features: ['Traffic tracking', 'Conversion tracking', 'E-commerce reports', 'Real-time data']
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    description: 'Track conversions and create targeted ads on Facebook',
    category: 'marketing',
    icon: Globe,
    developer: 'Meta',
    rating: 4.5,
    installs: '25K+',
    price: 'Free',
    features: ['Conversion tracking', 'Retargeting', 'Lookalike audiences', 'Dynamic ads']
  },
  {
    id: 'live-chat',
    name: 'Live Chat Support',
    description: 'Add live chat to your store for customer support',
    category: 'communication',
    icon: MessageSquare,
    developer: 'ChatCo',
    rating: 4.7,
    installs: '15K+',
    price: '$19 - $99/mo',
    features: ['Live chat widget', 'Visitor tracking', 'Chat history', 'Mobile app']
  },
  {
    id: 'shipping-easy',
    name: 'ShippingEasy',
    description: 'Simplify your shipping with automated label printing',
    category: 'shipping',
    icon: Truck,
    developer: 'ShippingEasy',
    rating: 4.6,
    installs: '8K+',
    price: '$29 - $99/mo',
    features: ['Label printing', 'Rate comparison', 'Tracking', 'Batch shipping']
  },
  {
    id: 'stripe-payments',
    name: 'Stripe Payments',
    description: 'Accept payments with Stripe payment gateway',
    category: 'payments',
    icon: CreditCard,
    developer: 'Stripe',
    rating: 4.9,
    installs: '30K+',
    price: '2.9% + 30¢',
    features: ['Credit cards', 'Digital wallets', 'International payments', 'Fraud protection']
  },
  {
    id: 'inventory-sync',
    name: 'Inventory Sync Pro',
    description: 'Sync inventory across multiple channels',
    category: 'inventory',
    icon: Database,
    developer: 'SyncPro',
    rating: 4.4,
    installs: '5K+',
    price: '$49 - $199/mo',
    features: ['Multi-channel sync', 'Low stock alerts', 'Bulk updates', 'Barcode scanning']
  },
  {
    id: 'loyalty-rewards',
    name: 'Loyalty & Rewards',
    description: 'Create a loyalty program to retain customers',
    category: 'loyalty',
    icon: Tags,
    developer: 'RewardsCo',
    rating: 4.8,
    installs: '12K+',
    price: '$29 - $299/mo',
    features: ['Points system', 'VIP tiers', 'Referral program', 'Email automation']
  },
  {
    id: 'smart-search',
    name: 'Smart Search & Discovery',
    description: 'Advanced search with AI-powered suggestions, analytics, and personalization',
    category: 'search',
    icon: FileSearch,
    developer: 'Nuvi',
    rating: 5.0,
    installs: '2K+',
    price: 'Free - $99/mo',
    features: ['AI suggestions', 'Search analytics', 'Synonym management', 'Faceted filtering', 'No-results optimization', 'Real-time indexing']
  }
];

export function AppStoreModal({ isOpen, onClose, onInstall, installedApps, subdomain }: AppStoreModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installingApp, setInstallingApp] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredApps = appListings.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = async (appId: string) => {
    setInstallingApp(appId);
    try {
      const response = await fetch(`/api/stores/${subdomain}/apps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appCode: appId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to install app');
      }

      onInstall(appId);
      toast.success('App installed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to install app');
    } finally {
      setInstallingApp(null);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1200px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>App Store</h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Discover apps to enhance your store</p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search apps..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#8B9F7E'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Categories Sidebar */}
          <div className="nuvi-w-64 nuvi-border-r nuvi-p-md nuvi-overflow-y-auto">
            <h3 className="nuvi-font-medium nuvi-mb-md">Categories</h3>
            <div className="nuvi-space-y-xs">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`nuvi-w-full nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-sm nuvi-rounded nuvi-text-left nuvi-transition ${
                      selectedCategory === category.id 
                        ? 'nuvi-bg-primary/10 nuvi-text-primary' 
                        : 'nuvi-hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="nuvi-text-sm">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apps Grid */}
          <div className="nuvi-flex-1 nuvi-p-md nuvi-overflow-y-auto">
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-md">
              {filteredApps.map(app => {
                const Icon = app.icon;
                const isInstalled = installedApps.includes(app.id);
                const isInstalling = installingApp === app.id;
                
                return (
                  <div key={app.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                    <Icon className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-xs">{app.name}</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">{app.description}</p>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-md nuvi-text-xs">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                        <Star className="h-3 w-3 nuvi-text-yellow-500 nuvi-fill-current" />
                        <span>{app.rating}</span>
                      </div>
                      <span className="nuvi-text-muted">•</span>
                      <span className="nuvi-text-muted">{app.installs} installs</span>
                    </div>
                    <button
                      onClick={() => handleInstall(app.id)}
                      disabled={isInstalled || isInstalling}
                      className={`nuvi-btn nuvi-btn-sm nuvi-w-full ${
                        isInstalled ? 'nuvi-btn-secondary' : 'nuvi-btn-primary'
                      }`}
                    >
                      {isInstalled ? (
                        <>
                          <Check className="h-4 w-4" />
                          Installed
                        </>
                      ) : isInstalling ? (
                        <>
                          <div className="nuvi-loading-spinner nuvi-loading-sm" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Install
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            
            {filteredApps.length === 0 && (
              <div className="nuvi-text-center nuvi-py-xl">
                <Package className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                <p className="nuvi-text-muted">No apps found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}