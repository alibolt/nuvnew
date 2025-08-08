'use client';

import { CheckCircle, Clock, XCircle, AlertCircle, Package, CreditCard, Truck } from 'lucide-react';

interface OrderTimelineProps {
  order: any;
}

export function OrderTimelineComponent({ order }: OrderTimelineProps) {
  // Generate timeline events from order data
  const generateTimelineEvents = () => {
    const events = [];

    // Order created
    events.push({
      id: 'order_created',
      type: 'order_created',
      title: 'Order Created',
      description: `Order #${order.orderNumber} was placed`,
      timestamp: order.createdAt,
      icon: Package,
      status: 'completed'
    });

    // Payment events
    if (order.financialStatus === 'paid') {
      events.push({
        id: 'payment_received',
        type: 'payment',
        title: 'Payment Received',
        description: `Payment of $${order.totalPrice.toFixed(2)} was successfully processed`,
        timestamp: order.createdAt, // In real app, would be separate payment timestamp
        icon: CreditCard,
        status: 'completed'
      });
    } else if (order.financialStatus === 'pending') {
      events.push({
        id: 'payment_pending',
        type: 'payment',
        title: 'Payment Pending',
        description: 'Waiting for payment confirmation',
        timestamp: order.createdAt,
        icon: Clock,
        status: 'pending'
      });
    }

    // Fulfillment events
    if (order.fulfillmentStatus === 'fulfilled') {
      events.push({
        id: 'order_fulfilled',
        type: 'fulfillment',
        title: 'Order Fulfilled',
        description: 'All items have been shipped',
        timestamp: order.updatedAt,
        icon: Truck,
        status: 'completed'
      });
    } else if (order.fulfillmentStatus === 'partial') {
      events.push({
        id: 'order_partial_fulfillment',
        type: 'fulfillment',
        title: 'Partially Fulfilled',
        description: 'Some items have been shipped',
        timestamp: order.updatedAt,
        icon: Package,
        status: 'completed'
      });
    }

    // Order status events
    if (order.status === 'completed') {
      events.push({
        id: 'order_completed',
        type: 'status',
        title: 'Order Completed',
        description: 'Order has been successfully completed',
        timestamp: order.updatedAt,
        icon: CheckCircle,
        status: 'completed'
      });
    } else if (order.status === 'cancelled') {
      events.push({
        id: 'order_cancelled',
        type: 'status',
        title: 'Order Cancelled',
        description: order.cancelReason ? `Reason: ${order.cancelReason}` : 'Order was cancelled',
        timestamp: order.cancelledAt || order.updatedAt,
        icon: XCircle,
        status: 'cancelled'
      });
    }

    // Sort by timestamp
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const timelineEvents = generateTimelineEvents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectorColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200';
      case 'pending':
        return 'border-yellow-200';
      case 'cancelled':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="p-6">
      {timelineEvents.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No timeline events yet</p>
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {timelineEvents.map((event, eventIdx) => {
              const Icon = event.icon;
              return (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== timelineEvents.length - 1 ? (
                      <span
                        className={`absolute top-4 left-4 -ml-px h-full w-0.5 border-l-2 ${getConnectorColor(event.status)}`}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(event.status)}`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={event.timestamp}>
                            {new Date(event.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Add Event Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Add Note or Update
        </button>
      </div>
    </div>
  );
}