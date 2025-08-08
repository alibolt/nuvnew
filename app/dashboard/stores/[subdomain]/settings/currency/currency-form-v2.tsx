'use client';

import type { Store } from '@prisma/client';
import { 
  DollarSign, Globe, AlertCircle
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

// Simplified currency settings - no tabs needed

export function CurrencyFormV2({ store }: { store: Store & { storeSettings?: any } }) {
  
  // Debug: Check what data we're receiving
  console.log('[CurrencyFormV2] Store settings:', store.storeSettings?.currency);

  const initialFormData = {
    // Primary Currency Settings
    currency: store.storeSettings?.currency?.defaultCurrency || store.storeSettings?.currency?.code || store.currency || 'USD',
    symbol: store.storeSettings?.currency?.symbol || '$',
    name: store.storeSettings?.currency?.name || 'US Dollar',
    position: store.storeSettings?.currency?.position || 'before',
    decimalPlaces: store.storeSettings?.currency?.decimalPlaces ?? 2,
    thousandSeparator: store.storeSettings?.currency?.thousandSeparator || ',',
    decimalSeparator: store.storeSettings?.currency?.decimalSeparator || '.',
    hideDecimalForWholeNumbers: store.storeSettings?.currency?.hideDecimalForWholeNumbers ?? true,
    
    // Multi-Currency (Advanced)
    enableMultiCurrency: store.storeSettings?.currency?.enableMultiCurrency ?? false,
    enabledCurrencies: store.storeSettings?.currency?.enabledCurrencies || ['USD', 'EUR', 'GBP'],
    autoDetectCurrency: store.storeSettings?.currency?.autoDetect ?? true,
    showCurrencySelector: store.storeSettings?.currency?.showCurrencySelector ?? true,
  };

  const transformDataForSave = (data: typeof initialFormData) => ({
    code: data.currency,
    symbol: data.symbol,
    name: data.name,
    position: data.position,
    decimalPlaces: data.decimalPlaces,
    thousandSeparator: data.thousandSeparator,
    decimalSeparator: data.decimalSeparator,
    hideDecimalForWholeNumbers: data.hideDecimalForWholeNumbers,
    enableMultiCurrency: data.enableMultiCurrency,
    enabledCurrencies: data.enabledCurrencies,
    defaultCurrency: data.currency,
    autoDetect: data.autoDetectCurrency,
    showCurrencySelector: data.showCurrencySelector
  });

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/currency"
      onDataChange={transformDataForSave}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Currency"
          description="Configure currency settings for different markets and regions"
        >
          <div className="nuvi-space-y-lg">
            {/* Markets Overview */}
            <div className="nuvi-alert nuvi-alert-info">
              <Globe className="h-4 w-4" />
              <div>
                <h4 className="nuvi-font-medium">Market-Specific Settings</h4>
                <p className="nuvi-text-sm">
                  Currency settings can be customized for different markets and regions. 
                  Configure your primary currency below, then use multi-currency to serve different markets.
                </p>
              </div>
            </div>

            {/* Primary Currency */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Store Currency</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Set the default currency for your store
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div>
                    <label className="nuvi-label">Currency</label>
                    <select 
                      className="nuvi-select"
                      value={formData.currency}
                      onChange={(e) => {
                        const currencyData: { [key: string]: { symbol: string; name: string } } = {
                          'USD': { symbol: '$', name: 'US Dollar' },
                          'EUR': { symbol: '€', name: 'Euro' },
                          'GBP': { symbol: '£', name: 'British Pound' },
                          'TRY': { symbol: '₺', name: 'Turkish Lira' },
                          'JPY': { symbol: '¥', name: 'Japanese Yen' },
                          'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
                          'AUD': { symbol: 'A$', name: 'Australian Dollar' },
                          'CHF': { symbol: 'CHF', name: 'Swiss Franc' },
                          'CNY': { symbol: '¥', name: 'Chinese Yuan' }
                        };
                        const selected = currencyData[e.target.value];
                        handleChange('currency', e.target.value);
                        handleChange('symbol', selected?.symbol || e.target.value);
                        handleChange('name', selected?.name || e.target.value);
                      }}
                    >
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="TRY">TRY - Turkish Lira (₺)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                      <option value="CAD">CAD - Canadian Dollar (C$)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="CHF">CHF - Swiss Franc (CHF)</option>
                      <option value="CNY">CNY - Chinese Yuan (¥)</option>
                    </select>
                  </div>

                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-bg-blue-50">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                      <DollarSign className="h-4 w-4 nuvi-text-blue-600" />
                      <h4 className="nuvi-font-medium nuvi-text-blue-900">Current Selection</h4>
                    </div>
                    <p className="nuvi-text-sm nuvi-text-blue-800">
                      <strong>{formData.name}</strong> ({formData.currency})
                      <br />
                      Symbol: {formData.symbol}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Currency Format */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Currency Format</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure how currency is displayed
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Symbol position</label>
                      <select 
                        className="nuvi-select"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                      >
                        <option value="before">Before amount ($100)</option>
                        <option value="after">After amount (100$)</option>
                        <option value="before-space">Before with space ($ 100)</option>
                        <option value="after-space">After with space (100 $)</option>
                      </select>
                    </div>
                    <div>
                      <label className="nuvi-label">Decimal places</label>
                      <select 
                        className="nuvi-select"
                        value={formData.decimalPlaces}
                        onChange={(e) => handleChange('decimalPlaces', parseInt(e.target.value))}
                      >
                        <option value="0">0 (100)</option>
                        <option value="1">1 (100.0)</option>
                        <option value="2">2 (100.00)</option>
                        <option value="3">3 (100.000)</option>
                      </select>
                    </div>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Thousand separator</label>
                      <select 
                        className="nuvi-select"
                        value={formData.thousandSeparator}
                        onChange={(e) => handleChange('thousandSeparator', e.target.value)}
                      >
                        <option value=",">Comma (1,000)</option>
                        <option value=".">Period (1.000)</option>
                        <option value=" ">Space (1 000)</option>
                        <option value="">None (1000)</option>
                      </select>
                    </div>
                    <div>
                      <label className="nuvi-label">Decimal separator</label>
                      <select 
                        className="nuvi-select"
                        value={formData.decimalSeparator}
                        onChange={(e) => handleChange('decimalSeparator', e.target.value)}
                      >
                        <option value=".">Period (100.50)</option>
                        <option value=",">Comma (100,50)</option>
                      </select>
                    </div>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Hide decimals for whole numbers</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">Show $10 instead of $10.00</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.hideDecimalForWholeNumbers} 
                        onChange={(e) => handleChange('hideDecimalForWholeNumbers', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>


            {/* Preview */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Preview</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  See how currency will be displayed in your store
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  {[9.99, 129.95, 1234.56, 10000].map((price) => {
                    const formatPrice = (amount: number) => {
                      const { symbol, position, decimalPlaces, thousandSeparator, decimalSeparator, hideDecimalForWholeNumbers } = formData;
                      
                      let finalDecimalPlaces = decimalPlaces;
                      if (hideDecimalForWholeNumbers && amount % 1 === 0) {
                        finalDecimalPlaces = 0;
                      }
                      
                      let formattedAmount = amount.toFixed(finalDecimalPlaces);
                      
                      if (decimalSeparator !== '.') {
                        formattedAmount = formattedAmount.replace('.', decimalSeparator);
                      }
                      
                      if (thousandSeparator) {
                        const parts = formattedAmount.split(decimalSeparator);
                        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
                        formattedAmount = parts.join(decimalSeparator);
                      }
                      
                      switch (position) {
                        case 'before':
                          return `${symbol}${formattedAmount}`;
                        case 'after':
                          return `${formattedAmount}${symbol}`;
                        case 'before-space':
                          return `${symbol} ${formattedAmount}`;
                        case 'after-space':
                          return `${formattedAmount} ${symbol}`;
                        default:
                          return `${symbol}${formattedAmount}`;
                      }
                    };
                    
                    return (
                      <div key={price} className="nuvi-flex nuvi-justify-between nuvi-p-sm nuvi-border nuvi-rounded">
                        <span className="nuvi-text-sm nuvi-text-muted">{price}</span>
                        <span className="nuvi-font-medium">{formatPrice(price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Multi-Currency Advanced */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Multi-Currency</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Allow customers to view and shop in their preferred currency
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable multi-currency</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to view prices in different currencies
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enableMultiCurrency} 
                        onChange={(e) => handleChange('enableMultiCurrency', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  {formData.enableMultiCurrency && (
                    <>
                      {/* Enabled Currencies */}
                      <div>
                        <label className="nuvi-label">Enabled currencies</label>
                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mb-sm">
                          Select which currencies customers can choose from
                        </p>
                        <div className="nuvi-grid nuvi-grid-cols-2 nuvi-md:grid-cols-3 nuvi-gap-sm">
                          {[
                            { code: 'USD', name: 'US Dollar', symbol: '$' },
                            { code: 'EUR', name: 'Euro', symbol: '€' },
                            { code: 'GBP', name: 'British Pound', symbol: '£' },
                            { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
                            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
                            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
                            { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
                            { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
                            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
                          ].map((currency) => (
                            <div key={currency.code} className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-sm nuvi-border nuvi-rounded">
                              <input 
                                type="checkbox" 
                                checked={formData.enabledCurrencies.includes(currency.code)} 
                                onChange={(e) => {
                                  const newCurrencies = e.target.checked 
                                    ? [...formData.enabledCurrencies, currency.code]
                                    : formData.enabledCurrencies.filter(c => c !== currency.code);
                                  handleChange('enabledCurrencies', newCurrencies);
                                }}
                                className="nuvi-checkbox" 
                              />
                              <div className="nuvi-flex-1">
                                <div className="nuvi-font-medium nuvi-text-sm">{currency.code}</div>
                                <div className="nuvi-text-xs nuvi-text-muted">{currency.symbol}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Currency Selector Settings */}
                      <div className="nuvi-space-y-sm">
                        <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                          <div>
                            <h4 className="nuvi-font-medium">Show currency selector</h4>
                            <p className="nuvi-text-sm nuvi-text-muted">
                              Display a currency picker in your store header
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.showCurrencySelector} 
                              onChange={(e) => handleChange('showCurrencySelector', e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                          </label>
                        </div>

                        <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                          <div>
                            <h4 className="nuvi-font-medium">Auto-detect customer currency</h4>
                            <p className="nuvi-text-sm nuvi-text-muted">
                              Automatically show prices in customer's local currency
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.autoDetectCurrency} 
                              onChange={(e) => handleChange('autoDetectCurrency', e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                          </label>
                        </div>
                      </div>

                      {/* Multi-Currency Preview */}
                      <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-bg-green-50">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                          <Globe className="h-4 w-4 nuvi-text-green-600" />
                          <h4 className="nuvi-font-medium nuvi-text-green-900">Multi-Currency Active</h4>
                        </div>
                        <p className="nuvi-text-sm nuvi-text-green-800">
                          Customers can now view prices in {formData.enabledCurrencies.length} currencies: {formData.enabledCurrencies.join(', ')}
                        </p>
                        <div className="nuvi-mt-sm nuvi-flex nuvi-gap-md nuvi-text-sm">
                          <span>$99.99 USD</span>
                          <span>•</span>
                          <span>€85.99 EUR</span>
                          <span>•</span>
                          <span>£76.99 GBP</span>
                        </div>
                      </div>
                    </>
                  )}

                  {!formData.enableMultiCurrency && (
                    <div className="nuvi-text-center nuvi-py-md nuvi-opacity-60">
                      <Globe className="h-8 w-8 nuvi-text-muted nuvi-mx-auto nuvi-mb-sm" />
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Enable multi-currency to allow customers to shop in their preferred currency
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="nuvi-alert nuvi-alert-info">
              <AlertCircle className="h-4 w-4" />
              <div>
                <h4 className="nuvi-font-medium">How Currency Conversion Works</h4>
                <p className="nuvi-text-sm">
                  {formData.enableMultiCurrency ? (
                    <>
                      Currency conversion uses real-time exchange rates updated daily. 
                      Customers see approximate prices in their selected currency, but checkout is always processed in your store currency ({formData.currency}).
                    </>
                  ) : (
                    <>
                      Changing your store currency will affect how prices are displayed to customers. 
                      Existing product prices will remain the same but be shown in the new currency format.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}