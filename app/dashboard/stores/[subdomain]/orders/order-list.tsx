'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NuviTable } from '@/components/ui/nuvi-table';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Clock, Plus, Truck, Check, X, Eye, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import type { Order, OrderLineItem, Product, ProductVariant } from '@prisma/client';

type OrderWithItems = Order & {
  lineItems: (OrderLineItem & {
    variant?: ProductVariant & {
      product: Product;
    } | null;
    product?: Product | null;
  })[];
};

export function OrderList({ 
  orders: initialOrders,
  subdomain 
}: { 
  orders: OrderWithItems[];
  subdomain: string;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [sortValue, setSortValue] = useState('');

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchValue) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(order => {
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(searchTerm);
        const matchesCustomer = order.customerName.toLowerCase().includes(searchTerm) ||
                               order.customerEmail.toLowerCase().includes(searchTerm);
        return matchesOrderNumber || matchesCustomer;
      });
    }

    // Status filter
    if (appliedFilters.status) {
      filtered = filtered.filter(order => order.status === appliedFilters.status);
    }

    // Payment status filter
    if (appliedFilters.paymentStatus) {
      filtered = filtered.filter(order => order.financialStatus === appliedFilters.paymentStatus);
    }

    // Sorting
    if (sortValue) {
      const [column, direction] = sortValue.split('_');
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (column) {
          case 'number':
            aValue = a.orderNumber;
            bValue = b.orderNumber;
            break;
          case 'customer':
            aValue = a.customerName.toLowerCase();
            bValue = b.customerName.toLowerCase();
            break;
          case 'total':
            aValue = a.totalPrice;
            bValue = b.totalPrice;
            break;
          case 'date':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (direction === 'ascending') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [orders, searchValue, appliedFilters, sortValue]);

  // View counts for tabs
  const viewCounts = useMemo(() => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const unfulfilled = orders.filter(o => (o.fulfillmentStatus || 'unfulfilled') === 'unfulfilled').length;
    const unpaid = orders.filter(o => o.financialStatus === 'pending').length;
    const open = orders.filter(o => ['pending', 'processing'].includes(o.status)).length;
    return { all: orders.length, pending, unfulfilled, unpaid, open };
  }, [orders]);

  // Helper functions
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning' },
      processing: { label: 'Processing', color: 'primary' },
      completed: { label: 'Completed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      refunded: { label: 'Refunded', color: 'secondary' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'secondary' };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Paid', color: 'success' },
      pending: { label: 'Pending', color: 'warning' },
      failed: { label: 'Failed', color: 'error' },
      refunded: { label: 'Refunded', color: 'secondary' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'secondary' };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  const getFulfillmentBadge = (status: string | null) => {
    const statusConfig = {
      fulfilled: { label: 'Fulfilled', color: 'success' },
      partial: { label: 'Partial', color: 'warning' },
      unfulfilled: { label: 'Unfulfilled', color: 'secondary' }
    };
    
    const config = statusConfig[(status || 'unfulfilled') as keyof typeof statusConfig] || { label: status || 'Unfulfilled', color: 'secondary' };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  // Actions
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        toast.success('Order status updated');
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('An error occurred');
    }
  };

  const handleBulkStatusUpdate = async (selectedIds: string[], newStatus: string) => {
    try {
      for (const id of selectedIds) {
        await handleStatusUpdate(id, newStatus);
      }
      setSelectedItems([]);
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error('Some orders could not be updated');
    }
  };

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const tableColumns = [
    {
      key: 'order',
      label: 'Order',
      width: '15%',
      render: (order: OrderWithItems) => {
        const shortOrderNumber = order.orderNumber.split('_').pop()?.substring(0, 8) || order.orderNumber;
        return (
          <div>
            <Link 
              href={`/dashboard/stores/${subdomain}/orders/${order.id}`}
              style={{ fontWeight: '500', color: '#0369A1', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              #{shortOrderNumber}
            </Link>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
              {formatDate(order.createdAt)}
            </div>
          </div>
        );
      }
    },
    {
      key: 'customer',
      label: 'Customer',
      width: '25%',
      render: (order: OrderWithItems) => (
        <div>
          <div style={{ fontWeight: '500' }}>{order.customerName}</div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>{order.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (order: OrderWithItems) => getStatusBadge(order.status)
    },
    {
      key: 'payment',
      label: 'Payment',
      width: '15%',
      render: (order: OrderWithItems) => getPaymentBadge(order.financialStatus)
    },
    {
      key: 'fulfillment',
      label: 'Fulfillment',
      width: '15%',
      render: (order: OrderWithItems) => getFulfillmentBadge(order.fulfillmentStatus)
    },
    {
      key: 'total',
      label: 'Total',
      width: '15%',
      render: (order: OrderWithItems) => (
        <div>
          <div style={{ fontWeight: '500' }}>{formatPrice(order.totalPrice)}</div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>{order.lineItems.length} items</div>
        </div>
      )
    }
  ];

  return (
    <NuviTable
      columns={tableColumns}
      data={filteredOrders}
      selectable={true}
      selectedRows={selectedItems}
      onSelectionChange={setSelectedItems}
      
      onView={(order) => router.push(`/dashboard/stores/${subdomain}/orders/${order.id}`)}
      customActions={(order: OrderWithItems) => (
        <>
          <Link 
            href={`/dashboard/stores/${subdomain}/orders/${order.id}`}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#6B7280',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="View details"
          >
            <Eye size={16} />
          </Link>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: '#6B7280',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MoreVertical size={16} />
            </button>
            {openDropdownId === order.id && (
              <>
                <div 
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10
                  }}
                  onClick={() => setOpenDropdownId(null)}
                />
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '32px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #E5E7EB',
                  padding: '4px 0',
                  minWidth: '160px',
                  zIndex: 20
                }}>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => {
                        handleStatusUpdate(order.id, 'processing');
                        setOpenDropdownId(null);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Package size={14} />
                      Mark as Processing
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button 
                      onClick={() => {
                        handleStatusUpdate(order.id, 'completed');
                        setOpenDropdownId(null);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Check size={14} />
                      Mark as Completed
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      handleStatusUpdate(order.id, 'cancelled');
                      setOpenDropdownId(null);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      fontSize: '13px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#DC2626'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <X size={14} />
                    Cancel Order
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
      
      bulkActions={[
        {
          label: 'Mark as Processing',
          icon: Package,
          onClick: (ids) => handleBulkStatusUpdate(ids, 'processing'),
        },
        {
          label: 'Mark as Completed',
          icon: Check,
          onClick: (ids) => handleBulkStatusUpdate(ids, 'completed'),
        },
        {
          label: 'Cancel Orders',
          icon: X,
          destructive: true,
          onClick: (ids) => handleBulkStatusUpdate(ids, 'cancelled'),
        },
      ]}
      
      searchable={true}
      searchPlaceholder="Search orders..."
      onSearch={setSearchValue}
      
      totalItems={filteredOrders.length}
      itemsPerPage={20}
      currentPage={1}
      
      emptyMessage="No orders yet. When customers place orders, they will appear here."
    />
  );
}