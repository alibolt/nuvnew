'use client';

import { useState } from 'react';
import { 
  Package, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  BarChart3,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Archive
} from 'lucide-react';
import { ReturnDetailsModal } from './return-details-modal';
import { CreateReturnModal } from './create-return-modal';
import { ReturnsAnalytics } from './returns-analytics';

interface ReturnsManagementProps {
  storeId: string;
  returns: any[];
  recentOrders: any[];
}

export function ReturnsManagement({ storeId, returns, recentOrders }: ReturnsManagementProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);

  // Filter returns based on active filters
  const filteredReturns = returns.filter(returnItem => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOrder = returnItem.orderNumber?.toLowerCase().includes(query);
      const matchesCustomer = returnItem.customerName?.toLowerCase().includes(query) ||
                             returnItem.customerEmail?.toLowerCase().includes(query);
      const matchesId = returnItem.id?.toLowerCase().includes(query);
      
      if (!matchesOrder && !matchesCustomer && !matchesId) {
        return false;
      }
    }

    // Status filter
    if (statusFilter && returnItem.status !== statusFilter) {
      return false;
    }

    // Type filter
    if (typeFilter && returnItem.returnType !== typeFilter) {
      return false;
    }

    // Tab filter
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'pending':
          return returnItem.status === 'pending';
        case 'approved':
          return returnItem.status === 'approved';
        case 'processing':
          return ['received', 'processed'].includes(returnItem.status);
        case 'completed':
          return returnItem.status === 'completed';
        default:
          return true;
      }
    }

    return true;
  });

  // Calculate stats
  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    processing: returns.filter(r => ['received', 'processed'].includes(r.status)).length,
    completed: returns.filter(r => r.status === 'completed').length,
    totalRefunded: returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReturns.length === 0) return;

    try {
      const response = await fetch(`/api/stores/${storeId}/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          returnIds: selectedReturns
        }),
      });

      if (response.ok) {
        // Refresh the page to see updates
        window.location.reload();
      } else {
        alert('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'received':
        return 'bg-purple-100 text-purple-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refund':
        return <DollarSign className="h-4 w-4" />;
      case 'exchange':
        return <RefreshCw className="h-4 w-4" />;
      case 'store_credit':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (showAnalytics) {
    return (
      <ReturnsAnalytics
        storeId={storeId}
        returns={returns}
        onBack={() => setShowAnalytics(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRefunded.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search returns..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64"
              />
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="received">Received</option>
              <option value="processed">Processed</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="refund">Refund</option>
              <option value="exchange">Exchange</option>
              <option value="store_credit">Store Credit</option>
            </select>

            {/* Bulk Actions */}
            {selectedReturns.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  Approve ({selectedReturns.length})
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Reject ({selectedReturns.length})
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Return
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Returns', count: stats.total },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'processing', label: 'Processing', count: stats.processing },
              { key: 'completed', label: 'Completed', count: stats.completed }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-1 px-2 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Returns Table */}
        <div className="overflow-x-auto">
          {filteredReturns.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
              <p className="text-gray-500 mb-4">
                {returns.length === 0 
                  ? "You haven't received any return requests yet."
                  : "No returns match your current filters."
                }
              </p>
              {returns.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Return
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedReturns.length === filteredReturns.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReturns(filteredReturns.map(r => r.id));
                        } else {
                          setSelectedReturns([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReturns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReturns.includes(returnItem.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReturns([...selectedReturns, returnItem.id]);
                          } else {
                            setSelectedReturns(selectedReturns.filter(id => id !== returnItem.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{returnItem.id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {returnItem.returnItems?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{returnItem.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {returnItem.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {returnItem.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(returnItem.returnType)}
                        <span className="text-sm text-gray-900 capitalize">
                          {returnItem.returnType.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${returnItem.refundAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(returnItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedReturn(returnItem)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedReturn && (
        <ReturnDetailsModal
          return={selectedReturn}
          storeId={storeId}
          onClose={() => setSelectedReturn(null)}
          onUpdate={() => {
            setSelectedReturn(null);
            window.location.reload();
          }}
        />
      )}

      {showCreateModal && (
        <CreateReturnModal
          storeId={storeId}
          recentOrders={recentOrders}
          onClose={() => setShowCreateModal(false)}
          onCreate={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}