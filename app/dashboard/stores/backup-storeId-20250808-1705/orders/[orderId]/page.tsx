import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CreditCard, User, MapPin, Clock, Edit, Printer, Mail } from 'lucide-react';
import { OrderStatusBadge } from '../order-status-badge';
import { OrderTimelineComponent } from '../order-timeline';
import { OrderActionsMenu } from '../order-actions-menu';
import { EmailButton } from '../email-button';

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ storeId: string; orderId: string }>
}) {
  const session = await requireAuth();
  const { storeId, orderId } = await params;

  // Verify store ownership and get order details
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id
    }
  });

  if (!store) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      storeId: store.id
    },
    include: {
      lineItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              slug: true
            }
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true
            }
          }
        }
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  // Parse addresses
  const shippingAddress = order.shippingAddress as any;
  const billingAddress = order.billingAddress as any;
  const shippingLines = order.shippingLines as any;
  const discountCodes = order.discountCodes as any[];

  // Calculate totals
  const subtotal = order.lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = order.totalDiscount || 0;
  const totalShipping = order.totalShipping || 0;
  const totalTax = order.totalTax || 0;

  return (
    <div className="nuvi-container">
      {/* Header */}
      <div className="nuvi-page-header">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/stores/${storeId}/orders`}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="nuvi-page-title">Order #{order.orderNumber}</h1>
            <p className="nuvi-page-description">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OrderActionsMenu order={order} storeId={storeId} />
          <button className="nuvi-button-secondary flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <EmailButton order={order} storeId={storeId} />
        </div>
      </div>

      <div className="nuvi-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Edit Status
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Package className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">Order Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">Payment Status</p>
                  <OrderStatusBadge status={order.financialStatus} type="financial" />
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">Fulfillment</p>
                  <OrderStatusBadge 
                    status={order.fulfillmentStatus || 'unfulfilled'} 
                    type="fulfillment" 
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.lineItems.map((item) => {
                    const productImage = Array.isArray(item.product?.images) && item.product.images.length > 0 
                      ? item.product.images[0] 
                      : null;
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={item.title}
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                          {item.variantTitle && (
                            <p className="text-sm text-gray-500">{item.variantTitle}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Totals */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discountCodes && discountCodes.length > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discountCodes.map(d => d.code).join(', ')})</span>
                        <span>-${totalDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${totalShipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </h2>
              </div>
              <OrderTimelineComponent order={order} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.customer 
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : order.customerName
                    }
                  </p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  )}
                </div>
                {order.customer && (
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href={`/dashboard/stores/${storeId}/customers/${order.customer.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View customer profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h2>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-900">
                  <p className="font-medium">{shippingAddress?.name}</p>
                  <p>{shippingAddress?.address1}</p>
                  {shippingAddress?.address2 && <p>{shippingAddress.address2}</p>}
                  <p>
                    {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}
                  </p>
                  <p>{shippingAddress?.country}</p>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            {billingAddress && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-900">
                    <p className="font-medium">{billingAddress?.name}</p>
                    <p>{billingAddress?.address1}</p>
                    {billingAddress?.address2 && <p>{billingAddress.address2}</p>}
                    <p>
                      {billingAddress?.city}, {billingAddress?.state} {billingAddress?.zip}
                    </p>
                    <p>{billingAddress?.country}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <OrderStatusBadge status={order.financialStatus} type="financial" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Currency</span>
                  <span>{order.currency}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {shippingLines && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
                </div>
                <div className="p-6">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{shippingLines.title}</p>
                    <p className="text-gray-600">${shippingLines.price?.toFixed(2)}</p>
                    {shippingLines.trackingNumber && (
                      <p className="text-blue-600 mt-2">
                        Tracking: {shippingLines.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}