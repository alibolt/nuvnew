'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FolderTree, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Image as ImageIcon, TrendingUp, Package,
  ChevronLeft, ChevronRight, Trash2, Archive, Eye as EyeIcon, EyeOff
} from 'lucide-react';
import { CategoryFormPanel } from './category-form-panel';

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

interface CategoriesTabContentProps {
  store: StoreData;
}

export function CategoriesTabContent({ store }: CategoriesTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('view') as 'list' | 'create' | 'edit' | null;
  const categoryIdParam = searchParams.get('categoryId');
  const [view, setView] = useState<'list' | 'create' | 'edit'>(viewParam || 'list');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(categoryIdParam);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'categories');
    if (view !== 'list') {
      params.set('view', view);
      if (view === 'edit' && editingCategoryId) {
        params.set('categoryId', editingCategoryId);
      }
    } else {
      params.delete('view');
      params.delete('categoryId');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, editingCategoryId, searchParams]);

  const handleAddCategory = () => {
    setView('create');
  };

  const handleEditCategory = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setEditingCategoryId(null);
    // Clear categoryId from URL
    const params = new URLSearchParams(searchParams);
    params.delete('categoryId');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  };

  const handleSave = () => {
    setView('list');
    setEditingCategoryId(null);
    // Trigger a refresh of the categories list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'list' ? (
        <CategoriesListPanel 
          store={store}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          refreshKey={refreshKey}
        />
      ) : view === 'create' ? (
        <CategoryFormPanel 
          store={store}
          onSave={handleSave}
          onCancel={handleBack}
        />
      ) : (
        <CategoryFormPanel 
          store={store}
          categoryId={editingCategoryId!}
          isEdit
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// Categories List Panel (Products tarzında)
function CategoriesListPanel({ store, onAddCategory, onEditCategory, refreshKey }: {
  store: StoreData;
  onAddCategory: () => void;
  onEditCategory: (id: string) => void;
  refreshKey?: number;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/categories?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          // API might return array directly or {categories: [], pagination: {}}
          if (Array.isArray(data)) {
            setCategories(data);
          } else {
            setCategories(data.categories || []);
            setPagination(data.pagination || null);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [store.id, currentPage, refreshKey]);

  // Filter categories based on search and filters
  const filteredCategories = (categories || []).filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = false;
    if (filterType === 'all') {
      matchesType = true;
    } else if (filterType === 'with-products') {
      matchesType = (category._count?.products || 0) > 0;
    } else {
      matchesType = category.type === filterType;
    }
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && category.isActive) || 
      (filterStatus === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(c => c.id));
    }
  };

  // Handle individual selection
  const handleSelectCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCategories.length} collections?`)) return;
    
    try {
      // Delete categories one by one
      for (const categoryId of selectedCategories) {
        await fetch(`/api/stores/${store.subdomain}/categories/${categoryId}`, {
          method: 'DELETE'
        });
      }
      
      // Refresh and clear selection
      const fetchCategories = async () => {
        const response = await fetch(`/api/stores/${store.subdomain}/categories?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCategories(data);
          } else {
            setCategories(data.categories || []);
          }
        }
      };
      await fetchCategories();
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error deleting categories:', error);
      alert('Failed to delete some collections');
    }
  };

  const handleBulkStatusChange = async (status: boolean) => {
    try {
      // Update categories one by one
      for (const categoryId of selectedCategories) {
        await fetch(`/api/stores/${store.subdomain}/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: status })
        });
      }
      
      // Update local state
      setCategories(prev => prev.map(c => 
        selectedCategories.includes(c.id) ? { ...c, isActive: status } : c
      ));
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error updating categories:', error);
      alert('Failed to update some collections');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
      } else {
        alert('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  return (
    <>
      {/* Categories Header - Minimal */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Collections</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Organize your products into collections</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={onAddCategory}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Collection
          </button>
        </div>
      </div>

      {/* Categories Table - Products tarzında */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {isLoading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading collections...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <FolderTree className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No collections yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Create your first collection to organize products</p>
              <button 
                onClick={onAddCategory}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Collection
              </button>
            </div>
          ) : (
            <div>
              {/* Search and Filter - Products tarzında */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search collections..."
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
                  <option value="all">
                    All Types ({categories.length})
                  </option>
                  <option value="manual">
                    Manual ({categories.filter(c => c.type === 'manual').length})
                  </option>
                  <option value="automatic">
                    Automatic ({categories.filter(c => c.type === 'automatic').length})
                  </option>
                  {categories.filter(c => (c._count?.products || 0) > 0).length > 0 && (
                    <option value="with-products">
                      With Products ({categories.filter(c => (c._count?.products || 0) > 0).length})
                    </option>
                  )}
                </select>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">
                    All Status ({categories.length})
                  </option>
                  <option value="active">
                    Active ({categories.filter(c => c.isActive).length})
                  </option>
                  <option value="inactive">
                    Inactive ({categories.filter(c => !c.isActive).length})
                  </option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedCategories.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedCategories.length} collection{selectedCategories.length > 1 ? 's' : ''} selected
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

              {/* Categories Table */}
              <div style={{ overflow: 'hidden' }}>
                <table className="nuvi-table" style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ fontSize: '12px' }}>
                      <th style={{ width: '40px', padding: '6px 12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox-custom"
                        />
                      </th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Collection</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Products</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                            ? 'No collections found matching your filters' 
                            : 'No collections yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category) => (
                        <tr key={category.id} style={{ fontSize: '13px' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => handleSelectCategory(category.id)}
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
                                {category.image ? (
                                  <img 
                                    src={category.image} 
                                    alt={category.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <FolderTree size={20} color="#9CA3AF" />
                                )}
                              </div>
                              <div>
                                <p className="nuvi-font-medium">{category.name}</p>
                                <p className="nuvi-text-sm nuvi-text-muted">
                                  {category.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <span className={`nuvi-badge ${
                              category.type === 'automatic' ? 'nuvi-badge-primary' : 'nuvi-badge-secondary'
                            }`}>
                              {category.type === 'automatic' ? 'Automatic' : 'Manual'}
                            </span>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <span className="nuvi-text-sm">{category._count?.products || 0} products</span>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <span className={`nuvi-badge ${
                              category.isActive ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
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
                                  window.open(`${baseUrl}/collections/${category.slug}`, '_blank');
                                }}
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={() => onEditCategory(category.id)}
                                className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDelete(category.id)}
                                className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                                title="Delete"
                              >
                                <Trash2 size={14} />
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
              {pagination && pagination.pages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} collections
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