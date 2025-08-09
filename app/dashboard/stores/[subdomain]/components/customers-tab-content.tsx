'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Mail, ShoppingBag, UserCheck, UserX,
  ChevronLeft, ChevronRight, Trash2, Ban, Check,
  SortAsc, MoreHorizontal
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

      {/* Customers Table - Data Table with Filters */}
      <div className="nuvi-card">
        {/* Filter Bar */}
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '6px 8px 6px 32px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  width: '200px'
                }}
              />
            </div>
            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">
              <Filter size={12} style={{ marginRight: '4px' }} />
              Filters
            </button>
            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">
              <SortAsc size={12} style={{ marginRight: '4px' }} />
              Sort
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="nuvi-btn nuvi-btn-xs nuvi-btn-secondary">
              <Download size={12} style={{ marginRight: '4px' }} />
              Export
            </button>
            <button 
              onClick={onAddCustomer}
              className="nuvi-btn nuvi-btn-xs nuvi-btn-primary"
            >
              <Plus size={12} style={{ marginRight: '4px' }} />
              Add Customer
            </button>
          </div>
        </div>
        
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
            <>
              {/* Customers Table */}
              <table className="nuvi-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ fontSize: '12px' }}>
                    <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Orders</th>
                    <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Total Spent</th>
                    <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Last Order</th>
                    <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                          {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'No name';
                        
                        return (
                          <tr key={customer.id} style={{ fontSize: '13px' }}>
                            <td style={{ padding: '8px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: '#E5E7EB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '500' }}>{fullName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px' }}>{customer.email}</td>
                            <td style={{ padding: '8px 12px' }}>{customer._count?.orders || 0}</td>
                            <td style={{ padding: '8px 12px', fontWeight: '500' }}>{formatCurrency(customer.totalSpent || 0)}</td>
                            <td style={{ padding: '8px 12px', color: '#6B7280', fontSize: '12px' }}>
                              {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                              <button 
                                className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                                onClick={() => onEditCustomer(customer.id)}
                              >
                                <MoreHorizontal size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              
              {/* Pagination Footer */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <span style={{ color: '#6B7280' }}>
                  Showing {filteredCustomers.length > 0 ? '1' : '0'}-{filteredCustomers.length} of {customers.length} results
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, Math.ceil(customers.length / 50)) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button 
                        key={page}
                        className={`nuvi-btn nuvi-btn-ghost nuvi-btn-xs ${currentPage === page ? 'nuvi-btn-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button 
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                    disabled={currentPage >= Math.ceil(customers.length / 50)}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
      </div>
    </>
  );
}