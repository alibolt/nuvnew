'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { IndexTable } from '@/components/ui/index-table';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product, Category, ProductVariant, ProductImage } from '@prisma/client';

type VariantWithImages = ProductVariant & {
  images: ProductImage[];
};

type ProductWithRelations = Product & {
  category: Category | null;
  variants: VariantWithImages[];
};

export function ProductList({ 
  products, 
  storeId 
}: { 
  products: ProductWithRelations[];
  storeId: string;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortedProducts, setSortedProducts] = useState(products);

  // Get unique categories for filters
  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.set(product.category.id, product.category.name);
      }
    });
    return Array.from(uniqueCategories, ([id, name]) => ({ id, name }));
  }, [products]);

  // Filter and search handling
  const handleSearch = (query: string) => {
    const filtered = products.filter(product => {
      if (!query) return true;
      const searchTerm = query.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(searchTerm);
      const matchesSku = product.variants.some(v => v.sku?.toLowerCase().includes(searchTerm));
      const matchesCategory = product.category?.name.toLowerCase().includes(searchTerm);
      return matchesName || matchesSku || matchesCategory;
    });
    setFilteredProducts(filtered);
    setSortedProducts(filtered);
  };

  const handleFilter = (filters: Record<string, any>) => {
    let filtered = products.filter(product => {
      // Category filter
      if (filters.category && filters.category !== 'all' && product.category?.id !== filters.category) {
        return false;
      }

      // Stock filter
      const totalStock = getTotalStock(product.variants);
      if (filters.stock === 'in-stock' && totalStock === 0) return false;
      if (filters.stock === 'out-of-stock' && totalStock > 0) return false;
      if (filters.stock === 'low-stock' && (totalStock === 0 || totalStock > 10)) return false;

      // Status filter
      if (filters.status === 'active' && !product.isActive) return false;
      if (filters.status === 'inactive' && product.isActive) return false;

      return true;
    });
    setFilteredProducts(filtered);
    setSortedProducts(filtered);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (column) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category?.name || '';
          bValue = b.category?.name || '';
          break;
        case 'stock':
          aValue = getTotalStock(a.variants);
          bValue = getTotalStock(b.variants);
          break;
        case 'price':
          aValue = Math.min(...a.variants.map(v => v.price));
          bValue = Math.min(...b.variants.map(v => v.price));
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedProducts(sorted);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeletingId(productId);
    try {
      const response = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
        return;
      }
      // Implement bulk delete
      console.log('Bulk deleting:', selectedIds);
    } else if (action === 'activate') {
      // Implement bulk activate
      console.log('Bulk activating:', selectedIds);
    } else if (action === 'deactivate') {
      // Implement bulk deactivate
      console.log('Bulk deactivating:', selectedIds);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getProductImage = (product: ProductWithRelations) => {
    const firstVariant = product.variants?.[0];
    return firstVariant?.images?.[0]?.url;
  };

  const getPriceRange = (variants: VariantWithImages[]) => {
    if (!variants || variants.length === 0) return 'No price';
    
    const prices = variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  const getTotalStock = (variants: VariantWithImages[]) => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  // Define table columns
  const columns = [
    { key: 'image', label: '', width: '80px' },
    { key: 'name', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true, align: 'center' as const },
    { key: 'price', label: 'Price', sortable: true, align: 'right' as const },
    { key: 'status', label: 'Status', sortable: true, align: 'center' as const },
    { key: 'actions', label: 'Actions', width: '120px', align: 'right' as const },
  ];

  // Define filters
  const filters = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { label: 'All Categories', value: 'all' },
        { label: 'No Category', value: 'no-category' },
        ...categories.map(cat => ({ label: cat.name, value: cat.id }))
      ]
    },
    {
      key: 'stock',
      label: 'Stock Level',
      type: 'select' as const,
      options: [
        { label: 'All Stock Levels', value: 'all' },
        { label: 'In Stock', value: 'in-stock' },
        { label: 'Low Stock (≤10)', value: 'low-stock' },
        { label: 'Out of Stock', value: 'out-of-stock' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    }
  ];

  // Define views
  const views = [
    { key: 'all', label: 'All Products', badge: products.length },
    { key: 'active', label: 'Active', badge: products.filter(p => p.isActive).length },
    { key: 'inactive', label: 'Inactive', badge: products.filter(p => !p.isActive).length },
    { key: 'low-stock', label: 'Low Stock', badge: products.filter(p => getTotalStock(p.variants) <= 10 && getTotalStock(p.variants) > 0).length }
  ];

  // Define bulk actions
  const bulkActions = [
    { key: 'activate', label: 'Activate', icon: Package },
    { key: 'deactivate', label: 'Deactivate', icon: Package },
    { key: 'delete', label: 'Delete', icon: Trash2 }
  ];

  // Render row function
  const renderRow = (product: ProductWithRelations) => {
    const image = getProductImage(product);
    const totalStock = getTotalStock(product.variants);
    const priceRange = getPriceRange(product.variants);
    
    return (
      <>
        <td className="nuvi-p-3">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-12 w-12 object-cover rounded-md"
            />
          ) : (
            <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </td>
        <td className="nuvi-p-3">
          <div>
            <p className="nuvi-font-medium nuvi-text-gray-900">{product.name}</p>
            <p className="nuvi-text-sm nuvi-text-gray-500">
              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </td>
        <td className="nuvi-p-3">
          <span className="nuvi-text-sm nuvi-text-gray-900">
            {product.category?.name || 'No category'}
          </span>
        </td>
        <td className="nuvi-p-3 nuvi-text-center">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-gap-2">
            <span className="nuvi-text-sm nuvi-text-gray-900">{totalStock}</span>
            {totalStock <= 10 && totalStock > 0 && (
              <Badge variant="secondary" className="nuvi-text-xs nuvi-bg-orange-100 nuvi-text-orange-800">
                Low
              </Badge>
            )}
            {totalStock === 0 && (
              <Badge variant="secondary" className="nuvi-text-xs nuvi-bg-red-100 nuvi-text-red-800">
                Out
              </Badge>
            )}
          </div>
        </td>
        <td className="nuvi-p-3 nuvi-text-right">
          <span className="nuvi-text-sm nuvi-font-medium nuvi-text-gray-900">
            {priceRange}
          </span>
        </td>
        <td className="nuvi-p-3 nuvi-text-center">
          <Badge 
            variant={product.isActive ? "default" : "secondary"}
            className={product.isActive 
              ? "nuvi-bg-green-100 nuvi-text-green-800" 
              : "nuvi-bg-gray-100 nuvi-text-gray-800"
            }
          >
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </td>
        <td className="nuvi-p-3 nuvi-text-right">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-end nuvi-gap-2">
            <Link
              href={`/dashboard/stores/${storeId}/products/${product.id}/edit`}
              className="nuvi-text-gray-600 nuvi-hover:text-gray-900 nuvi-p-1"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDelete(product.id)}
              disabled={deletingId === product.id}
              className="nuvi-text-red-600 nuvi-hover:text-red-900 nuvi-disabled:opacity-50 nuvi-p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </>
    );
  };

  return (
    <IndexTable
      title="Products"
      data={sortedProducts}
      columns={columns}
      filters={filters}
      views={views}
      searchPlaceholder="Search products, SKUs, categories..."
      onSearch={handleSearch}
      onFilter={handleFilter}
      onSort={handleSort}
      onBulkAction={handleBulkAction}
      bulkActions={bulkActions}
      primaryAction={{
        label: 'Add Product',
        icon: Plus,
        onClick: () => window.location.href = `/dashboard/stores/${storeId}/products/new`
      }}
      renderRow={renderRow}
      selectable={true}
      keyField="id"
    />
  );
}