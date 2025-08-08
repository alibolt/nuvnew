'use client';

import { useState } from 'react';
import { IndexTable } from '@/components/ui/index-table';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Trash2, Plus, Mail, Phone } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export function CustomerList({ 
  customers,
  storeId 
}: { 
  customers: Customer[];
  storeId: string;
}) {
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [sortedCustomers, setSortedCustomers] = useState(customers);

  // Filter and search handling
  const handleSearch = (query: string) => {
    const filtered = customers.filter(customer => {
      if (!query) return true;
      const searchTerm = query.toLowerCase();
      const matchesName = customer.name.toLowerCase().includes(searchTerm);
      const matchesEmail = customer.email.toLowerCase().includes(searchTerm);
      const matchesPhone = customer.phone?.toLowerCase().includes(searchTerm);
      return matchesName || matchesEmail || matchesPhone;
    });
    setFilteredCustomers(filtered);
    setSortedCustomers(filtered);
  };

  const handleFilter = (filters: Record<string, any>) => {
    let filtered = customers.filter(customer => {
      // Status filter
      if (filters.status && filters.status !== 'all' && customer.status !== filters.status) {
        return false;
      }

      // Spending filter
      if (filters.spending && filters.spending !== 'all') {
        if (filters.spending === 'high' && customer.totalSpent < 1000) return false;
        if (filters.spending === 'medium' && (customer.totalSpent < 100 || customer.totalSpent >= 1000)) return false;
        if (filters.spending === 'low' && customer.totalSpent >= 100) return false;
      }

      return true;
    });
    setFilteredCustomers(filtered);
    setSortedCustomers(filtered);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sorted = [...filteredCustomers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (column) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'orders':
          aValue = a.totalOrders;
          bValue = b.totalOrders;
          break;
        case 'spent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'lastOrder':
          aValue = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
          bValue = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
          break;
        case 'joined':
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
    setSortedCustomers(sorted);
  };

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    if (action === 'export') {
      console.log('Exporting customers:', selectedIds);
    } else if (action === 'send-email') {
      console.log('Sending email to customers:', selectedIds);
    } else if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) {
        console.log('Deleting customers:', selectedIds);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  // Define table columns
  const columns = [
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'orders', label: 'Orders', sortable: true, align: 'center' as const },
    { key: 'spent', label: 'Total Spent', sortable: true, align: 'right' as const },
    { key: 'lastOrder', label: 'Last Order', sortable: true },
    { key: 'joined', label: 'Joined', sortable: true },
    { key: 'actions', label: 'Actions', width: '120px', align: 'right' as const },
  ];

  // Define filters
  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    {
      key: 'spending',
      label: 'Spending Level',
      type: 'select' as const,
      options: [
        { label: 'All Levels', value: 'all' },
        { label: 'High ($1000+)', value: 'high' },
        { label: 'Medium ($100-$999)', value: 'medium' },
        { label: 'Low (<$100)', value: 'low' }
      ]
    }
  ];

  // Define views
  const views = [
    { key: 'all', label: 'All Customers', badge: customers.length },
    { key: 'active', label: 'Active', badge: customers.filter(c => c.status === 'active').length },
    { key: 'inactive', label: 'Inactive', badge: customers.filter(c => c.status === 'inactive').length },
    { key: 'high-value', label: 'High Value', badge: customers.filter(c => c.totalSpent >= 1000).length }
  ];

  // Define bulk actions
  const bulkActions = [
    { key: 'send-email', label: 'Send Email', icon: Mail },
    { key: 'export', label: 'Export', icon: User },
    { key: 'delete', label: 'Delete', icon: Trash2 }
  ];

  // Render row function
  const renderRow = (customer: Customer) => {
    return (
      <>
        <td className="nuvi-p-3">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-3">
            <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-gray-100 nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
              <User className="h-5 w-5 nuvi-text-gray-600" />
            </div>
            <div>
              <p className="nuvi-font-medium nuvi-text-gray-900">{customer.name}</p>
              {customer.phone && (
                <p className="nuvi-text-sm nuvi-text-gray-500 nuvi-flex nuvi-items-center nuvi-gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="nuvi-p-3">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-1">
            <Mail className="h-4 w-4 nuvi-text-gray-400" />
            <span className="nuvi-text-sm nuvi-text-gray-900">{customer.email}</span>
          </div>
        </td>
        <td className="nuvi-p-3 nuvi-text-center">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-gap-2">
            <span className="nuvi-font-medium nuvi-text-gray-900">{customer.totalOrders}</span>
            {customer.totalOrders > 10 && (
              <Badge variant="secondary" className="nuvi-text-xs nuvi-bg-blue-100 nuvi-text-blue-800">
                VIP
              </Badge>
            )}
          </div>
        </td>
        <td className="nuvi-p-3 nuvi-text-right">
          <div className="nuvi-flex nuvi-flex-col nuvi-items-end">
            <span className="nuvi-font-medium nuvi-text-gray-900">
              {formatPrice(customer.totalSpent)}
            </span>
            {customer.totalSpent >= 1000 && (
              <Badge variant="secondary" className="nuvi-text-xs nuvi-bg-green-100 nuvi-text-green-800 nuvi-mt-1">
                High Value
              </Badge>
            )}
          </div>
        </td>
        <td className="nuvi-p-3">
          <span className="nuvi-text-sm nuvi-text-gray-900">
            {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
          </span>
        </td>
        <td className="nuvi-p-3">
          <span className="nuvi-text-sm nuvi-text-gray-900">
            {formatDate(customer.createdAt)}
          </span>
        </td>
        <td className="nuvi-p-3 nuvi-text-right">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-end nuvi-gap-2">
            <button className="nuvi-text-gray-600 nuvi-hover:text-gray-900 nuvi-p-1">
              <Edit className="h-4 w-4" />
            </button>
            <button className="nuvi-text-red-600 nuvi-hover:text-red-900 nuvi-p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </>
    );
  };

  return (
    <IndexTable
      title="Customers"
      data={sortedCustomers}
      columns={columns}
      filters={filters}
      views={views}
      searchPlaceholder="Search customers..."
      onSearch={handleSearch}
      onFilter={handleFilter}
      onSort={handleSort}
      onBulkAction={handleBulkAction}
      bulkActions={bulkActions}
      primaryAction={{
        label: 'Add Customer',
        icon: Plus,
        onClick: () => console.log('Add customer')
      }}
      renderRow={renderRow}
      selectable={true}
      keyField="id"
    />
  );
}