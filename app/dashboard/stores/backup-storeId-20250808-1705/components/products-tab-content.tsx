'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Package, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Image as ImageIcon, TrendingUp, DollarSign,
  ChevronLeft, ChevronRight
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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.id}/products?page=${currentPage}&limit=50`);
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

  // Filter products based on search and filters
  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || (product.category?.id === filterCategory);
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && product.isActive) || 
      (filterStatus === 'draft' && !product.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });
  return (
    <>
      {/* Products Header - Customer/Orders tarzında */}
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

      {/* Product Stats - Orders tarzında */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Products</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{pagination?.total || products.length}</p>
              </div>
              <Package className="h-6 w-6 nuvi-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Active</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{products.filter(p => p.isActive).length}</p>
              </div>
              <CheckCircle className="h-6 w-6 nuvi-text-success" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Draft</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{products.filter(p => !p.isActive).length}</p>
              </div>
              <Clock className="h-6 w-6 nuvi-text-warning" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Low Stock</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{products.filter(p => p.variants?.some((v: any) => v.inventory > 0 && v.inventory < 10)).length}</p>
              </div>
              <AlertCircle className="h-6 w-6 nuvi-text-error" />
            </div>
          </div>
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
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
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
                  style={{ width: '150px' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home-garden">Home & Garden</option>
                </select>
                <select 
                  className="nuvi-input" 
                  style={{ width: '120px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Product</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Inventory</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Type</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
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
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                                  {product.images?.[0] ? (
                                    <img 
                                      src={product.images[0].url} 
                                      alt={product.name}
                                      className="nuvi-w-full nuvi-h-full nuvi-object-cover nuvi-rounded-lg"
                                    />
                                  ) : (
                                    <ImageIcon className="h-5 w-5 nuvi-text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="nuvi-font-medium">{product.title}</p>
                                  <p className="nuvi-text-sm nuvi-text-muted">
                                    ${firstVariant?.price?.toFixed(2) || '0.00'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <span className={`nuvi-badge ${
                                product.isActive ? 'nuvi-badge-success' : 'nuvi-badge-warning'
                              }`}>
                                {product.isActive ? 'Active' : 'Draft'}
                              </span>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              {product.productType === 'digital' ? (
                                <span className="nuvi-text-sm">Digital Product</span>
                              ) : (
                                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                  <span className="nuvi-text-sm">{totalStock} in stock</span>
                                  {isLowStock && <AlertCircle className="h-4 w-4 nuvi-text-warning" />}
                                </div>
                              )}
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <span className="nuvi-text-sm">
                                {product.productType.charAt(0).toUpperCase() + product.productType.slice(1)}
                              </span>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                                <button 
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
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
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => onEditProduct(product.id)}
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost">
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