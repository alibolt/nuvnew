'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Package, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Image as ImageIcon, TrendingUp, DollarSign,
  ChevronLeft, ChevronRight, Trash2, Archive, Eye as EyeIcon, EyeOff
} from 'lucide-react';
import { ProductFormPanel } from './product-form-panel';

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

interface ProductsTabContentProps {
  store: StoreData;
}

export function ProductsTabContent({ store }: ProductsTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('view') as 'list' | 'create' | 'edit' | null;
  const [view, setView] = useState<'list' | 'create' | 'edit'>(viewParam || 'list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'products');
    if (view !== 'list') {
      params.set('view', view);
    } else {
      params.delete('view');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, searchParams]);

  const handleAddProduct = () => {
    setView('create');
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setEditingProductId(null);
  };

  const handleSave = () => {
    setView('list');
    setEditingProductId(null);
    // Trigger a refresh of the products list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'list' ? (
        <ProductsListPanel 
          store={store}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          refreshKey={refreshKey}
        />
      ) : view === 'create' ? (
        <ProductFormPanel 
          store={store}
          onSave={handleSave}
          onCancel={handleBack}
        />
      ) : (
        <ProductFormPanel 
          store={store}
          productId={editingProductId!}
          isEdit
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// Products List Panel (Customer/Orders tarzında)
function ProductsListPanel({ store, onAddProduct, onEditProduct, refreshKey }: {
  store: StoreData;
  onAddProduct: () => void;
  onEditProduct: (id: string) => void;
  refreshKey?: number;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/products?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          // API returns { products: [], pagination: {} }
          setProducts(data.products || []);
          setPagination(data.pagination || null);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [store.id, currentPage, refreshKey]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [store.subdomain]);

  // Filter products based on search and filters
  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && product.isActive) || 
      (filterStatus === 'draft' && !product.isActive) ||
      (filterStatus === 'low-stock' && product.variants?.some((v: any) => v.inventory > 0 && v.inventory < 10));
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Handle individual selection
  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
    
    try {
      // Delete products one by one
      for (const productId of selectedProducts) {
        await fetch(`/api/stores/${store.subdomain}/products/${productId}`, {
          method: 'DELETE'
        });
      }
      
      // Refresh and clear selection
      const fetchProducts = async () => {
        const response = await fetch(`/api/stores/${store.subdomain}/products?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      };
      await fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Failed to delete some products');
    }
  };

  const handleBulkStatusChange = async (status: boolean) => {
    try {
      // Update products one by one
      for (const productId of selectedProducts) {
        await fetch(`/api/stores/${store.subdomain}/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: status })
        });
      }
      
      // Update local state
      setProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) ? { ...p, isActive: status } : p
      ));
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error updating products:', error);
      alert('Failed to update some products');
    }
  };

  return (
    <>
      {/* Products Header - Minimal */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Products</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage your product catalog</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={onAddProduct}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table - Orders tarzında */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {isLoading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <Package className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No products yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Add your first product to get started</p>
              <button 
                onClick={onAddProduct}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          ) : (
            <div>
              {/* Search and Filter - Orders tarzında */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">
                    All Status ({products.length})
                  </option>
                  <option value="active">
                    Active ({products.filter(p => p.isActive).length})
                  </option>
                  <option value="draft">
                    Draft ({products.filter(p => !p.isActive).length})
                  </option>
                  {products.filter(p => p.variants?.some((v: any) => v.inventory > 0 && v.inventory < 10)).length > 0 && (
                    <option value="low-stock">
                      Low Stock ({products.filter(p => p.variants?.some((v: any) => v.inventory > 0 && v.inventory < 10)).length})
                    </option>
                  )}
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedProducts.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => handleBulkStatusChange(true)}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange(false)}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <EyeOff className="h-4 w-4" />
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

              {/* Products Table */}
              <div style={{ overflow: 'hidden' }}>
                <table className="nuvi-table" style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ fontSize: '12px' }}>
                      <th style={{ width: '40px', padding: '6px 12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox-custom"
                        />
                      </th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Product</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Category</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Stock</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Price</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                            ? 'No products found matching your filters' 
                            : 'No products yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const firstVariant = product.variants?.[0];
                        const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.inventory || 0), 0) || 0;
                        const isLowStock = totalStock > 0 && totalStock < 10;
                        
                        return (
                          <tr key={product.id} className="nuvi-border-b">
                            <td className="nuvi-py-md nuvi-px-md">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleSelectProduct(product.id)}
                                className="nuvi-checkbox-custom"
                              />
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  minWidth: '40px',
                                  backgroundColor: '#F3F4F6', 
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  flexShrink: 0
                                }}>
                                  {(() => {
                                    // Try to get image from product.images (handles imported products)
                                    if (product.images) {
                                      try {
                                        let images: any[] = [];
                                        if (typeof product.images === 'string') {
                                          images = JSON.parse(product.images);
                                        } else if (Array.isArray(product.images)) {
                                          images = product.images;
                                        }
                                        
                                        if (images.length > 0) {
                                          const firstImage = images[0];
                                          const imageUrl = typeof firstImage === 'string' 
                                            ? firstImage 
                                            : (firstImage?.url || null);
                                          
                                          if (imageUrl) {
                                            return (
                                              <img 
                                                src={imageUrl} 
                                                alt={product.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                              />
                                            );
                                          }
                                        }
                                      } catch (error) {
                                        console.error('Error parsing product images:', error);
                                      }
                                    }
                                    
                                    // Fall back to variant images
                                    if (product.variants?.[0]?.images?.[0]?.url) {
                                      return (
                                        <img 
                                          src={product.variants[0].images[0].url} 
                                          alt={product.title}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      );
                                    }
                                    
                                    // No image found
                                    return <Package size={20} color="#9CA3AF" />;
                                  })()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '500' }}>{product.title}</div>
                                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                                    SKU: {product.sku || firstVariant?.sku || `PRD-${product.id.slice(0, 6).toUpperCase()}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span className="nuvi-badge nuvi-badge-sm nuvi-badge-secondary">
                                {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {product.productType === 'digital' ? (
                                <span style={{ fontSize: '13px', color: '#6B7280' }}>Digital</span>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontWeight: '500', color: isLowStock ? '#DC2626' : undefined }}>
                                    {totalStock}
                                  </span>
                                  <span style={{ fontSize: '11px', color: isLowStock ? '#DC2626' : '#6B7280' }}>
                                    {isLowStock ? 'low stock' : 'in stock'}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: '500' }}>
                              ${firstVariant?.price?.toFixed(2) || '0.00'}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span className={`nuvi-badge nuvi-badge-sm ${
                                product.isActive ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
                              }`}>
                                {product.isActive ? 'Active' : 'Draft'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                <button 
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                                  title="View"
                                  onClick={() => {
                                    // For local development
                                    const baseUrl = process.env.NODE_ENV === 'development' 
                                      ? `http://localhost:3000/s/${store.subdomain}`
                                      : store.customDomain 
                                        ? `https://${store.customDomain}`
                                        : `https://${store.subdomain}.usenuvi.com`;
                                    window.open(`${baseUrl}/products/${product.slug}`, '_blank');
                                  }}
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => onEditProduct(product.id)}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" title="Delete">
                                  <Trash2 size={14} />
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
                    Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} products
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