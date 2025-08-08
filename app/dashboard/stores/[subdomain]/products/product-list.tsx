'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { NuviTable } from '@/components/ui/nuvi-table';
import { Plus, Edit, Trash2, Package, Image, Copy, Eye, EyeOff, Download, Filter, MoreHorizontal } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Product, Category, ProductVariant, ProductImage } from '@prisma/client';

type VariantWithImages = ProductVariant & {
  images: ProductImage[];
};

type ProductWithRelations = Product & {
  category: Category | null;
  variants: VariantWithImages[];
};

export function ProductList({ 
  products: initialProducts, 
  subdomain 
}: { 
  products: ProductWithRelations[];
  subdomain: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [sortValue, setSortValue] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Get unique categories for filters
  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.set(product.category.id, product.category.name);
      }
    });
    return Array.from(uniqueCategories, ([id, name]) => ({ label: name, value: id }));
  }, [products]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchValue) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchTerm);
        const matchesSku = product.variants.some(v => v.sku?.toLowerCase().includes(searchTerm));
        const matchesCategory = product.category?.name.toLowerCase().includes(searchTerm);
        return matchesName || matchesSku || matchesCategory;
      });
    }

    // Category filter
    if (appliedFilters.category) {
      filtered = filtered.filter(product => product.category?.id === appliedFilters.category);
    }

    // Stock filter
    if (appliedFilters.stock) {
      filtered = filtered.filter(product => {
        const totalStock = getTotalStock(product.variants);
        switch (appliedFilters.stock) {
          case 'in-stock':
            return totalStock > 10;
          case 'low-stock':
            return totalStock > 0 && totalStock <= 10;
          case 'out-of-stock':
            return totalStock === 0;
          default:
            return true;
        }
      });
    }

    // Status filter
    if (appliedFilters.status) {
      filtered = filtered.filter(product => {
        if (appliedFilters.status === 'active') return product.isActive;
        if (appliedFilters.status === 'inactive') return !product.isActive;
        return true;
      });
    }

    // Sorting
    if (sortValue) {
      const [column, direction] = sortValue.split('_');
      filtered = [...filtered].sort((a, b) => {
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
          case 'date':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (direction === 'ascending') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [products, searchValue, appliedFilters, sortValue]);

  // View counts for tabs
  const viewCounts = useMemo(() => {
    const active = products.filter(p => p.isActive).length;
    const outOfStock = products.filter(p => getTotalStock(p.variants) === 0).length;
    return { all: products.length, active, outOfStock };
  }, [products]);

  // Helper functions
  function getTotalStock(variants: VariantWithImages[]): number {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  }

  function getProductImage(product: ProductWithRelations): string | null {
    const firstVariant = product.variants[0];
    if (firstVariant && firstVariant.images.length > 0) {
      return firstVariant.images[0].url;
    }
    return null;
  }

  function getProductPriceRange(product: ProductWithRelations): string {
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  }

  function getStockLevel(stock: number): { label: string; color: string } {
    if (stock === 0) return { label: 'Out of stock', color: 'error' };
    if (stock <= 10) return { label: `Low stock (${stock})`, color: 'warning' };
    return { label: `In stock (${stock})`, color: 'success' };
  }

  // Actions
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeletingIds(prev => new Set(prev).add(productId));
    try {
      const response = await fetch(`/api/stores/${subdomain}/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An error occurred');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    try {
      // Delete products one by one
      for (const id of selectedIds) {
        await handleDelete(id);
      }
      setSelectedItems([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Some products could not be deleted');
    }
  };

  const handleBulkStatusChange = async (selectedIds: string[], status: boolean) => {
    try {
      // Update products one by one
      for (const id of selectedIds) {
        const response = await fetch(`/api/stores/${subdomain}/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: status }),
        });

        if (response.ok) {
          setProducts(prev => prev.map(p => 
            p.id === id ? { ...p, isActive: status } : p
          ));
        }
      }
      toast.success(`${selectedIds.length} products updated`);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('Some products could not be updated');
    }
  };

  const handleDuplicate = async (product: ProductWithRelations) => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${product.name} (Copy)`,
          description: product.description,
          categoryId: product.category?.id,
          tags: product.tags,
          isActive: false,
          variants: product.variants.map(v => ({
            name: v.name,
            sku: `${v.sku}-copy`,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: 0,
            weight: v.weight,
            dimensions: v.dimensions,
            barcode: v.barcode,
          })),
        }),
      });

      if (response.ok) {
        const newProduct = await response.json();
        toast.success('Product duplicated successfully');
        // Reload the page to show the new product
        window.location.reload();
      } else {
        toast.error('Failed to duplicate product');
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error('An error occurred');
    }
  };

  // Render functions
  const renderProductRow = (product: ProductWithRelations, index: number) => {
    const image = getProductImage(product);
    const stock = getTotalStock(product.variants);
    const stockLevel = getStockLevel(stock);
    const isDeleting = deletingIds.has(product.id);

    if (viewMode === 'grid') {
      // Grid view card
      return (
        <div className="nuvi-resource-item-card">
          <div className="nuvi-aspect-square nuvi-mb-4 nuvi-relative nuvi-overflow-hidden nuvi-rounded-lg nuvi-bg-muted">
            {image ? (
              <img 
                src={image} 
                alt={product.name}
                className="nuvi-w-full nuvi-h-full nuvi-object-cover"
              />
            ) : (
              <div className="nuvi-w-full nuvi-h-full nuvi-flex nuvi-items-center nuvi-justify-center">
                <Package className="nuvi-h-12 nuvi-w-12 nuvi-text-muted" />
              </div>
            )}
            {!product.isActive && (
              <div className="nuvi-absolute nuvi-top-2 nuvi-right-2">
                <span className="nuvi-badge nuvi-badge-secondary">
                  <EyeOff className="nuvi-h-3 nuvi-w-3" />
                  Inactive
                </span>
              </div>
            )}
          </div>
          
          <h3 className="nuvi-font-medium nuvi-mb-1 nuvi-line-clamp-2">{product.name}</h3>
          
          {product.category && (
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-2">{product.category.name}</p>
          )}
          
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-3">
            <span className="nuvi-font-medium">{getProductPriceRange(product)}</span>
            <span className={`nuvi-badge nuvi-badge-${stockLevel.color}`}>
              {stockLevel.label}
            </span>
          </div>
          
          <div className="nuvi-flex nuvi-gap-2">
            <Link 
              href={`/dashboard/stores/${subdomain}/products/${product.id}/edit`}
              className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-flex-1"
            >
              <Edit className="nuvi-h-4 nuvi-w-4" />
              Edit
            </Link>
            <button
              onClick={() => handleDuplicate(product)}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
              title="Duplicate"
            >
              <Copy className="nuvi-h-4 nuvi-w-4" />
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              disabled={isDeleting}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-error"
              title="Delete"
            >
              <Trash2 className="nuvi-h-4 nuvi-w-4" />
            </button>
          </div>
        </div>
      );
    }

    // List view row
    return (
      <>
        <td className="nuvi-py-2 nuvi-px-3 nuvi-text-sm">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-2">
            <div className="nuvi-h-8 nuvi-w-8 nuvi-rounded nuvi-overflow-hidden nuvi-bg-muted nuvi-flex-shrink-0">
              {image ? (
                <img 
                  src={image} 
                  alt={product.name}
                  className="nuvi-w-full nuvi-h-full nuvi-object-cover"
                />
              ) : (
                <div className="nuvi-w-full nuvi-h-full nuvi-flex nuvi-items-center nuvi-justify-center">
                  <Image className="nuvi-h-4 nuvi-w-4 nuvi-text-muted" />
                </div>
              )}
            </div>
            <div>
              <Link 
                href={`/dashboard/stores/${subdomain}/products/${product.id}/edit`}
                className="nuvi-font-medium nuvi-text-primary hover:nuvi-underline nuvi-text-sm"
              >
                {product.name}
              </Link>
              {product.variants.length > 1 && (
                <p className="nuvi-text-xs nuvi-text-secondary">
                  {product.variants.length} variants
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="nuvi-py-2 nuvi-px-3 nuvi-text-sm">
          {product.category ? (
            <span className="nuvi-badge nuvi-badge-sm nuvi-badge-secondary">
              {product.category.name}
            </span>
          ) : (
            <span className="nuvi-text-secondary">—</span>
          )}
        </td>
        <td className="nuvi-py-2 nuvi-px-3">
          <div className="nuvi-text-sm">
            <span className={`nuvi-font-medium nuvi-text-${stockLevel.color}`}>
              {stock}
            </span>
            <span className="nuvi-text-secondary nuvi-ml-1 nuvi-text-xs">in stock</span>
          </div>
        </td>
        <td className="nuvi-py-2 nuvi-px-3 nuvi-text-sm">
          <span className="nuvi-font-medium">{getProductPriceRange(product)}</span>
        </td>
        <td className="nuvi-py-2 nuvi-px-3">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-1">
            {product.isActive ? (
              <>
                <span className="nuvi-inline-block nuvi-w-1.5 nuvi-h-1.5 nuvi-bg-success nuvi-rounded-full"></span>
                <span className="nuvi-text-xs">Active</span>
              </>
            ) : (
              <>
                <span className="nuvi-inline-block nuvi-w-1.5 nuvi-h-1.5 nuvi-bg-muted nuvi-rounded-full"></span>
                <span className="nuvi-text-xs nuvi-text-secondary">Inactive</span>
              </>
            )}
          </div>
        </td>
        <td className="nuvi-py-2 nuvi-px-3">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-end nuvi-gap-1">
            <Link 
              href={`/dashboard/stores/${subdomain}/products/${product.id}/edit`}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
            >
              <Edit className="nuvi-h-4 nuvi-w-4" />
            </Link>
            <button
              onClick={() => handleDuplicate(product)}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
              title="Duplicate"
            >
              <Copy className="nuvi-h-4 nuvi-w-4" />
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              disabled={isDeleting}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-error"
            >
              <Trash2 className="nuvi-h-4 nuvi-w-4" />
            </button>
          </div>
        </td>
      </>
    );
  };

  const router = useRouter();
  
  const tableColumns = [
    {
      key: 'product',
      label: 'PRODUCT',
      width: '30%',
      render: (product: ProductWithRelations) => {
        const image = getProductImage(product);
        const firstVariant = product.variants[0];
        const sku = firstVariant?.sku || 'N/A';
        const stock = getTotalStock(product.variants);
        
        // Determine background color based on stock
        const bgColor = stock === 0 ? '#FEF3C7' : 
                       stock <= 10 ? '#FEF3C7' : 
                       '#F3F4F6';
        const iconColor = stock === 0 ? '#F59E0B' :
                         stock <= 10 ? '#F59E0B' :
                         '#9CA3AF';
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: image ? 'transparent' : bgColor, 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {image ? (
                <img 
                  src={image} 
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Package size={20} color={iconColor} />
              )}
            </div>
            <div>
              <div style={{ fontWeight: '500', fontSize: '13px' }}>{product.name}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>SKU: {sku}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'category',
      label: 'CATEGORY',
      width: '15%',
      render: (product: ProductWithRelations) => (
        product.category ? (
          <span className="nuvi-badge nuvi-badge-sm nuvi-badge-secondary">
            {product.category.name}
          </span>
        ) : (
          <span style={{ color: '#9CA3AF' }}>—</span>
        )
      )
    },
    {
      key: 'stock',
      label: 'STOCK',
      width: '15%',
      render: (product: ProductWithRelations) => {
        const stock = getTotalStock(product.variants);
        const isLowStock = stock > 0 && stock <= 10;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              fontWeight: '500',
              color: isLowStock ? '#DC2626' : '#111827'
            }}>
              {stock}
            </span>
            <span style={{ 
              fontSize: '11px', 
              color: isLowStock ? '#DC2626' : '#6B7280'
            }}>
              {isLowStock ? 'low stock' : 'in stock'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'price',
      label: 'PRICE',
      width: '15%',
      render: (product: ProductWithRelations) => (
        <span style={{ fontWeight: '500', fontSize: '13px' }}>{getProductPriceRange(product)}</span>
      )
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '10%',
      render: (product: ProductWithRelations) => (
        <span className={`nuvi-badge nuvi-badge-sm ${product.isActive ? 'nuvi-badge-success' : 'nuvi-badge-secondary'}`}>
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <NuviTable
      columns={tableColumns}
      data={filteredProducts}
      selectable={true}
      striped={true}
      selectedRows={selectedItems}
      onSelectionChange={setSelectedItems}
      
      onEdit={(product) => router.push(`/dashboard/stores/${subdomain}/products/${product.id}/edit`)}
      onDelete={(product) => handleDelete(product.id)}
      customActions={(product: ProductWithRelations) => (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          <button 
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" 
            onClick={() => router.push(`/dashboard/stores/${subdomain}/products/${product.id}`)}
            title="View"
          >
            <Eye size={14} />
          </button>
          <button 
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
            onClick={() => router.push(`/dashboard/stores/${subdomain}/products/${product.id}/edit`)}
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button 
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
            onClick={() => handleDelete(product.id)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      
      bulkActions={[
        {
          label: 'Delete',
          icon: Trash2,
          destructive: true,
          onClick: handleBulkDelete,
        },
      ]}
      
      searchable={false}
      
      totalItems={filteredProducts.length}
      itemsPerPage={20}
      currentPage={1}
      
      emptyMessage="No products found. Add your first product to get started."
    />
  );
}