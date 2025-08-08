'use client';

interface OrderStatusBadgeProps {
  status: string;
  type?: 'order' | 'financial' | 'fulfillment';
}

export function OrderStatusBadge({ status, type = 'order' }: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (type) {
      case 'financial':
        return {
          pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
          authorized: { label: 'Authorized', className: 'bg-blue-100 text-blue-800' },
          paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
          partially_paid: { label: 'Partially Paid', className: 'bg-orange-100 text-orange-800' },
          refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-800' },
          partially_refunded: { label: 'Partially Refunded', className: 'bg-purple-100 text-purple-800' },
          voided: { label: 'Voided', className: 'bg-red-100 text-red-800' },
        };
      
      case 'fulfillment':
        return {
          unfulfilled: { label: 'Unfulfilled', className: 'bg-gray-100 text-gray-800' },
          partial: { label: 'Partially Fulfilled', className: 'bg-orange-100 text-orange-800' },
          fulfilled: { label: 'Fulfilled', className: 'bg-green-100 text-green-800' },
          restocked: { label: 'Restocked', className: 'bg-blue-100 text-blue-800' },
        };
      
      default: // order status
        return {
          open: { label: 'Open', className: 'bg-blue-100 text-blue-800' },
          pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
          processing: { label: 'Processing', className: 'bg-orange-100 text-orange-800' },
          completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
          cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
          archived: { label: 'Archived', className: 'bg-gray-100 text-gray-800' },
        };
    }
  };

  const statusConfig = getStatusConfig();
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}