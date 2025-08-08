import { notFound } from 'next/navigation';
import { CheckCircle, Package, Mail, CreditCard, MapPin, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStore } from '@/lib/stores';
import { prisma } from '@/lib/prisma';

interface OrderConfirmationPageProps {
  params: Promise<{
    subdomain: string;
    orderNumber: string;
  }>;
}

async function getOrderByOrderNumber(storeId: string, orderNumber: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        storeId,
        orderNumber,
      },
      include: {
        lineItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function formatAddress(address: any) {
  if (!address) return '';
  
  const { firstName, lastName, company, address1, address2, city, province, country, zip } = address;
  
  const parts = [
    [firstName, lastName].filter(Boolean).join(' '),
    company,
    address1,
    address2,
    [city, province].filter(Boolean).join(', '),
    [country, zip].filter(Boolean).join(' '),
  ].filter(Boolean);
  
  return parts.join('\n');
}

function getPaymentStatusColor(paymentStatus: string) {
  switch (paymentStatus.toLowerCase()) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'partially_paid':
      return 'outline';
    case 'refunded':
    case 'partially_refunded':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getPaymentStatusText(paymentStatus: string) {
  switch (paymentStatus.toLowerCase()) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending Payment';
    case 'partially_paid':
      return 'Partially Paid';
    case 'refunded':
      return 'Refunded';
    case 'partially_refunded':
      return 'Partially Refunded';
    default:
      return 'Unknown';
  }
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { subdomain, orderNumber } = await params;
  
  // Get store
  const store = await getStore(subdomain);
  if (!store) {
    return notFound();
  }

  // Get order
  const order = await getOrderByOrderNumber(store.id, orderNumber);
  if (!order) {
    return notFound();
  }

  const shippingAddress = order.shippingAddress as any;
  const billingAddress = order.billingAddress as any;
  const storeSettings = store.storeSettings as any;
  const paymentSettings = storeSettings?.paymentSettings;
  
  // Check if this is a manual payment (bank transfer)
  const isManualPayment = order.paymentStatus === 'pending' && 
    (paymentSettings?.manualPayment?.enabled || paymentSettings?.bankTransfer?.enabled);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your purchase, {order.customerName}!
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>Order #{order.orderNumber}</span>
            <span>•</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
              {getPaymentStatusText(order.paymentStatus)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.lineItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.title}
                        </h4>
                        {item.variantTitle && (
                          <p className="text-sm text-gray-600">
                            {item.variantTitle}
                          </p>
                        )}
                        {item.sku && (
                          <p className="text-xs text-gray-500">
                            SKU: {item.sku}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.totalPrice, order.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Manual Payment Instructions */}
            {isManualPayment && paymentSettings?.bankTransfer && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Instructions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <p className="text-sm text-blue-800 font-medium">
                      Please transfer the total amount to the following bank account:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {paymentSettings.bankTransfer.bankName && (
                        <div>
                          <span className="font-medium text-gray-700">Bank Name:</span>
                          <p className="text-gray-900">{paymentSettings.bankTransfer.bankName}</p>
                        </div>
                      )}
                      {paymentSettings.bankTransfer.accountName && (
                        <div>
                          <span className="font-medium text-gray-700">Account Name:</span>
                          <p className="text-gray-900">{paymentSettings.bankTransfer.accountName}</p>
                        </div>
                      )}
                      {paymentSettings.bankTransfer.accountNumber && (
                        <div>
                          <span className="font-medium text-gray-700">Account Number:</span>
                          <p className="text-gray-900 font-mono">{paymentSettings.bankTransfer.accountNumber}</p>
                        </div>
                      )}
                      {paymentSettings.bankTransfer.routingNumber && (
                        <div>
                          <span className="font-medium text-gray-700">Routing Number:</span>
                          <p className="text-gray-900 font-mono">{paymentSettings.bankTransfer.routingNumber}</p>
                        </div>
                      )}
                      {paymentSettings.bankTransfer.swiftCode && (
                        <div>
                          <span className="font-medium text-gray-700">SWIFT Code:</span>
                          <p className="text-gray-900 font-mono">{paymentSettings.bankTransfer.swiftCode}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3 mt-4">
                      <p className="text-sm font-medium text-gray-700">Amount to Transfer:</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.totalPrice, order.currency)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Please include your order number (#{order.orderNumber}) in the transfer reference.
                      </p>
                    </div>

                    {paymentSettings.bankTransfer.instructions && (
                      <div className="border-t pt-3 mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Additional Instructions:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {paymentSettings.bankTransfer.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Shipping Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-gray-600 whitespace-pre-line font-sans">
                    {formatAddress(shippingAddress)}
                  </pre>
                  {shippingAddress?.phone && (
                    <div className="flex items-center space-x-2 mt-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{shippingAddress.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-gray-600 whitespace-pre-line font-sans">
                    {formatAddress(billingAddress)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(order.subtotalPrice, order.currency)}</span>
                  </div>
                  
                  {order.totalShipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>{formatCurrency(order.totalShipping, order.currency)}</span>
                    </div>
                  )}
                  
                  {order.totalTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatCurrency(order.totalTax, order.currency)}</span>
                    </div>
                  )}
                  
                  {order.totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.totalDiscount, order.currency)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalPrice, order.currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>What's Next?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Confirmation Email</p>
                      <p className="text-gray-600">
                        We've sent a confirmation email to {order.customerEmail}
                      </p>
                    </div>
                  </div>

                  {!isManualPayment && (
                    <div className="flex items-start space-x-3">
                      <Package className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Processing Order</p>
                        <p className="text-gray-600">
                          Your order will be processed and shipped within 1-2 business days
                        </p>
                      </div>
                    </div>
                  )}

                  {isManualPayment && (
                    <div className="flex items-start space-x-3">
                      <CreditCard className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Awaiting Payment</p>
                        <p className="text-gray-600">
                          Please complete the bank transfer. We'll process your order once payment is received.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent>
                <div className="space-y-3">
                  <Link href={`/s/${subdomain}/account`}>
                    <Button className="w-full">
                      Go to My Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  
                  <Link href={`/s/${subdomain}`}>
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}