'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  CreditCard, Settings, Receipt, Shield, AlertCircle, Check, X,
  Info, ExternalLink, Key, Globe, DollarSign, Percent, MapPin,
  ToggleLeft, ToggleRight, Copy, Eye, EyeOff, Loader2
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'providers' as const, label: 'Payment Providers', icon: CreditCard },
  { id: 'settings' as const, label: 'Payment Settings', icon: Settings },
  { id: 'taxes' as const, label: 'Tax Configuration', icon: Receipt },
  { id: 'test' as const, label: 'Test Mode', icon: Shield }
];

interface PaymentSettings {
  nuvi?: {
    enabled: boolean;
    commission: number;
    fixedFee: number;
    accountVerified: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    bankAddress: string;
    accountType: 'checking' | 'savings';
  };
  stripe?: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    testMode: boolean;
  };
  paypal?: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    testMode: boolean;
  };
  manual?: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
    iban: string;
    instructions: string;
  };
  currency: string;
  captureMethod: 'automatic' | 'manual';
  statementDescriptor: string;
  saveCards: boolean;
  requireCVV: boolean;
  requirePostalCode: boolean;
  enableWallets: {
    applePay: boolean;
    googlePay: boolean;
  };
  taxes: {
    enabled: boolean;
    inclusive: boolean;
    defaultRate: number;
    regions: Array<{
      id: string;
      name: string;
      code: string;
      rate: number;
    }>;
  };
  testMode: {
    enabled: boolean;
    showBanner: boolean;
    testCards: boolean;
  };
}

