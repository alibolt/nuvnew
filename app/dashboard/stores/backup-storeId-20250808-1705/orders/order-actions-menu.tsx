'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Truck, CreditCard, X, RefreshCw, Archive } from 'lucide-react';

interface OrderActionsMenuProps {
  order: any;
  storeId: string;
}

export function OrderActionsMenu({ order, storeId }: OrderActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusUpdate = async (newStatus: string, statusType: 'order' | 'financial' | 'fulfillment') => {
    setIsLoading(true);
    try {
      const updateData: any = {};
      
      if (statusType === 'order') {
        updateData.status = newStatus;
      } else if (statusType === 'financial') {
        updateData.financialStatus = newStatus;
      } else if (statusType === 'fulfillment') {
        updateData.fulfillmentStatus = newStatus;
      }

      const response = await fetch(`/api/stores/${storeId}/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.refresh();
        setIsOpen(false);
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFulfillOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${storeId}/orders/${order.id}/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineItems: order.lineItems.map((item: any) => ({
            id: item.id,
            quantity: item.quantity
          }))
        }),
      });

      if (response.ok) {
        router.refresh();
        setIsOpen(false);
      } else {
        console.error('Failed to fulfill order');
      }
    } catch (error) {
      console.error('Error fulfilling order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    // Order status actions
    if (order.status === 'pending') {
      actions.push({
        label: 'Mark as Processing',
        icon: RefreshCw,
        onClick: () => handleStatusUpdate('processing', 'order'),
        className: 'text-blue-600 hover:text-blue-700'
      });
    }

    if (order.status === 'processing') {
      actions.push({
        label: 'Mark as Completed',
        icon: Edit,
        onClick: () => handleStatusUpdate('completed', 'order'),
        className: 'text-green-600 hover:text-green-700'
      });
    }

    if (order.status !== 'cancelled' && order.status !== 'completed') {
      actions.push({
        label: 'Cancel Order',
        icon: X,
        onClick: () => handleStatusUpdate('cancelled', 'order'),
        className: 'text-red-600 hover:text-red-700'
      });
    }

    // Fulfillment actions
    if (order.fulfillmentStatus !== 'fulfilled' && order.status !== 'cancelled') {
      actions.push({
        label: 'Fulfill Order',
        icon: Truck,
        onClick: handleFulfillOrder,
        className: 'text-purple-600 hover:text-purple-700'
      });
    }

    // Payment actions
    if (order.financialStatus === 'pending' && order.status !== 'cancelled') {
      actions.push({
        label: 'Mark as Paid',
        icon: CreditCard,
        onClick: () => handleStatusUpdate('paid', 'financial'),
        className: 'text-green-600 hover:text-green-700'
      });
    }

    // Archive action
    if (order.status === 'completed' || order.status === 'cancelled') {
      actions.push({
        label: 'Archive Order',
        icon: Archive,
        onClick: () => handleStatusUpdate('archived', 'order'),
        className: 'text-gray-600 hover:text-gray-700'
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="nuvi-button-secondary flex items-center gap-2"
      >
        <MoreVertical className="h-4 w-4" />
        Actions
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              {availableActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={isLoading}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${action.className}`}
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}