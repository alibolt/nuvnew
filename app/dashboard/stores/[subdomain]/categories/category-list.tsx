'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NuviTable } from '@/components/ui/nuvi-table';
import { 
  Plus, Eye, Edit, MoreVertical, Trash2, FolderTree, Package
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  slug: string;
  type: 'manual' | 'automatic';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    products: number;
  };
}

interface CategoryListProps {
  store: any;
}

export function CategoryList({ store }: CategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${store.subdomain}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/stores/${store.subdomain}/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Category deleted successfully');
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('An error occurred');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} categories?`)) return;

    try {
      for (const id of ids) {
        await handleDelete(id);
      }
      setSelectedItems([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Some categories could not be deleted');
    }
  };

  const tableColumns = [
    {
      key: 'category',
      label: 'CATEGORY',
      width: '35%',
      render: (category: Category) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {category.image ? (
            <img 
              src={category.image} 
              alt={category.name}
              style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#F3F4F6', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderTree size={20} color="#9CA3AF" />
            </div>
          )}
          <div>
            <div style={{ fontWeight: '500', fontSize: '13px' }}>{category.name}</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              {category.description || 'No description'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'TYPE',
      width: '15%',
      render: (category: Category) => (
        <span className={`nuvi-badge nuvi-badge-sm ${
          category.type === 'automatic' ? 'nuvi-badge-primary' : 'nuvi-badge-secondary'
        }`}>
          {category.type === 'automatic' ? 'Automatic' : 'Manual'}
        </span>
      )
    },
    {
      key: 'products',
      label: 'PRODUCTS',
      width: '15%',
      render: (category: Category) => (
        <div>
          <span style={{ fontWeight: '500' }}>{category._count?.products || 0}</span>
          <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '4px' }}>items</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '15%',
      render: (category: Category) => (
        <span className={`nuvi-badge nuvi-badge-sm ${
          category.isActive ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
        }`}>
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Categories</h1>
          <button
            onClick={() => router.push(`/dashboard/stores/${store.subdomain}/categories/new`)}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <NuviTable
        columns={tableColumns}
        data={categories}
        selectable={true}
        selectedRows={selectedItems}
        onSelectionChange={setSelectedItems}
        
        onView={(category) => window.open(`/s/${store.subdomain}/collections/${category.slug}`, '_blank')}
        onEdit={(category) => router.push(`/dashboard/stores/${store.subdomain}/categories/${category.id}/edit`)}
        onDelete={(category) => handleDelete(category.id)}
        
        bulkActions={[
          {
            label: 'Delete',
            icon: Trash2,
            destructive: true,
            onClick: handleBulkDelete,
          },
        ]}
        
        searchable={true}
        searchPlaceholder="Search categories..."
        
        totalItems={categories.length}
        itemsPerPage={20}
        currentPage={1}
        
        loading={loading}
        emptyMessage="No categories found. Create your first category to organize products."
      />
    </div>
  );
}