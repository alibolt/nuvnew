'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  Settings, Layout, CreditCard, BarChart3,
  Plus, Edit, Trash2, Download,
  Gift, Calendar, DollarSign, Eye, CheckCircle,
  XCircle, Search, Filter
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'settings' as const, label: 'Settings', icon: Settings },
  { id: 'templates' as const, label: 'Templates', icon: Layout },
  { id: 'active' as const, label: 'Active Cards', icon: CreditCard },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 }
];

const initialFormData = {
    // Gift Card Settings
    enabled: true,
    allowPartialUse: true,
    expiration: {
      enabled: true,
      days: 365
    },
    minAmount: 10,
    maxAmount: 500,
    defaultAmounts: [25, 50, 100, 250],
    requireTerms: true,
    
    // Templates
    templates: [
      { id: 1, name: 'Birthday Template', design: 'birthday', isDefault: true },
      { id: 2, name: 'Holiday Template', design: 'holiday', isDefault: false },
      { id: 3, name: 'Thank You Template', design: 'thankyou', isDefault: false }
    ],
    
    // Active Cards
    activeCards: [
      { id: 'GC001', amount: 100, balance: 75, recipient: 'john@example.com', status: 'active', issueDate: '2024-01-15', expiryDate: '2025-01-15' },
      { id: 'GC002', amount: 50, balance: 0, recipient: 'jane@example.com', status: 'redeemed', issueDate: '2024-01-10', expiryDate: '2025-01-10' }
    ]
};

