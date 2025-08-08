'use client';

import { useState } from 'react';
import { EntityFormWrapper } from '@/components/dashboard/forms/EntityFormWrapper';
import { 
  ArrowLeft, FolderTree, Type, Image, FileText, 
  Layout, Hash, Settings, Plus, X, Database
} from 'lucide-react';
import { CollectionType, CollectionSortOrder, CollectionConditionGroup } from '@/types/collection';
import { ConditionBuilder } from './components/condition-builder';
import { ProductSelectionModal } from './components/product-selection-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryMetafields } from './category-metafields';

interface CategoryFormV2Props {
  subdomain: string;
  category?: any;
  metafields?: any[];
  metafieldDefinitions?: any[];
}

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
  slug: string;
  templateId: string | null;
  type: CollectionType;
  sortOrder: CollectionSortOrder;
  conditions?: CollectionConditionGroup[];
  productIds?: string[];
}

export function CategoryFormV2({ subdomain, category, metafields, metafieldDefinitions }: CategoryFormV2Props) {
  const isEditing = !!category;
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEditing);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    category?.products?.map((p: any) => p.id) || []
  );
  const [selectedProductsInfo, setSelectedProductsInfo] = useState<any[]>(
    category?.products || []
  );

  const initialData: CategoryFormData = {
    name: category?.name || '',
    description: category?.description || '',
    image: category?.image || '',
    slug: category?.slug || '',
    templateId: category?.templateId || null,
    type: category?.type || 'manual',
    sortOrder: category?.sortOrder || 'manual',
    conditions: category?.conditions?.groups || [],
    productIds: selectedProductIds
  };

  const transformData = (data: CategoryFormData) => {
    return {
      ...data,
      productIds: data.type === 'manual' ? selectedProductIds : undefined
    };
  };

  const validateForm = (data: CategoryFormData): string | null => {
    if (!data.name.trim()) {
      return 'Category name is required';
    }

    if (!data.slug.trim()) {
      return 'URL slug is required';
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    return null;
  };

  return (
    <EntityFormWrapper
      mode={isEditing ? 'edit' : 'create'}
      entityId={category?.id}
      initialData={initialData}
      apiEndpoint={`/api/stores/${subdomain}/categories`}
      onDataChange={transformData}
      redirectPath={`/dashboard/stores/${subdomain}/categories`}
    >
      {({ formData, handleChange, loading, saving, error, handleSubmit }) => {
        // Auto-generate slug from name if enabled
        const handleNameChange = (value: string) => {
          handleChange('name', value);
          
          if (autoGenerateSlug) {
            const slug = value.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            handleChange('slug', slug);
          }
        };

        const formError = error || validateForm(formData);

        return (
          <form onSubmit={handleSubmit} className="nuvi-animate-slide-up">
            {/* Header */}
            <div className="nuvi-page-header">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="nuvi-page-title">
                    {isEditing ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="nuvi-page-description">
                    {isEditing ? 'Update category information' : 'Create a new product category'}
                  </p>
                </div>
              </div>
              <div className="nuvi-flex nuvi-gap-md">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                  disabled={saving || !!formError}
                >
                  {saving ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </div>

            {/* Form Content */}
            <Tabs defaultValue="general" className="nuvi-space-y-lg">
              <TabsList className="nuvi-mb-lg">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="custom">Custom Fields</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
                  {/* Main Information */}
                  <div className="nuvi-lg:col-span-2">
                  <div className="nuvi-card">
                    <div className="nuvi-card-header">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <FolderTree className="h-5 w-5" />
                        <h3 className="nuvi-card-title">Category Information</h3>
                      </div>
                    </div>
                    <div className="nuvi-card-content nuvi-space-y-md">
                      {/* Name */}
                      <div className="nuvi-form-group">
                        <label className="nuvi-label nuvi-required">
                          <Type className="h-4 w-4" />
                          Category Name
                        </label>
                        <input
                          type="text"
                          className="nuvi-input"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="e.g., Electronics, Clothing, Books"
                          required
                        />
                      </div>

                      {/* Slug */}
                      <div className="nuvi-form-group">
                        <label className="nuvi-label nuvi-required">
                          <Hash className="h-4 w-4" />
                          URL Slug
                        </label>
                        <div className="nuvi-space-y-sm">
                          <input
                            type="text"
                            className="nuvi-input"
                            value={formData.slug}
                            onChange={(e) => {
                              setAutoGenerateSlug(false);
                              handleChange('slug', e.target.value);
                            }}
                            placeholder="e.g., electronics, clothing, books"
                            required
                          />
                          {!isEditing && (
                            <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-text-sm">
                              <input
                                type="checkbox"
                                className="nuvi-checkbox"
                                checked={autoGenerateSlug}
                                onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                              />
                              Auto-generate from name
                            </label>
                          )}
                        </div>
                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                          This will be used in the URL: /categories/{formData.slug || 'slug'}
                        </p>
                      </div>

                      {/* Description */}
                      <div className="nuvi-form-group">
                        <label className="nuvi-label">
                          <FileText className="h-4 w-4" />
                          Description
                        </label>
                        <textarea
                          className="nuvi-input"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          placeholder="Describe what products belong in this category..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Collection Type */}
                  <div className="nuvi-card nuvi-mt-lg">
                    <div className="nuvi-card-header">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <Settings className="h-5 w-5" />
                        <h3 className="nuvi-card-title">Collection Type</h3>
                      </div>
                    </div>
                    <div className="nuvi-card-content nuvi-space-y-md">
                      <div className="nuvi-form-group">
                        <label className="nuvi-label">Collection Type</label>
                        <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                          <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-cursor-pointer nuvi-hover:bg-gray-50 nuvi-transition">
                            <input
                              type="radio"
                              className="nuvi-radio"
                              value="manual"
                              checked={formData.type === 'manual'}
                              onChange={(e) => handleChange('type', e.target.value)}
                            />
                            <div>
                              <div className="nuvi-font-medium">Manual</div>
                              <div className="nuvi-text-sm nuvi-text-muted">Add products individually</div>
                            </div>
                          </label>
                          <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-cursor-pointer nuvi-hover:bg-gray-50 nuvi-transition">
                            <input
                              type="radio"
                              className="nuvi-radio"
                              value="automatic"
                              checked={formData.type === 'automatic'}
                              onChange={(e) => handleChange('type', e.target.value)}
                            />
                            <div>
                              <div className="nuvi-font-medium">Automatic</div>
                              <div className="nuvi-text-sm nuvi-text-muted">Products match conditions</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Sort Order */}
                      <div className="nuvi-form-group">
                        <label className="nuvi-label">Sort Order</label>
                        <select
                          className="nuvi-input"
                          value={formData.sortOrder}
                          onChange={(e) => handleChange('sortOrder', e.target.value)}
                        >
                          <option value="manual">Manual</option>
                          <option value="best-selling">Best Selling</option>
                          <option value="title-asc">Alphabetically, A-Z</option>
                          <option value="title-desc">Alphabetically, Z-A</option>
                          <option value="price-asc">Price, low to high</option>
                          <option value="price-desc">Price, high to low</option>
                          <option value="created-desc">Date, new to old</option>
                          <option value="created-asc">Date, old to new</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Automatic Collection Conditions */}
                  {formData.type === 'automatic' && (
                    <div className="nuvi-card nuvi-mt-lg">
                      <div className="nuvi-card-header">
                        <h3 className="nuvi-card-title">Conditions</h3>
                        <p className="nuvi-text-sm nuvi-text-muted">Products must match these conditions to be included</p>
                      </div>
                      <div className="nuvi-card-content">
                        <ConditionBuilder
                          conditions={formData.conditions || []}
                          onChange={(conditions) => handleChange('conditions', conditions)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Manual Collection Products */}
                  {formData.type === 'manual' && (
                    <div className="nuvi-card nuvi-mt-lg">
                      <div className="nuvi-card-header">
                        <h3 className="nuvi-card-title">Products</h3>
                        <p className="nuvi-text-sm nuvi-text-muted">Select products to include in this collection</p>
                      </div>
                      <div className="nuvi-card-content">
                        <button
                          type="button"
                          onClick={() => setShowProductModal(true)}
                          className="nuvi-btn nuvi-btn-secondary nuvi-w-full"
                        >
                          <Plus className="h-4 w-4" />
                          Select Products ({selectedProductIds.length} selected)
                        </button>
                        
                        {selectedProductsInfo.length > 0 && (
                          <div className="nuvi-mt-md nuvi-space-y-sm">
                            <p className="nuvi-text-sm nuvi-font-medium">Selected Products:</p>
                            <div className="nuvi-max-h-48 nuvi-overflow-y-auto nuvi-space-y-xs">
                              {selectedProductsInfo.map((product) => (
                                <div key={product.id} className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-sm nuvi-bg-muted nuvi-rounded">
                                  <span className="nuvi-text-sm nuvi-flex-1">{product.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newIds = selectedProductIds.filter(id => id !== product.id);
                                      setSelectedProductIds(newIds);
                                      setSelectedProductsInfo(selectedProductsInfo.filter(p => p.id !== product.id));
                                      handleChange('productIds', newIds);
                                    }}
                                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="nuvi-space-y-lg">
                  {/* Category Image */}
                  <div className="nuvi-card">
                    <div className="nuvi-card-header">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <Image className="h-5 w-5" />
                        <h3 className="nuvi-card-title">Category Image</h3>
                      </div>
                    </div>
                    <div className="nuvi-card-content nuvi-space-y-md">
                      {formData.image ? (
                        <div className="nuvi-relative nuvi-group nuvi-rounded-lg nuvi-overflow-hidden">
                          <img
                            src={formData.image}
                            alt="Category"
                            className="nuvi-w-full nuvi-h-48 nuvi-object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleChange('image', '')}
                            className="nuvi-absolute nuvi-top-sm nuvi-right-sm nuvi-btn nuvi-btn-sm nuvi-btn-error nuvi-opacity-0 nuvi-group-hover:opacity-100 nuvi-transition"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="nuvi-border-2 nuvi-border-dashed nuvi-rounded-lg nuvi-p-lg nuvi-text-center">
                          <Image className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                          <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                            No image uploaded
                          </p>
                          <input
                            type="text"
                            className="nuvi-input nuvi-text-sm"
                            value={formData.image}
                            onChange={(e) => handleChange('image', e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </div>
                      )}
                      <p className="nuvi-text-xs nuvi-text-muted">
                        Recommended size: 800x800px
                      </p>
                    </div>
                  </div>

                  {/* Template Settings */}
                  <div className="nuvi-card">
                    <div className="nuvi-card-header">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <Layout className="h-5 w-5" />
                        <h3 className="nuvi-card-title">Template Settings</h3>
                      </div>
                    </div>
                    <div className="nuvi-card-content">
                      <div className="nuvi-form-group">
                        <label className="nuvi-label">Category Template</label>
                        <select
                          className="nuvi-select"
                          value={formData.templateId || ''}
                          onChange={(e) => handleChange('templateId', e.target.value || null)}
                        >
                          <option value="">Use default template</option>
                          <option value="grid">Grid Layout</option>
                          <option value="list">List Layout</option>
                          <option value="featured">Featured Products</option>
                        </select>
                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                          Choose how products in this category will be displayed
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category Stats (for editing) */}
                  {isEditing && category && (
                    <div className="nuvi-card">
                      <div className="nuvi-card-header">
                        <h3 className="nuvi-card-title">Category Stats</h3>
                      </div>
                      <div className="nuvi-card-content">
                        <div className="nuvi-space-y-sm">
                          <div className="nuvi-flex nuvi-justify-between">
                            <span className="nuvi-text-sm nuvi-text-muted">Products</span>
                            <span className="nuvi-text-sm nuvi-font-medium">
                              {category._count?.products || 0}
                            </span>
                          </div>
                          <div className="nuvi-flex nuvi-justify-between">
                            <span className="nuvi-text-sm nuvi-text-muted">Created</span>
                            <span className="nuvi-text-sm nuvi-font-medium">
                              {new Date(category.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="nuvi-flex nuvi-justify-between">
                            <span className="nuvi-text-sm nuvi-text-muted">Last Updated</span>
                            <span className="nuvi-text-sm nuvi-font-medium">
                              {new Date(category.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </TabsContent>
              
              <TabsContent value="custom">
                {category && (
                  <CategoryMetafields
                    subdomain={subdomain}
                    categoryId={category.id}
                    metafields={metafields}
                    metafieldDefinitions={metafieldDefinitions}
                  />
                )}
                {!category && (
                  <div className="nuvi-card">
                    <div className="nuvi-card-content nuvi-text-center nuvi-py-lg">
                      <Database className="h-12 w-12 nuvi-mx-auto nuvi-mb-md nuvi-text-muted" />
                      <p className="nuvi-text-muted">Custom fields will be available after creating the category</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Product Selection Modal */}
            <ProductSelectionModal
              subdomain={subdomain}
              isOpen={showProductModal}
              onClose={() => setShowProductModal(false)}
              selectedProductIds={selectedProductIds}
              onSelectionChange={(productIds, products) => {
                setSelectedProductIds(productIds);
                if (products) {
                  setSelectedProductsInfo(products);
                }
                handleChange('productIds', productIds);
              }}
            />
          </form>
        );
      }}
    </EntityFormWrapper>
  );
}