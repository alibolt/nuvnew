'use client';

import { useState } from 'react';
import { IndexTable } from '@/components/ui/index-table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Package, Eye, Check, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { OrderStatusBadge } from './order-status-badge';
import { AdvancedFilters } from './advanced-filters';
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
  orders,
  storeId 
}: { 
  orders: OrderWithItems[];
  storeId: string;
}) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [sortedOrders, setSortedOrders] = useState(orders);
  const [advancedFilters, setAdvancedFilters] = useState<any>(null);

  const toggleExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Apply all filters
  const applyFilters = (searchQuery: string = '', filters: any = null) => {
    let filtered = [...orders];

    // Apply search
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(searchTerm);
        const matchesCustomer = order.customerName.toLowerCase().includes(searchTerm) ||
                               order.customerEmail.toLowerCase().includes(searchTerm);
        return matchesOrderNumber || matchesCustomer;
      });
    }

    // Apply advanced filters
    if (filters) {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt);
          const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
          const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
          
          if (startDate && orderDate < startDate) return false;
          if (endDate && orderDate > endDate) return false;
          return true;
        });
      }

      // Status filters
      if (filters.statusFilters.order.length > 0) {
        filtered = filtered.filter(order => filters.statusFilters.order.includes(order.status));
      }
      if (filters.statusFilters.financial.length > 0) {
        filtered = filtered.filter(order => filters.statusFilters.financial.includes(order.financialStatus));
      }
      if (filters.statusFilters.fulfillment.length > 0) {
        filtered = filtered.filter(order => filters.statusFilters.fulfillment.includes(order.fulfillmentStatus || 'unfulfilled'));
      }

      // Amount range filter
      if (filters.amountRange.min || filters.amountRange.max) {
        filtered = filtered.filter(order => {
          const amount = order.totalPrice;
          if (filters.amountRange.min && amount < parseFloat(filters.amountRange.min)) return false;
          if (filters.amountRange.max && amount > parseFloat(filters.amountRange.max)) return false;
          return true;
        });
      }

      // Customer type filter
      if (filters.customerType) {
        filtered = filtered.filter(order => {
          if (filters.customerType === 'guest') return !order.customerId;
          if (filters.customerType === 'new') return order.customerId; // Simplified logic
          if (filters.customerType === 'returning') return order.customerId; // Simplified logic
          return true;
        });
      }

      // Discount filter
      if (filters.hasDiscount) {
        filtered = filtered.filter(order => {
          const hasDiscount = (order.totalDiscount || 0) > 0;
          return filters.hasDiscount === 'yes' ? hasDiscount : !hasDiscount;
        });
      }

      // Tags filter
      if (filters.tags) {
        const searchTags = filters.tags.toLowerCase().split(',').map((tag: string) => tag.trim());
        filtered = filtered.filter(order => {
          const orderTags = order.tags as string[] || [];
          return searchTags.some(searchTag => 
            orderTags.some(orderTag => orderTag.toLowerCase().includes(searchTag))
          );
        });
      }
    }

    setFilteredOrders(filtered);
    setSortedOrders(filtered);
  };

  // Filter and search handling
  const handleSearch = (query: string) => {
    applyFilters(query, advancedFilters);
  };

  const handleAdvancedFilters = (filters: any) => {
    setAdvancedFilters(filters);
    applyFilters('', filters);
  };

  const handleResetFilters = () => {
    setAdvancedFilters(null);
    setFilteredOrders(orders);
    setSortedOrders(orders);
  };

  const handleFilter = (filters: Record<string, any>) => {
    let filtered = orders.filter(order => {
      // Status filter
      if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }

      // Date range filter (placeholder for now)
      if (filters.dateRange && filters.dateRange !== 'all') {
        // Implement date range filtering
      }

      return true;
    });
    setFilteredOrders(filtered);
    setSortedOrders(filtered);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sorted = [...filteredOrders].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (column) {
        case 'orderNumber':
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
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedOrders(sorted);
  };

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    if (action === 'mark-processing') {
      console.log('Marking as processing:', selectedIds);
    } else if (action === 'mark-completed') {
      console.log('Marking as completed:', selectedIds);
    } else if (action === 'cancel') {
      console.log('Cancelling orders:', selectedIds);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Define table columns
  const columns = [
    { key: 'expand', label: '', width: '50px' },
    { key: 'orderNumber', label: 'Order', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'total', label: 'Total', sortable: true, align: 'right' as const },
    { key: 'status', label: 'Status', sortable: true, align: 'center' as const },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'actions', label: 'Actions', width: '100px', align: 'right' as const },
  ];

  // Define filters
  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'select' as const,
      options: [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: '7days' },
        { label: 'Last 30 days', value: '30days' }
      ]
    }
  ];

  // Define views
  const views = [
    { key: 'all', label: 'All Orders', badge: orders.length },
    { key: 'pending', label: 'Pending', badge: orders.filter(o => o.status === 'pending').length },
    { key: 'processing', label: 'Processing', badge: orders.filter(o => o.status === 'processing').length },
    { key: 'completed', label: 'Completed', badge: orders.filter(o => o.status === 'completed').length },
    { key: 'cancelled', label: 'Cancelled', badge: orders.filter(o => o.status === 'cancelled').length }
  ];

  // Define bulk actions
  const bulkActions = [
    { key: 'mark-processing', label: 'Mark as Processing', icon: Package },
    { key: 'mark-completed', label: 'Mark as Completed', icon: Check },
    { key: 'cancel', label: 'Cancel Orders', icon: X }
  ];

  // Render row function
  const renderRow = (order: OrderWithItems) => {
    const isExpanded = expandedOrders.has(order.id);
    const shortOrderNumber = order.orderNumber.split('_').pop()?.substring(0, 7);
    
    return (
      <>
        <td className="nuvi-p-3">
          <button
            onClick={() => toggleExpanded(order.id)}
            className="nuvi-text-gray-400 nuvi-hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="nuvi-p-3">
          <div>
            <p className="nuvi-font-medium nuvi-text-gray-900">#{shortOrderNumber}</p>
            <p className="nuvi-text-sm nuvi-text-gray-500">{order.lineItems.length} items</p>
          </div>
        </td>
        <td className="nuvi-p-3">
          <div>
            <p className="nuvi-font-medium nuvi-text-gray-900">{order.customerName}</p>
            <p className="nuvi-text-sm nuvi-text-gray-500">{order.customerEmail}</p>
          </div>
        </td>
        <td className="nuvi-p-3 nuvi-text-right">
          <span className="nuvi-font-medium nuvi-text-gray-900">
            {formatPrice(order.totalPrice)}
          </span>
        </td>
        <td className="nuvi-p-3 nuvi-text-center">
          <OrderStatusBadge status={order.status} />
        </td>
        <td className="nuvi-p-3">
          <span className="nuvi-text-sm nuvi-text-gray-900">
            {formatDate(order.createdAt)}
          </span>
        </td>
        <td className="nuvi-p-3 nuvi-text-right">
          <Link 
            href={`/dashboard/stores/${storeId}/orders/${order.id}`}
            className="nuvi-text-gray-600 nuvi-hover:text-gray-900 nuvi-p-1 inline-block"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </td>
      </>
    );
  };

  return (
    <div>
      {/* Advanced Filters */}
      <div className="mb-6 flex justify-between items-center">
        <AdvancedFilters 
          onFiltersChange={handleAdvancedFilters}
          onReset={handleResetFilters}
        />
        <div className="text-sm text-gray-500">
          {filteredOrders.length !== orders.length && (
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          )}
        </div>
      </div>

      <IndexTable
        title="Orders"
        data={sortedOrders}
        columns={columns}
        filters={filters}
        views={views}
        searchPlaceholder="Search orders, customers..."
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onBulkAction={handleBulkAction}
        bulkActions={bulkActions}
        primaryAction={{
          label: 'Create Order',
          icon: Plus,
          href: `/dashboard/stores/${storeId}/orders/create`
        }}
        renderRow={renderRow}
        selectable={true}
        keyField="id"
      />

      {/* Expanded Order Details */}
      {Array.from(expandedOrders).map(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return null;

        return (
          <div key={orderId} className="nuvi-mt-4 nuvi-bg-gray-50 nuvi-border nuvi-rounded-lg nuvi-p-4">
            <h4 className="nuvi-text-sm nuvi-font-medium nuvi-text-gray-900 nuvi-mb-3">
              Order Details - #{order.orderNumber.split('_').pop()?.substring(0, 7)}
            </h4>
            
            <div className="nuvi-space-y-2">
              {order.lineItems.map((item) => (
                <div key={item.id} className="nuvi-flex nuvi-justify-between nuvi-text-sm">
                  <span className="nuvi-text-gray-600">
                    {item.title || (item.variant && item.product ? `${item.product.name} (${item.variant.name})` : 'Unknown Item')} × {item.quantity}
                  </span>
                  <span className="nuvi-text-gray-900 nuvi-font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            {order.customerPhone && (
              <p className="nuvi-mt-3 nuvi-text-sm nuvi-text-gray-600">
                Phone: {order.customerPhone}
              </p>
            )}

            {order.status === 'pending' && (
              <div className="nuvi-mt-4 nuvi-flex nuvi-gap-2">
                <button className="nuvi-text-sm nuvi-text-blue-600 nuvi-hover:text-blue-900 nuvi-px-3 nuvi-py-1 nuvi-bg-blue-50 nuvi-rounded">
                  Mark as Processing
                </button>
                <button className="nuvi-text-sm nuvi-text-red-600 nuvi-hover:text-red-900 nuvi-px-3 nuvi-py-1 nuvi-bg-red-50 nuvi-rounded">
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}