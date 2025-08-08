'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Mail, ShoppingBag, UserCheck, UserX,
  ChevronLeft, ChevronRight, Trash2, Ban, Check
} from 'lucide-react';
import { CustomerFormPanel } from './customer-form-panel';

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

interface CustomersTabContentProps {
  store: StoreData;
}

export function CustomersTabContent({ store }: CustomersTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('view') as 'list' | 'create' | 'edit' | null;
  const [view, setView] = useState<'list' | 'create' | 'edit'>(viewParam || 'list');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'customers');
    if (view !== 'list') {
      params.set('view', view);
    } else {
      params.delete('view');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, searchParams]);

  const handleAddCustomer = () => {
    setView('create');
  };

  const handleEditCustomer = (customerId: string) => {
    setEditingCustomerId(customerId);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setEditingCustomerId(null);
  };

  const handleSave = () => {
    setView('list');
    setEditingCustomerId(null);
    // Trigger a refresh of the customers list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'list' ? (
        <CustomersListPanel 
          store={store}
          onAddCustomer={handleAddCustomer}
          onEditCustomer={handleEditCustomer}
          refreshKey={refreshKey}
        />
      ) : view === 'create' ? (
        <CustomerFormPanel 
          store={store}
          onSave={handleSave}
          onCancel={handleBack}
        />
      ) : (
        <CustomerFormPanel 
          store={store}
          customerId={editingCustomerId!}
          isEdit
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// Customers List Panel (Products tarzında)
function CustomersListPanel({ store, onAddCustomer, onEditCustomer, refreshKey }: {
  store: StoreData;
  onAddCustomer: () => void;
  onEditCustomer: (id: string) => void;
  refreshKey?: number;
}) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/customers?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          // API might return array directly or {customers: [], pagination: {}}
          if (Array.isArray(data)) {
            setCustomers(data);
          } else {
            setCustomers(data.customers || []);
            setPagination(data.pagination || null);
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [store.id, currentPage, refreshKey]);

  // Filter customers based on search and filters
  const filteredCustomers = (customers || []).filter(customer => {
    const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'No name';
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && customer.status === 'active') || 
      (filterStatus === 'inactive' && customer.status === 'inactive');
    const matchesSubscription = filterSubscription === 'all' || 
      (filterSubscription === 'subscribed' && customer.acceptsMarketing) || 
      (filterSubscription === 'unsubscribed' && !customer.acceptsMarketing);
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  // Handle individual selection
  const handleSelectCustomer = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCustomers.length} customers?`)) return;
    
    try {
      // Delete customers one by one
      for (const customerId of selectedCustomers) {
        await fetch(`/api/stores/${store.subdomain}/customers/${customerId}`, {
          method: 'DELETE'
        });
      }
      
      // Refresh and clear selection
      const fetchCustomers = async () => {
        const response = await fetch(`/api/stores/${store.subdomain}/customers?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCustomers(data);
          } else {
            setCustomers(data.customers || []);
          }
        }
      };
      await fetchCustomers();
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('Failed to delete some customers');
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive' | 'banned') => {
    try {
      // Update customers one by one
      for (const customerId of selectedCustomers) {
        await fetch(`/api/stores/${store.subdomain}/customers/${customerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      }
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        selectedCustomers.includes(c.id) ? { ...c, status } : c
      ));
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error updating customers:', error);
      alert('Failed to update some customers');
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/customers/${customerId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  // Calculate stats
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const subscribedCount = customers.filter(c => c.acceptsMarketing).length;

  return (
    <>
      {/* Customers Header - Products tarzında */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Customers</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage your customer relationships</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={onAddCustomer}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Customer Stats - Products tarzında */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Customers</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{customers.length}</p>
              </div>
              <Users className="h-6 w-6 nuvi-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Email Subscribers</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{subscribedCount}</p>
              </div>
              <Mail className="h-6 w-6 nuvi-text-success" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Revenue</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <ShoppingBag className="h-6 w-6 nuvi-text-warning" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Avg. Order Value</p>
                <p className="nuvi-text-2xl nuvi-font-bold">
                  {customers.length > 0 ? formatCurrency(totalSpent / customers.length) : '$0.00'}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 nuvi-text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table - Products tarzında */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {isLoading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <Users className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No customers yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Customers will appear here after their first purchase</p>
              <button 
                onClick={onAddCustomer}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Customer
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
                      placeholder="Search customers..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select 
                  className="nuvi-input" 
                  style={{ width: '150px' }}
                  value={filterSubscription}
                  onChange={(e) => setFilterSubscription(e.target.value)}
                >
                  <option value="all">All Subscriptions</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="unsubscribed">Not Subscribed</option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedCustomers.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => handleBulkStatusChange('active')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <Check className="h-4 w-4" />
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('inactive')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <UserX className="h-4 w-4" />
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('banned')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <Ban className="h-4 w-4" />
                      Ban
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

              {/* Customers Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium" style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox"
                        />
                      </th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Customer</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Orders</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Total Spent</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Subscription</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          {searchTerm || filterStatus !== 'all' || filterSubscription !== 'all' 
                            ? 'No customers found matching your filters' 
                            : 'No customers yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'No name';
                        
                        return (
                          <tr key={customer.id} className="nuvi-border-b">
                            <td className="nuvi-py-md nuvi-px-md">
                              <input
                                type="checkbox"
                                checked={selectedCustomers.includes(customer.id)}
                                onChange={() => handleSelectCustomer(customer.id)}
                                className="nuvi-checkbox"
                              />
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                                <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-primary/10 nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                                  <span className="nuvi-text-sm nuvi-font-medium nuvi-text-primary">
                                    {fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="nuvi-font-medium">{fullName}</p>
                                  <p className="nuvi-text-sm nuvi-text-muted">{customer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <span className="nuvi-text-sm">{customer._count?.orders || 0} orders</span>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <span className="nuvi-font-medium">{formatCurrency(customer.totalSpent || 0)}</span>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <span className={`nuvi-badge ${
                                customer.acceptsMarketing ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
                              }`}>
                                {customer.acceptsMarketing ? 'Subscribed' : 'Not subscribed'}
                              </span>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <span className={`nuvi-badge ${
                                customer.status === 'active' ? 'nuvi-badge-success' : 
                                customer.status === 'banned' ? 'nuvi-badge-destructive' : 'nuvi-badge-secondary'
                              }`}>
                                {customer.status}
                              </span>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                                <button 
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                  onClick={() => router.push(`/dashboard/stores/${store.subdomain}/customers/${customer.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => onEditCustomer(customer.id)}
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(customer.id)}
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} customers
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