export function GiftCardsFormV2({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<'settings' | 'templates' | 'active' | 'analytics'>('settings');

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/settings"
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Gift Cards"
          description="Manage gift card settings and configurations"
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
        {activeTab === 'settings' && (
          <div className="nuvi-space-y-lg">
            {/* Gift Card Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Gift Card Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure how gift cards work in your store
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable gift cards</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to purchase and redeem gift cards
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enabled}
                        onChange={(e) => handleChange('enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Allow partial use</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to use gift cards for partial payments
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.allowPartialUse}
                        onChange={(e) => handleChange('allowPartialUse', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Require terms acceptance</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Require customers to accept gift card terms
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.requireTerms}
                        onChange={(e) => handleChange('requireTerms', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Amount Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Set minimum, maximum, and default amounts for gift cards
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Minimum amount</label>
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <span className="nuvi-text-sm">$</span>
                        <input
                          type="number"
                          className="nuvi-input"
                          min="1"
                          value={formData.minAmount}
                          onChange={(e) => handleChange('minAmount', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="nuvi-label">Maximum amount</label>
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <span className="nuvi-text-sm">$</span>
                        <input
                          type="number"
                          className="nuvi-input"
                          min="1"
                          value={formData.maxAmount}
                          onChange={(e) => handleChange('maxAmount', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label">Default amounts</label>
                    <div className="nuvi-flex nuvi-gap-sm nuvi-flex-wrap">
                      {formData.defaultAmounts.map((amount, index) => (
                        <div key={index} className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-p-sm nuvi-border nuvi-rounded">
                          <span className="nuvi-text-sm">${amount}</span>
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs nuvi-text-red-600">
                            <XCircle className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                        <Plus className="h-4 w-4" />
                        Add Amount
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiration Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Expiration Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure when gift cards expire
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Gift cards expire</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Set an expiration date for gift cards
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.expiration.enabled}
                        onChange={(e) => handleChange('expiration.enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  {formData.expiration.enabled && (
                    <div>
                      <label className="nuvi-label">Expiration period (days)</label>
                      <input
                        type="number"
                        className="nuvi-input"
                        min="1"
                        value={formData.expiration.days}
                        onChange={(e) => handleChange('expiration', { 
                          ...formData.expiration, 
                          days: parseInt(e.target.value) 
                        })}
                      />
                      <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                        Gift cards will expire {formData.expiration.days} days after purchase
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="nuvi-space-y-lg">
            {/* Gift Card Templates */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Gift Card Templates</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Customize the design and appearance of your gift cards
                    </p>
                  </div>
                  <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
                    <Plus className="h-4 w-4" />
                    Create Template
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-md">
                  {formData.templates.map((template) => (
                    <div key={template.id} className="nuvi-border nuvi-rounded-lg nuvi-p-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                        <h4 className="nuvi-font-medium">{template.name}</h4>
                        <div className="nuvi-flex nuvi-gap-xs">
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="nuvi-w-full nuvi-h-32 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mb-md">
                        <Gift className="h-8 w-8 nuvi-text-gray-400" />
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <span className="nuvi-text-sm nuvi-text-muted">Design: {template.design}</span>
                        {template.isDefault && (
                          <span className="nuvi-badge nuvi-badge-primary nuvi-badge-sm">Default</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Template Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure template-specific settings
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div>
                    <label className="nuvi-label">Store logo</label>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <div className="nuvi-w-16 nuvi-h-16 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                        <Gift className="h-6 w-6 nuvi-text-gray-400" />
                      </div>
                      <div>
                        <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                          Upload Logo
                        </button>
                        <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                          Recommended: 200x200px PNG or JPG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label">Brand colors</label>
                    <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label nuvi-text-sm">Primary color</label>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <input type="color" className="nuvi-w-8 nuvi-h-8 nuvi-border nuvi-rounded" defaultValue="#3b82f6" />
                          <input type="text" className="nuvi-input" placeholder="#3b82f6" />
                        </div>
                      </div>
                      <div>
                        <label className="nuvi-label nuvi-text-sm">Secondary color</label>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <input type="color" className="nuvi-w-8 nuvi-h-8 nuvi-border nuvi-rounded" defaultValue="#64748b" />
                          <input type="text" className="nuvi-input" placeholder="#64748b" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label">Default message</label>
                    <textarea
                      className="nuvi-textarea"
                      rows={3}
                      placeholder="Enter default gift card message..."
                      defaultValue="Thank you for your purchase! Enjoy your gift card."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="nuvi-space-y-lg">
            {/* Active Gift Cards */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Active Gift Cards</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Manage all issued gift cards
                    </p>
                  </div>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Search className="h-4 w-4 nuvi-text-muted" />
                      <input
                        type="text"
                        placeholder="Search gift cards..."
                        className="nuvi-input nuvi-input-sm"
                      />
                    </div>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      <Filter className="h-4 w-4" />
                      Filter
                    </button>
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Card ID</th>
                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Recipient</th>
                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Amount</th>
                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Balance</th>
                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Status</th>
                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Issue Date</th>
                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.activeCards.map((card) => (
                        <tr key={card.id} className="border-b">
                          <td className="py-3">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              <CreditCard className="h-4 w-4 nuvi-text-muted" />
                              <span className="nuvi-font-medium">{card.id}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="nuvi-text-sm">{card.recipient}</span>
                          </td>
                          <td className="py-3">
                            <span className="nuvi-font-medium">${card.amount}</span>
                          </td>
                          <td className="py-3">
                            <span className="nuvi-font-medium">${card.balance}</span>
                          </td>
                          <td className="py-3">
                            <span className={`nuvi-badge ${
                              card.status === 'active' ? 'nuvi-badge-success' :
                              card.status === 'redeemed' ? 'nuvi-badge-secondary' :
                              'nuvi-badge-warning'
                            }`}>
                              {card.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="nuvi-text-sm">{new Date(card.issueDate).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3">
                            <div className="nuvi-flex nuvi-gap-sm">
                              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Quick Actions</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Perform bulk actions on gift cards
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-gap-sm">
                  <button className="nuvi-btn nuvi-btn-secondary">
                    <Plus className="h-4 w-4" />
                    Issue New Card
                  </button>
                  <button className="nuvi-btn nuvi-btn-secondary">
                    <Download className="h-4 w-4" />
                    Export All
                  </button>
                  <button className="nuvi-btn nuvi-btn-secondary">
                    <Calendar className="h-4 w-4" />
                    Send Reminders
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="nuvi-space-y-lg">
            {/* Gift Card Analytics */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Gift Card Analytics</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Track gift card performance and usage
                    </p>
                  </div>
                  <select className="nuvi-select nuvi-select-sm">
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md">
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">$12,450</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Total Sold</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">$8,320</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Total Redeemed</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">$4,130</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Outstanding Balance</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">67%</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Redemption Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Usage Statistics</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Detailed breakdown of gift card usage
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-lg">
                  <div>
                    <h4 className="nuvi-font-medium nuvi-mb-md">Cards by Status</h4>
                    <div className="nuvi-space-y-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <span className="nuvi-text-sm">Active</span>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <div className="nuvi-w-16 nuvi-h-2 nuvi-bg-gray-200 nuvi-rounded-full">
                            <div className="nuvi-w-10 nuvi-h-2 nuvi-bg-green-500 nuvi-rounded-full"></div>
                          </div>
                          <span className="nuvi-text-sm nuvi-font-medium">24</span>
                        </div>
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <span className="nuvi-text-sm">Redeemed</span>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <div className="nuvi-w-16 nuvi-h-2 nuvi-bg-gray-200 nuvi-rounded-full">
                            <div className="nuvi-w-8 nuvi-h-2 nuvi-bg-blue-500 nuvi-rounded-full"></div>
                          </div>
                          <span className="nuvi-text-sm nuvi-font-medium">18</span>
                        </div>
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <span className="nuvi-text-sm">Expired</span>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <div className="nuvi-w-16 nuvi-h-2 nuvi-bg-gray-200 nuvi-rounded-full">
                            <div className="nuvi-w-2 nuvi-h-2 nuvi-bg-red-500 nuvi-rounded-full"></div>
                          </div>
                          <span className="nuvi-text-sm nuvi-font-medium">3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="nuvi-font-medium nuvi-mb-md">Popular Amounts</h4>
                    <div className="nuvi-space-y-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <span className="nuvi-text-sm">$50</span>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <div className="nuvi-w-16 nuvi-h-2 nuvi-bg-gray-200 nuvi-rounded-full">
                            <div className="nuvi-w-12 nuvi-h-2 nuvi-bg-primary nuvi-rounded-full"></div>
                          </div>
                          <span className="nuvi-text-sm nuvi-font-medium">15</span>
                        </div>
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <span className="nuvi-text-sm">$100</span>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <div className="nuvi-w-16 nuvi-h-2 nuvi-bg-gray-200 nuvi-rounded-full">
                            <div className="nuvi-w-10 nuvi-h-2 nuvi-bg-primary nuvi-rounded-full"></div>
                          </div>
                          <span className="nuvi-text-sm nuvi-font-medium">12</span>
                        </div>
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <span className="nuvi-text-sm">$25</span>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <div className="nuvi-w-16 nuvi-h-2 nuvi-bg-gray-200 nuvi-rounded-full">
                            <div className="nuvi-w-8 nuvi-h-2 nuvi-bg-primary nuvi-rounded-full"></div>
                          </div>
                          <span className="nuvi-text-sm nuvi-font-medium">8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Recent Activity</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Latest gift card transactions
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <div className="nuvi-w-8 nuvi-h-8 nuvi-bg-green-100 nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                        <Plus className="h-4 w-4 nuvi-text-green-600" />
                      </div>
                      <div>
                        <h4 className="nuvi-font-medium">Gift card purchased</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">GC003 - $75.00 by jane@example.com</p>
                      </div>
                    </div>
                    <span className="nuvi-text-sm nuvi-text-muted">2 hours ago</span>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <div className="nuvi-w-8 nuvi-h-8 nuvi-bg-blue-100 nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                        <CreditCard className="h-4 w-4 nuvi-text-blue-600" />
                      </div>
                      <div>
                        <h4 className="nuvi-font-medium">Gift card redeemed</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">GC001 - $25.00 used for Order #1234</p>
                      </div>
                    </div>
                    <span className="nuvi-text-sm nuvi-text-muted">5 hours ago</span>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <div className="nuvi-w-8 nuvi-h-8 nuvi-bg-green-100 nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                        <Plus className="h-4 w-4 nuvi-text-green-600" />
                      </div>
                      <div>
                        <h4 className="nuvi-font-medium">Gift card purchased</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">GC002 - $50.00 by mike@example.com</p>
                      </div>
                    </div>
                    <span className="nuvi-text-sm nuvi-text-muted">1 day ago</span>
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