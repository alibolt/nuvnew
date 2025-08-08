'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NuviTable } from '@/components/ui/nuvi-table';
import { 
  Plus, Eye, Edit, MoreVertical, Trash2, Users, Mail, ShoppingBag,
  UserCheck, UserX, Clock
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  acceptsMarketing: boolean;
  status: 'active' | 'inactive' | 'banned';
  totalSpent: number;
  orderCount: number;
  createdAt: string;
  lastOrderAt: string | null;
  _count?: {
    orders: number;
  };
}

interface CustomerListProps {
  store: any;
}

export function CustomerList({ store }: CustomerListProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${store.subdomain}/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/customers/${customerId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} customers?`)) return;
    
    try {
      await Promise.all(
        selectedItems.map(id => 
          fetch(`/api/stores/${store.subdomain}/customers/${id}`, {
            method: 'DELETE'
          })
        )
      );
      
      setSelectedItems([]);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('Failed to delete customers');
    }
  };

  const handleBulkEmail = () => {
    router.push(`/dashboard/stores/${store.subdomain}/marketing/campaigns/new?customers=${selectedItems.join(',')}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const subscribedCount = customers.filter(c => c.acceptsMarketing).length;

  const tableColumns = [
    {
      key: 'customer',
      label: 'Customer',
      width: '30%',
      render: (customer: Customer) => {
        const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'No name';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#E0F2FE',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#0369A1' }}>
                {fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>{fullName}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{customer.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'orders',
      label: 'Orders',
      width: '15%',
      render: (customer: Customer) => (
        <span style={{ fontWeight: '500' }}>{customer._count?.orders || 0}</span>
      )
    },
    {
      key: 'spent',
      label: 'Total spent',
      width: '15%',
      render: (customer: Customer) => (
        <span style={{ fontWeight: '500' }}>{formatCurrency(customer.totalSpent || 0)}</span>
      )
    },
    {
      key: 'marketing',
      label: 'Marketing',
      width: '15%',
      render: (customer: Customer) => (
        <span className={`nuvi-badge nuvi-badge-sm ${
          customer.acceptsMarketing ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
        }`}>
          {customer.acceptsMarketing ? 'Subscribed' : 'Not subscribed'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (customer: Customer) => (
        <span className={`nuvi-badge nuvi-badge-sm ${
          customer.status === 'active' ? 'nuvi-badge-success' : 
          customer.status === 'banned' ? 'nuvi-badge-destructive' : 'nuvi-badge-secondary'
        }`}>
          {customer.status}
        </span>
      )
    }
  ];

  return (
    <NuviTable
      columns={tableColumns}
      data={customers}
      selectable={true}
      selectedRows={selectedItems}
      onSelectionChange={setSelectedItems}
      
      onView={(customer) => router.push(`/dashboard/stores/${store.subdomain}/customers/${customer.id}`)}
      onEdit={(customer) => router.push(`/dashboard/stores/${store.subdomain}/customers/${customer.id}/edit`)}
      onDelete={(customer) => handleDelete(customer.id)}
      
      bulkActions={[
        {
          label: 'Send email',
          icon: Mail,
          onClick: handleBulkEmail
        },
        {
          label: 'Delete customers',
          icon: Trash2,
          destructive: true,
          onClick: handleBulkDelete
        }
      ]}
      
      searchable={true}
      searchPlaceholder="Search customers..."
      
      totalItems={customers.length}
      itemsPerPage={20}
      currentPage={1}
      
      emptyMessage="No customers yet. Customers will appear here after their first purchase or when you add them manually."
      loading={loading}
    />
  );
}