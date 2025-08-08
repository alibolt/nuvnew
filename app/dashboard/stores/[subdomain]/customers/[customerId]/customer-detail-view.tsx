'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, ShoppingCart,
  DollarSign, Package, Clock, Edit, Trash2, Plus, Tag, 
  TrendingUp, CreditCard, AlertCircle, CheckCircle, XCircle,
  MoreVertical, Download, Send, UserCheck, UserX, Database
} from 'lucide-react';
import { OrderStatusBadge } from '../../orders/order-status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerMetafields } from './customer-metafields';

interface CustomerDetailViewProps {
  customer: any;
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: Date | null;
  };
  subdomain: string;
  metafields?: any[];
  metafieldDefinitions?: any[];
}

export function CustomerDetailView({ customer, stats, subdomain, metafields, metafieldDefinitions }: CustomerDetailViewProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUpdateCustomer = async (data: any) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.refresh();
        setShowEditModal(false);
      } else {
        alert('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/stores/${subdomain}/customers/${customer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/dashboard/stores/${subdomain}/customers`);
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('An error occurred');
    }
  };

  return (
    <div className="nuvi-animate-slide-up">
      {/* Header */}
      <div className="nuvi-page-header">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            onClick={() => router.push(`/dashboard/stores/${subdomain}/customers`)}
            className="nuvi-btn nuvi-btn-ghost"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="nuvi-page-title">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="nuvi-page-description">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
          <Link
            href={`mailto:${customer.email}`}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Link>
          <button
            onClick={() => setShowEditModal(true)}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <div className="nuvi-relative">
            <button className="nuvi-btn nuvi-btn-ghost">
              <MoreVertical className="h-4 w-4" />
            </button>
            <div className="nuvi-dropdown-menu nuvi-hidden">
              <button className="nuvi-dropdown-item">
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button 
                onClick={handleDeleteCustomer}
                className="nuvi-dropdown-item nuvi-text-error"
              >
                <Trash2 className="h-4 w-4" />
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content */}
        <div className="nuvi-lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="nuvi-mb-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="custom">Custom Fields</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="nuvi-space-y-lg">
          {/* Customer Stats */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md">
            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <ShoppingCart className="h-5 w-5 nuvi-text-primary" />
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">{stats.totalOrders}</h3>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Orders</p>
              </div>
            </div>
            
            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <DollarSign className="h-5 w-5 nuvi-text-success" />
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">${stats.totalSpent.toFixed(2)}</h3>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Spent</p>
              </div>
            </div>
            
            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <TrendingUp className="h-5 w-5 nuvi-text-primary" />
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">${stats.averageOrderValue.toFixed(2)}</h3>
                <p className="nuvi-text-sm nuvi-text-secondary">Avg Order Value</p>
              </div>
            </div>
            
            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <Calendar className="h-5 w-5 nuvi-text-primary" />
                </div>
                <h3 className="nuvi-text-lg nuvi-font-bold">
                  {stats.lastOrderDate ? formatDate(stats.lastOrderDate) : 'Never'}
                </h3>
                <p className="nuvi-text-sm nuvi-text-secondary">Last Order</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="nuvi-card">
            <div className="nuvi-card-header nuvi-flex nuvi-justify-between nuvi-items-center">
              <h2 className="nuvi-card-title">Recent Orders</h2>
              <Link
                href={`/dashboard/stores/${subdomain}/orders?customerId=${customer.id}`}
                className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline"
              >
                View all orders →
              </Link>
            </div>
            <div className="nuvi-card-content">
              {customer.orders.length === 0 ? (
                <div className="nuvi-text-center nuvi-py-lg">
                  <ShoppingCart className="h-12 w-12 nuvi-mx-auto nuvi-mb-md nuvi-text-muted" />
                  <p className="nuvi-text-muted">No orders yet</p>
                  <Link
                    href={`/dashboard/stores/${subdomain}/orders/create?customerId=${customer.id}`}
                    className="nuvi-btn nuvi-btn-primary nuvi-mt-md"
                  >
                    <Plus className="h-4 w-4" />
                    Create Order
                  </Link>
                </div>
              ) : (
                <div className="nuvi-space-y-sm">
                  {customer.orders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/stores/${subdomain}/orders/${order.id}`}
                      className="nuvi-block nuvi-p-md nuvi-border nuvi-rounded-lg hover:nuvi-border-primary nuvi-transition"
                    >
                      <div className="nuvi-flex nuvi-justify-between nuvi-items-start">
                        <div>
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <span className="nuvi-font-medium">{order.orderNumber}</span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="nuvi-text-sm nuvi-text-secondary nuvi-mt-xs">
                            {order.lineItems.length} items • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="nuvi-text-right">
                          <p className="nuvi-font-medium">${order.totalPrice.toFixed(2)}</p>
                          <OrderStatusBadge status={order.financialStatus} type="financial" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="nuvi-card">
            <div className="nuvi-card-header nuvi-flex nuvi-justify-between nuvi-items-center">
              <h2 className="nuvi-card-title">Addresses</h2>
              <button
                onClick={() => setShowAddressModal(true)}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
              >
                <Plus className="h-3 w-3" />
                Add Address
              </button>
            </div>
            <div className="nuvi-card-content">
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                  {customer.addresses.map((address: any) => (
                    <div key={address.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <div className="nuvi-flex nuvi-justify-between nuvi-items-start nuvi-mb-sm">
                        <MapPin className="h-4 w-4 nuvi-text-muted" />
                        {address.isDefault && (
                          <span className="nuvi-badge nuvi-badge-primary nuvi-badge-sm">Default</span>
                        )}
                      </div>
                      <p className="nuvi-text-sm">
                        {address.firstName} {address.lastName}<br />
                        {address.address1}<br />
                        {address.address2 && <>{address.address2}<br /></>}
                        {address.city}, {address.province} {address.zip}<br />
                        {address.country}
                      </p>
                      {address.phone && (
                        <p className="nuvi-text-sm nuvi-text-secondary nuvi-mt-sm">
                          <Phone className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                          {address.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="nuvi-text-center nuvi-py-lg">
                  <MapPin className="h-12 w-12 nuvi-mx-auto nuvi-mb-md nuvi-text-muted" />
                  <p className="nuvi-text-muted">No addresses saved</p>
                </div>
              )}
            </div>
          </div>
            </TabsContent>
            
            <TabsContent value="custom" className="nuvi-space-y-lg">
              <CustomerMetafields
                subdomain={subdomain}
                customerId={customer.id}
                metafields={metafields}
                metafieldDefinitions={metafieldDefinitions}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* Contact Information */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title">Contact Information</h2>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-xs">Email</p>
                <p className="nuvi-font-medium">{customer.email}</p>
              </div>
              {customer.phone && (
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-xs">Phone</p>
                  <p className="nuvi-font-medium">{customer.phone}</p>
                </div>
              )}
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-xs">Marketing</p>
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  {customer.acceptsMarketing ? (
                    <>
                      <CheckCircle className="h-4 w-4 nuvi-text-success" />
                      <span className="nuvi-text-sm nuvi-text-success">Subscribed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 nuvi-text-muted" />
                      <span className="nuvi-text-sm nuvi-text-muted">Not subscribed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="nuvi-card">
            <div className="nuvi-card-header nuvi-flex nuvi-justify-between nuvi-items-center">
              <h2 className="nuvi-card-title">Tags</h2>
              <button
                onClick={() => setShowTagModal(true)}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="nuvi-card-content">
              {customer.tags && customer.tags.length > 0 ? (
                <div className="nuvi-flex nuvi-flex-wrap nuvi-gap-sm">
                  {customer.tags.map((tag: string, index: number) => (
                    <span key={index} className="nuvi-badge nuvi-badge-secondary">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="nuvi-text-sm nuvi-text-muted">No tags</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title">Notes</h2>
            </div>
            <div className="nuvi-card-content">
              {customer.notes ? (
                <p className="nuvi-text-sm">{customer.notes}</p>
              ) : (
                <p className="nuvi-text-sm nuvi-text-muted">No notes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}