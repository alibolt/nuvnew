'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { CreditCard, Package, Receipt, Download, AlertCircle, Check, ChevronRight, Zap } from 'lucide-react';
import { PlanFormV2 } from '../plan/plan-form-v2';

export function BillingFormV2({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<'plan' | 'billing' | 'invoices'>('plan');

  const tabs = [
    { id: 'plan' as const, label: 'Plan', icon: Package },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'invoices' as const, label: 'Invoices', icon: Receipt },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="nuvi-page-header">
        <h2 className="nuvi-page-title">Plan & Billing</h2>
        <p className="nuvi-page-description">
          Manage your subscription plan and billing information
        </p>
      </div>

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
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'plan' && <PlanTabContent store={store} />}
      {activeTab === 'billing' && <BillingTabContent store={store} />}
      {activeTab === 'invoices' && <InvoicesTabContent store={store} />}
    </div>
  );
}

function PlanTabContent({ store }: { store: Store }) {
  return (
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

      {/* Available Plans */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Available Plans</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-lg">
            {/* Starter Plan */}
            <div className="nuvi-card nuvi-border-gray-200">
              <div className="nuvi-card-content">
                <div className="nuvi-text-center nuvi-mb-lg">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mb-sm">
                    <Zap className="h-6 w-6 nuvi-text-blue-600" />
                  </div>
                  <h4 className="nuvi-text-lg nuvi-font-semibold">Starter</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">Perfect for new stores</p>
                </div>
                
                <div className="nuvi-text-center nuvi-mb-lg">
                  <div className="nuvi-text-2xl nuvi-font-bold">$29<span className="nuvi-text-sm nuvi-font-normal">/month</span></div>
                </div>

                <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full nuvi-btn-sm">
                  Downgrade
                </button>
              </div>
            </div>

            {/* Professional Plan - Current */}
            <div className="nuvi-card nuvi-border-primary nuvi-relative">
              <div className="nuvi-absolute nuvi-top-0 nuvi-left-1/2 nuvi-transform -nuvi-translate-x-1/2 -nuvi-translate-y-1/2">
                <span className="nuvi-bg-primary nuvi-text-white nuvi-px-sm nuvi-py-xs nuvi-text-xs nuvi-rounded-full">
                  Current
                </span>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-text-center nuvi-mb-lg">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mb-sm">
                    <Package className="h-6 w-6 nuvi-text-purple-600" />
                  </div>
                  <h4 className="nuvi-text-lg nuvi-font-semibold">Professional</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">Perfect for growing businesses</p>
                </div>
                
                <div className="nuvi-text-center nuvi-mb-lg">
                  <div className="nuvi-text-2xl nuvi-font-bold">$79<span className="nuvi-text-sm nuvi-font-normal">/month</span></div>
                </div>

                <button className="nuvi-btn nuvi-btn-primary nuvi-w-full nuvi-btn-sm" disabled>
                  Current Plan
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="nuvi-card nuvi-border-gray-200">
              <div className="nuvi-card-content">
                <div className="nuvi-text-center nuvi-mb-lg">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mb-sm">
                    <Package className="h-6 w-6 nuvi-text-amber-600" />
                  </div>
                  <h4 className="nuvi-text-lg nuvi-font-semibold">Enterprise</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">For large businesses</p>
                </div>
                
                <div className="nuvi-text-center nuvi-mb-lg">
                  <div className="nuvi-text-2xl nuvi-font-bold">$299<span className="nuvi-text-sm nuvi-font-normal">/month</span></div>
                </div>

                <button className="nuvi-btn nuvi-btn-primary nuvi-w-full nuvi-btn-sm">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingTabContent({ store }: { store: Store }) {
  const [billingInfo, setBillingInfo] = useState({
    companyName: 'Acme Inc.',
    email: 'billing@acme.com',
    address: '123 Business St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
  });

  return (
    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-lg">
      {/* Payment Method */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <h3 className="nuvi-card-title nuvi-mb-md">Payment method</h3>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="h-10 w-16 bg-[var(--nuvi-primary)] rounded nuvi-flex nuvi-items-center justify-center text-white nuvi-font-semibold nuvi-text-sm">
                  VISA
                </div>
                <div>
                  <p className="nuvi-font-medium">•••• •••• •••• 4242</p>
                  <p className="nuvi-text-sm nuvi-text-muted">Expires 12/24 • Default</p>
                </div>
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                  Set as default
                </button>
                <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                  Update
                </button>
              </div>
            </div>
          </div>

          <button className="nuvi-mt-md nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            + Add backup payment method
          </button>
        </div>
      </div>

      {/* Billing Information */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
            <h3 className="nuvi-card-title">Billing information</h3>
            <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
              Edit
            </button>
          </div>
          
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-sm nuvi-text-sm">
            <div>
              <p className="nuvi-font-medium">{billingInfo.companyName}</p>
              <p className="nuvi-text-muted">{billingInfo.email}</p>
            </div>
            <div className="nuvi-text-muted">
              <p>{billingInfo.address}</p>
              <p>{billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}</p>
              <p>{billingInfo.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <h3 className="nuvi-card-title nuvi-mb-md">Billing settings</h3>
          
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between py-3 border-b">
              <div>
                <p className="nuvi-font-medium">Billing cycle</p>
                <p className="nuvi-text-sm nuvi-text-muted">Currently billed monthly</p>
              </div>
              <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                Switch to yearly
              </button>
            </div>

            <div className="nuvi-flex nuvi-items-center nuvi-justify-between py-3 border-b">
              <div>
                <p className="nuvi-font-medium">Auto-renewal</p>
                <p className="nuvi-text-sm nuvi-text-muted">Your plan will renew on March 1, 2024</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>

            <div className="nuvi-flex nuvi-items-center nuvi-justify-between py-3">
              <div>
                <p className="nuvi-font-medium">Spending limit</p>
                <p className="nuvi-text-sm nuvi-text-muted">Prevent unexpected charges</p>
              </div>
              <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                Set limit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicesTabContent({ store }: { store: Store }) {
  const invoices = [
    { id: 'INV-001', date: '2024-02-01', amount: '$79.00', status: 'paid', plan: 'Professional', period: 'Feb 2024' },
    { id: 'INV-002', date: '2024-01-01', amount: '$79.00', status: 'paid', plan: 'Professional', period: 'Jan 2024' },
    { id: 'INV-003', date: '2023-12-01', amount: '$29.00', status: 'paid', plan: 'Starter', period: 'Dec 2023' },
    { id: 'INV-004', date: '2023-11-01', amount: '$29.00', status: 'failed', plan: 'Starter', period: 'Nov 2023' },
  ];

  return (
    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-lg">
      {/* Invoice List */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
            <h3 className="nuvi-card-title">Invoice history</h3>
            <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
              Download all
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-medium text-gray-700 pb-3">Invoice</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3">Date</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3">Plan</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3">Amount</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3">Status</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-xs text-gray-500">{invoice.period}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="text-sm">{invoice.date}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium">{invoice.plan}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium">{invoice.amount}</p>
                    </td>
                    <td className="py-3">
                      <span className={`nuvi-badge ${
                        invoice.status === 'paid' ? 'nuvi-badge-success' : 
                        invoice.status === 'failed' ? 'nuvi-badge-danger' : 
                        'nuvi-badge-warning'
                      }`}>
                        {invoice.status === 'paid' ? 'Paid' : 
                         invoice.status === 'failed' ? 'Failed' : 
                         invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-flex nuvi-items-center nuvi-gap-sm" disabled={invoice.status === 'failed'}>
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <h3 className="nuvi-card-title nuvi-mb-md">Tax settings</h3>
          
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-font-medium">Tax exemption</p>
                <p className="nuvi-text-sm nuvi-text-muted">Upload tax exemption certificates</p>
              </div>
              <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}