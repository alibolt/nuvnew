'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, Truck, CreditCard, User, MapPin, Clock, 
  Edit, Printer, Mail, Check, X, AlertCircle, RefreshCw,
  DollarSign, Calendar, Phone, Globe, Copy, CheckCircle,
  Ban, FileText, Download, MoreVertical, Loader2, Database
} from 'lucide-react';
import { OrderStatusBadge } from '../order-status-badge';
import { OrderTimelineComponent } from '../order-timeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderMetafields } from './order-metafields';

interface OrderDetailViewProps {
  order: any;
  subdomain: string;
  metafields?: any[];
  metafieldDefinitions?: any[];
}

export function OrderDetailView({ order, subdomain, metafields, metafieldDefinitions }: OrderDetailViewProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const formatAddress = (addr: any) => {
    if (!addr) return '';
    return `${addr.firstName || ''} ${addr.lastName || ''}
${addr.address1 || ''}
${addr.address2 || ''}
${addr.city || ''}, ${addr.province || ''} ${addr.zip || ''}
${addr.country || ''}`.trim().replace(/\n\n+/g, '\n');
  };

  // Parse addresses
  const shippingAddress = typeof order.shippingAddress === 'string' 
    ? order.shippingAddress 
    : formatAddress(order.shippingAddress);
  const billingAddress = typeof order.billingAddress === 'string'
    ? order.billingAddress
    : formatAddress(order.billingAddress);

  // Calculate totals
  const subtotal = order.lineItems.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity), 0
  );

  const handleStatusUpdate = async (type: string, status: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, status }),
      });

      if (response.ok) {
        router.refresh();
        setShowStatusModal(false);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };


  return (
    <div className="nuvi-animate-slide-up">
      {/* Header */}
      <div className="nuvi-page-header">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            onClick={() => router.push(`/dashboard/stores/${subdomain}/orders`)}
            className="nuvi-btn nuvi-btn-ghost"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="nuvi-page-title">Order {order.orderNumber}</h1>
            <p className="nuvi-page-description">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
          <button onClick={handlePrint} className="nuvi-btn nuvi-btn-secondary">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <Link
            href={`mailto:${order.customerEmail}?subject=Order ${order.orderNumber}`}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <Mail className="h-4 w-4" />
            Email Customer
          </Link>
          <div className="nuvi-relative">
            <button className="nuvi-btn nuvi-btn-ghost">
              <MoreVertical className="h-4 w-4" />
            </button>
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
          {/* Order Status */}
          <div className="nuvi-card">
            <div className="nuvi-card-header nuvi-flex nuvi-justify-between nuvi-items-center">
              <h2 className="nuvi-card-title">Order Status</h2>
              <button 
                onClick={() => setShowStatusModal(true)}
                className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline nuvi-flex nuvi-items-center nuvi-gap-xs"
              >
                <Edit className="h-3 w-3" />
                Edit Status
              </button>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                <div className="nuvi-text-center nuvi-p-md nuvi-bg-surface-hover nuvi-rounded-lg">
                  <Package className="h-6 w-6 nuvi-mx-auto nuvi-mb-sm nuvi-text-primary" />
                  <p className="nuvi-text-sm nuvi-font-medium nuvi-mb-xs">Order Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="nuvi-text-center nuvi-p-md nuvi-bg-surface-hover nuvi-rounded-lg">
                  <CreditCard className="h-6 w-6 nuvi-mx-auto nuvi-mb-sm nuvi-text-primary" />
                  <p className="nuvi-text-sm nuvi-font-medium nuvi-mb-xs">Payment</p>
                  <OrderStatusBadge status={order.financialStatus} type="financial" />
                </div>
                <div className="nuvi-text-center nuvi-p-md nuvi-bg-surface-hover nuvi-rounded-lg">
                  <Truck className="h-6 w-6 nuvi-mx-auto nuvi-mb-sm nuvi-text-primary" />
                  <p className="nuvi-text-sm nuvi-font-medium nuvi-mb-xs">Fulfillment</p>
                  <OrderStatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="nuvi-mt-lg nuvi-flex nuvi-gap-sm">
                {order.financialStatus === 'pending' && (
                  <button className="nuvi-btn nuvi-btn-primary">
                    <DollarSign className="h-4 w-4" />
                    Collect Payment
                  </button>
                )}
                {order.fulfillmentStatus === 'unfulfilled' && (
                  <button 
                    onClick={() => setShowFulfillModal(true)}
                    className="nuvi-btn nuvi-btn-secondary"
                  >
                    <Truck className="h-4 w-4" />
                    Fulfill Order
                  </button>
                )}
                {order.financialStatus === 'paid' && (
                  <button 
                    onClick={() => setShowRefundModal(true)}
                    className="nuvi-btn nuvi-btn-secondary"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refund
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title">Order Items</h2>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-md">
                {order.lineItems.map((item: any) => (
                  <div key={item.id} className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-w-16 nuvi-h-16 nuvi-bg-surface-hover nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                      {item.variant?.product?.images?.[0] ? (
                        <img
                          src={item.variant.product.images[0]}
                          alt={item.title || ''}
                          className="nuvi-w-full nuvi-h-full nuvi-object-cover nuvi-rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 nuvi-text-muted" />
                      )}
                    </div>
                    <div className="nuvi-flex-1">
                      <h3 className="nuvi-font-medium">{item.title || 'Product'}</h3>
                      {item.variantTitle && (
                        <p className="nuvi-text-sm nuvi-text-secondary">{item.variantTitle}</p>
                      )}
                      {item.sku && (
                        <p className="nuvi-text-xs nuvi-text-muted">SKU: {item.sku}</p>
                      )}
                    </div>
                    <div className="nuvi-text-right">
                      <p className="nuvi-font-medium">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                      <p className="nuvi-text-sm nuvi-text-secondary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="nuvi-mt-lg nuvi-border-t nuvi-pt-lg">
                <div className="nuvi-space-y-sm">
                  <div className="nuvi-flex nuvi-justify-between nuvi-text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {order.totalDiscount > 0 && (
                    <div className="nuvi-flex nuvi-justify-between nuvi-text-sm nuvi-text-success">
                      <span>Discount</span>
                      <span>-${order.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="nuvi-flex nuvi-justify-between nuvi-text-sm">
                    <span>Shipping</span>
                    <span>${order.totalShipping.toFixed(2)}</span>
                  </div>
                  <div className="nuvi-flex nuvi-justify-between nuvi-text-sm">
                    <span>Tax</span>
                    <span>${order.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="nuvi-flex nuvi-justify-between nuvi-font-medium nuvi-text-base nuvi-border-t nuvi-pt-sm">
                    <span>Total</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Clock className="h-4 w-4" />
                Order Timeline
              </h2>
            </div>
            <OrderTimelineComponent order={order} />
          </div>

          {/* Notes */}
          {order.note && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h2 className="nuvi-card-title">Order Notes</h2>
              </div>
              <div className="nuvi-card-content">
                <p className="nuvi-text-sm">{order.note}</p>
              </div>
            </div>
          )}
            </TabsContent>
            
            <TabsContent value="custom" className="nuvi-space-y-lg">
              <OrderMetafields
                subdomain={subdomain}
                orderId={order.id}
                metafields={metafields}
                metafieldDefinitions={metafieldDefinitions}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* Customer Information */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                <User className="h-4 w-4" />
                Customer
              </h2>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-sm">
                <div>
                  <p className="nuvi-font-medium">
                    {order.customer 
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : order.customerName
                    }
                  </p>
                  <p className="nuvi-text-sm nuvi-text-secondary">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      <Phone className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                      {order.customerPhone}
                    </p>
                  )}
                </div>
                {order.customer && (
                  <div className="nuvi-pt-sm nuvi-border-t">
                    <Link
                      href={`/dashboard/stores/${subdomain}/customers/${order.customer.id}`}
                      className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline"
                    >
                      View customer profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h2>
            </div>
            <div className="nuvi-card-content">
              <p className="nuvi-text-sm nuvi-whitespace-pre-line">{shippingAddress}</p>
            </div>
          </div>

          {/* Billing Address */}
          {billingAddress && billingAddress !== shippingAddress && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h2 className="nuvi-card-title">Billing Address</h2>
              </div>
              <div className="nuvi-card-content">
                <p className="nuvi-text-sm nuvi-whitespace-pre-line">{billingAddress}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {order.tags && order.tags.length > 0 && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h2 className="nuvi-card-title">Tags</h2>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-flex-wrap nuvi-gap-sm">
                  {order.tags.map((tag: string, index: number) => (
                    <span key={index} className="nuvi-badge nuvi-badge-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="nuvi-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="nuvi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nuvi-modal-header">
              <h3 className="nuvi-modal-title">Update Order Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="nuvi-btn nuvi-btn-ghost">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="nuvi-modal-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Order Status</label>
                <select 
                  className="nuvi-input"
                  value={order.status}
                  onChange={(e) => handleStatusUpdate('status', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="nuvi-label">Payment Status</label>
                <select 
                  className="nuvi-input"
                  value={order.financialStatus}
                  onChange={(e) => handleStatusUpdate('financialStatus', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
                  <option value="voided">Voided</option>
                </select>
              </div>
              <div>
                <label className="nuvi-label">Fulfillment Status</label>
                <select 
                  className="nuvi-input"
                  value={order.fulfillmentStatus}
                  onChange={(e) => handleStatusUpdate('fulfillmentStatus', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="unfulfilled">Unfulfilled</option>
                  <option value="partial">Partially Fulfilled</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
            <div className="nuvi-modal-footer">
              <button 
                onClick={() => setShowStatusModal(false)} 
                className="nuvi-btn nuvi-btn-secondary"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                className="nuvi-btn nuvi-btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}