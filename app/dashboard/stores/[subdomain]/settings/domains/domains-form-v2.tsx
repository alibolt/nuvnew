'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  Globe, Link, Shield, ExternalLink,
  AlertCircle, Plus, Edit, Trash2,
  CheckCircle, XCircle, Copy, RefreshCw, X
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'primary' as const, label: 'Primary Domain', icon: Globe },
  { id: 'redirects' as const, label: 'URL Redirects', icon: ExternalLink }
];

export function DomainsFormV2({ store }: { store: Store & { storeSettings?: any } }) {
  const [activeTab, setActiveTab] = useState<'primary' | 'redirects'>('primary');
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<any>(null);

  // Initialize form data from store settings
  const initialFormData = {
    // Primary Domain
    primaryDomain: {
      domain: store.customDomain || store.storeSettings?.primaryDomain?.domain || '',
      connected: store.storeSettings?.primaryDomain?.connected ?? false,
    },
    
    // Redirects
    redirects: store.storeSettings?.redirects || [],
    
    // Settings
    redirectWww: store.storeSettings?.domainSettings?.redirectWww ?? true,
    forceHttps: store.storeSettings?.domainSettings?.forceHttps ?? true,
  };

  const transformDataForSave = (data: typeof initialFormData) => ({
    domainSettings: data
  });

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/domains"
      onDataChange={transformDataForSave}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Domains"
          description="Connect your custom domain and manage URL redirects"
        >

      {/* Tabs */}
      <div className="nuvi-settings-tabs">
        <div className="nuvi-settings-tabs-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nuvi-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

          {/* Tab Content */}
          <div className="nuvi-tab-content">
        {activeTab === 'primary' && (
          <div className="nuvi-space-y-lg">
            {/* Primary Domain Configuration */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Custom Domain</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Connect your own domain to your online store
                </p>
              </div>
              <div className="nuvi-card-content">
                {!formData.primaryDomain.domain ? (
                  <div className="nuvi-text-center nuvi-py-lg">
                    <Globe className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-sm">No custom domain connected</h4>
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                      Your store is currently using {store.subdomain}.nuvi.shop
                    </p>
                    <button 
                      className="nuvi-btn nuvi-btn-primary"
                      onClick={() => setShowDomainModal(true)}
                    >
                      Connect Domain
                    </button>
                  </div>
                ) : (
                  <div className="nuvi-space-y-md">
                    <div>
                      <label className="nuvi-label">Domain</label>
                      <div className="nuvi-flex nuvi-gap-sm">
                        <input
                          type="text"
                          className="nuvi-input nuvi-flex-1"
                          value={formData.primaryDomain.domain}
                          onChange={(e) => handleChange('primaryDomain.domain', e.target.value)}
                          placeholder="example.com"
                        />
                        <button className="nuvi-btn nuvi-btn-secondary">
                          Change Domain
                        </button>
                      </div>
                    </div>

                    <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-bg-gray-50">
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          {formData.primaryDomain.connected ? (
                            <CheckCircle className="h-5 w-5 nuvi-text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 nuvi-text-yellow-600" />
                          )}
                          <div>
                            <h4 className="nuvi-font-medium">
                              {formData.primaryDomain.connected ? 'Domain Connected' : 'Pending Connection'}
                            </h4>
                            <p className="nuvi-text-sm nuvi-text-muted">
                              {formData.primaryDomain.connected 
                                ? 'Your domain is active and working'
                                : 'Update your DNS settings to complete connection'
                              }
                            </p>
                          </div>
                        </div>
                        <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                          View Instructions
                        </button>
                      </div>
                    </div>

                    {!formData.primaryDomain.connected && (
                      <div className="nuvi-alert nuvi-alert-info">
                        <AlertCircle className="h-4 w-4" />
                        <div className="nuvi-flex-1">
                          <h4 className="nuvi-font-medium">DNS Configuration Required</h4>
                          <p className="nuvi-text-sm nuvi-mt-xs">
                            Point your domain to these nameservers:
                          </p>
                          <div className="nuvi-mt-sm nuvi-space-y-xs">
                            <code className="nuvi-text-xs nuvi-bg-gray-100 nuvi-px-sm nuvi-py-xs nuvi-rounded nuvi-block">
                              ns1.nuvi-dns.com
                            </code>
                            <code className="nuvi-text-xs nuvi-bg-gray-100 nuvi-px-sm nuvi-py-xs nuvi-rounded nuvi-block">
                              ns2.nuvi-dns.com
                            </code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Domain Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Domain Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure domain behavior and security
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Redirect www to non-www</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Automatically redirect www.domain.com to domain.com
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.redirectWww}
                        onChange={(e) => handleChange('redirectWww', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Force HTTPS</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Always use secure connection (recommended)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.forceHttps}
                        onChange={(e) => handleChange('forceHttps', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SSL Status Info */}
            <div className="nuvi-alert nuvi-alert-success">
              <Shield className="h-4 w-4" />
              <div>
                <h4 className="nuvi-font-medium">SSL Certificate Active</h4>
                <p className="nuvi-text-sm">
                  Your store has an active SSL certificate that renews automatically. All traffic is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'redirects' && (
          <div className="nuvi-space-y-lg">
            {/* URL Redirects */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">URL Redirects</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Redirect visitors from old URLs to new ones
                    </p>
                  </div>
                  <button 
                    className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                    onClick={() => {
                      setEditingRedirect(null);
                      setShowRedirectModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Redirect
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                {formData.redirects.length === 0 ? (
                  <div className="nuvi-text-center nuvi-py-lg">
                    <ExternalLink className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-sm">No redirects configured</h4>
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                      Create URL redirects to maintain SEO when changing URLs
                    </p>
                    <button 
                      className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                      onClick={() => {
                        setEditingRedirect(null);
                        setShowRedirectModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Redirect
                    </button>
                  </div>
                ) : (
                  <div className="nuvi-space-y-md">
                    {formData.redirects.map((redirect) => (
                      <div key={redirect.id} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div>
                          <h4 className="nuvi-font-medium">
                            {redirect.from} → {redirect.to}
                          </h4>
                          <p className="nuvi-text-sm nuvi-text-muted">
                            {redirect.type} redirect
                          </p>
                        </div>
                        <div className="nuvi-flex nuvi-gap-sm">
                          <button 
                            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                            onClick={() => {
                              setEditingRedirect(redirect);
                              setShowRedirectModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-danger"
                            onClick={() => {
                              const updatedRedirects = formData.redirects.filter((r: any) => r.id !== redirect.id);
                              handleChange('redirects', updatedRedirects);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* How Redirects Work */}
            <div className="nuvi-alert nuvi-alert-info">
              <AlertCircle className="h-4 w-4" />
              <div>
                <h4 className="nuvi-font-medium">How URL redirects work</h4>
                <p className="nuvi-text-sm">
                  When visitors go to the "From" URL, they'll be automatically redirected to the "To" URL. 
                  Use 301 redirects for permanent changes and 302 for temporary ones.
                </p>
              </div>
            </div>
          </div>
        )}

          </div>

          {/* Domain Modal */}
          {showDomainModal && (
            <DomainModal
              onSave={(domain) => {
                handleChange('primaryDomain', { domain, connected: false });
                setShowDomainModal(false);
              }}
              onClose={() => setShowDomainModal(false)}
            />
          )}

          {/* Redirect Modal */}
          {showRedirectModal && (
            <RedirectModal
              redirect={editingRedirect}
              onSave={(redirect) => {
                if (editingRedirect) {
                  // Edit existing redirect
                  const updatedRedirects = formData.redirects.map((r: any) =>
                    r.id === editingRedirect.id ? { ...redirect, id: editingRedirect.id } : r
                  );
                  handleChange('redirects', updatedRedirects);
                } else {
                  // Add new redirect
                  const newRedirect = {
                    ...redirect,
                    id: Date.now().toString(),
                  };
                  handleChange('redirects', [...formData.redirects, newRedirect]);
                }
                setShowRedirectModal(false);
                setEditingRedirect(null);
              }}
              onClose={() => {
                setShowRedirectModal(false);
                setEditingRedirect(null);
              }}
            />
          )}
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}

// Domain Connection Modal
function DomainModal({ onSave, onClose }: { onSave: (domain: string) => void; onClose: () => void }) {
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    onSave(domain.trim());
  };

  return (
    <div className="nuvi-modal-backdrop">
      <div className="nuvi-modal-content" style={{ maxWidth: '500px' }}>
        <div className="nuvi-modal-header">
          <h3 className="nuvi-modal-title">Connect Domain</h3>
          <button onClick={onClose} className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="nuvi-modal-body">
            <div className="nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Domain Name *</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  required
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  Enter your domain without "www" (e.g., example.com)
                </p>
              </div>

              <div className="nuvi-alert nuvi-alert-info">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <h4 className="nuvi-font-medium">Next Steps</h4>
                  <p className="nuvi-text-sm">
                    After connecting your domain, you'll need to update your DNS settings to point to our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="nuvi-modal-footer">
            <button type="button" onClick={onClose} className="nuvi-btn nuvi-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="nuvi-btn nuvi-btn-primary">
              Connect Domain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Redirect Modal
function RedirectModal({ 
  redirect, 
  onSave, 
  onClose 
}: { 
  redirect?: any; 
  onSave: (redirect: any) => void; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    from: redirect?.from || '',
    to: redirect?.to || '',
    type: redirect?.type || '301',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from.trim() || !formData.to.trim()) return;
    onSave(formData);
  };

  return (
    <div className="nuvi-modal-backdrop">
      <div className="nuvi-modal-content" style={{ maxWidth: '500px' }}>
        <div className="nuvi-modal-header">
          <h3 className="nuvi-modal-title">
            {redirect ? 'Edit Redirect' : 'Add URL Redirect'}
          </h3>
          <button onClick={onClose} className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="nuvi-modal-body">
            <div className="nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Redirect From *</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  placeholder="/old-page"
                  required
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  The old URL path (e.g., /old-page or old-domain.com)
                </p>
              </div>

              <div>
                <label className="nuvi-label">Redirect To *</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="/new-page"
                  required
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  The new URL path (e.g., /new-page or https://new-domain.com)
                </p>
              </div>

              <div>
                <label className="nuvi-label">Redirect Type</label>
                <select
                  className="nuvi-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="301">301 - Permanent</option>
                  <option value="302">302 - Temporary</option>
                </select>
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  Use 301 for permanent changes, 302 for temporary redirects
                </p>
              </div>
            </div>
          </div>
          <div className="nuvi-modal-footer">
            <button type="button" onClick={onClose} className="nuvi-btn nuvi-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="nuvi-btn nuvi-btn-primary">
              {redirect ? 'Update' : 'Create'} Redirect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}