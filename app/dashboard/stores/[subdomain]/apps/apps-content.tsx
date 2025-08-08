'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Search, Plug, Upload, Mail, BarChart2, Zap, Trash2, Loader2, CreditCard
} from 'lucide-react';
import { AppStoreModal } from './app-store-modal';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface App {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  developer: string;
  version: string;
  pricing: any;
  features: string[];
}

interface AppInstall {
  id: string;
  storeId: string;
  appId: string;
  status: string;
  settings: any;
  installedAt: string;
  app: App;
}

interface AppsContentProps {
  store: StoreData;
}

export function AppsContent({ store }: AppsContentProps) {
  const router = useRouter();
  const [installedApps, setInstalledApps] = useState<AppInstall[]>([]);
  const [loading, setLoading] = useState(true);
  const [installingApp, setInstallingApp] = useState<string | null>(null);
  const [removingApp, setRemovingApp] = useState<string | null>(null);
  const [showAppStore, setShowAppStore] = useState(false);

  useEffect(() => {
    fetchInstalledApps();
  }, []);

  const fetchInstalledApps = async () => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/apps`);
      if (response.ok) {
        const data = await response.json();
        // Handle both old and new API response formats
        if (data.success && data.data) {
          setInstalledApps(data.data.apps || []);
        } else {
          setInstalledApps(data.apps || []);
        }
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const installApp = async (appCode: string) => {
    setInstallingApp(appCode);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appCode }),
      });
      
      if (response.ok) {
        await fetchInstalledApps();
      } else {
        const error = await response.json();
        // Handle both old and new error formats
        const errorMessage = error.error || (error.success === false && error.error) || 'Failed to install app';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error installing app:', error);
      alert('Failed to install app');
    } finally {
      setInstallingApp(null);
    }
  };

  const removeApp = async (appId: string) => {
    if (!confirm('Are you sure you want to remove this app?')) return;
    
    setRemovingApp(appId);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/apps/${appId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchInstalledApps();
      } else {
        const error = await response.json();
        // Handle both old and new error formats
        const errorMessage = error.error || (error.success === false && error.error) || 'Failed to remove app';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error removing app:', error);
      alert('Failed to remove app');
    } finally {
      setRemovingApp(null);
    }
  };

  const isAppInstalled = (appCode: string) => {
    return installedApps.some(install => install.app.code === appCode);
  };

  const getInstalledApp = (appCode: string) => {
    return installedApps.find(install => install.app.code === appCode);
  };

  return (
    <div className="nuvi-tab-panel">
      {/* Apps Header */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Apps</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Extend your store with powerful apps</p>
        </div>
        <button 
          className="nuvi-btn nuvi-btn-secondary"
          onClick={() => setShowAppStore(true)}
        >
          <Search className="h-4 w-4" />
          Browse App Store
        </button>
      </div>

      {/* Installed Apps */}
      <div className="nuvi-card nuvi-mb-lg">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Installed Apps</h3>
        </div>
        <div className="nuvi-card-content">
          {loading ? (
            <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-py-lg">
              <Loader2 className="h-6 w-6 nuvi-animate-spin nuvi-text-primary" />
            </div>
          ) : installedApps.length === 0 ? (
            <p className="nuvi-text-secondary nuvi-text-center nuvi-py-lg">
              No apps installed yet. Check out our recommended apps below!
            </p>
          ) : (
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
              {installedApps.map((installation) => (
                <div key={installation.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                    <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-surface-hover nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                      <span className="text-2xl">{installation.app.icon || '🔌'}</span>
                    </div>
                    <div className="nuvi-flex-1">
                      <h4 className="nuvi-font-medium">{installation.app.name}</h4>
                      <p className="nuvi-text-sm nuvi-text-secondary">{installation.app.description}</p>
                      <div className="nuvi-mt-md">
                        <div className="nuvi-flex nuvi-gap-sm">
                          {installation.app.code === 'shopify-import' && (
                            <button 
                              className="nuvi-btn nuvi-btn-sm nuvi-btn-primary"
                              onClick={() => {
                                router.push(`/dashboard/stores/${store.subdomain}/apps/shopify-import`);
                              }}
                            >
                              <Upload className="h-4 w-4" />
                              Open Import Tool
                            </button>
                          )}
                          {installation.app.code === 'smart-search' && (
                            <button 
                              className="nuvi-btn nuvi-btn-sm nuvi-btn-primary"
                              onClick={() => {
                                router.push(`/dashboard/stores/${store.subdomain}/apps/smart-search`);
                              }}
                            >
                              <Search className="h-4 w-4" />
                              Manage Search
                            </button>
                          )}
                          {installation.app.code === 'stripe-payments' && (
                            <button 
                              className="nuvi-btn nuvi-btn-sm nuvi-btn-primary"
                              onClick={() => {
                                router.push(`/dashboard/stores/${store.subdomain}/settings#payment`);
                              }}
                            >
                              Configure
                            </button>
                          )}
                          <button 
                            className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                            disabled={removingApp === installation.app.id}
                            onClick={() => removeApp(installation.app.id)}
                          >
                            {removingApp === installation.app.id ? (
                              <Loader2 className="h-4 w-4 nuvi-animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Apps */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Recommended for You</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
            {!isAppInstalled('shopify-import') && (
              <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                <span className="text-3xl mb-3 block">🛍️</span>
                <h4 className="nuvi-font-medium nuvi-mb-xs">Shopify Import</h4>
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Import products from Shopify</p>
                <button 
                  className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full"
                  disabled={installingApp === 'shopify-import'}
                  onClick={() => installApp('shopify-import')}
                >
                  {installingApp === 'shopify-import' ? (
                    <><Loader2 className="h-4 w-4 nuvi-animate-spin nuvi-mr-xs" /> Installing...</>
                  ) : (
                    'Install'
                  )}
                </button>
              </div>
            )}
            {!isAppInstalled('smart-search') && (
              <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                <Search className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                <h4 className="nuvi-font-medium nuvi-mb-xs">Smart Search</h4>
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Advanced search with filters and autocomplete</p>
                <button 
                  className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full"
                  disabled={installingApp === 'smart-search'}
                  onClick={() => installApp('smart-search')}
                >
                  {installingApp === 'smart-search' ? (
                    <><Loader2 className="h-4 w-4 nuvi-animate-spin nuvi-mr-xs" /> Installing...</>
                  ) : (
                    'Install'
                  )}
                </button>
              </div>
            )}
            {!isAppInstalled('stripe-payments') && (
              <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                <CreditCard className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                <h4 className="nuvi-font-medium nuvi-mb-xs">Stripe Payments</h4>
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Accept payments with Stripe</p>
                <button 
                  className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full"
                  disabled={installingApp === 'stripe-payments'}
                  onClick={() => installApp('stripe-payments')}
                >
                  {installingApp === 'stripe-payments' ? (
                    <><Loader2 className="h-4 w-4 nuvi-animate-spin nuvi-mr-xs" /> Installing...</>
                  ) : (
                    'Install'
                  )}
                </button>
              </div>
            )}
            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
              <Mail className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-xs">Email Marketing</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Send beautiful emails</p>
              <button 
                className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full"
                disabled={installingApp === 'email-marketing'}
                onClick={() => installApp('email-marketing')}
              >
                {installingApp === 'email-marketing' ? (
                  <><Loader2 className="h-4 w-4 nuvi-animate-spin nuvi-mr-xs" /> Installing...</>
                ) : (
                  'Install'
                )}
              </button>
            </div>
            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
              <BarChart2 className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-xs">Advanced Analytics</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Deep insights and reports</p>
              <button 
                className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full"
                disabled={installingApp === 'advanced-analytics'}
                onClick={() => installApp('advanced-analytics')}
              >
                {installingApp === 'advanced-analytics' ? (
                  <><Loader2 className="h-4 w-4 nuvi-animate-spin nuvi-mr-xs" /> Installing...</>
                ) : (
                  'Install'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* App Store Modal */}
      <AppStoreModal
        isOpen={showAppStore}
        onClose={() => setShowAppStore(false)}
        onInstall={(appId) => {
          installApp(appId);
          setShowAppStore(false);
        }}
        installedApps={installedApps.map(app => app.app.code)}
        subdomain={store.subdomain}
      />
    </div>
  );
}