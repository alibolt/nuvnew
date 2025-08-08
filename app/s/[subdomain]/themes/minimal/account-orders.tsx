'use client';

import Link from 'next/link';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';

interface AccountOrdersProps {
  settings?: any;
  pageData?: {
    customer?: any;
    storeSubdomain?: string;
  };
}

export function AccountOrders({ settings: sectionSettings, pageData }: AccountOrdersProps) {
  const { settings } = useTheme();
  
  const title = sectionSettings?.title || 'Recent Orders';
  const showViewAll = sectionSettings?.showViewAll ?? true;
  const ordersPerPage = sectionSettings?.ordersPerPage || 10;
  
  const customer = pageData?.customer;
  const storeSubdomain = pageData?.storeSubdomain || '';
  const orders = customer?.orders || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'processing':
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
      case 'refunded':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <section 
      className="py-12"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 
            style={{
              fontSize: 'var(--theme-text-2xl)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-font-weight-medium)',
              color: 'var(--theme-text)',
            }}
          >
            {title}
          </h2>
          
          {showViewAll && orders.length > 0 && (
            <Link
              href={`/s/${storeSubdomain}/account/orders`}
              className="text-sm transition-opacity hover:opacity-70"
              style={{
                color: 'var(--theme-primary)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              View All Orders
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <MinimalIcons.Package 
                size={48} 
                className="mx-auto opacity-40"
                style={{ color: 'var(--theme-text-secondary)' }}
              />
            </div>
            <h3 
              className="mb-2"
              style={{
                fontSize: 'var(--theme-text-xl)',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
              }}
            >
              No orders yet
            </h3>
            <p 
              className="mb-6"
              style={{
                fontSize: 'var(--theme-text-base)',
                color: 'var(--theme-text-secondary)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              When you place your first order, it will appear here.
            </p>
            <Link
              href={`/s/${storeSubdomain}`}
              className="inline-block px-6 py-3 rounded-lg transition-all"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'white',
                fontSize: 'var(--theme-text-base)',
                fontFamily: 'var(--theme-font-body)',
                fontWeight: 'var(--theme-font-weight-medium)',
              }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, ordersPerPage).map((order: any) => (
              <div 
                key={order.id}
                className="border rounded-lg p-6"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-background)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 
                      className="font-medium mb-1"
                      style={{
                        fontSize: 'var(--theme-text-lg)',
                        fontFamily: 'var(--theme-font-heading)',
                        color: 'var(--theme-text)',
                      }}
                    >
                      Order #{order.orderNumber}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                    >
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <span 
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}
                      style={{ fontFamily: 'var(--theme-font-body)' }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span 
                      className="font-medium"
                      style={{
                        fontSize: 'var(--theme-text-lg)',
                        color: 'var(--theme-text)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                    >
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {order.items.slice(0, 4).map((item: any, index: number) => (
                      <div 
                        key={item.id}
                        className="w-16 h-16 rounded bg-gray-100 overflow-hidden"
                      >
                        {item.variant?.images?.[0] ? (
                          <img
                            src={item.variant.images[0].url}
                            alt={item.variant.product?.name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MinimalIcons.Package 
                              size={20} 
                              style={{ color: 'var(--theme-text-secondary)' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div 
                        className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center"
                        style={{
                          fontSize: 'var(--theme-text-sm)',
                          color: 'var(--theme-text-secondary)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/s/${storeSubdomain}/account/orders/${order.id}`}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{
                      color: 'var(--theme-primary)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    View Details
                  </Link>
                  {order.status === 'delivered' && (
                    <>
                      <span style={{ color: 'var(--theme-text-secondary)' }}>•</span>
                      <button
                        className="text-sm transition-opacity hover:opacity-70"
                        style={{
                          color: 'var(--theme-primary)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        Reorder
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}