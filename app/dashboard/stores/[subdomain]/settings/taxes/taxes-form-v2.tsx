'use client';

import type { Store } from '@prisma/client';
import { 
  Percent, AlertCircle, CheckCircle
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

// Simplified tax settings - no tabs needed

export function TaxesFormV2({ store }: { store: Store & { storeSettings?: any } }) {

  const initialFormData = {
    // Basic Tax Settings
    enableTaxes: (store.storeSettings as any)?.taxSettings?.enabled ?? false,
    taxIncludedInPrices: (store.storeSettings as any)?.taxSettings?.inclusive ?? false,
    chargesTaxOnShipping: (store.storeSettings as any)?.taxSettings?.chargesTaxOnShipping ?? true,
    defaultTaxRate: (store.storeSettings as any)?.taxSettings?.defaultRate || 8.25,
    
    // Tax Collection Settings
    collectTaxWhen: (store.storeSettings as any)?.taxSettings?.collectTaxWhen || 'always',
    displayTaxAs: (store.storeSettings as any)?.taxSettings?.displayTaxAs || 'exclusive',
  };

  const transformDataForSave = (data: typeof initialFormData) => ({
    taxSettings: {
      enabled: data.enableTaxes,
      inclusive: data.taxIncludedInPrices,
      chargesTaxOnShipping: data.chargesTaxOnShipping,
      defaultRate: data.defaultTaxRate,
      collectTaxWhen: data.collectTaxWhen,
      displayTaxAs: data.displayTaxAs,
    }
  });

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/settings"
      onDataChange={transformDataForSave}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Taxes"
          description="Configure tax rates and rules for different markets and regions"
        >
          <div className="nuvi-space-y-lg">
            {/* Markets Overview */}
            <div className="nuvi-alert nuvi-alert-info">
              <AlertCircle className="h-4 w-4" />
              <div>
                <h4 className="nuvi-font-medium">Market-Specific Tax Settings</h4>
                <p className="nuvi-text-sm">
                  Tax rates and rules can vary by country and region. 
                  Configure your default tax settings below, with the ability to customize by specific markets in the future.
                </p>
              </div>
            </div>

            {/* Tax Enable/Disable */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Tax Collection</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Enable or disable tax collection for your store
                </p>
              </div>
              <div className="nuvi-card-content">
                {!formData.enableTaxes ? (
                  <div className="nuvi-text-center nuvi-py-lg">
                    <Percent className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-sm">Tax collection is disabled</h4>
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                      Turn on tax collection to charge taxes on orders
                    </p>
                    <button 
                      className="nuvi-btn nuvi-btn-primary"
                      onClick={() => handleChange('enableTaxes', true)}
                    >
                      Enable Tax Collection
                    </button>
                  </div>
                ) : (
                  <div className="nuvi-space-y-md">
                    <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-bg-green-50 nuvi-border-green-200">
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <CheckCircle className="h-5 w-5 nuvi-text-green-600" />
                          <div>
                            <h4 className="nuvi-font-medium">Tax collection enabled</h4>
                            <p className="nuvi-text-sm nuvi-text-muted">
                              Taxes will be calculated and charged on orders
                            </p>
                          </div>
                        </div>
                        <button 
                          className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                          onClick={() => handleChange('enableTaxes', false)}
                        >
                          Disable
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tax Settings - Only show when enabled */}
            {formData.enableTaxes && (
              <>
                {/* Basic Tax Settings */}
                <div className="nuvi-card">
                  <div className="nuvi-card-header">
                    <h3 className="nuvi-card-title">Tax Settings</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Configure how taxes are calculated and displayed
                    </p>
                  </div>
                  <div className="nuvi-card-content">
                    <div className="nuvi-space-y-md">
                      <div>
                        <label className="nuvi-label">Default Tax Rate (%)</label>
                        <input
                          type="number"
                          className="nuvi-input"
                          value={formData.defaultTaxRate}
                          onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="8.25"
                        />
                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                          This rate will be applied to all taxable products
                        </p>
                      </div>

                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div>
                          <h4 className="nuvi-font-medium">Include tax in product prices</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">
                            Product prices shown include tax amounts
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.taxIncludedInPrices}
                            onChange={(e) => handleChange('taxIncludedInPrices', e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                      </div>

                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div>
                          <h4 className="nuvi-font-medium">Charge tax on shipping</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">
                            Apply tax rates to shipping costs
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.chargesTaxOnShipping}
                            onChange={(e) => handleChange('chargesTaxOnShipping', e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div className="nuvi-alert nuvi-alert-info">
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <h4 className="nuvi-font-medium">Tax Compliance</h4>
                    <p className="nuvi-text-sm">
                      Tax rates and rules can be complex. We recommend consulting with a tax professional 
                      to ensure compliance with local tax laws and regulations.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}