'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShoppingCart, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Package, DollarSign, TrendingUp,
  ChevronLeft, ChevronRight, Trash2, XCircle, RefreshCw
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface OrdersTabContentProps {
  store: StoreData;
}

export function OrdersTabContent({ store }: OrdersTabContentProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/orders?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          // API might return array directly or {orders: [], pagination: {}}
          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            setOrders(data.orders || []);
            setPagination(data.pagination || null);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [store.id, currentPage]);

  // Filter orders based on search and filters
  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'nuvi-badge-success';
      case 'processing':
        return 'nuvi-badge-warning';
      case 'cancelled':
        return 'nuvi-badge-destructive';
      default:
        return 'nuvi-badge-secondary';
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  // Handle individual selection
  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Handle expand row
  const handleExpandRow = (orderId: string) => {
    if (expandedRows.includes(orderId)) {
      setExpandedRows(expandedRows.filter(id => id !== orderId));
    } else {
      setExpandedRows([...expandedRows, orderId]);
    }
  };

  // Bulk actions
  const handleBulkStatusChange = async (status: string) => {
    try {
      // Update orders one by one
      for (const orderId of selectedOrders) {
        await fetch(`/api/stores/${store.subdomain}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      }
      
      // Update local state
      setOrders(prev => prev.map(o => 
        selectedOrders.includes(o.id) ? { ...o, status } : o
      ));
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error updating orders:', error);
      alert('Failed to update some orders');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) return;
    
    try {
      // Delete orders one by one
      for (const orderId of selectedOrders) {
        await fetch(`/api/stores/${store.subdomain}/orders/${orderId}`, {
          method: 'DELETE'
        });
      }
      
      // Refresh and clear selection
      const fetchOrders = async () => {
        const response = await fetch(`/api/stores/${store.subdomain}/orders?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            setOrders(data.orders || []);
          }
        }
      };
      await fetchOrders();
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error deleting orders:', error);
      alert('Failed to delete some orders');
    }
  };

  // Calculate stats
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  return (
    <>
      {/* Orders Header - Products tarzında */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Orders</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage and track customer orders</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            className="nuvi-btn nuvi-btn-primary"
            onClick={() => router.push(`/dashboard/stores/${store.subdomain}/orders/new`)}
          >
            <Plus className="h-4 w-4" />
            Create Order
          </button>
        </div>
      </div>

      {/* Order Stats - Products tarzında */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Orders</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{orders.length}</p>
              </div>
              <ShoppingCart className="h-6 w-6 nuvi-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Revenue</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-6 w-6 nuvi-text-success" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Processing</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{processingOrders}</p>
              </div>
              <Clock className="h-6 w-6 nuvi-text-warning" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Completed</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{completedOrders}</p>
              </div>
              <CheckCircle className="h-6 w-6 nuvi-text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table - Products tarzında */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {isLoading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <ShoppingCart className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No orders yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Orders will appear here when customers make purchases</p>
              <button 
                onClick={() => window.open(`/s/${store.subdomain}`, '_blank')}
                className="nuvi-btn nuvi-btn-primary"
              >
                Visit Your Store
              </button>
            </div>
          ) : (
            <div>
              {/* Search and Filter - Products tarzında */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '150px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select 
                  className="nuvi-input" 
                  style={{ width: '150px' }}
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Payment Pending</option>
                  <option value="failed">Payment Failed</option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedOrders.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => handleBulkStatusChange('processing')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Process
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('completed')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('cancelled')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-table" style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ fontSize: '12px' }}>
                      <th style={{ width: '40px', padding: '6px 12px' }}></th>
                      <th style={{ width: '40px', padding: '6px 12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox-custom"
                        />
                      </th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Order ID</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Customer</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Total</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Payment</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                          {searchTerm || filterStatus !== 'all' || filterPayment !== 'all' 
                            ? 'No orders found matching your filters' 
                            : 'No orders yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr 
                            style={{ fontSize: '13px', cursor: 'pointer' }} 
                            onClick={() => handleExpandRow(order.id)}
                          >
                            <td style={{ padding: '8px 12px' }}>
                              <ChevronRight 
                                size={14} 
                                style={{
                                  transform: expandedRows.includes(order.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s'
                                }}
                              />
                            </td>
                            <td style={{ padding: '8px 12px' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={() => handleSelectOrder(order.id)}
                                className="nuvi-checkbox-custom"
                              />
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: '500' }}>#{order.orderNumber}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <div>
                                <div>{order.customerName || 'Guest'}</div>
                                <div style={{ fontSize: '11px', color: '#6B7280' }}>{order.customerEmail}</div>
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '8px 12px', fontWeight: '500' }}>{formatCurrency(order.totalPrice)}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <span className={`nuvi-badge nuvi-badge-sm ${
                                order.paymentStatus === 'paid' ? 'nuvi-badge-success' : 
                                order.paymentStatus === 'failed' ? 'nuvi-badge-destructive' : 'nuvi-badge-secondary'
                              }`}>
                                {order.paymentStatus || 'pending'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span className={`nuvi-badge nuvi-badge-sm ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                          {expandedRows.includes(order.id) && (
                            <tr>
                              <td colSpan={8} style={{ padding: '0' }}>
                                <div style={{ 
                                  padding: '16px 24px', 
                                  backgroundColor: '#F9FAFB',
                                  borderTop: '1px solid #E5E7EB',
                                  borderBottom: '1px solid #E5E7EB'
                                }}>
                                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Order Details</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {order.items?.map((item: any, index: number) => (
                                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span>{item.productTitle || item.title} × {item.quantity}</span>
                                        <span style={{ fontWeight: '500' }}>{formatCurrency(item.price * item.quantity)}</span>
                                      </div>
                                    ))}
                                    {(!order.items || order.items.length === 0) && (
                                      <div style={{ fontSize: '12px', color: '#6B7280' }}>No items data available</div>
                                    )}
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      fontSize: '12px',
                                      paddingTop: '8px',
                                      borderTop: '1px solid #E5E7EB',
                                      marginTop: '8px',
                                      fontWeight: '600'
                                    }}>
                                      <span>Total</span>
                                      <span>{formatCurrency(order.totalPrice)}</span>
                                    </div>
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button 
                                          className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                                          onClick={() => router.push(`/dashboard/stores/${store.subdomain}/orders/${order.id}`)}
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} orders
                  </div>
                  
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        
                        if (page > pagination.pages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`nuvi-btn nuvi-btn-sm ${
                              page === currentPage 
                                ? 'nuvi-btn-primary' 
                                : 'nuvi-btn-ghost'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}