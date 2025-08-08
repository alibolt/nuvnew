'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  RotateCcw, Shield, FileText, Truck,
  AlertCircle, Save, Eye, Edit
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'refund' as const, label: 'Refund Policy', icon: RotateCcw },
  { id: 'privacy' as const, label: 'Privacy Policy', icon: Shield },
  { id: 'terms' as const, label: 'Terms of Service', icon: FileText },
  { id: 'shipping' as const, label: 'Shipping Policy', icon: Truck }
];

export function PoliciesFormV2({ store }: { store: Store & { storeSettings?: any } }) {
  const [activeTab, setActiveTab] = useState<'refund' | 'privacy' | 'terms' | 'shipping'>('refund');

  // Initialize form data from store settings
  const initialFormData = {
    // Refund Policy
    refundPolicy: {
      enabled: store.storeSettings?.refundPolicy?.enabled ?? true,
      timeLimit: store.storeSettings?.refundPolicy?.timeLimit || 30,
      conditions: store.storeSettings?.refundPolicy?.conditions || 'Items must be in original condition and packaging',
      content: store.storeSettings?.refundPolicy?.content || 'We offer full refunds within 30 days of purchase for items in original condition.'
    },
    
    // Privacy Policy
    privacyPolicy: {
      enabled: store.storeSettings?.privacyPolicy?.enabled ?? true,
      lastUpdated: store.storeSettings?.privacyPolicy?.lastUpdated || '2024-01-15',
      content: store.storeSettings?.privacyPolicy?.content || 'This privacy policy describes how we collect, use, and protect your personal information.'
    },
    
    // Terms of Service
    termsOfService: {
      enabled: store.storeSettings?.termsOfService?.enabled ?? true,
      lastUpdated: store.storeSettings?.termsOfService?.lastUpdated || '2024-01-15',
      content: store.storeSettings?.termsOfService?.content || 'By using our services, you agree to these terms and conditions.'
    },
    
    // Shipping Policy
    shippingPolicy: {
      enabled: store.storeSettings?.shippingPolicy?.enabled ?? true,
      processingTime: store.storeSettings?.shippingPolicy?.processingTime || '1-2 business days',
      shippingTime: store.storeSettings?.shippingPolicy?.shippingTime || '3-7 business days',
      content: store.storeSettings?.shippingPolicy?.content || 'We ship all orders within 1-2 business days via standard shipping.'
    }
  };

  const transformDataForSave = (data: typeof initialFormData) => ({
    policies: data
  });

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/policies"
      onDataChange={transformDataForSave}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Store Policies"
          description="Manage your store policies and legal pages"
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
        {activeTab === 'refund' && (
          <div className="nuvi-space-y-lg">
            {/* Refund Policy Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Refund Policy Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure your refund policy terms and conditions
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable refund policy</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display refund policy to customers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.refundPolicy.enabled}
                        onChange={(e) => handleChange('refundPolicy.enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Refund time limit</label>
                      <select 
                        className="nuvi-select"
                        value={formData.refundPolicy.timeLimit}
                        onChange={(e) => handleChange('refundPolicy.timeLimit', parseInt(e.target.value))}
                      >
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="nuvi-label">Refund conditions</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.refundPolicy.conditions}
                        onChange={(e) => handleChange('refundPolicy.conditions', e.target.value)}
                        placeholder="Enter refund conditions"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Policy Content */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <h3 className="nuvi-card-title">Refund Policy Content</h3>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div>
                  <label className="nuvi-label">Policy content</label>
                  <textarea
                    rows={8}
                    className="nuvi-textarea"
                    value={formData.refundPolicy.content}
                    onChange={(e) => handleChange('refundPolicy.content', e.target.value)}
                    placeholder="Enter your refund policy content..."
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    This content will be displayed on your refund policy page
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Quick Templates</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Use pre-made templates to get started quickly
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <h4 className="nuvi-font-medium nuvi-mb-sm">Standard Refund</h4>
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                      30-day refund policy with standard conditions
                    </p>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full">
                      Use Template
                    </button>
                  </div>
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <h4 className="nuvi-font-medium nuvi-mb-sm">Digital Products</h4>
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                      Refund policy for digital goods and services
                    </p>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full">
                      Use Template
                    </button>
                  </div>
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <h4 className="nuvi-font-medium nuvi-mb-sm">No Refunds</h4>
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                      Policy for final sale items with no refunds
                    </p>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full">
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="nuvi-space-y-lg">
            {/* Privacy Policy Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Privacy Policy Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure your privacy policy and data protection settings
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable privacy policy</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display privacy policy to customers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.privacyPolicy.enabled}
                        onChange={(e) => handleChange('privacyPolicy.enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="nuvi-label">Last updated</label>
                    <input
                      type="date"
                      className="nuvi-input"
                      value={formData.privacyPolicy.lastUpdated}
                      onChange={(e) => handleChange('privacyPolicy.lastUpdated', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Policy Content */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <h3 className="nuvi-card-title">Privacy Policy Content</h3>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div>
                  <label className="nuvi-label">Policy content</label>
                  <textarea
                    rows={10}
                    className="nuvi-textarea"
                    value={formData.privacyPolicy.content}
                    onChange={(e) => handleChange('privacyPolicy.content', e.target.value)}
                    placeholder="Enter your privacy policy content..."
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    This content will be displayed on your privacy policy page
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Compliance */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Privacy Compliance</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Ensure compliance with privacy regulations
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">GDPR Compliance</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Enable GDPR compliance features
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">CCPA Compliance</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Enable CCPA compliance features
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Cookie consent</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Show cookie consent banner
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="nuvi-space-y-lg">
            {/* Terms of Service Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Terms of Service Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure your terms of service and legal agreements
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable terms of service</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display terms of service to customers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.termsOfService.enabled}
                        onChange={(e) => handleChange('termsOfService.enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="nuvi-label">Last updated</label>
                    <input
                      type="date"
                      className="nuvi-input"
                      value={formData.termsOfService.lastUpdated}
                      onChange={(e) => handleChange('termsOfService.lastUpdated', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <h3 className="nuvi-card-title">Terms of Service Content</h3>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div>
                  <label className="nuvi-label">Terms content</label>
                  <textarea
                    rows={10}
                    className="nuvi-textarea"
                    value={formData.termsOfService.content}
                    onChange={(e) => handleChange('termsOfService.content', e.target.value)}
                    placeholder="Enter your terms of service content..."
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    This content will be displayed on your terms of service page
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Requirements */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Legal Requirements</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure legal acceptance requirements
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Require acceptance at checkout</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Customers must accept terms before purchase
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Require acceptance at registration</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Customers must accept terms when creating account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Track acceptance history</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Keep records of when customers accept terms
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="nuvi-space-y-lg">
            {/* Shipping Policy Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Shipping Policy Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure your shipping policy and delivery terms
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable shipping policy</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display shipping policy to customers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.shippingPolicy.enabled}
                        onChange={(e) => handleChange('shippingPolicy.enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Processing time</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.shippingPolicy.processingTime}
                        onChange={(e) => handleChange('shippingPolicy.processingTime', e.target.value)}
                        placeholder="e.g., 1-2 business days"
                      />
                    </div>
                    <div>
                      <label className="nuvi-label">Shipping time</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.shippingPolicy.shippingTime}
                        onChange={(e) => handleChange('shippingPolicy.shippingTime', e.target.value)}
                        placeholder="e.g., 3-7 business days"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Policy Content */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <h3 className="nuvi-card-title">Shipping Policy Content</h3>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div>
                  <label className="nuvi-label">Policy content</label>
                  <textarea
                    rows={8}
                    className="nuvi-textarea"
                    value={formData.shippingPolicy.content}
                    onChange={(e) => handleChange('shippingPolicy.content', e.target.value)}
                    placeholder="Enter your shipping policy content..."
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    This content will be displayed on your shipping policy page
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Shipping Information</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure shipping methods and restrictions
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Show shipping calculator</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Let customers calculate shipping costs
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">International shipping</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Enable shipping to international destinations
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Shipping restrictions</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display shipping restrictions and limitations
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
          </div>
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}