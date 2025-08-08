'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, Package, DollarSign, Tag, BarChart3, Upload, Plus, X, 
  Globe, Wand2, Eye, Ruler, Weight, Info, FileEdit, Palette, Image as ImageIcon,
  Shield, MessageSquare, Calendar, Settings, Bot
} from 'lucide-react';
import { toast } from 'sonner';

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

interface ProductFormPanelProps {
  store: StoreData;
  productId?: string;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  productType: 'physical' | 'digital' | 'service';
  price: string;
  compareAtPrice: string;
  cost: string;
  sku: string;
  barcode: string;
  inventory: string;
  weight: string;
  weightUnit: 'kg' | 'lb' | 'oz' | 'g';
  category: string;
  status: 'draft' | 'active' | 'archived';
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  requiresShipping: boolean;
  tags: string[];
  images: File[];
  existingImages?: string[]; // URLs of existing images
  // SEO fields
  metaTitle: string;
  metaDescription: string;
  slug: string;
  // Variant fields
  hasVariants: boolean;
  variantOptions: Array<{ name: string; values: string[] }>;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  productType: 'physical',
  price: '',
  compareAtPrice: '',
  cost: '',
  sku: '',
  barcode: '',
  inventory: '0',  // Default to '0' instead of empty string
  weight: '',
  weightUnit: 'kg',
  category: '',
  status: 'active',
  trackQuantity: true,
  continueSellingWhenOutOfStock: false,
  requiresShipping: true,
  tags: [],
  images: [],
  existingImages: [],
  metaTitle: '',
  metaDescription: '',
  slug: '',
  hasVariants: false,
  variantOptions: []
};

