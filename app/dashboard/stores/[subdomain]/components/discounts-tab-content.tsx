'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Tag, Plus, Search, Filter, Edit2, MoreVertical, 
  ArrowLeft, Trash2, Copy, Calendar, CheckCircle,
  XCircle, Clock, AlertCircle, TrendingUp, DollarSign,
  Users, ChevronLeft, ChevronRight, Download, Upload,
  Save, X, Percent, Package, Truck, Gift
} from 'lucide-react';
import { DiscountFormPanel } from './discount-form-panel';
import { toast } from 'sonner';

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

interface DiscountsTabContentProps {
  store: StoreData;
}

interface Discount {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  startsAt?: string;
  endsAt?: string;
  usageCount: number;
  usageLimit?: number;
  remainingUses?: number;
  uniqueCustomers: number;
  performance: {
    totalSavings: number;
    averageOrderValue: number;
    conversionRate: number;
  };
}

export function DiscountsTabContent({ store }: DiscountsTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('view') as 'list' | 'create' | 'edit' | null;
  const discountIdParam = searchParams.get('discountId');
  const [view, setView] = useState<'list' | 'create' | 'edit'>(viewParam || 'list');
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(discountIdParam);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Check for AI data and auto-switch to create view
  useEffect(() => {
    const aiDiscountData = sessionStorage.getItem('aiDiscountData');
    if (aiDiscountData && view === 'list') {
      // Auto-switch to create view when AI data is present
      setView('create');
    }
  }, []);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'discounts');
    if (view !== 'list') {
      params.set('view', view);
      if (view === 'edit' && editingDiscountId) {
        params.set('discountId', editingDiscountId);
      }
    } else {
      params.delete('view');
      params.delete('discountId');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, editingDiscountId, searchParams]);

  const handleAddDiscount = () => {
    setView('create');
  };

  const handleEditDiscount = (discountId: string) => {
    setEditingDiscountId(discountId);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setEditingDiscountId(null);
    // Clear discountId from URL
    const params = new URLSearchParams(searchParams);
    params.delete('discountId');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  };

  const handleSave = () => {
    setView('list');
    setEditingDiscountId(null);
    // Trigger a refresh of the discounts list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'list' ? (
        <DiscountsListPanel 
          store={store}
          onAddDiscount={handleAddDiscount}
          onEditDiscount={handleEditDiscount}
          refreshKey={refreshKey}
        />
      ) : view === 'create' ? (
        <DiscountFormPanel 
          store={store}
          onSave={handleSave}
          onCancel={handleBack}
        />
      ) : (
        <DiscountFormPanel 
          store={store}
          discountId={editingDiscountId!}
          isEdit
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// Discounts List Panel
function DiscountsListPanel({ store, onAddDiscount, onEditDiscount, refreshKey }: {
  store: StoreData;
  onAddDiscount: () => void;
  onEditDiscount: (id: string) => void;
  refreshKey?: number;
}) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch discounts from API
  useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/discounts?status=${filterStatus}&page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setDiscounts(data.discounts || []);
          setPagination(data.pagination || null);
          setAnalytics(data.analytics || null);
        }
      } catch (error) {
        console.error('Error fetching discounts:', error);
        setDiscounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscounts();
  }, [store.subdomain, currentPage, filterStatus, refreshKey]);

  // Filter discounts based on search and filters
  const filteredDiscounts = (discounts || []).filter(discount => {
    const matchesSearch = discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || discount.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedDiscounts.length === filteredDiscounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(filteredDiscounts.map(d => d.id));
    }
  };

  // Handle individual selection
  const handleSelectDiscount = (discountId: string) => {
    if (selectedDiscounts.includes(discountId)) {
      setSelectedDiscounts(selectedDiscounts.filter(id => id !== discountId));
    } else {
      setSelectedDiscounts([...selectedDiscounts, discountId]);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedDiscounts.length} discounts?`)) return;
    
    try {
      // Delete discounts one by one
      for (const discountId of selectedDiscounts) {
        await fetch(`/api/stores/${store.subdomain}/discounts?discountId=${discountId}`, {
          method: 'DELETE'
        });
      }
      
      // Refresh and clear selection
      const fetchDiscounts = async () => {
        const response = await fetch(`/api/stores/${store.subdomain}/discounts?status=${filterStatus}&page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setDiscounts(data.discounts || []);
        }
      };
      await fetchDiscounts();
      setSelectedDiscounts([]);
      toast.success('Discounts deleted successfully');
    } catch (error) {
      console.error('Error deleting discounts:', error);
      toast.error('Failed to delete some discounts');
    }
  };

  const handleDuplicateDiscount = async (discount: Discount) => {
    try {
      const duplicatedDiscount = {
        ...discount,
        code: `${discount.code}-COPY`,
        name: `${discount.name} (Copy)`,
        status: 'inactive',
        usageCount: 0,
        uniqueCustomers: 0,
        performance: {
          totalSavings: 0,
          averageOrderValue: 0,
          conversionRate: 0
        }
      };

      const response = await fetch(`/api/stores/${store.subdomain}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedDiscount)
      });
      
      if (response.ok) {
        const fetchDiscounts = async () => {
          const response = await fetch(`/api/stores/${store.subdomain}/discounts?status=${filterStatus}&page=${currentPage}&limit=50`);
          if (response.ok) {
            const data = await response.json();
            setDiscounts(data.discounts || []);
          }
        };
        await fetchDiscounts();
        toast.success('Discount duplicated successfully');
      } else {
        toast.error('Failed to duplicate discount');
      }
    } catch (error) {
      console.error('Error duplicating discount:', error);
      toast.error('Failed to duplicate discount');
    }
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/discounts?discountId=${discountId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDiscounts(prev => prev.filter(d => d.id !== discountId));
        toast.success('Discount deleted successfully');
      } else {
        toast.error('Failed to delete discount');
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Failed to delete discount');
    }
  };

  const handleToggleStatus = async (discount: Discount) => {
    const newStatus = discount.status === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/discounts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountId: discount.id,
          status: newStatus
        }),
      });

      if (response.ok) {
        const fetchDiscounts = async () => {
          const response = await fetch(`/api/stores/${store.subdomain}/discounts?status=${filterStatus}&page=${currentPage}&limit=50`);
          if (response.ok) {
            const data = await response.json();
            setDiscounts(data.discounts || []);
          }
        };
        await fetchDiscounts();
        toast.success(`Discount ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error('Failed to update discount status');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error('Failed to update discount status');
    }
  };

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Discount code copied to clipboard');
  };

  const formatDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}% off`;
      case 'fixed_amount':
        return `$${discount.value} off`;
      case 'free_shipping':
        return 'Free shipping';
      case 'buy_x_get_y':
        return 'BOGO deal';
      default:
        return discount.value;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 nuvi-text-success" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 nuvi-text-muted" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 nuvi-text-warning" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 nuvi-text-error" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed_amount':
        return <DollarSign className="h-4 w-4" />;
      case 'free_shipping':
        return <Truck className="h-4 w-4" />;
      case 'buy_x_get_y':
        return <Gift className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Discounts Header - Minimal */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Discount Codes</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Create and manage discount codes for your store</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="nuvi-btn nuvi-btn-secondary">
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button 
            onClick={onAddDiscount}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Discount
          </button>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {isLoading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading discounts...</p>
            </div>
          ) : discounts.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <Tag className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No discount codes yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Create your first discount code to attract customers</p>
              <button 
                onClick={onAddDiscount}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Create Discount
              </button>
            </div>
          ) : (
            <div>
              {/* Search and Filter */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search discount codes..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types ({discounts.length})</option>
                  <option value="percentage">Percentage ({discounts.filter(d => d.type === 'percentage').length})</option>
                  <option value="fixed_amount">Fixed Amount ({discounts.filter(d => d.type === 'fixed_amount').length})</option>
                  <option value="free_shipping">Free Shipping ({discounts.filter(d => d.type === 'free_shipping').length})</option>
                  <option value="buy_x_get_y">BOGO ({discounts.filter(d => d.type === 'buy_x_get_y').length})</option>
                </select>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">
                    All Status ({discounts.length})
                  </option>
                  <option value="active">
                    Active ({discounts.filter(d => d.status === 'active').length})
                  </option>
                  <option value="inactive">
                    Inactive ({discounts.filter(d => d.status === 'inactive').length})
                  </option>
                  <option value="scheduled">
                    Scheduled ({discounts.filter(d => d.status === 'scheduled').length})
                  </option>
                  <option value="expired">
                    Expired ({discounts.filter(d => d.status === 'expired').length})
                  </option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedDiscounts.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedDiscounts.length} discount{selectedDiscounts.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary">
                      <XCircle className="h-4 w-4" />
                      Deactivate
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

              {/* Discounts Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium" style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedDiscounts.length === filteredDiscounts.length && filteredDiscounts.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox"
                        />
                      </th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Code</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Type & Value</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Usage</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Performance</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDiscounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                            ? 'No discounts found matching your filters' 
                            : 'No discounts yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredDiscounts.map((discount) => (
                        <tr key={discount.id} className="nuvi-border-b">
                          <td className="nuvi-py-md nuvi-px-md">
                            <input
                              type="checkbox"
                              checked={selectedDiscounts.includes(discount.id)}
                              onChange={() => handleSelectDiscount(discount.id)}
                              className="nuvi-checkbox"
                            />
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              <code className="nuvi-font-mono nuvi-font-bold">{discount.code}</code>
                              <button
                                onClick={() => copyDiscountCode(discount.code)}
                                className="nuvi-text-muted hover:nuvi-text-primary nuvi-transition"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="nuvi-text-sm nuvi-text-muted">{discount.name}</p>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              {getTypeIcon(discount.type)}
                              <span className="nuvi-font-medium">
                                {formatDiscountValue(discount)}
                              </span>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div>
                              <p className="nuvi-font-medium">{discount.usageCount} uses</p>
                              {discount.usageLimit && (
                                <p className="nuvi-text-sm nuvi-text-muted">
                                  of {discount.usageLimit} limit
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-text-sm">
                              <p className="nuvi-font-medium">${discount.performance.totalSavings.toFixed(2)}</p>
                              <p className="nuvi-text-muted">
                                {discount.performance.conversionRate.toFixed(1)}% conversion
                              </p>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              {getStatusIcon(discount.status)}
                              <span className="nuvi-capitalize">{discount.status}</span>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                              <button 
                                onClick={() => handleToggleStatus(discount)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                title={discount.status === 'active' ? 'Deactivate' : 'Activate'}
                              >
                                {discount.status === 'active' ? (
                                  <XCircle className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button 
                                onClick={() => handleDuplicateDiscount(discount)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => onEditDiscount(discount.id)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteDiscount(discount.id)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} discounts
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
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        
                        if (page > pagination.totalPages) return null;
                        
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
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
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