'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit2, Trash2, Package, 
  Search, ArrowUpDown, Eye,
  ChevronDown, Loader2,
  Grid, List, Folder, FolderOpen, Calendar, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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


export function CategoryManagerV2({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'products' | 'date'>('name');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
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

    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
      setDeletingCategoryId(null);
    }
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          return (b._count?.products || 0) - (a._count?.products || 0);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  return (
    <>
      {/* Header */}
      <div className="nuvi-card nuvi-mb-lg">
        <div className="nuvi-card-content">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-flex-wrap nuvi-gap-md">
            <div>
              <h2 className="nuvi-text-xl nuvi-font-semibold">Categories</h2>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mt-xs">
                Organize your products into categories for better navigation
              </p>
            </div>
            <button
              onClick={() => router.push(`/dashboard/stores/${subdomain}/categories/new`)}
              className="nuvi-btn nuvi-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="nuvi-card nuvi-mb-md">
        <div className="nuvi-card-content">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-flex-wrap nuvi-gap-sm">
            {/* Search */}
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-flex-1 nuvi-max-w-md">
              <div className="nuvi-relative nuvi-flex-1">
                <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-secondary" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="nuvi-input nuvi-pl-10 w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
              {/* Sort */}
              <div className="nuvi-relative">
                <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort by {sortBy}
                  <ChevronDown className="h-3 w-3 nuvi-ml-xs" />
                </button>
              </div>

              {/* View Mode */}
              <div className="nuvi-flex nuvi-bg-gray-100 nuvi-rounded-lg nuvi-p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "nuvi-p-1.5 nuvi-rounded nuvi-transition-colors",
                    viewMode === 'grid' 
                      ? "nuvi-bg-white nuvi-text-primary nuvi-shadow-sm" 
                      : "nuvi-text-secondary hover:nuvi-text-primary"
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "nuvi-p-1.5 nuvi-rounded nuvi-transition-colors",
                    viewMode === 'list' 
                      ? "nuvi-bg-white nuvi-text-primary nuvi-shadow-sm" 
                      : "nuvi-text-secondary hover:nuvi-text-primary"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-py-12">
          <Loader2 className="h-8 w-8 nuvi-animate-spin nuvi-text-primary" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-text-center nuvi-py-12">
            <Folder className="h-12 w-12 nuvi-text-gray-300 nuvi-mx-auto nuvi-mb-md" />
            <h3 className="nuvi-text-lg nuvi-font-medium nuvi-mb-sm">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="nuvi-text-secondary nuvi-mb-md">
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Create your first category to organize products'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push(`/dashboard/stores/${subdomain}/categories/new`)}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Create Category
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-xl:grid-cols-4 nuvi-gap-md">
          {filteredCategories.map((category) => (
            <div key={category.id} className="nuvi-card hover:nuvi-shadow-lg nuvi-transition-shadow">
              <div className="nuvi-card-content">
                {/* Image */}
                <div className="nuvi-bg-gray-100 nuvi-rounded-lg nuvi-h-32 nuvi-mb-md nuvi-flex nuvi-items-center nuvi-justify-center nuvi-overflow-hidden">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="nuvi-w-full nuvi-h-full nuvi-object-cover"
                    />
                  ) : (
                    <FolderOpen className="h-12 w-12 nuvi-text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <h3 className="nuvi-font-medium nuvi-mb-xs">{category.name}</h3>
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-sm">
                  {category._count?.products || 0} products
                </p>

                {/* Actions */}
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <button
                    onClick={() => router.push(`/dashboard/stores/${subdomain}/products?category=${category.id}`)}
                    className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-flex-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/stores/${subdomain}/categories/${category.id}/edit`)}
                    className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {category._count?.products === 0 && (
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="nuvi-card">
          <table className="nuvi-w-full">
            <thead>
              <tr className="nuvi-border-b">
                <th className="nuvi-text-left nuvi-py-sm nuvi-px-md nuvi-text-xs nuvi-font-medium nuvi-text-secondary">
                  CATEGORY
                </th>
                <th className="nuvi-text-left nuvi-py-sm nuvi-px-md nuvi-text-xs nuvi-font-medium nuvi-text-secondary">
                  PRODUCTS
                </th>
                <th className="nuvi-text-left nuvi-py-sm nuvi-px-md nuvi-text-xs nuvi-font-medium nuvi-text-secondary">
                  CREATED
                </th>
                <th className="nuvi-text-right nuvi-py-sm nuvi-px-md nuvi-text-xs nuvi-font-medium nuvi-text-secondary">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="nuvi-border-b hover:nuvi-bg-gray-50">
                  <td className="nuvi-py-md nuvi-px-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center nuvi-overflow-hidden">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="nuvi-w-full nuvi-h-full nuvi-object-cover"
                          />
                        ) : (
                          <Folder className="h-5 w-5 nuvi-text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="nuvi-font-medium">{category.name}</p>
                        <p className="nuvi-text-sm nuvi-text-secondary">/{category.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="nuvi-py-md nuvi-px-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                      <Package className="h-4 w-4 nuvi-text-secondary" />
                      <span>{category._count?.products || 0}</span>
                    </div>
                  </td>
                  <td className="nuvi-py-md nuvi-px-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-text-sm nuvi-text-secondary">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="nuvi-py-md nuvi-px-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                      <button
                        onClick={() => router.push(`/dashboard/stores/${subdomain}/products?category=${category.id}`)}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                      >
                        View Products
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/stores/${subdomain}/categories/${category.id}/edit`)}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {category._count?.products === 0 && (
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </>
  );
}