export function PaymentsFormV2({ store }: { store: Store & { storeSettings?: any } }) {
  const [activeTab, setActiveTab] = useState<'providers' | 'settings' | 'taxes' | 'test'>('providers');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize form data
  const initialFormData: PaymentSettings = {
    nuvi: {
      enabled: store.storeSettings?.paymentMethods?.nuvi?.enabled || false,
      commission: store.storeSettings?.paymentMethods?.nuvi?.settings?.commission || 5.9,
      fixedFee: store.storeSettings?.paymentMethods?.nuvi?.settings?.fixedFee || 0.50,
      accountVerified: store.storeSettings?.paymentMethods?.nuvi?.accountVerified || false,
      bankName: store.storeSettings?.paymentMethods?.nuvi?.settings?.bankName || '',
      accountName: store.storeSettings?.paymentMethods?.nuvi?.settings?.accountName || '',
      accountNumber: store.storeSettings?.paymentMethods?.nuvi?.settings?.accountNumber || '',
      iban: store.storeSettings?.paymentMethods?.nuvi?.settings?.iban || '',
      swiftCode: store.storeSettings?.paymentMethods?.nuvi?.settings?.swiftCode || '',
      bankAddress: store.storeSettings?.paymentMethods?.nuvi?.settings?.bankAddress || '',
      accountType: store.storeSettings?.paymentMethods?.nuvi?.settings?.accountType || 'checking',
    },
    stripe: {
      enabled: store.storeSettings?.paymentMethods?.stripe?.enabled || false,
      publicKey: store.storeSettings?.paymentMethods?.stripe?.settings?.publicKey || '',
      secretKey: store.storeSettings?.paymentMethods?.stripe?.settings?.secretKey || '',
      webhookSecret: store.storeSettings?.paymentMethods?.stripe?.settings?.webhookSecret || '',
      testMode: store.storeSettings?.paymentMethods?.stripe?.testMode ?? true,
    },
    paypal: {
      enabled: store.storeSettings?.paymentMethods?.paypal?.enabled || false,
      clientId: store.storeSettings?.paymentMethods?.paypal?.settings?.clientId || '',
      clientSecret: store.storeSettings?.paymentMethods?.paypal?.settings?.clientSecret || '',
      testMode: store.storeSettings?.paymentMethods?.paypal?.testMode ?? true,
    },
    manual: {
      enabled: store.storeSettings?.paymentMethods?.manual?.enabled || false,
      bankName: store.storeSettings?.paymentMethods?.manual?.settings?.bankName || '',
      accountName: store.storeSettings?.paymentMethods?.manual?.settings?.accountName || store.name,
      accountNumber: store.storeSettings?.paymentMethods?.manual?.settings?.accountNumber || '',
      routingNumber: store.storeSettings?.paymentMethods?.manual?.settings?.routingNumber || '',
      swiftCode: store.storeSettings?.paymentMethods?.manual?.settings?.swiftCode || '',
      iban: store.storeSettings?.paymentMethods?.manual?.settings?.iban || '',
      instructions: store.storeSettings?.paymentMethods?.manual?.settings?.instructions || 'Please include your order number as the payment reference.',
    },
    currency: store.storeSettings?.paymentSettings?.currency || 'USD',
    captureMethod: store.storeSettings?.paymentSettings?.captureMethod || 'automatic',
    statementDescriptor: store.storeSettings?.paymentSettings?.statementDescriptor || store.name.substring(0, 22),
    saveCards: store.storeSettings?.paymentSettings?.saveCards ?? true,
    requireCVV: store.storeSettings?.paymentSettings?.requireCVV ?? true,
    requirePostalCode: store.storeSettings?.paymentSettings?.requirePostalCode ?? false,
    enableWallets: {
      applePay: store.storeSettings?.paymentSettings?.enableWallets?.applePay ?? true,
      googlePay: store.storeSettings?.paymentSettings?.enableWallets?.googlePay ?? true,
    },
    taxes: {
      enabled: store.storeSettings?.paymentSettings?.taxes?.enabled ?? false,
      inclusive: store.storeSettings?.paymentSettings?.taxes?.inclusive ?? false,
      defaultRate: store.storeSettings?.paymentSettings?.taxes?.defaultRate || 0,
      regions: store.storeSettings?.paymentSettings?.taxes?.regions || [],
    },
    testMode: {
      enabled: store.storeSettings?.paymentSettings?.testMode?.enabled ?? true,
      showBanner: store.storeSettings?.paymentSettings?.testMode?.showBanner ?? true,
      testCards: store.storeSettings?.paymentSettings?.testMode?.testCards ?? true,
    },
  };

  const transformDataForSave = (data: PaymentSettings) => {
    // Transform the data structure to match what the API expects
    const paymentMethods = [];
    
    // Add Nuvi if configured
    if (data.nuvi) {
      paymentMethods.push({
        provider: 'nuvi',
        enabled: data.nuvi.enabled,
        settings: {
          commission: data.nuvi.commission,
          fixedFee: data.nuvi.fixedFee,
          bankName: data.nuvi.bankName,
          accountName: data.nuvi.accountName,
          accountNumber: data.nuvi.accountNumber,
          iban: data.nuvi.iban,
          swiftCode: data.nuvi.swiftCode,
          bankAddress: data.nuvi.bankAddress,
          accountType: data.nuvi.accountType,
        },
        accountVerified: data.nuvi.accountVerified,
        displayName: 'Nuvi Payment',
        description: 'Accept payments through platform account'
      });
    }
    
    // Add Stripe if configured
    if (data.stripe) {
      paymentMethods.push({
        provider: 'stripe',
        enabled: data.stripe.enabled,
        testMode: data.stripe.testMode,
        settings: {
          publicKey: data.stripe.publicKey,
          secretKey: data.stripe.secretKey,
          webhookSecret: data.stripe.webhookSecret,
        },
        displayName: 'Credit/Debit Card',
        description: 'Pay with credit or debit card'
      });
    }
    
    // Add PayPal if configured
    if (data.paypal) {
      paymentMethods.push({
        provider: 'paypal',
        enabled: data.paypal.enabled,
        testMode: data.paypal.testMode,
        settings: {
          clientId: data.paypal.clientId,
          clientSecret: data.paypal.clientSecret,
        },
        displayName: 'PayPal',
        description: 'Pay with PayPal'
      });
    }
    
    // Add manual payment method if configured
    if (data.manual) {
      paymentMethods.push({
        provider: 'manual',
        enabled: data.manual.enabled,
        settings: {
          bankName: data.manual.bankName,
          accountName: data.manual.accountName,
          accountNumber: data.manual.accountNumber,
          routingNumber: data.manual.routingNumber,
          swiftCode: data.manual.swiftCode,
          iban: data.manual.iban,
          instructions: data.manual.instructions
        },
        displayName: 'Bank Transfer',
        description: 'Pay via bank transfer',
        instructions: data.manual.instructions
      });
    }
    
    return {
      paymentMethods
    };
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      // You could add a toast notification here
    }
  };

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/payment-methods"
      onDataChange={transformDataForSave}
    >
      {({ formData, handleChange, loading }) => {
        const addTaxRegion = () => {
          const newRegion = {
            id: Date.now().toString(),
            name: '',
            code: '',
            rate: 0,
          };
          handleChange('taxes.regions', [...formData.taxes.regions, newRegion]);
        };

        const removeTaxRegion = (id: string) => {
          handleChange('taxes.regions', formData.taxes.regions.filter(r => r.id !== id));
        };

        const updateTaxRegion = (id: string, field: string, value: any) => {
          const updatedRegions = formData.taxes.regions.map(region =>
            region.id === id ? { ...region, [field]: value } : region
          );
          handleChange('taxes.regions', updatedRegions);
        };

        return (
          <SettingsPageLayout
            title="Payment Settings"
            description="Configure payment methods and processing options"
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
              {activeTab === 'providers' && (
          <div className="nuvi-space-y-lg">
            {/* Nuvi Payment */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                    <div className="nuvi-p-sm nuvi-bg-green-100 nuvi-rounded-lg">
                      <DollarSign className="h-6 w-6 nuvi-text-green-600" />
                    </div>
                    <div>
                      <h3 className="nuvi-card-title">Nuvi Payment</h3>
                      <p className="nuvi-text-sm nuvi-text-secondary">
                        Accept payments without your own Stripe account
                      </p>
                    </div>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => {
                        handleChange('nuvi.enabled', !formData.nuvi?.enabled);
                        // Disable Stripe if Nuvi is being enabled
                        if (!formData.nuvi?.enabled && formData.stripe?.enabled) {
                          handleChange('stripe.enabled', false);
                        }
                      }}
                      className={`nuvi-toggle ${formData.nuvi?.enabled ? 'nuvi-toggle-on' : ''}`}
                    >
                      {formData.nuvi?.enabled ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    {formData.nuvi?.enabled && (
                      <button
                        type="button"
                        onClick={() => toggleSection('nuvi')}
                        className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                      >
                        {expandedSections['nuvi'] ? 'Hide' : 'Details'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {formData.nuvi?.enabled && expandedSections['nuvi'] && (
                <div className="nuvi-card-content nuvi-space-y-md">
                  <div className="nuvi-alert nuvi-alert-info nuvi-mb-md">
                    <Info className="h-4 w-4" />
                    <div>
                      <p className="nuvi-font-medium">Platform Payment System</p>
                      <p className="nuvi-text-sm nuvi-mt-xs">
                        Accept payments through Nuvi's payment infrastructure. No need to set up your own payment gateway.
                        The fee includes all costs: Stripe processing (2.9% + $0.30), taxes, bank transfer fees, and platform operation costs.
                      </p>
                    </div>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label" htmlFor="nuvi-commission">
                        Transaction Fee (%)
                      </label>
                      <div className="nuvi-relative">
                        <div className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-flex nuvi-items-center nuvi-justify-center">
                          <Percent className="h-4 w-4 nuvi-text-muted" />
                        </div>
                        <input
                          id="nuvi-commission"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.nuvi?.commission || 5.9}
                          onChange={(e) => handleChange('nuvi.commission', parseFloat(e.target.value))}
                          className="nuvi-input pl-10"
                          disabled
                        />
                      </div>
                      <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                        Includes Stripe fees, taxes, and platform costs
                      </p>
                    </div>

                    <div>
                      <label className="nuvi-label" htmlFor="nuvi-fixed-fee">
                        Fixed Fee ($)
                      </label>
                      <div className="nuvi-relative">
                        <div className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-flex nuvi-items-center nuvi-justify-center">
                          <DollarSign className="h-4 w-4 nuvi-text-muted" />
                        </div>
                        <input
                          id="nuvi-fixed-fee"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.nuvi?.fixedFee || 0.50}
                          onChange={(e) => handleChange('nuvi.fixedFee', parseFloat(e.target.value))}
                          className="nuvi-input pl-10"
                          disabled
                        />
                      </div>
                      <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                        Fixed fee per transaction
                      </p>
                    </div>
                  </div>

                  <div className="nuvi-border-t nuvi-pt-md">
                    <h4 className="nuvi-text-sm nuvi-font-medium nuvi-mb-sm">Bank Account Information</h4>
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mb-md">
                      Enter your bank account details to receive payments from Nuvi
                    </p>
                    
                    <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label" htmlFor="nuvi-bank-name">
                          Bank Name
                        </label>
                        <input
                          id="nuvi-bank-name"
                          type="text"
                          value={formData.nuvi?.bankName || ''}
                          onChange={(e) => handleChange('nuvi.bankName', e.target.value)}
                          className="nuvi-input"
                          placeholder="e.g. Bank of America"
                        />
                      </div>

                      <div>
                        <label className="nuvi-label" htmlFor="nuvi-account-name">
                          Account Holder Name
                        </label>
                        <input
                          id="nuvi-account-name"
                          type="text"
                          value={formData.nuvi?.accountName || ''}
                          onChange={(e) => handleChange('nuvi.accountName', e.target.value)}
                          className="nuvi-input"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="nuvi-label" htmlFor="nuvi-account-number">
                          Account Number
                        </label>
                        <input
                          id="nuvi-account-number"
                          type="text"
                          value={formData.nuvi?.accountNumber || ''}
                          onChange={(e) => handleChange('nuvi.accountNumber', e.target.value)}
                          className="nuvi-input"
                          placeholder="1234567890"
                        />
                      </div>

                      <div>
                        <label className="nuvi-label" htmlFor="nuvi-account-type">
                          Account Type
                        </label>
                        <select
                          id="nuvi-account-type"
                          value={formData.nuvi?.accountType || 'checking'}
                          onChange={(e) => handleChange('nuvi.accountType', e.target.value)}
                          className="nuvi-input"
                        >
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>

                      <div>
                        <label className="nuvi-label" htmlFor="nuvi-iban">
                          IBAN (International)
                        </label>
                        <input
                          id="nuvi-iban"
                          type="text"
                          value={formData.nuvi?.iban || ''}
                          onChange={(e) => handleChange('nuvi.iban', e.target.value)}
                          className="nuvi-input"
                          placeholder="GB29 NWBK 6016 1331 9268 19"
                        />
                      </div>

                      <div>
                        <label className="nuvi-label" htmlFor="nuvi-swift">
                          SWIFT/BIC Code
                        </label>
                        <input
                          id="nuvi-swift"
                          type="text"
                          value={formData.nuvi?.swiftCode || ''}
                          onChange={(e) => handleChange('nuvi.swiftCode', e.target.value)}
                          className="nuvi-input"
                          placeholder="NWBKGB2L"
                        />
                      </div>

                      <div className="nuvi-col-span-2">
                        <label className="nuvi-label" htmlFor="nuvi-bank-address">
                          Bank Address
                        </label>
                        <textarea
                          id="nuvi-bank-address"
                          value={formData.nuvi?.bankAddress || ''}
                          onChange={(e) => handleChange('nuvi.bankAddress', e.target.value)}
                          className="nuvi-input"
                          rows={2}
                          placeholder="123 Main St, New York, NY 10001, USA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="nuvi-border-t nuvi-pt-md">
                    <h4 className="nuvi-text-sm nuvi-font-medium nuvi-mb-sm">Account Status</h4>
                    {formData.nuvi?.accountVerified ? (
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="nuvi-text-sm">Your account is verified and ready to accept payments</span>
                      </div>
                    ) : (
                      <div className="nuvi-space-y-sm">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-text-yellow-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="nuvi-text-sm">Account verification pending</span>
                        </div>
                        <p className="nuvi-text-xs nuvi-text-muted">
                          To use Nuvi Payment, you need to complete account verification.
                          Required documents and information will be sent to you via email.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="nuvi-bg-gray-50 nuvi-p-md nuvi-rounded-lg nuvi-mt-md">
                    <h4 className="nuvi-text-sm nuvi-font-medium nuvi-mb-sm">Fee Breakdown & Example</h4>
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mb-sm">
                      For a $100 sale, here's what's included in our fee:
                    </p>
                    <div className="nuvi-space-y-xs nuvi-text-sm">
                      <div className="nuvi-flex nuvi-justify-between">
                        <span>Sale Amount:</span>
                        <span className="nuvi-font-medium">$100.00</span>
                      </div>
                      <div className="nuvi-bg-yellow-50 nuvi-p-sm nuvi-rounded nuvi-mt-xs nuvi-mb-xs">
                        <p className="nuvi-text-xs nuvi-text-yellow-800">
                          <strong>Important:</strong> In most countries, VAT/Tax (typically 18-20%) is added on top of the sale price. 
                          For a $100 product, the customer pays $120 (with 20% VAT).
                        </p>
                      </div>
                      <div className="nuvi-border-t nuvi-pt-xs">
                        <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">What's included in our {formData.nuvi?.commission || 5.9}% + ${formData.nuvi?.fixedFee || 0.50} fee:</div>
                        <div className="nuvi-flex nuvi-justify-between nuvi-text-xs nuvi-text-muted">
                          <span className="nuvi-ml-4">• Stripe Processing (2.9% + $0.30)</span>
                          <span>$3.20</span>
                        </div>
                        <div className="nuvi-flex nuvi-justify-between nuvi-text-xs nuvi-text-muted">
                          <span className="nuvi-ml-4">• Bank Transfer Fees</span>
                          <span>$0.25</span>
                        </div>
                        <div className="nuvi-flex nuvi-justify-between nuvi-text-xs nuvi-text-muted">
                          <span className="nuvi-ml-4">• Currency Exchange (if needed)</span>
                          <span>$0.20</span>
                        </div>
                        <div className="nuvi-flex nuvi-justify-between nuvi-text-xs nuvi-text-muted">
                          <span className="nuvi-ml-4">• Platform Operations & Profit</span>
                          <span>$2.75</span>
                        </div>
                      </div>
                      <div className="nuvi-flex nuvi-justify-between nuvi-font-medium nuvi-text-red-600 nuvi-border-t nuvi-pt-xs">
                        <span>Total Nuvi Fee ({formData.nuvi?.commission || 5.9}% + ${formData.nuvi?.fixedFee || 0.50}):</span>
                        <span>-${((100 * (formData.nuvi?.commission || 5.9)) / 100 + (formData.nuvi?.fixedFee || 0.50)).toFixed(2)}</span>
                      </div>
                      <div className="nuvi-flex nuvi-justify-between nuvi-border-t nuvi-pt-xs nuvi-font-medium">
                        <span>Your Net Earnings:</span>
                        <span className="nuvi-text-green-600">
                          ${(100 - ((100 * (formData.nuvi?.commission || 5.9)) / 100) - (formData.nuvi?.fixedFee || 0.50)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-md nuvi-italic">
                      * VAT/Sales tax is handled separately and added to customer prices based on their location and local regulations.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stripe */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                    <div className="nuvi-p-sm nuvi-bg-primary/10 nuvi-rounded-lg">
                      <CreditCard className="h-6 w-6 nuvi-text-primary" />
                    </div>
                    <div>
                      <h3 className="nuvi-card-title">Stripe</h3>
                      <p className="nuvi-text-sm nuvi-text-secondary">
                        Accept credit cards, debit cards, and digital wallets
                      </p>
                    </div>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => {
                        handleChange('stripe.enabled', !formData.stripe?.enabled);
                        // Disable Nuvi if Stripe is being enabled
                        if (!formData.stripe?.enabled && formData.nuvi?.enabled) {
                          handleChange('nuvi.enabled', false);
                        }
                      }}
                      className={`nuvi-toggle ${formData.stripe?.enabled ? 'nuvi-toggle-on' : ''}`}
                    >
                      {formData.stripe?.enabled ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    {formData.stripe?.enabled && (
                      <button
                        type="button"
                        onClick={() => toggleSection('stripe')}
                        className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                      >
                        {expandedSections['stripe'] ? 'Hide' : 'Configure'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {formData.stripe?.enabled && expandedSections['stripe'] && (
                <div className="nuvi-card-content nuvi-space-y-md">
                  {formData.nuvi?.enabled && (
                    <div className="nuvi-alert nuvi-alert-warning nuvi-mb-md">
                      <Info className="h-4 w-4" />
                      <div>
                        <p>Nuvi Payment is currently enabled. You cannot use both Nuvi Payment and your own Stripe account simultaneously.</p>
                      </div>
                    </div>
                  )}
                  <div className="nuvi-alert nuvi-alert-info nuvi-mb-md">
                    <Info className="h-4 w-4" />
                    <div>
                      <p>Configure your Stripe integration to accept payments.</p>
                      <a 
                        href="https://dashboard.stripe.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline nuvi-inline-flex nuvi-items-center nuvi-gap-xs nuvi-mt-xs"
                      >
                        Go to Stripe Dashboard
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="stripe-public-key">
                      Publishable Key
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="stripe-public-key"
                        type="text"
                        value={formData.stripe.publicKey}
                        onChange={(e) => handleChange('stripe.publicKey', e.target.value)}
                        className="nuvi-input nuvi-pr-20"
                        placeholder={formData.stripe.testMode ? 'pk_test_...' : 'pk_live_...'}
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.stripe?.publicKey || '')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="stripe-secret-key">
                      Secret Key
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="stripe-secret-key"
                        type={showSecrets['stripe-secret'] ? 'text' : 'password'}
                        value={formData.stripe.secretKey}
                        onChange={(e) => handleChange('stripe.secretKey', e.target.value)}
                        className="nuvi-input nuvi-pr-20"
                        placeholder={formData.stripe.testMode ? 'sk_test_...' : 'sk_live_...'}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('stripe-secret')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        {showSecrets['stripe-secret'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="stripe-webhook-secret">
                      Webhook Secret
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="stripe-webhook-secret"
                        type={showSecrets['stripe-webhook'] ? 'text' : 'password'}
                        value={formData.stripe.webhookSecret}
                        onChange={(e) => handleChange('stripe.webhookSecret', e.target.value)}
                        className="nuvi-input nuvi-pr-20"
                        placeholder="whsec_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('stripe-webhook')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        {showSecrets['stripe-webhook'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="nuvi-mt-sm nuvi-space-y-xs">
                      <p className="nuvi-help-text">
                        Webhook endpoint: <code className="nuvi-text-xs nuvi-bg-muted nuvi-px-xs nuvi-py-1 nuvi-rounded">{`${window.location.origin}/api/webhooks/stripe`}</code>
                      </p>
                      <details className="nuvi-text-sm nuvi-text-secondary">
                        <summary className="nuvi-cursor-pointer hover:nuvi-text-primary">How to set up webhooks</summary>
                        <ol className="nuvi-mt-sm nuvi-ml-md nuvi-list-decimal nuvi-space-y-xs">
                          <li>Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="nuvi-text-primary hover:nuvi-underline">Stripe Dashboard → Webhooks</a></li>
                          <li>Click "Add endpoint"</li>
                          <li>Enter the webhook endpoint URL above</li>
                          <li>Select these events: 
                            <ul className="nuvi-ml-md nuvi-list-disc nuvi-mt-xs">
                              <li>payment_intent.succeeded</li>
                              <li>payment_intent.payment_failed</li>
                              <li>charge.refunded</li>
                            </ul>
                          </li>
                          <li>Copy the signing secret and paste it above</li>
                        </ol>
                      </details>
                    </div>
                  </div>

                  <label className="nuvi-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.stripe.testMode}
                      onChange={(e) => handleChange('stripe.testMode', e.target.checked)}
                      className="nuvi-checkbox"
                    />
                    <span>Use test mode</span>
                  </label>
                </div>
              )}
            </div>

            {/* PayPal */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                    <div className="nuvi-p-sm nuvi-bg-blue-100 nuvi-rounded-lg">
                      <DollarSign className="h-6 w-6 nuvi-text-blue-600" />
                    </div>
                    <div>
                      <h3 className="nuvi-card-title">PayPal</h3>
                      <p className="nuvi-text-sm nuvi-text-secondary">
                        Accept PayPal and Venmo payments
                      </p>
                    </div>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => handleChange('paypal.enabled', !formData.paypal?.enabled)}
                      className={`nuvi-toggle ${formData.paypal?.enabled ? 'nuvi-toggle-on' : ''}`}
                    >
                      {formData.paypal?.enabled ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    {formData.paypal?.enabled && (
                      <button
                        type="button"
                        onClick={() => toggleSection('paypal')}
                        className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                      >
                        {expandedSections['paypal'] ? 'Hide' : 'Configure'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {formData.paypal?.enabled && expandedSections['paypal'] && (
                <div className="nuvi-card-content nuvi-space-y-md">
                  <div className="nuvi-alert nuvi-alert-info nuvi-mb-md">
                    <Info className="h-4 w-4" />
                    <div>
                      <p>Configure your PayPal business account to accept payments.</p>
                      <a 
                        href="https://developer.paypal.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline nuvi-inline-flex nuvi-items-center nuvi-gap-xs nuvi-mt-xs"
                      >
                        Go to PayPal Developer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="paypal-client-id">
                      Client ID
                    </label>
                    <input
                      id="paypal-client-id"
                      type="text"
                      value={formData.paypal.clientId}
                      onChange={(e) => handleChange('paypal.clientId', e.target.value)}
                      className="nuvi-input"
                      placeholder="AYSq3RDGsmBLJE-otTkBtM..."
                    />
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="paypal-client-secret">
                      Client Secret
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="paypal-client-secret"
                        type={showSecrets['paypal-secret'] ? 'text' : 'password'}
                        value={formData.paypal.clientSecret}
                        onChange={(e) => handleChange('paypal.clientSecret', e.target.value)}
                        className="nuvi-input nuvi-pr-12"
                        placeholder="EGnHDxD_qRPdaLdZz8..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('paypal-secret')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        {showSecrets['paypal-secret'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="nuvi-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.paypal.testMode}
                      onChange={(e) => handleChange('paypal.testMode', e.target.checked)}
                      className="nuvi-checkbox"
                    />
                    <span>Use sandbox mode</span>
                  </label>
                </div>
              )}
            </div>

            {/* Bank Transfer */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                    <div className="nuvi-p-sm nuvi-bg-green-100 nuvi-rounded-lg">
                      <MapPin className="h-6 w-6 nuvi-text-green-600" />
                    </div>
                    <div>
                      <h3 className="nuvi-card-title">Bank Transfer</h3>
                      <p className="nuvi-text-sm nuvi-text-secondary">
                        Accept direct bank transfers and wire payments
                      </p>
                    </div>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => handleChange('manual.enabled', !formData.manual?.enabled)}
                      className={`nuvi-toggle ${formData.manual?.enabled ? 'nuvi-toggle-on' : ''}`}
                    >
                      {formData.manual?.enabled ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    {formData.manual?.enabled && (
                      <button
                        type="button"
                        onClick={() => toggleSection('manual')}
                        className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                      >
                        {expandedSections['manual'] ? 'Hide' : 'Configure'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {formData.manual?.enabled && expandedSections['manual'] && (
                <div className="nuvi-card-content nuvi-space-y-md">
                  <div className="nuvi-alert nuvi-alert-info nuvi-mb-md">
                    <Info className="h-4 w-4" />
                    <div>
                      <p>Configure your bank account details for customers to make direct transfers.</p>
                      <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                        Orders will be marked as pending until you manually confirm payment receipt.
                      </p>
                    </div>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label" htmlFor="bank-name">
                        Bank Name
                      </label>
                      <input
                        id="bank-name"
                        type="text"
                        value={formData.manual.bankName}
                        onChange={(e) => handleChange('manual.bankName', e.target.value)}
                        className="nuvi-input"
                        placeholder="e.g., Chase Bank"
                      />
                    </div>

                    <div>
                      <label className="nuvi-label" htmlFor="account-name">
                        Account Name
                      </label>
                      <input
                        id="account-name"
                        type="text"
                        value={formData.manual.accountName}
                        onChange={(e) => handleChange('manual.accountName', e.target.value)}
                        className="nuvi-input"
                        placeholder="Your Business Name"
                      />
                    </div>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label" htmlFor="account-number">
                        Account Number
                      </label>
                      <div className="nuvi-relative">
                        <input
                          id="account-number"
                          type={showSecrets['account-number'] ? 'text' : 'password'}
                          value={formData.manual.accountNumber}
                          onChange={(e) => handleChange('manual.accountNumber', e.target.value)}
                          className="nuvi-input nuvi-pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('account-number')}
                          className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                        >
                          {showSecrets['account-number'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="nuvi-label" htmlFor="routing-number">
                        Routing Number
                      </label>
                      <input
                        id="routing-number"
                        type="text"
                        value={formData.manual.routingNumber}
                        onChange={(e) => handleChange('manual.routingNumber', e.target.value)}
                        className="nuvi-input"
                        placeholder="123456789"
                      />
                    </div>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label" htmlFor="swift-code">
                        SWIFT/BIC Code
                      </label>
                      <input
                        id="swift-code"
                        type="text"
                        value={formData.manual.swiftCode}
                        onChange={(e) => handleChange('manual.swiftCode', e.target.value)}
                        className="nuvi-input"
                        placeholder="CHASUS33"
                      />
                    </div>

                    <div>
                      <label className="nuvi-label" htmlFor="iban">
                        IBAN (Optional)
                      </label>
                      <input
                        id="iban"
                        type="text"
                        value={formData.manual.iban}
                        onChange={(e) => handleChange('manual.iban', e.target.value)}
                        className="nuvi-input"
                        placeholder="GB82 WEST 1234 5698 7654 32"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="instructions">
                      Payment Instructions
                    </label>
                    <textarea
                      id="instructions"
                      value={formData.manual.instructions}
                      onChange={(e) => handleChange('manual.instructions', e.target.value)}
                      className="nuvi-textarea"
                      rows={4}
                      placeholder="Please include your order number as the payment reference. Your order will be processed within 1-2 business days after payment confirmation."
                    />
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                      These instructions will be shown to customers during checkout and in order confirmation emails.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">General Settings</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div>
                  <label className="nuvi-label" htmlFor="currency">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="nuvi-select"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>

                <div>
                  <label className="nuvi-label" htmlFor="capture-method">
                    Payment Capture Method
                  </label>
                  <select
                    id="capture-method"
                    value={formData.captureMethod}
                    onChange={(e) => handleChange('captureMethod', e.target.value)}
                    className="nuvi-select"
                  >
                    <option value="automatic">Automatic - Charge immediately</option>
                    <option value="manual">Manual - Authorize and capture later</option>
                  </select>
                  <p className="nuvi-help-text">
                    {formData.captureMethod === 'automatic' 
                      ? 'Payments will be charged immediately upon order completion.'
                      : 'Payments will be authorized but not charged until you manually capture them.'}
                  </p>
                </div>

                <div>
                  <label className="nuvi-label" htmlFor="statement-descriptor">
                    Statement Descriptor
                  </label>
                  <input
                    id="statement-descriptor"
                    type="text"
                    value={formData.statementDescriptor}
                    onChange={(e) => handleChange('statementDescriptor', e.target.value)}
                    className="nuvi-input"
                    maxLength={22}
                    placeholder="MYSTORE"
                  />
                  <p className="nuvi-help-text">
                    This appears on customer credit card statements (max 22 characters)
                  </p>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Security Settings</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.saveCards}
                    onChange={(e) => handleChange('saveCards', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Allow customers to save payment methods</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Customers can save their cards for faster checkout
                    </p>
                  </div>
                </label>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requireCVV}
                    onChange={(e) => handleChange('requireCVV', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Require CVV for all transactions</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Extra security by requiring the 3-4 digit security code
                    </p>
                  </div>
                </label>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requirePostalCode}
                    onChange={(e) => handleChange('requirePostalCode', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Require postal code verification</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Match billing postal code for fraud prevention
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Digital Wallets</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.enableWallets.applePay}
                    onChange={(e) => handleChange('enableWallets.applePay', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Apple Pay</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Allow customers to pay with Apple Pay on supported devices
                    </p>
                  </div>
                </label>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.enableWallets.googlePay}
                    onChange={(e) => handleChange('enableWallets.googlePay', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Google Pay</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Allow customers to pay with Google Pay
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'taxes' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Tax Configuration</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.taxes.enabled}
                    onChange={(e) => handleChange('taxes.enabled', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Enable tax calculation</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Automatically calculate and collect taxes
                    </p>
                  </div>
                </label>

                {formData.taxes.enabled && (
                  <>
                    <div>
                      <label className="nuvi-label">Tax Display</label>
                      <div className="nuvi-space-y-sm">
                        <label className="nuvi-radio-label">
                          <input
                            type="radio"
                            name="tax-display"
                            checked={!formData.taxes.inclusive}
                            onChange={() => handleChange('taxes.inclusive', false)}
                            className="nuvi-radio"
                          />
                          <div>
                            <span>Tax Exclusive</span>
                            <p className="nuvi-text-sm nuvi-text-secondary">
                              Show prices without tax, add tax at checkout
                            </p>
                          </div>
                        </label>
                        <label className="nuvi-radio-label">
                          <input
                            type="radio"
                            name="tax-display"
                            checked={formData.taxes.inclusive}
                            onChange={() => handleChange('taxes.inclusive', true)}
                            className="nuvi-radio"
                          />
                          <div>
                            <span>Tax Inclusive</span>
                            <p className="nuvi-text-sm nuvi-text-secondary">
                              Show prices with tax included
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="nuvi-label" htmlFor="default-tax-rate">
                        Default Tax Rate (%)
                      </label>
                      <input
                        id="default-tax-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.taxes.defaultRate}
                        onChange={(e) => handleChange('taxes.defaultRate', parseFloat(e.target.value) || 0)}
                        className="nuvi-input"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {formData.taxes.enabled && (
              <div className="nuvi-card">
                <div className="nuvi-card-header nuvi-flex nuvi-justify-between nuvi-items-center">
                  <h3 className="nuvi-card-title">Regional Tax Rates</h3>
                  <button
                    type="button"
                    onClick={addTaxRegion}
                    className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                  >
                    Add Region
                  </button>
                </div>
                <div className="nuvi-card-content">
                  {formData.taxes.regions.length === 0 ? (
                    <p className="nuvi-text-center nuvi-text-muted nuvi-py-lg">
                      No regional tax rates configured
                    </p>
                  ) : (
                    <div className="nuvi-space-y-md">
                      {formData.taxes.regions.map((region) => (
                        <div key={region.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md">
                            <div>
                              <label className="nuvi-label nuvi-text-sm">Region Name</label>
                              <input
                                type="text"
                                value={region.name}
                                onChange={(e) => updateTaxRegion(region.id, 'name', e.target.value)}
                                className="nuvi-input nuvi-input-sm"
                                placeholder="California"
                              />
                            </div>
                            <div>
                              <label className="nuvi-label nuvi-text-sm">Code</label>
                              <input
                                type="text"
                                value={region.code}
                                onChange={(e) => updateTaxRegion(region.id, 'code', e.target.value)}
                                className="nuvi-input nuvi-input-sm"
                                placeholder="CA"
                                maxLength={2}
                              />
                            </div>
                            <div>
                              <label className="nuvi-label nuvi-text-sm">Tax Rate (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={region.rate}
                                onChange={(e) => updateTaxRegion(region.id, 'rate', parseFloat(e.target.value) || 0)}
                                className="nuvi-input nuvi-input-sm"
                              />
                            </div>
                            <div className="nuvi-flex nuvi-items-end">
                              <button
                                type="button"
                                onClick={() => removeTaxRegion(region.id)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-error"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Test Mode Settings</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.testMode.enabled}
                    onChange={(e) => handleChange('testMode.enabled', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Enable test mode</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Process test transactions without charging real payment methods
                    </p>
                  </div>
                </label>

                {formData.testMode.enabled && (
                  <>
                    <label className="nuvi-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.testMode.showBanner}
                        onChange={(e) => handleChange('testMode.showBanner', e.target.checked)}
                        className="nuvi-checkbox"
                      />
                      <div>
                        <span>Show test mode banner</span>
                        <p className="nuvi-text-sm nuvi-text-secondary">
                          Display a banner on your store indicating test mode is active
                        </p>
                      </div>
                    </label>

                    <label className="nuvi-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.testMode.testCards}
                        onChange={(e) => handleChange('testMode.testCards', e.target.checked)}
                        className="nuvi-checkbox"
                      />
                      <div>
                        <span>Enable test card numbers</span>
                        <p className="nuvi-text-sm nuvi-text-secondary">
                          Allow using test card numbers for testing checkout
                        </p>
                      </div>
                    </label>

                    <div className="nuvi-alert nuvi-alert-warning">
                      <AlertCircle className="h-4 w-4" />
                      <div>
                        <p className="nuvi-font-medium">Test mode is enabled</p>
                        <p className="nuvi-text-sm">
                          No real payments will be processed. Use test card numbers like 4242 4242 4242 4242.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="nuvi-border-t nuvi-pt-md">
                  <h4 className="nuvi-font-medium nuvi-mb-sm">Test Card Numbers</h4>
                  <div className="nuvi-space-y-sm nuvi-text-sm">
                    <div className="nuvi-flex nuvi-justify-between">
                      <span className="nuvi-font-mono">4242 4242 4242 4242</span>
                      <span className="nuvi-text-secondary">Successful payment</span>
                    </div>
                    <div className="nuvi-flex nuvi-justify-between">
                      <span className="nuvi-font-mono">4000 0000 0000 0002</span>
                      <span className="nuvi-text-secondary">Card declined</span>
                    </div>
                    <div className="nuvi-flex nuvi-justify-between">
                      <span className="nuvi-font-mono">4000 0000 0000 9995</span>
                      <span className="nuvi-text-secondary">Insufficient funds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
              )}
            </div>
          </SettingsPageLayout>
        );
      }}
    </SettingsFormWrapper>
  );
}