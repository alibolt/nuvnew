'use client';

import { useState } from 'react';
import { Users, Plus, Mail, Gift } from 'lucide-react';
import { CustomerForm } from '../customers/customer-form';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  _count: {
    products: number;
    orders: number;
    categories: number;
    customers: number;
  };
  customers: any[];
}

interface CustomersContentProps {
  store: StoreData;
}

export function CustomersContent({ store }: CustomersContentProps) {
  const [customerView, setCustomerView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  return (
    <div className="nuvi-tab-panel">
      {customerView === 'list' ? (
        <>
          {/* Customers Header */}
          <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
            <div>
              <h2 className="nuvi-text-2xl nuvi-font-bold">Customers</h2>
              <p className="nuvi-text-secondary nuvi-text-sm">Manage your customer relationships</p>
            </div>
            <button 
              className="nuvi-btn nuvi-btn-primary"
              onClick={() => setCustomerView('new')}
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          </div>

          {/* Customer Stats */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md nuvi-mb-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">
                  <Users className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                  Customer Segments
                </h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                    <span className="nuvi-text-sm">New Customers</span>
                    <span className="nuvi-badge nuvi-badge-primary">0</span>
                  </div>
                  <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                    <span className="nuvi-text-sm">Returning Customers</span>
                    <span className="nuvi-badge nuvi-badge-primary">0</span>
                  </div>
                  <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                    <span className="nuvi-text-sm">Email Subscribers</span>
                    <span className="nuvi-badge nuvi-badge-primary">{store._count.customers}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">
                  <Mail className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                  Email Marketing
                </h3>
              </div>
              <div className="nuvi-card-content">
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                  Build customer relationships with email campaigns
                </p>
                <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full">
                  Create Campaign
                </button>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">
                  <Gift className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                  Loyalty Program
                </h3>
              </div>
              <div className="nuvi-card-content">
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                  Reward loyal customers with points and perks
                </p>
                <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full">
                  Setup Program
                </button>
              </div>
            </div>
          </div>

          {/* Customers List */}
          <div className="nuvi-card">
            <div className="nuvi-card-content">
              {store._count.customers === 0 ? (
                <div className="nuvi-text-center nuvi-py-xl">
                  <Users className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                  <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No customers yet</h3>
                  <p className="nuvi-text-muted nuvi-mb-lg">Customers will appear here after their first purchase</p>
                  <button 
                    className="nuvi-btn nuvi-btn-primary"
                    onClick={() => setCustomerView('new')}
                  >
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </button>
                </div>
              ) : (
                <div>
                  <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="nuvi-input nuvi-flex-1"
                    />
                    <select className="nuvi-input" style={{ width: '150px' }}>
                      <option>All Customers</option>
                      <option>New</option>
                      <option>Returning</option>
                      <option>Subscribers</option>
                    </select>
                  </div>
                  <div className="nuvi-space-y-sm">
                    {store.customers.map((customer) => (
                      <div key={customer.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                          <div>
                            <h4 className="nuvi-font-medium">{customer.firstName} {customer.lastName}</h4>
                            <p className="nuvi-text-sm nuvi-text-secondary">{customer.email}</p>
                          </div>
                          <button 
                            className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                            onClick={() => {
                              setEditingCustomerId(customer.id);
                              setCustomerView('edit');
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <CustomerForm
          subdomain={store.subdomain}
          customer={editingCustomerId ? store.customers.find(c => c.id === editingCustomerId) : undefined}
          onSuccess={() => {
            setCustomerView('list');
            setEditingCustomerId(null);
            // Optionally refresh customer list here
          }}
          onCancel={() => {
            setCustomerView('list');
            setEditingCustomerId(null);
          }}
        />
      )}
    </div>
  );
}