export function ProductFormPanel({ store, productId, isEdit = false, onSave, onCancel }: ProductFormPanelProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIBanner, setShowAIBanner] = useState(false);
  const aiDataApplied = useRef(false);

  // Refs for smart auto-focus
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);

  // Check for AI generated data on mount
  useEffect(() => {
    if (!isEdit && !aiDataApplied.current) {
      const storedAIData = sessionStorage.getItem('aiProductData');
      if (storedAIData) {
        try {
          const aiData = JSON.parse(storedAIData);
          aiDataApplied.current = true;
          
          // Apply AI data to form
          setFormData(prev => ({
            ...prev,
            name: aiData.name || '',
            description: aiData.description || '',
            price: aiData.price?.toString() || '',
            metaTitle: aiData.name || '',
            metaDescription: aiData.description?.substring(0, 160) || '',
            slug: aiData.name?.toLowerCase().replace(/\s+/g, '-') || '',
            sku: `SKU-${Date.now()}`
          }));
          
          setShowAIBanner(true);
          
          // Clear the data from session storage
          sessionStorage.removeItem('aiProductData');
          
          // Show success toast
          toast.success('AI has pre-filled the product form. Please review and add images before saving.');
        } catch (error) {
          console.error('Failed to parse AI data:', error);
        }
      }
    }
  }, [isEdit]);

  // Load existing product data if editing
  useEffect(() => {
    if (isEdit && productId) {
      setIsLoadingProduct(true);
      fetch(`/api/stores/${store.subdomain}/products/${productId}`)
        .then(async (response) => {
          if (response.ok) {
            const product = await response.json();
            console.log('Loaded product for editing:', product);
            
            // Parse existing images
            let existingImageUrls: string[] = [];
            if (product.images) {
              if (Array.isArray(product.images)) {
                existingImageUrls = product.images.map((img: any) => {
                  if (typeof img === 'string') return img;
                  if (img && img.url) return img.url;
                  return '';
                }).filter(Boolean);
              } else if (typeof product.images === 'string') {
                try {
                  const parsed = JSON.parse(product.images);
                  if (Array.isArray(parsed)) {
                    existingImageUrls = parsed.map((img: any) => {
                      if (typeof img === 'string') return img;
                      if (img && img.url) return img.url;
                      return '';
                    }).filter(Boolean);
                  }
                } catch (e) {
                  console.error('Error parsing images:', e);
                }
              }
            }
            
            // Transform product data to form format
            setFormData({
              name: product.name || '',
              description: product.description || '',
              productType: product.productType || 'physical',
              price: product.variants?.[0]?.price?.toString() || '',
              compareAtPrice: product.variants?.[0]?.compareAtPrice?.toString() || '',
              cost: product.variants?.[0]?.cost?.toString() || '',
              sku: product.variants?.[0]?.sku || '',
              barcode: product.variants?.[0]?.barcode || '',
              inventory: product.variants?.[0]?.stock?.toString() || '0',
              weight: product.variants?.[0]?.weight?.toString() || '',
              weightUnit: product.variants?.[0]?.weightUnit || 'kg',
              category: product.categoryId || '',
              status: product.isActive ? 'active' : 'draft',
              trackQuantity: product.trackQuantity !== false,
              continueSellingWhenOutOfStock: product.variants?.[0]?.continueSellingWhenOutOfStock || false,
              requiresShipping: product.requiresShipping !== false,
              tags: Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags || '[]'),
              images: [], // Start with empty array for file uploads
              existingImages: existingImageUrls,
              metaTitle: product.metaTitle || '',
              metaDescription: product.metaDescription || '',
              slug: product.slug || '',
              hasVariants: (product.variants?.length || 0) > 1,
              variantOptions: [] // Will be populated if has variants
            });
          } else {
            console.error('Failed to load product:', response.status);
          }
        })
        .catch(error => {
          console.error('Error loading product:', error);
        })
        .finally(() => {
          setIsLoadingProduct(false);
        });
    }
  }, [isEdit, productId, store.subdomain]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const nameSlug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
    return `${nameSlug}-${timestamp}-${random}`;
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      handleInputChange('slug', slug);
    }
    
    // Auto-populate meta title from name
    if (formData.name && !formData.metaTitle) {
      handleInputChange('metaTitle', formData.name);
    }
  }, [formData.name, formData.slug, formData.metaTitle]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const url = isEdit 
        ? `/api/stores/${store.subdomain}/products/${productId}`
        : `/api/stores/${store.subdomain}/products`;
      
      const method = isEdit ? 'PUT' : 'POST';

      // Prepare the product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        productType: formData.productType,
        categoryId: formData.category || null,
        tags: formData.tags,
        variants: [{
          name: 'Default',
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          sku: formData.sku.trim() || null,
          barcode: formData.barcode.trim() || null,
          stock: formData.inventory && formData.inventory !== '' ? parseInt(formData.inventory, 10) : 0,
          trackQuantity: formData.trackQuantity,
          continueSellingWhenOutOfStock: formData.continueSellingWhenOutOfStock,
          requiresShipping: formData.requiresShipping,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          weightUnit: formData.weightUnit,
          options: {},
          images: []
        }],
        metaTitle: formData.metaTitle.trim() || formData.name.trim(),
        metaDescription: formData.metaDescription.trim() || formData.description.trim().substring(0, 160),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        isActive: formData.status === 'active'
      };

      // Debug logging
      console.log('Submitting product data:', productData);
      console.log('Variant details:', {
        price: productData.variants[0].price,
        priceType: typeof productData.variants[0].price,
        stock: productData.variants[0].stock,
        stockType: typeof productData.variants[0].stock,
        isValidPrice: !isNaN(productData.variants[0].price),
        isValidStock: !isNaN(productData.variants[0].stock)
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific error types
        if (data.error?.includes('Unique constraint failed') && data.error?.includes('sku')) {
          throw new Error('This SKU is already in use. Please use a different SKU or leave it blank to auto-generate.');
        }
        
        // If we have detailed validation errors, format them nicely
        if (data.details) {
          console.error('Validation errors:', data.details);
          let errorMessage = 'Validation errors:\n';
          
          // Handle variant-specific errors
          if (data.details.variants) {
            Object.entries(data.details.variants).forEach(([index, variantErrors]: [string, any]) => {
              Object.entries(variantErrors).forEach(([field, fieldError]: [string, any]) => {
                if (fieldError._errors) {
                  errorMessage += `- Variant ${field}: ${fieldError._errors.join(', ')}\n`;
                }
              });
            });
          }
          
          // Handle top-level field errors
          Object.entries(data.details).forEach(([field, fieldError]: [string, any]) => {
            if (field !== 'variants' && fieldError._errors) {
              errorMessage += `- ${field}: ${fieldError._errors.join(', ')}\n`;
            }
          });
          
          throw new Error(errorMessage);
        }
        throw new Error(data.error || 'Failed to save product');
      }

      // Success
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nuvi-animate-slide-up">
      {/* AI Banner */}
      {showAIBanner && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">AI-Generated Content</h3>
                <p className="text-sm text-purple-700">
                  This product was pre-filled with AI. Please review the content and add product images.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAIBanner(false)}
              className="text-purple-600 hover:text-purple-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header - Customer Form Tarzında */}
      <div className="nuvi-page-header">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-page-title">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="nuvi-page-description">
              {isEdit 
                ? 'Update product information' 
                : showAIBanner 
                  ? 'AI has pre-filled the form. Review and complete the details.'
                  : 'Create a new product for your store'}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-md">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
            disabled={isLoading}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="nuvi-btn-loading" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEdit ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingProduct && (
        <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-py-xl">
          <div className="nuvi-text-center">
            <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
            <p className="nuvi-text-muted">Loading product data...</p>
          </div>
        </div>
      )}

      {/* Form - Customer Form Layout */}
      {!isLoadingProduct && (
        <form id="product-form" onSubmit={handleSubmit} className="nuvi-space-y-lg">
          {errors.submit && (
            <div className="nuvi-alert nuvi-alert-error">
              {errors.submit}
            </div>
          )}

          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
          {/* Main Content - 2/3 Width */}
          <div className="nuvi-lg:col-span-2">
            {/* Basic Information Card */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Package className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Basic Information</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                {/* Product Name */}
                <div className="nuvi-form-group">
                  <label className="nuvi-label nuvi-required">
                    Product Name
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    className={`nuvi-input ${errors.name ? 'nuvi-input-error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                    autoFocus
                  />
                  {errors.name && (
                    <p className="nuvi-text-error nuvi-text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="nuvi-form-group">
                  <label className="nuvi-label">
                    Description
                  </label>
                  <div className="nuvi-space-y-sm">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                      <span></span>
                      <button
                        type="button"
                        onClick={() => setShowAIGenerator(!showAIGenerator)}
                        className={`nuvi-btn nuvi-btn-sm ${
                          showAIGenerator ? 'nuvi-btn-primary' : 'nuvi-btn-secondary'
                        }`}
                      >
                        <Wand2 className="h-4 w-4" />
                        AI Generate
                      </button>
                    </div>
                    
                    {showAIGenerator && (
                      <div className="nuvi-p-md nuvi-bg-blue-50 nuvi-border nuvi-border-blue-200 nuvi-rounded-lg">
                        <p className="nuvi-text-sm nuvi-text-blue-700 nuvi-mb-sm">
                          AI will generate a description based on your product name and type.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            // Simulate AI generation
                            const aiDescription = `This ${formData.name.toLowerCase()} is a high-quality product designed to meet your needs. Perfect for everyday use with excellent durability and performance.`;
                            handleInputChange('description', aiDescription);
                            setShowAIGenerator(false);
                          }}
                          className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                          disabled={!formData.name}
                        >
                          Generate Description
                        </button>
                      </div>
                    )}
                    
                    <textarea
                      className="nuvi-input"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your product features and benefits..."
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="nuvi-grid nuvi-grid-cols-1 sm:nuvi-grid-cols-3 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label nuvi-required">
                      Price
                    </label>
                    <input
                      ref={priceRef}
                      type="number"
                      className={`nuvi-input ${errors.price ? 'nuvi-input-error' : ''}`}
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                    {errors.price && (
                      <p className="nuvi-text-error nuvi-text-sm">{errors.price}</p>
                    )}
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Compare at Price</label>
                    <input
                      type="number"
                      className="nuvi-input"
                      value={formData.compareAtPrice}
                      onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Cost per Item</label>
                    <input
                      type="number"
                      className="nuvi-input"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="nuvi-card nuvi-mt-lg">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <BarChart3 className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Inventory & Tracking</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-grid nuvi-grid-cols-1 sm:nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">
                      SKU
                    </label>
                    <div className="nuvi-flex nuvi-gap-sm">
                      <input
                        ref={skuRef}
                        type="text"
                        className="nuvi-input nuvi-flex-1"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="Product SKU"
                      />
                      {!formData.sku && formData.name && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('sku', generateSKU())}
                          className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                        >
                          <Wand2 className="h-4 w-4" />
                          Generate
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Barcode</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="Barcode"
                    />
                  </div>
                </div>

                <div className="nuvi-grid nuvi-grid-cols-1 sm:nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Quantity</label>
                    <input
                      type="number"
                      className="nuvi-input"
                      value={formData.inventory}
                      onChange={(e) => handleInputChange('inventory', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  {formData.productType === 'physical' && (
                    <div className="nuvi-form-group">
                      <label className="nuvi-label">
                        Weight
                      </label>
                      <div className="nuvi-flex nuvi-gap-sm">
                        <input
                          type="number"
                          className="nuvi-input nuvi-flex-1"
                          value={formData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          placeholder="0"
                          step="0.1"
                          min="0"
                        />
                        <select
                          className="nuvi-input"
                          value={formData.weightUnit}
                          onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                          style={{ width: '80px' }}
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="lb">lb</option>
                          <option value="oz">oz</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="nuvi-space-y-sm">
                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-cursor-pointer">
                    <input
                      type="checkbox"
                      className="nuvi-checkbox"
                      checked={formData.trackQuantity}
                      onChange={(e) => handleInputChange('trackQuantity', e.target.checked)}
                    />
                    <span>Track quantity</span>
                  </label>
                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-cursor-pointer">
                    <input
                      type="checkbox"
                      className="nuvi-checkbox"
                      checked={formData.continueSellingWhenOutOfStock}
                      onChange={(e) => handleInputChange('continueSellingWhenOutOfStock', e.target.checked)}
                    />
                    <span>Continue selling when out of stock</span>
                  </label>
                  {formData.productType === 'physical' && (
                    <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-cursor-pointer">
                      <input
                        type="checkbox"
                        className="nuvi-checkbox"
                        checked={formData.requiresShipping}
                        onChange={(e) => handleInputChange('requiresShipping', e.target.checked)}
                      />
                      <span>This is a physical product</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Card */}
            <div className="nuvi-card nuvi-mt-lg">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Globe className="h-5 w-5" />
                  <h3 className="nuvi-card-title">SEO Settings</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Page Title</label>
                  <input
                    type="text"
                    className="nuvi-input"
                    value={formData.metaTitle || formData.name}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO title"
                    maxLength={60}
                  />
                  <p className="nuvi-text-xs nuvi-text-muted">
                    {(formData.metaTitle || formData.name).length}/60 characters
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Meta Description</label>
                  <textarea
                    className="nuvi-input"
                    rows={3}
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO description"
                    maxLength={160}
                  />
                  <p className="nuvi-text-xs nuvi-text-muted">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">URL Slug</label>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <span className="nuvi-text-sm nuvi-text-muted">your-store.com/products/</span>
                    <input
                      type="text"
                      className="nuvi-input nuvi-flex-1"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="product-url"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 Width */}
          <div className="nuvi-space-y-lg">
            {/* Status & Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Shield className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Status & Settings</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Status</label>
                  <select
                    className="nuvi-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Product Type</label>
                  <select
                    className="nuvi-select"
                    value={formData.productType}
                    onChange={(e) => {
                      handleInputChange('productType', e.target.value);
                      handleInputChange('requiresShipping', e.target.value === 'physical');
                    }}
                  >
                    <option value="physical">Physical Product</option>
                    <option value="digital">Digital Product</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Category</label>
                  <select
                    className="nuvi-select"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    <optgroup label="Electronics">
                      <option value="electronics-phones">Mobile Phones</option>
                      <option value="electronics-computers">Computers</option>
                      <option value="electronics-audio">Audio</option>
                    </optgroup>
                    <optgroup label="Clothing">
                      <option value="apparel-clothing">Clothing</option>
                      <option value="apparel-shoes">Shoes</option>
                      <option value="apparel-accessories">Accessories</option>
                    </optgroup>
                    <optgroup label="Home & Garden">
                      <option value="home-furniture">Furniture</option>
                      <option value="home-decor">Home Decor</option>
                      <option value="home-kitchen">Kitchen</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Tag className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Tags</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-flex nuvi-gap-sm">
                  <input
                    type="text"
                    className="nuvi-input nuvi-flex-1"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="nuvi-flex nuvi-flex-wrap nuvi-gap-xs">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="nuvi-badge nuvi-badge-secondary nuvi-badge-removable"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <span className="nuvi-badge-remove">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Images */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <ImageIcon className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Product Images</h3>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="product-images-upload"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleInputChange('images', [...formData.images, ...files]);
                    }}
                  />
                  <label 
                    htmlFor="product-images-upload"
                    className="nuvi-block nuvi-w-full nuvi-border-2 nuvi-border-dashed nuvi-border-gray-300 nuvi-rounded-lg nuvi-p-lg nuvi-text-center nuvi-cursor-pointer nuvi-hover:border-primary nuvi-transition-colors"
                  >
                    <div className="nuvi-space-y-sm">
                      <Upload className="h-8 w-8 nuvi-text-gray-400 nuvi-mx-auto" />
                      <div>
                        <p className="nuvi-text-sm nuvi-font-medium">Upload product images</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Display existing images */}
                {formData.existingImages && formData.existingImages.length > 0 && (
                  <div className="nuvi-mt-md nuvi-space-y-sm">
                    <h4 className="nuvi-text-sm nuvi-font-medium">
                      Current Images ({formData.existingImages.length})
                    </h4>
                    <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-sm">
                      {formData.existingImages.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="nuvi-relative nuvi-group">
                          <img
                            src={imageUrl}
                            alt={`Product ${index + 1}`}
                            className="nuvi-w-full nuvi-h-20 nuvi-object-cover nuvi-rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newExistingImages = formData.existingImages?.filter((_, i) => i !== index) || [];
                              handleInputChange('existingImages', newExistingImages);
                            }}
                            className="nuvi-absolute nuvi-top-1 nuvi-right-1 nuvi-w-6 nuvi-h-6 nuvi-bg-red-500 nuvi-text-white nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center nuvi-opacity-0 nuvi-group-hover:opacity-100 nuvi-transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div className="nuvi-mt-md nuvi-space-y-sm">
                    <h4 className="nuvi-text-sm nuvi-font-medium">
                      Uploaded Images ({formData.images.length})
                    </h4>
                    <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-sm">
                      {formData.images.map((image, index) => (
                        <div key={index} className="nuvi-relative nuvi-group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Product ${index + 1}`}
                            className="nuvi-w-full nuvi-h-20 nuvi-object-cover nuvi-rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index);
                              handleInputChange('images', newImages);
                            }}
                            className="nuvi-absolute nuvi-top-1 nuvi-right-1 nuvi-w-6 nuvi-h-6 nuvi-bg-red-500 nuvi-text-white nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center nuvi-opacity-0 nuvi-group-hover:opacity-100 nuvi-transition-opacity"
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
          </div>
        </div>
        </form>
      )}
    </div>
  );
}