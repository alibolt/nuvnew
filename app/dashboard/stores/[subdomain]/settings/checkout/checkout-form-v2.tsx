'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  FileText, Settings, Users, Package,
  AlertCircle, Eye, EyeOff, Mail, Phone,
  MapPin, CreditCard, ShoppingCart, Clock,
  CheckSquare, Square, ToggleLeft, ToggleRight,
  Info, Gift, Plus, Trash2, Edit2, Image, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { ImagePickerModal } from '@/components/ui/image-picker-modal';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'fields' as const, label: 'Form Fields', icon: FileText },
  { id: 'behavior' as const, label: 'Checkout Behavior', icon: Settings },
  { id: 'accounts' as const, label: 'Customer Accounts', icon: Users },
  { id: 'post' as const, label: 'Post-Purchase', icon: Package }
];

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required: boolean;
  options?: string[];
  section: 'customer' | 'shipping' | 'billing' | 'additional';
}

export function CheckoutFormV2({ store }: { store: Store & { storeSettings?: any } }) {
  const [activeTab, setActiveTab] = useState<'fields' | 'behavior' | 'accounts' | 'post'>('fields');
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Initialize form data from store settings
  const initialFormData = {
    // Form Fields - now with show/require options
    showEmail: store.storeSettings?.checkoutSettings?.showEmail ?? true,
    requireEmail: store.storeSettings?.checkoutSettings?.requireEmail ?? true,
    showPhone: store.storeSettings?.checkoutSettings?.showPhone ?? true,
    requirePhone: store.storeSettings?.checkoutSettings?.requirePhone ?? true,
    showCompany: store.storeSettings?.checkoutSettings?.showCompany ?? true,
    requireCompany: store.storeSettings?.checkoutSettings?.requireCompany ?? false,
    showAddress2: store.storeSettings?.checkoutSettings?.showAddress2 ?? true,
    requireAddress2: store.storeSettings?.checkoutSettings?.requireAddress2 ?? false,
    showNewsletterSignup: store.storeSettings?.checkoutSettings?.showNewsletterSignup ?? true,
    showSpecialInstructions: store.storeSettings?.checkoutSettings?.showSpecialInstructions ?? true,
    customFields: store.storeSettings?.checkoutSettings?.customFields || [],
    
    // Checkout Behavior
    enableGuestCheckout: store.storeSettings?.checkoutSettings?.enableGuestCheckout ?? true,
    showShippingCalculator: store.storeSettings?.checkoutSettings?.showShippingCalculator ?? true,
    requireAccountCreation: store.storeSettings?.checkoutSettings?.requireAccountCreation ?? false,
    enableExpressCheckout: store.storeSettings?.checkoutSettings?.enableExpressCheckout ?? true,
    showOrderSummary: store.storeSettings?.checkoutSettings?.showOrderSummary ?? true,
    enableTipsAndGratuity: store.storeSettings?.checkoutSettings?.enableTipsAndGratuity ?? false,
    checkoutLogo: store.storeSettings?.checkoutSettings?.checkoutLogo || '',
    requireTermsAcceptance: store.storeSettings?.checkoutSettings?.requireTermsAcceptance ?? true,
    showTermsAndConditions: store.storeSettings?.checkoutSettings?.showTermsAndConditions ?? true,
    showPrivacyPolicy: store.storeSettings?.checkoutSettings?.showPrivacyPolicy ?? true,
    showReturnPolicy: store.storeSettings?.checkoutSettings?.showReturnPolicy ?? true,
    
    // Customer Accounts
    accountCreation: store.storeSettings?.checkoutSettings?.accountCreation || 'optional', // required, optional, disabled
    passwordRequirements: {
      minLength: store.storeSettings?.checkoutSettings?.passwordRequirements?.minLength || 8,
      requireUppercase: store.storeSettings?.checkoutSettings?.passwordRequirements?.requireUppercase ?? false,
      requireNumbers: store.storeSettings?.checkoutSettings?.passwordRequirements?.requireNumbers ?? false,
      requireSpecialChars: store.storeSettings?.checkoutSettings?.passwordRequirements?.requireSpecialChars ?? false
    },
    enableSocialLogin: store.storeSettings?.checkoutSettings?.enableSocialLogin ?? false,
    allowAccountDeletion: store.storeSettings?.checkoutSettings?.allowAccountDeletion ?? true,
    
    // Post-Purchase
    showThankYouPage: store.storeSettings?.checkoutSettings?.showThankYouPage ?? true,
    enableOrderTracking: store.storeSettings?.checkoutSettings?.enableOrderTracking ?? true,
    showRecommendedProducts: store.storeSettings?.checkoutSettings?.showRecommendedProducts ?? true,
    enableReviews: store.storeSettings?.checkoutSettings?.enableReviews ?? true,
    sendConfirmationEmail: store.storeSettings?.checkoutSettings?.sendConfirmationEmail ?? true,
    redirectUrl: store.storeSettings?.checkoutSettings?.redirectUrl || '',
    thankYouMessage: store.storeSettings?.checkoutSettings?.thankYouMessage || 'Thank you for your order!'
  };

  const transformDataForSave = (data: typeof initialFormData) => ({
    checkoutSettings: data
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
          title="Checkout Settings"
          description="Customize your checkout process and form fields"
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
        {activeTab === 'fields' && (
          <div className="nuvi-space-y-lg">
            {/* Required Fields */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Required Information</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Choose which fields are required during checkout
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                        <Mail className="h-4 w-4 nuvi-text-muted" />
                        <div>
                          <h4 className="nuvi-font-medium">Email Address</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">For order confirmation</p>
                        </div>
                      </div>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-lg nuvi-mt-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.showEmail}
                            onChange={(e) => {
                              handleChange('showEmail', e.target.checked);
                              if (!e.target.checked) {
                                handleChange('requireEmail', false);
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Show field</span>
                      </div>
                      <div className={`nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit ${!formData.showEmail ? 'nuvi-opacity-50' : ''}`}>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.requireEmail}
                            onChange={(e) => handleChange('requireEmail', e.target.checked)}
                            disabled={!formData.showEmail}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)] disabled:cursor-not-allowed disabled:opacity-50"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Required</span>
                      </div>
                    </div>
                  </div>

                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                        <Phone className="h-4 w-4 nuvi-text-muted" />
                        <div>
                          <h4 className="nuvi-font-medium">Phone Number</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">For delivery updates and support</p>
                        </div>
                      </div>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-lg nuvi-mt-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.showPhone}
                            onChange={(e) => {
                              handleChange('showPhone', e.target.checked);
                              if (!e.target.checked) {
                                handleChange('requirePhone', false);
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Show field</span>
                      </div>
                      <div className={`nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit ${!formData.showPhone ? 'nuvi-opacity-50' : ''}`}>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.requirePhone}
                            onChange={(e) => handleChange('requirePhone', e.target.checked)}
                            disabled={!formData.showPhone}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)] disabled:cursor-not-allowed disabled:opacity-50"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Required</span>
                      </div>
                    </div>
                  </div>

                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                        <MapPin className="h-4 w-4 nuvi-text-muted" />
                        <div>
                          <h4 className="nuvi-font-medium">Company Name</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">For business orders</p>
                        </div>
                      </div>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-lg nuvi-mt-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.showCompany}
                            onChange={(e) => {
                              handleChange('showCompany', e.target.checked);
                              if (!e.target.checked) {
                                handleChange('requireCompany', false);
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Show field</span>
                      </div>
                      <div className={`nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit ${!formData.showCompany ? 'nuvi-opacity-50' : ''}`}>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.requireCompany}
                            onChange={(e) => handleChange('requireCompany', e.target.checked)}
                            disabled={!formData.showCompany}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)] disabled:cursor-not-allowed disabled:opacity-50"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Required</span>
                      </div>
                    </div>
                  </div>

                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                        <MapPin className="h-4 w-4 nuvi-text-muted" />
                        <div>
                          <h4 className="nuvi-font-medium">Address Line 2</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">Apartment, suite, unit, etc.</p>
                        </div>
                      </div>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-lg nuvi-mt-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.showAddress2}
                            onChange={(e) => {
                              handleChange('showAddress2', e.target.checked);
                              if (!e.target.checked) {
                                handleChange('requireAddress2', false);
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Show field</span>
                      </div>
                      <div className={`nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-min-w-fit ${!formData.showAddress2 ? 'nuvi-opacity-50' : ''}`}>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.requireAddress2}
                            onChange={(e) => handleChange('requireAddress2', e.target.checked)}
                            disabled={!formData.showAddress2}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)] disabled:cursor-not-allowed disabled:opacity-50"></div>
                        </label>
                        <span className="nuvi-text-sm nuvi-whitespace-nowrap">Required</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Optional Fields</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Additional fields to show during checkout
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <Mail className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Newsletter Signup</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Allow customers to subscribe to marketing emails</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showNewsletterSignup}
                        onChange={(e) => handleChange('showNewsletterSignup', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <FileText className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Special Instructions</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Let customers add delivery or gift notes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showSpecialInstructions}
                        onChange={(e) => handleChange('showSpecialInstructions', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Custom Fields</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Add custom fields for specific business needs
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const newField: CustomField = {
                        id: `field_${Date.now()}`,
                        label: '',
                        type: 'text',
                        placeholder: '',
                        required: false,
                        options: [],
                        section: 'customer'
                      };
                      const currentFields = formData.customFields || [];
                      handleChange('customFields', [...currentFields, newField]);
                    }}
                    className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                {formData.customFields && formData.customFields.length > 0 ? (
                  <div className="nuvi-space-y-md">
                    {formData.customFields.map((field: CustomField, index: number) => (
                      <div key={field.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div className="nuvi-space-y-md">
                          <div className="nuvi-flex nuvi-gap-md">
                            <div className="nuvi-flex-1">
                              <label className="nuvi-label">Field Label</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => {
                                  const updatedFields = [...formData.customFields];
                                  updatedFields[index] = { ...field, label: e.target.value };
                                  handleChange('customFields', updatedFields);
                                }}
                                placeholder="e.g., VAT Number"
                                className="nuvi-input"
                              />
                            </div>
                            <div className="nuvi-w-40">
                              <label className="nuvi-label">Field Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const updatedFields = [...formData.customFields];
                                  updatedFields[index] = { 
                                    ...field, 
                                    type: e.target.value as CustomField['type'],
                                    options: e.target.value === 'select' ? [''] : undefined
                                  };
                                  handleChange('customFields', updatedFields);
                                }}
                                className="nuvi-select"
                              >
                                <option value="text">Text</option>
                                <option value="textarea">Textarea</option>
                                <option value="select">Dropdown</option>
                                <option value="checkbox">Checkbox</option>
                              </select>
                            </div>
                            <div className="nuvi-w-48">
                              <label className="nuvi-label">Section</label>
                              <select
                                value={field.section || 'customer'}
                                onChange={(e) => {
                                  const updatedFields = [...formData.customFields];
                                  updatedFields[index] = { 
                                    ...field, 
                                    section: e.target.value as CustomField['section']
                                  };
                                  handleChange('customFields', updatedFields);
                                }}
                                className="nuvi-select"
                              >
                                <option value="customer">Customer Information</option>
                                <option value="shipping">Shipping Address</option>
                                <option value="billing">Billing Address</option>
                                <option value="additional">Additional Information</option>
                              </select>
                            </div>
                          </div>
                          
                          {field.type !== 'checkbox' && (
                            <div>
                              <label className="nuvi-label">Placeholder Text</label>
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => {
                                  const updatedFields = [...formData.customFields];
                                  updatedFields[index] = { ...field, placeholder: e.target.value };
                                  handleChange('customFields', updatedFields);
                                }}
                                placeholder="e.g., Enter your VAT number"
                                className="nuvi-input"
                              />
                            </div>
                          )}
                          
                          {field.type === 'select' && (
                            <div>
                              <label className="nuvi-label">Options (one per line)</label>
                              <textarea
                                value={field.options?.join('\n') || ''}
                                onChange={(e) => {
                                  const options = e.target.value.split('\n').filter(opt => opt.trim());
                                  const updatedFields = [...formData.customFields];
                                  updatedFields[index] = { ...field, options };
                                  handleChange('customFields', updatedFields);
                                }}
                                rows={3}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                className="nuvi-textarea"
                              />
                            </div>
                          )}
                          
                          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              <input
                                type="checkbox"
                                id={`required_${field.id}`}
                                checked={field.required}
                                onChange={(e) => {
                                  const updatedFields = [...formData.customFields];
                                  updatedFields[index] = { ...field, required: e.target.checked };
                                  handleChange('customFields', updatedFields);
                                }}
                                className="nuvi-checkbox"
                              />
                              <label htmlFor={`required_${field.id}`} className="nuvi-text-sm cursor-pointer">
                                Required field
                              </label>
                            </div>
                            
                            <button
                              onClick={() => {
                                const updatedFields = formData.customFields.filter((_: CustomField, i: number) => i !== index);
                                handleChange('customFields', updatedFields);
                              }}
                              className="nuvi-text-danger hover:nuvi-text-danger-dark"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="nuvi-text-center nuvi-py-lg">
                    <FileText className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <p className="nuvi-text-muted">No custom fields added yet</p>
                    <p className="nuvi-text-sm nuvi-text-muted">Add custom fields to collect additional information during checkout</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="nuvi-space-y-lg">
            {/* Checkout Options */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Checkout Options</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure how customers experience your checkout process
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <Users className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Guest Checkout</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Allow customers to checkout without creating an account</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enableGuestCheckout}
                        onChange={(e) => handleChange('enableGuestCheckout', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <CreditCard className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Express Checkout</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Enable one-click checkout with Apple Pay, Google Pay</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enableExpressCheckout}
                        onChange={(e) => handleChange('enableExpressCheckout', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <Package className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Shipping Calculator</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Show shipping rates before customer enters details</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showShippingCalculator}
                        onChange={(e) => handleChange('showShippingCalculator', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <ShoppingCart className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Order Summary</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Show detailed order summary during checkout</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showOrderSummary}
                        onChange={(e) => handleChange('showOrderSummary', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <Gift className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Tips & Gratuity</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Allow customers to add tips for service</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enableTipsAndGratuity}
                        onChange={(e) => handleChange('enableTipsAndGratuity', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Express Checkout Settings */}
            {formData.enableExpressCheckout && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Express Checkout Settings</h3>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Configure express payment options
                  </p>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <input type="checkbox" className="nuvi-checkbox" defaultChecked />
                      <span className="nuvi-font-medium">Apple Pay</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <input type="checkbox" className="nuvi-checkbox" defaultChecked />
                      <span className="nuvi-font-medium">Google Pay</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <input type="checkbox" className="nuvi-checkbox" />
                      <span className="nuvi-font-medium">PayPal Express</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Settings */}
            {formData.enableTipsAndGratuity && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Tips & Gratuity Settings</h3>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Configure tip amounts and options
                  </p>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Suggested Tip Percentages</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        placeholder="15, 18, 20, 25"
                        defaultValue="15, 18, 20, 25"
                      />
                    </div>
                    <div>
                      <label className="nuvi-label">Maximum Tip Amount</label>
                      <input
                        type="number"
                        className="nuvi-input"
                        placeholder="100"
                        defaultValue="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Checkout Branding */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Checkout Branding</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Customize the appearance of your checkout page
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div>
                    <label className="nuvi-label">Checkout Logo</label>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      {formData.checkoutLogo ? (
                        <img 
                          src={formData.checkoutLogo} 
                          alt="Checkout Logo" 
                          className="h-20 object-contain border rounded"
                        />
                      ) : (
                        <div className="h-20 w-32 bg-gray-100 rounded flex items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="nuvi-flex nuvi-gap-sm">
                        <button 
                          type="button"
                          className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                          onClick={() => setShowImagePicker(true)}
                        >
                          <Image className="h-4 w-4 mr-1" />
                          Select from Media Library
                        </button>
                        {formData.checkoutLogo && (
                          <button 
                            type="button"
                            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                            onClick={() => handleChange('checkoutLogo', '')}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-sm">
                      Recommended size: 200x50px. Supports PNG, JPG, SVG.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terms and Policies */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Terms and Policies</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure legal agreements and policies
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <Shield className="h-4 w-4 nuvi-text-muted" />
                      <div>
                        <h4 className="nuvi-font-medium">Require Terms Acceptance</h4>
                        <p className="nuvi-text-sm nuvi-text-muted">Customers must agree to terms before checkout</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.requireTermsAcceptance}
                        onChange={(e) => handleChange('requireTermsAcceptance', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                  
                  {formData.requireTermsAcceptance && (
                    <div className="nuvi-space-y-md nuvi-mt-lg">
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                          <FileText className="h-4 w-4 nuvi-text-muted" />
                          <div>
                            <h4 className="nuvi-font-medium">Show Terms and Conditions</h4>
                            <p className="nuvi-text-sm nuvi-text-muted">Display link to terms and conditions</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.showTermsAndConditions}
                            onChange={(e) => handleChange('showTermsAndConditions', e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                      </div>
                      
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                          <Shield className="h-4 w-4 nuvi-text-muted" />
                          <div>
                            <h4 className="nuvi-font-medium">Show Privacy Policy</h4>
                            <p className="nuvi-text-sm nuvi-text-muted">Display link to privacy policy</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.showPrivacyPolicy}
                            onChange={(e) => handleChange('showPrivacyPolicy', e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                      </div>
                      
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                          <Package className="h-4 w-4 nuvi-text-muted" />
                          <div>
                            <h4 className="nuvi-font-medium">Show Return Policy</h4>
                            <p className="nuvi-text-sm nuvi-text-muted">Display link to return policy</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.showReturnPolicy}
                            onChange={(e) => handleChange('showReturnPolicy', e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="nuvi-space-y-lg">
            {/* Account Creation */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Account Creation</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure how customers create accounts
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div>
                    <label className="nuvi-label">Account Creation</label>
                    <select 
                      className="nuvi-select"
                      value={formData.accountCreation}
                      onChange={(e) => handleChange('accountCreation', e.target.value)}
                    >
                      <option value="optional">Optional - customers can choose</option>
                      <option value="required">Required - must create account</option>
                      <option value="disabled">Disabled - guest checkout only</option>
                    </select>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Allow account deletion</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Let customers delete their own accounts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.allowAccountDeletion}
                        onChange={(e) => handleChange('allowAccountDeletion', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Social login</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to sign in with social accounts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enableSocialLogin}
                        onChange={(e) => handleChange('enableSocialLogin', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Password Requirements</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Set minimum password requirements for security
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div>
                    <label className="nuvi-label">Minimum password length</label>
                    <input
                      type="number"
                      min="6"
                      max="50"
                      className="nuvi-input"
                      value={formData.passwordRequirements.minLength}
                      onChange={(e) => handleChange('passwordRequirements.minLength', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Require uppercase letters</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Password must contain at least one uppercase letter
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.passwordRequirements.requireUppercase}
                        onChange={(e) => handleChange('passwordRequirements.requireUppercase', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Require numbers</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Password must contain at least one number
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.passwordRequirements.requireNumbers}
                        onChange={(e) => handleChange('passwordRequirements.requireNumbers', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Require special characters</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Password must contain at least one special character
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.passwordRequirements.requireSpecialChars}
                        onChange={(e) => handleChange('passwordRequirements.requireSpecialChars', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Login Settings */}
            {formData.enableSocialLogin && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Social Login Providers</h3>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Configure which social login providers are available
                  </p>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <input type="checkbox" className="nuvi-checkbox" />
                      <span className="nuvi-font-medium">Google</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <input type="checkbox" className="nuvi-checkbox" />
                      <span className="nuvi-font-medium">Facebook</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <input type="checkbox" className="nuvi-checkbox" />
                      <span className="nuvi-font-medium">Apple</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <input type="checkbox" className="nuvi-checkbox" />
                      <span className="nuvi-font-medium">Twitter</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'post' && (
          <div className="nuvi-space-y-lg">
            {/* Thank You Page */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Thank You Page</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure what customers see after completing their purchase
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Show thank you page</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display a custom thank you message after purchase
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showThankYouPage}
                        onChange={(e) => handleChange('showThankYouPage', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  {formData.showThankYouPage && (
                    <div>
                      <label className="nuvi-label">Thank you message</label>
                      <textarea
                        rows={4}
                        className="nuvi-textarea"
                        value={formData.thankYouMessage}
                        onChange={(e) => handleChange('thankYouMessage', e.target.value)}
                        placeholder="Enter your thank you message..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="nuvi-label">Redirect URL (optional)</label>
                    <input
                      type="url"
                      className="nuvi-input"
                      value={formData.redirectUrl}
                      onChange={(e) => handleChange('redirectUrl', e.target.value)}
                      placeholder="https://yourstore.com/custom-page"
                    />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                      Leave empty to use default thank you page
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Tracking */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Order Tracking</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Help customers track their orders
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable order tracking</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to track their order status
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enableOrderTracking}
                        onChange={(e) => handleChange('enableOrderTracking', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Send confirmation email</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Email customers their order confirmation
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.sendConfirmationEmail}
                        onChange={(e) => handleChange('sendConfirmationEmail', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing & Recommendations */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Marketing & Recommendations</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Engage customers after their purchase
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Show recommended products</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display related products on the thank you page
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showRecommendedProducts}
                        onChange={(e) => handleChange('showRecommendedProducts', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable reviews</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to review purchased products
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.enableReviews}
                        onChange={(e) => handleChange('enableReviews', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Social Sharing</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Encourage customers to share their purchase
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Show social sharing buttons</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Let customers share their purchase on social media
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="nuvi-label">Social sharing message</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      placeholder="Just purchased from [Store Name]! Check them out:"
                      defaultValue="Just purchased from [Store Name]! Check them out:"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
          </div>
          {/* Image Picker Modal */}
          {showImagePicker && (
            <ImagePickerModal
              isOpen={showImagePicker}
              onClose={() => setShowImagePicker(false)}
              onSelect={(imageUrl) => {
                handleChange('checkoutLogo', imageUrl);
                setShowImagePicker(false);
              }}
              subdomain={store.subdomain}
              currentValue={formData.checkoutLogo}
              title="Select Checkout Logo"
              description="Choose a logo from your media library"
            />
          )}
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}