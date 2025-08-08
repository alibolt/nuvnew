'use client';

import { useState, useRef, useEffect } from 'react';
import { EntityFormWrapper } from '@/components/dashboard/forms/EntityFormWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/product/rich-text-editor';
import { AIDescriptionGenerator } from '@/components/product/ai-description-generator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductPreview } from '@/components/product/product-preview';
import { 
  Trash2, PlusCircle, X, Upload, Image as ImageIcon, Package, 
  DollarSign, Search, Globe, Save, Truck, Tag, BarChart3, 
  Weight, Ruler, AlertCircle, FileCode, Smartphone, Briefcase,
  Info, Wand2, Eye, Bot
} from 'lucide-react';
import { useCategories } from '@/hooks/dashboard/useCategories';
import { ProductVariantManager } from './product-variant-manager';
import { ProductImageUploader } from './product-image-uploader';
import { ProductMetafields } from '../product-metafields';
import { toast } from 'sonner';

interface ProductFormV2Props {
  subdomain: string;
  product?: any;
  metafields?: any[];
  metafieldDefinitions?: any[];
  isEdit?: boolean;
  onSuccess?: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  productType: 'physical' | 'digital' | 'service';
  categoryId: string;
  productCategory: string;
  isActive: boolean;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
  weight: string;
  weightUnit: 'kg' | 'lb' | 'oz' | 'g';
  dimensions: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  images: string[];
  variants: any[];
  variantOptions: any[];
}

