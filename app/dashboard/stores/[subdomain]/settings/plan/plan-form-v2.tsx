'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  CreditCard, TrendingUp, Receipt, FileText,
  Check, Crown, Zap, Building2, 
  Users, Package, BarChart3, Edit, Trash2,
  Download, ExternalLink, Plus, MapPin, Mail,
  Phone, Globe, Shield, Calendar
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'current' as const, label: 'Current Plan', icon: CreditCard },
  { id: 'upgrade' as const, label: 'Available Plans', icon: TrendingUp },
  { id: 'billing' as const, label: 'Billing Details', icon: Receipt },
  { id: 'history' as const, label: 'Invoice History', icon: FileText }
];

interface PlanFormV2Props {
  store: Store & { _count?: any };
  subscription?: any;
  pricingPlans?: any[];
}

export function PlanFormV2({ store, subscription, pricingPlans = [] }: PlanFormV2Props) {
  const [activeTab, setActiveTab] = useState<'current' | 'upgrade' | 'billing' | 'history'>('current');

  const initialFormData = {
    // Current Plan Data
    currentPlan: subscription ? {
      name: subscription.plan.name,
      price: subscription.billingCycle === 'monthly' ? subscription.plan.priceMonthly : subscription.plan.priceAnnually,
      billing: subscription.billingCycle,
      nextBilling: subscription.currentPeriodEnd,
      features: subscription.plan.features || [],
      usage: {
        products: store._count?.products || 0,
        orders: store._count?.orders || 0,
        storage: subscription.usage?.storage || 0,
        storageLimit: subscription.usageLimits?.storage || 100
      }
    } : {
      name: 'Free',
      price: 0,
      billing: 'monthly',
      nextBilling: null,
      features: ['10 products', 'Basic reports', 'Community support'],
      usage: {
        products: store._count?.products || 0,
        orders: store._count?.orders || 0,
        storage: 0,
        storageLimit: 10
      }
    },
    
    // Billing Details
    billingDetails: subscription?.paymentMethod || {},
    
    // Invoice History
    invoices: subscription?.invoices?.map((inv: any) => ({
      id: inv.id,
      number: inv.invoiceNumber,
      date: inv.createdAt,
      amount: inv.amount,
      status: inv.status,
      description: `${subscription.plan.name} - ${subscription.billingCycle}`,
      downloadUrl: inv.pdfUrl || '#'
    })) || []
};

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/settings"
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Plan & Billing"
          description="Manage your subscription plan and billing details"
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
        {activeTab === 'current' && (
          <div className="nuvi-space-y-lg">
            {/* Current Plan Card */}
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
                  <div>
                    <h3 className="nuvi-text-lg nuvi-font-semibold">Professional Plan</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">Perfect for growing businesses</p>
                  </div>
                  <div className="nuvi-text-right">
                    <div className="nuvi-text-2xl nuvi-font-bold">$79<span className="nuvi-text-sm nuvi-font-normal">/month</span></div>
                    <p className="nuvi-text-sm nuvi-text-muted">Billed monthly</p>
                  </div>
                </div>

                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-lg nuvi-mb-lg">
                  <div className="nuvi-space-y-sm">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Unlimited products</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Professional reports</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Advanced analytics</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Priority support</span>
                    </div>
                  </div>
                  <div className="nuvi-space-y-sm">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Custom domain</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">API access</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Advanced themes</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Abandoned cart recovery</span>
                    </div>
                  </div>
                </div>

                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-bg-blue-50 nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <AlertCircle className="h-4 w-4 nuvi-text-blue-600" />
                    <span className="nuvi-text-sm">Next billing date: March 15, 2024</span>
                  </div>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      Change plan
                    </button>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                      Cancel subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Usage this month</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-lg">
                  <div className="nuvi-text-center">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">245</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Products</p>
                    <p className="nuvi-text-xs nuvi-text-muted">No limit</p>
                  </div>
                  <div className="nuvi-text-center">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">1,234</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Orders</p>
                    <p className="nuvi-text-xs nuvi-text-muted">No limit</p>
                  </div>
                  <div className="nuvi-text-center">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">8.5GB</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Storage used</p>
                    <p className="nuvi-text-xs nuvi-text-muted">100GB limit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upgrade' && (
          <div className="nuvi-space-y-lg">
            {/* Plan Comparison */}
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-lg">
              {/* Starter Plan */}
              <div className="nuvi-card">
                <div className="nuvi-card-content">
                  <div className="nuvi-text-center nuvi-mb-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mb-sm">
                      <Zap className="h-6 w-6 nuvi-text-blue-600" />
                    </div>
                    <h3 className="nuvi-text-lg nuvi-font-semibold">Starter</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">Perfect for new stores</p>
                  </div>
                  
                  <div className="nuvi-text-center nuvi-mb-lg">
                    <div className="nuvi-text-3xl nuvi-font-bold">$29<span className="nuvi-text-sm nuvi-font-normal">/month</span></div>
                    <p className="nuvi-text-sm nuvi-text-muted">Billed monthly</p>
                  </div>

                  <div className="nuvi-space-y-sm nuvi-mb-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Up to 1,000 products</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Basic reports</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Email support</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Basic themes</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">10GB storage</span>
                    </div>
                  </div>

                  <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
                    Current Plan
                  </button>
                </div>
              </div>

              {/* Professional Plan */}
              <div className="nuvi-card nuvi-border-primary nuvi-relative">
                <div className="nuvi-absolute nuvi-top-0 nuvi-left-1/2 nuvi-transform -nuvi-translate-x-1/2 -nuvi-translate-y-1/2">
                  <span className="nuvi-bg-primary nuvi-text-white nuvi-px-sm nuvi-py-xs nuvi-text-xs nuvi-rounded-full">
                    Current
                  </span>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-text-center nuvi-mb-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mb-sm">
                      <Crown className="h-6 w-6 nuvi-text-purple-600" />
                    </div>
                    <h3 className="nuvi-text-lg nuvi-font-semibold">Professional</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">Perfect for growing businesses</p>
                  </div>
                  
                  <div className="nuvi-text-center nuvi-mb-lg">
                    <div className="nuvi-text-3xl nuvi-font-bold">$79<span className="nuvi-text-sm nuvi-font-normal">/month</span></div>
                    <p className="nuvi-text-sm nuvi-text-muted">Billed monthly</p>
                  </div>

                  <div className="nuvi-space-y-sm nuvi-mb-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Unlimited products</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Professional reports</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Priority support</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Advanced themes</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">100GB storage</span>
                    </div>
                  </div>

                  <button className="nuvi-btn nuvi-btn-primary nuvi-w-full" disabled>
                    Current Plan
                  </button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="nuvi-card">
                <div className="nuvi-card-content">
                  <div className="nuvi-text-center nuvi-mb-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mb-sm">
                      <Building2 className="h-6 w-6 nuvi-text-amber-600" />
                    </div>
                    <h3 className="nuvi-text-lg nuvi-font-semibold">Enterprise</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">For large businesses</p>
                  </div>
                  
                  <div className="nuvi-text-center nuvi-mb-lg">
                    <div className="nuvi-text-3xl nuvi-font-bold">$299<span className="nuvi-text-sm nuvi-font-normal">/month</span></div>
                    <p className="nuvi-text-sm nuvi-text-muted">Billed monthly</p>
                  </div>

                  <div className="nuvi-space-y-sm nuvi-mb-lg">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Unlimited everything</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Custom reports</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">24/7 phone support</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Custom themes</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Check className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm">Unlimited storage</span>
                    </div>
                  </div>

                  <button className="nuvi-btn nuvi-btn-primary nuvi-w-full">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>

            {/* Annual Billing Discount */}
            <div className="nuvi-card nuvi-bg-green-50 nuvi-border-green-200">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                  <div className="nuvi-p-sm nuvi-bg-green-100 nuvi-rounded-lg">
                    <Receipt className="h-5 w-5 nuvi-text-green-600" />
                  </div>
                  <div>
                    <h3 className="nuvi-font-semibold nuvi-text-green-900">Save 20% with annual billing</h3>
                    <p className="nuvi-text-sm nuvi-text-green-700">
                      Switch to annual billing and get 2 months free on any plan
                    </p>
                  </div>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-text-green-700 nuvi-border-green-300 nuvi-ml-auto">
                    Learn more
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="nuvi-space-y-lg">
            {/* Payment Method */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Payment Method</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Manage your payment method for subscription billing
                    </p>
                  </div>
                  <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                    <div className="nuvi-p-sm nuvi-bg-blue-50 nuvi-rounded-lg">
                      <CreditCard className="h-5 w-5 nuvi-text-blue-600" />
                    </div>
                    <div>
                      <h4 className="nuvi-font-medium nuvi-flex nuvi-items-center nuvi-gap-sm">
                        {formData.billingDetails.paymentMethod.brand.toUpperCase()} ****{formData.billingDetails.paymentMethod.last4}
                        <span className="nuvi-badge nuvi-badge-primary">Default</span>
                      </h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Expires {formData.billingDetails.paymentMethod.expiryMonth}/{formData.billingDetails.paymentMethod.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Billing Address</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Address used for billing and tax calculations
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Full name</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.billingDetails.billingAddress.name}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          billingAddress: {
                            ...formData.billingDetails.billingAddress,
                            name: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="nuvi-label">Company (optional)</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.billingDetails.billingAddress.company}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          billingAddress: {
                            ...formData.billingDetails.billingAddress,
                            company: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label">Email address</label>
                    <input
                      type="email"
                      className="nuvi-input"
                      value={formData.billingDetails.billingAddress.email}
                      onChange={(e) => handleChange('billingDetails', {
                        ...formData.billingDetails,
                        billingAddress: {
                          ...formData.billingDetails.billingAddress,
                          email: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div>
                    <label className="nuvi-label">Address line 1</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.billingDetails.billingAddress.address1}
                      onChange={(e) => handleChange('billingDetails', {
                        ...formData.billingDetails,
                        billingAddress: {
                          ...formData.billingDetails.billingAddress,
                          address1: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div>
                    <label className="nuvi-label">Address line 2 (optional)</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.billingDetails.billingAddress.address2}
                      onChange={(e) => handleChange('billingDetails', {
                        ...formData.billingDetails,
                        billingAddress: {
                          ...formData.billingDetails.billingAddress,
                          address2: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">City</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.billingDetails.billingAddress.city}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          billingAddress: {
                            ...formData.billingDetails.billingAddress,
                            city: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="nuvi-label">State/Province</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.billingDetails.billingAddress.state}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          billingAddress: {
                            ...formData.billingDetails.billingAddress,
                            state: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="nuvi-label">ZIP/Postal code</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.billingDetails.billingAddress.zipCode}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          billingAddress: {
                            ...formData.billingDetails.billingAddress,
                            zipCode: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label">Country</label>
                    <select 
                      className="nuvi-select"
                      value={formData.billingDetails.billingAddress.country}
                      onChange={(e) => handleChange('billingDetails', {
                        ...formData.billingDetails,
                        billingAddress: {
                          ...formData.billingDetails.billingAddress,
                          country: e.target.value
                        }
                      })}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Tax Information</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Tax details for your billing and compliance
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Tax ID/EIN (optional)</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.billingDetails.taxInfo.taxId}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          taxInfo: {
                            ...formData.billingDetails.taxInfo,
                            taxId: e.target.value
                          }
                        })}
                        placeholder="12-3456789"
                      />
                    </div>
                    <div>
                      <label className="nuvi-label">VAT Number (optional)</label>
                      <input
                        type="text"
                        className="nuvi-input"
                        value={formData.billingDetails.taxInfo.vatNumber}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          taxInfo: {
                            ...formData.billingDetails.taxInfo,
                            vatNumber: e.target.value
                          }
                        })}
                        placeholder="DE123456789"
                      />
                    </div>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Tax exempt</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Check if your organization is tax exempt
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.billingDetails.taxInfo.taxExempt}
                        onChange={(e) => handleChange('billingDetails', {
                          ...formData.billingDetails,
                          taxInfo: {
                            ...formData.billingDetails.taxInfo,
                            taxExempt: e.target.checked
                          }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing History Summary */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Billing Summary</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Your billing activity and spend overview
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">$237</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Total spend (last 3 months)</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-green-600">3</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Successful payments</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-blue-600">$79</div>
                    <p className="nuvi-text-sm nuvi-text-muted">Next payment amount</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="nuvi-space-y-lg">
            {/* Invoice History */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Invoice History</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      View and download your billing history
                    </p>
                  </div>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                      <Download className="h-4 w-4" />
                      Download All
                    </button>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                      <Calendar className="h-4 w-4" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {formData.invoices.map((invoice) => (
                    <div key={invoice.id} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                        <div className="nuvi-p-sm nuvi-bg-gray-50 nuvi-rounded-lg">
                          <Receipt className="h-5 w-5 nuvi-text-gray-600" />
                        </div>
                        <div>
                          <h4 className="nuvi-font-medium">{invoice.number}</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">
                            {invoice.description}
                          </p>
                          <p className="nuvi-text-xs nuvi-text-muted">
                            {new Date(invoice.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                        <div className="nuvi-text-right">
                          <div className="nuvi-font-medium">
                            ${invoice.amount.toFixed(2)}
                          </div>
                          <span className={`nuvi-badge ${
                            invoice.status === 'paid' ? 'nuvi-badge-success' : 
                            invoice.status === 'pending' ? 'nuvi-badge-warning' : 
                            'nuvi-badge-error'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                            <ExternalLink className="h-4 w-4" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Billing Statistics */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Billing Statistics</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Overview of your billing activity
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md">
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">
                      {formData.invoices.length}
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">Total invoices</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-green-600">
                      ${formData.invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">Total amount</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-blue-600">
                      ${(formData.invoices.reduce((sum, inv) => sum + inv.amount, 0) / formData.invoices.length).toFixed(2)}
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">Average amount</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-green-600">
                      {formData.invoices.filter(inv => inv.status === 'paid').length}
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">Paid invoices</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods History */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Payment Methods Used</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Payment methods used for your invoices
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-sm nuvi-border nuvi-rounded">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <CreditCard className="h-4 w-4 nuvi-text-blue-600" />
                      <span className="nuvi-text-sm">VISA ****4242</span>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <span className="nuvi-text-sm nuvi-text-muted">
                        {formData.invoices.length} payments
                      </span>
                      <span className="nuvi-badge nuvi-badge-success">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Preferences */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Billing Preferences</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure your billing and invoice preferences
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Email invoices</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Send invoices to your email address
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Payment reminders</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Receive reminders before payment due dates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Failed payment notifications</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Get notified when payments fail
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="nuvi-label">Invoice email address</label>
                    <input
                      type="email"
                      className="nuvi-input"
                      value={formData.billingDetails.billingAddress.email}
                      onChange={(e) => handleChange('billingDetails', {
                        ...formData.billingDetails,
                        billingAddress: {
                          ...formData.billingDetails.billingAddress,
                          email: e.target.value
                        }
                      })}
                    />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                      Invoices will be sent to this email address
                    </p>
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