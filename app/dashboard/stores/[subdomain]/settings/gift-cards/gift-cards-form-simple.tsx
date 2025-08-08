'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { Gift, Settings } from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const initialFormData = {
  enabled: false,
  minAmount: 10,
  maxAmount: 500,
  defaultAmounts: [25, 50, 100, 250],
  expirationDays: 365,
  allowPartialUse: true
};

export function GiftCardsFormSimple({ store }: { store: Store }) {
  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint={`/api/stores/${store.subdomain}/gift-cards/settings`}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Gift Cards"
          description="Enable gift cards for your store"
        >
          <div className="nuvi-space-y-lg">
            {/* Basic Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Gift className="h-5 w-5 nuvi-text-muted" />
                  <h3 className="nuvi-card-title">Gift Card Settings</h3>
                </div>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure basic gift card settings for when the feature launches
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  {/* Enable/Disable */}
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

                  {/* Amount Range */}
                  <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Minimum amount</label>
                      <div className="nuvi-input-group">
                        <span className="nuvi-input-addon">$</span>
                        <input
                          type="number"
                          className="nuvi-input"
                          min="1"
                          value={formData.minAmount}
                          onChange={(e) => handleChange('minAmount', parseInt(e.target.value) || 0)}
                          disabled={!formData.enabled}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="nuvi-label">Maximum amount</label>
                      <div className="nuvi-input-group">
                        <span className="nuvi-input-addon">$</span>
                        <input
                          type="number"
                          className="nuvi-input"
                          min="1"
                          value={formData.maxAmount}
                          onChange={(e) => handleChange('maxAmount', parseInt(e.target.value) || 0)}
                          disabled={!formData.enabled}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Default Amounts */}
                  <div>
                    <label className="nuvi-label">Suggested amounts</label>
                    <div className="nuvi-flex nuvi-flex-wrap nuvi-gap-sm">
                      {formData.defaultAmounts.map((amount, index) => (
                        <div key={index} className="nuvi-input-group" style={{ width: '100px' }}>
                          <span className="nuvi-input-addon">$</span>
                          <input
                            type="number"
                            className="nuvi-input nuvi-text-sm"
                            value={amount}
                            onChange={(e) => {
                              const newAmounts = [...formData.defaultAmounts];
                              newAmounts[index] = parseInt(e.target.value) || 0;
                              handleChange('defaultAmounts', newAmounts);
                            }}
                            disabled={!formData.enabled}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-sm">
                      These amounts will be shown as quick selection options
                    </p>
                  </div>

                  {/* Expiration */}
                  <div>
                    <label className="nuvi-label">Expiration period (days)</label>
                    <input
                      type="number"
                      className="nuvi-input"
                      min="1"
                      max="3650"
                      value={formData.expirationDays}
                      onChange={(e) => handleChange('expirationDays', parseInt(e.target.value) || 365)}
                      disabled={!formData.enabled}
                    />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                      Gift cards will expire {formData.expirationDays} days after purchase
                    </p>
                  </div>

                  {/* Partial Use */}
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Allow partial use</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Customers can use gift cards multiple times until balance is depleted
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.allowPartialUse}
                        onChange={(e) => handleChange('allowPartialUse', e.target.checked)}
                        disabled={!formData.enabled}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Features */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Planned Features</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  These features will be available when gift cards launch
                </p>
              </div>
              <div className="nuvi-card-content">
                <ul className="nuvi-space-y-sm nuvi-text-sm">
                  <li className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Settings className="h-4 w-4 nuvi-text-muted" />
                    <span>Custom gift card designs and templates</span>
                  </li>
                  <li className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Settings className="h-4 w-4 nuvi-text-muted" />
                    <span>Email delivery with personalized messages</span>
                  </li>
                  <li className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Settings className="h-4 w-4 nuvi-text-muted" />
                    <span>Bulk gift card generation for promotions</span>
                  </li>
                  <li className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Settings className="h-4 w-4 nuvi-text-muted" />
                    <span>Gift card balance tracking and analytics</span>
                  </li>
                  <li className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Settings className="h-4 w-4 nuvi-text-muted" />
                    <span>Integration with loyalty programs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}