export function ProductFormV2({ subdomain, product, metafields, metafieldDefinitions, isEdit = false, onSuccess }: ProductFormV2Props) {
  const [activeTab, setActiveTab] = useState('general');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showAIBanner, setShowAIBanner] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiDataApplied = useRef(false);
  
  const { categories } = useCategories(subdomain);

  // Check for AI generated data on mount
  useEffect(() => {
    if (!isEdit) {
      const storedAIData = sessionStorage.getItem('aiProductData');
      if (storedAIData) {
        try {
          const parsedData = JSON.parse(storedAIData);
          setAiData(parsedData);
          setShowAIBanner(true);
          // Clear the data from session storage
          sessionStorage.removeItem('aiProductData');
        } catch (error) {
          console.error('Failed to parse AI data:', error);
        }
      }
    }
  }, [isEdit]);

  const initialData: ProductFormData = {
    name: product?.name || aiData?.name || '',
    description: product?.description || aiData?.description || '',
    productType: product?.productType || 'physical',
    categoryId: product?.categoryId || '',
    productCategory: product?.category?.name || '',
    isActive: product?.isActive ?? true,
    tags: product?.tags || [],
    metaTitle: product?.metaTitle || aiData?.name || '',
    metaDescription: product?.metaDescription || aiData?.description?.substring(0, 160) || '',
    slug: product?.slug || aiData?.name?.toLowerCase().replace(/\s+/g, '-') || '',
    weight: product?.weight?.toString() || '',
    weightUnit: product?.weightUnit || 'kg',
    dimensions: product?.dimensions || { length: '', width: '', height: '', unit: 'cm' },
    trackQuantity: product?.trackQuantity ?? true,
    continueSellingWhenOutOfStock: product?.continueSellingWhenOutOfStock ?? false,
    images: product?.images || [],
    variants: product?.variants || (aiData?.price ? [{
      name: 'Default',
      price: aiData.price,
      stock: 0,
      sku: `SKU-${Date.now()}`
    }] : []),
    variantOptions: []
  };

  // Extract variant options from existing variants
  if (isEdit && product?.variants) {
    const optionsMap = new Map<string, Set<string>>();
    product.variants.forEach((variant: any) => {
      Object.entries(variant.options || {}).forEach(([key, value]) => {
        if (!optionsMap.has(key)) {
          optionsMap.set(key, new Set());
        }
        optionsMap.get(key)?.add(value as string);
      });
    });

    initialData.variantOptions = Array.from(optionsMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values)
    }));
  }

  const transformData = (data: ProductFormData) => {
    const requiresShipping = data.productType === 'physical';
    
    return {
      name: data.name,
      description: data.description,
      productType: data.productType,
      categoryId: data.categoryId === 'no-category' ? null : data.categoryId || null,
      metaTitle: data.metaTitle || data.name,
      metaDescription: data.metaDescription || data.description,
      slug: data.slug,
      isActive: data.isActive,
      tags: data.tags,
      images: data.images,
      requiresShipping,
      weight: requiresShipping ? parseFloat(data.weight) || 0 : 0,
      weightUnit: data.weightUnit,
      dimensions: requiresShipping ? data.dimensions : null,
      trackQuantity: data.trackQuantity,
      continueSellingWhenOutOfStock: data.continueSellingWhenOutOfStock,
      variants: data.variants.map(v => ({
        id: isEdit ? v.id : undefined,
        name: data.variantOptions.length > 0 ? Object.values(v.options).join(' / ') : 'Default',
        sku: v.sku || undefined,
        barcode: v.barcode || undefined,
        price: parseFloat(v.price),
        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
        cost: v.cost ? parseFloat(v.cost) : undefined,
        stock: parseInt(v.stock, 10),
        weight: v.weight ? parseFloat(v.weight) : undefined,
        weightUnit: v.weightUnit,
        options: v.options,
        images: v.images || [],
        trackQuantity: v.trackQuantity,
        continueSellingWhenOutOfStock: v.continueSellingWhenOutOfStock
      }))
    };
  };

  const addTag = (formData: ProductFormData, handleChange: any) => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    handleChange('tags', [...formData.tags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tag: string, formData: ProductFormData, handleChange: any) => {
    handleChange('tags', formData.tags.filter((t: string) => t !== tag));
  };

  return (
    <TooltipProvider>
      <EntityFormWrapper
        mode={isEdit ? 'edit' : 'create'}
        entityId={product?.id}
        initialData={initialData}
        apiEndpoint={`/api/stores/${subdomain}/products`}
        onDataChange={transformData}
        redirectPath={`/dashboard/stores/${subdomain}/products`}
        onSuccess={onSuccess}
      >
        {({ formData, handleChange, loading, saving, error, handleSubmit }) => {
          // Apply AI data when it's available and form is ready
          useEffect(() => {
            if (aiData && !isEdit && formData && !aiDataApplied.current) {
              // Mark as applied to prevent re-running
              aiDataApplied.current = true;
              
              // Only apply once when AI data is first loaded
              handleChange('name', aiData.name || '');
              handleChange('description', aiData.description || '');
              handleChange('metaTitle', aiData.name || '');
              handleChange('metaDescription', aiData.description?.substring(0, 160) || '');
              handleChange('slug', aiData.name?.toLowerCase().replace(/\s+/g, '-') || '');
              
              if (aiData.price) {
                handleChange('variants', [{
                  name: 'Default',
                  price: aiData.price,
                  stock: 0,
                  sku: `SKU-${Date.now()}`
                }]);
              }
              
              // Show success toast
              toast.success('AI has pre-filled the product form. Please review and add images before saving.');
            }
          }, [aiData, isEdit, formData, handleChange]);

          return (
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
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

            <div className="nuvi-page-header">
              <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                <div>
                  <h1 className="nuvi-page-title">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                  </h1>
                  <p className="nuvi-page-description">
                    {isEdit 
                      ? 'Update your product information' 
                      : aiData 
                        ? 'AI has pre-filled the form. Review and complete the details.'
                        : 'Create a new product for your store'}
                  </p>
                </div>
                <div className="nuvi-flex nuvi-gap-md nuvi-items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    disabled={!formData.name}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="nuvi-btn nuvi-btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Product'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="custom">Custom Fields</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        {/* Product Title and Type Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="productName">Product Title *</Label>
                            <Input
                              id="productName"
                              value={formData.name}
                              onChange={(e) => handleChange('name', e.target.value)}
                              placeholder="Short sleeve t-shirt"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="productCategory">Product Category</Label>
                            <Input
                              id="productCategory"
                              value={formData.productCategory}
                              onChange={(e) => handleChange('productCategory', e.target.value)}
                              placeholder="e.g., Apparel, Electronics, Home & Garden"
                              className="flex-1"
                            />
                            <p className="text-xs text-gray-500">Used for organization and reporting</p>
                          </div>
                        </div>

                        {/* Product Type Selection */}
                        <div className="space-y-2">
                          <Label>Type *</Label>
                          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                            <button
                              type="button"
                              onClick={() => handleChange('productType', 'physical')}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                formData.productType === 'physical' 
                                  ? 'bg-white shadow-sm text-gray-900' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <Package className="h-3.5 w-3.5" />
                              Physical
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('productType', 'digital')}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                formData.productType === 'digital' 
                                  ? 'bg-white shadow-sm text-gray-900' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <FileCode className="h-3.5 w-3.5" />
                              Digital
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('productType', 'service')}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                formData.productType === 'service' 
                                  ? 'bg-white shadow-sm text-gray-900' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <Briefcase className="h-3.5 w-3.5" />
                              Service
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="productDescription">Description</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAIGenerator(!showAIGenerator)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <Wand2 className="h-4 w-4 mr-1" />
                              AI Assistant
                            </Button>
                          </div>
                          
                          {showAIGenerator && (
                            <AIDescriptionGenerator
                              productName={formData.name}
                              productType={formData.productType}
                              onGenerated={(description) => {
                                handleChange('description', description);
                                setShowAIGenerator(false);
                              }}
                            />
                          )}
                          
                          <RichTextEditor
                            content={formData.description}
                            onChange={(value) => handleChange('description', value)}
                            placeholder="Describe your product in detail..."
                          />
                        </div>

                        {/* Product Images */}
                        <ProductImageUploader
                          images={formData.images}
                          onChange={(images) => handleChange('images', images)}
                          subdomain={subdomain}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="inventory" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Inventory Tracking</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Track quantity</Label>
                            <p className="text-sm text-gray-500">Track this product's inventory</p>
                          </div>
                          <Switch
                            checked={formData.trackQuantity}
                            onCheckedChange={(value) => handleChange('trackQuantity', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Continue selling when out of stock</Label>
                            <p className="text-sm text-gray-500">Allow customers to purchase when inventory reaches 0</p>
                          </div>
                          <Switch
                            checked={formData.continueSellingWhenOutOfStock}
                            onCheckedChange={(value) => handleChange('continueSellingWhenOutOfStock', value)}
                            disabled={!formData.trackQuantity}
                          />
                        </div>

                        {!formData.trackQuantity && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">
                              Inventory will not be tracked. Product will always be available for purchase.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quantity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {formData.variantOptions.length > 0 ? (
                          <p className="text-sm text-gray-500">
                            Inventory is tracked at the variant level. Set quantities in the Variants tab.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <Label>Available quantity</Label>
                            <Input
                              type="number"
                              min="0"
                              value={formData.variants[0]?.stock || '0'}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                if (!newVariants[0]) {
                                  newVariants[0] = { stock: e.target.value };
                                } else {
                                  newVariants[0].stock = e.target.value;
                                }
                                handleChange('variants', newVariants);
                              }}
                              disabled={!formData.trackQuantity}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="shipping" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Shipping</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {formData.productType !== 'physical' ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex gap-2">
                            <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-700 font-medium">
                                {formData.productType === 'digital' ? 'Digital products' : 'Services'} don't require shipping
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                This product will be delivered {formData.productType === 'digital' ? 'electronically' : 'as a service'}.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Weight</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={formData.weight}
                                  onChange={(e) => handleChange('weight', e.target.value)}
                                  placeholder="0.0"
                                  className="flex-1"
                                />
                                <Select 
                                  value={formData.weightUnit} 
                                  onValueChange={(value: any) => handleChange('weightUnit', value)}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="g">g</SelectItem>
                                    <SelectItem value="lb">lb</SelectItem>
                                    <SelectItem value="oz">oz</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Dimensions (optional)</Label>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.dimensions.length}
                                    onChange={(e) => handleChange('dimensions', {...formData.dimensions, length: e.target.value})}
                                    placeholder="Length"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.dimensions.width}
                                    onChange={(e) => handleChange('dimensions', {...formData.dimensions, width: e.target.value})}
                                    placeholder="Width"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.dimensions.height}
                                    onChange={(e) => handleChange('dimensions', {...formData.dimensions, height: e.target.value})}
                                    placeholder="Height"
                                  />
                                </div>
                              </div>
                              <Select 
                                value={formData.dimensions.unit} 
                                onValueChange={(value) => handleChange('dimensions', {...formData.dimensions, unit: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cm">cm</SelectItem>
                                  <SelectItem value="in">in</SelectItem>
                                  <SelectItem value="ft">ft</SelectItem>
                                  <SelectItem value="m">m</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Search engine listing</CardTitle>
                        <p className="text-sm text-gray-500">
                          Add a title and description to see how this product might appear in a search engine listing
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="metaTitle">Page title</Label>
                          <Input
                            id="metaTitle"
                            value={formData.metaTitle}
                            onChange={(e) => handleChange('metaTitle', e.target.value)}
                            placeholder={formData.name || "Product title"}
                          />
                          <p className="text-xs text-gray-500">{formData.metaTitle.length || 0} of 70 characters used</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="metaDescription">Meta description</Label>
                          <Textarea
                            id="metaDescription"
                            value={formData.metaDescription}
                            onChange={(e) => handleChange('metaDescription', e.target.value)}
                            placeholder={formData.description || "Product description"}
                            rows={3}
                          />
                          <p className="text-xs text-gray-500">{formData.metaDescription.length || 0} of 160 characters used</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="slug">URL handle</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">/products/</span>
                            <Input
                              id="slug"
                              value={formData.slug}
                              onChange={(e) => handleChange('slug', e.target.value)}
                              placeholder="product-url-handle"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="variants" className="space-y-4">
                    <ProductVariantManager
                      variants={formData.variants}
                      variantOptions={formData.variantOptions}
                      trackQuantity={formData.trackQuantity}
                      onChange={(field, value) => handleChange(field, value)}
                      isEdit={isEdit}
                    />
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <ProductMetafields
                      subdomain={subdomain}
                      productId={product?.id}
                      metafields={metafields}
                      metafieldDefinitions={metafieldDefinitions}
                      onMetafieldsChange={(fields) => {
                        // Handle metafields change if needed
                        console.log('Metafields updated:', fields);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select 
                      value={formData.isActive ? 'active' : 'draft'} 
                      onValueChange={(value) => handleChange('isActive', value === 'active')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Product category</Label>
                      <Select value={formData.categoryId} onValueChange={(value) => handleChange('categoryId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-category">No category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(formData, handleChange))}
                        />
                        <Button
                          type="button"
                          onClick={() => addTag(formData, handleChange)}
                          disabled={!newTag.trim()}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag, formData, handleChange)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        );
        }}
      </EntityFormWrapper>
      
      {/* Product Preview Modal */}
      {showPreview && (
        <ProductPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          product={{
            name: initialData.name,
            description: initialData.description,
            productType: initialData.productType,
            price: initialData.variants[0]?.price || '0',
            compareAtPrice: initialData.variants[0]?.compareAtPrice,
            images: initialData.images,
            tags: initialData.tags,
            inStock: parseInt(initialData.variants[0]?.stock || '0') > 0
          }}
        />
      )}
    </TooltipProvider>
  );
}