'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Folder, Plus, Search, Download, Edit, MoreVertical, 
  Eye, ChevronLeft, ChevronRight, CheckCircle, Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export function CategoryManagerProductsStyle({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [subdomain]);

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stores/${subdomain}/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted');
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && (category._count?.products || 0) > 0) || 
      (filterStatus === 'empty' && (category._count?.products || 0) === 0);
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => (c._count?.products || 0) > 0).length;
  const emptyCategories = categories.filter(c => (c._count?.products || 0) === 0).length;

  return (
    <>
      {/* Header */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Categories</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Organize your products into categories</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={() => router.push(`/dashboard/stores/${subdomain}/categories/new`)}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Categories</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{totalCategories}</p>
              </div>
              <Folder className="h-6 w-6 nuvi-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">With Products</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{activeCategories}</p>
              </div>
              <CheckCircle className="h-6 w-6 nuvi-text-success" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Empty</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{emptyCategories}</p>
              </div>
              <Clock className="h-6 w-6 nuvi-text-warning" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Products</p>
                <p className="nuvi-text-2xl nuvi-font-bold">
                  {categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0)}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 nuvi-text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {isLoading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <Folder className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No categories yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Create your first category to organize products</p>
              <button 
                onClick={() => router.push(`/dashboard/stores/${subdomain}/categories/new`)}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>
          ) : (
            <div>
              {/* Search and Filter */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '150px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="active">With Products</option>
                  <option value="empty">Empty</option>
                </select>
              </div>

              {/* Categories Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Category</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Products</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Created</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          No categories found matching your filters
                        </td>
                      </tr>
                    ) : (
                      paginatedCategories.map((category) => (
                        <tr key={category.id} className="nuvi-border-b">
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              {category.image && (
                                <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center nuvi-overflow-hidden">
                                  <img 
                                    src={category.image} 
                                    alt={category.name}
                                    className="nuvi-w-full nuvi-h-full nuvi-object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="nuvi-font-medium">{category.name}</p>
                                {category.description && (
                                  <p className="nuvi-text-sm nuvi-text-muted nuvi-line-clamp-1">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <span className={`nuvi-badge ${
                              (category._count?.products || 0) > 0 ? 'nuvi-badge-success' : 'nuvi-badge-default'
                            }`}>
                              {category._count?.products || 0} products
                            </span>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <span className="nuvi-text-sm nuvi-text-muted">
                              {new Date(category.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                              <button 
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                onClick={() => router.push(`/dashboard/stores/${subdomain}/products?category=${category.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => router.push(`/dashboard/stores/${subdomain}/categories/${category.id}/edit`)}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} categories
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
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        
                        if (page > totalPages) return null;
                        
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
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
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