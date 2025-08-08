'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RichTextEditor } from '@/components/product/rich-text-editor';
import { AIDescriptionGenerator } from '@/components/product/ai-description-generator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductPreview } from '@/components/product/product-preview';
import { 
  Trash2, PlusCircle, X, Upload, Image as ImageIcon, Package, 
  DollarSign, Search, Globe, Save, Truck, Tag, BarChart3, 
  Weight, Ruler, AlertCircle, FileCode, Smartphone, Briefcase,
  Info, Wand2, Eye
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface VariantOption {
  name: string;
  values: string[];
}

interface VariantCombination {
  id: string;
  options: Record<string, string>;
  price: string;
  compareAtPrice: string;
  cost: string;
  stock: string;
  sku: string;
  barcode: string;
  weight: string;
  weightUnit: 'kg' | 'lb' | 'oz' | 'g';
  images: File[];
  imageUrls: string[];
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
}

interface ProductFormProps {
  storeId: string;
  product?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export function ProductForm({ storeId, product, isEdit = false, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Product fields
  const [productName, setProductName] = useState(product?.name || '');
  const [productDescription, setProductDescription] = useState(product?.description || '');
  const [productType, setProductType] = useState<'physical' | 'digital' | 'service'>(product?.productType || 'physical');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [productCategory, setProductCategory] = useState(product?.category || '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Tags
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [newTag, setNewTag] = useState('');
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription || '');
  const [slug, setSlug] = useState(product?.slug || '');

  // Shipping (automatically determined by product type)
  const requiresShipping = productType === 'physical';
  const [weight, setWeight] = useState(product?.weight || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb' | 'oz' | 'g'>(product?.weightUnit || 'kg');
  const [dimensions, setDimensions] = useState({
    length: product?.dimensions?.length || '',
    width: product?.dimensions?.width || '',
    height: product?.dimensions?.height || '',
    unit: product?.dimensions?.unit || 'cm'
  });

  // Inventory
  const [trackQuantity, setTrackQuantity] = useState(product?.trackQuantity ?? true);
  const [continueSellingWhenOutOfStock, setContinueSellingWhenOutOfStock] = useState(
    product?.continueSellingWhenOutOfStock ?? false
  );

  // Variant options (e.g., Color, Size)
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');

  // Generated variant combinations
  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([]);

  // Product images (for main product, not variants)
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImageUrls, setProductImageUrls] = useState<string[]>(product?.images || []);

  useEffect(() => {
    fetch(`/api/stores/${storeId}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, [storeId]);

  // Auto-generate slug from product name
  useEffect(() => {
    if (!isEdit && productName) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [productName, isEdit]);

  // Auto-save functionality
  useEffect(() => {
    if (!isEdit || !productName) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save after 2 seconds of no changes
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [productName, productDescription, productType, categoryId, tags, metaTitle, metaDescription, slug]);

  const handleAutoSave = async () => {
    if (!isEdit || !productName) return;
    
    setAutoSaving(true);
    try {
      const payload = {
        name: productName,
        description: productDescription,
        productType,
        categoryId: categoryId === 'no-category' ? null : categoryId || null,
        metaTitle: metaTitle || productName,
        metaDescription: metaDescription || productDescription,
        slug,
        isActive,
        tags,
      };

      const response = await fetch(`/api/stores/${storeId}/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!productName.trim()) {
      errors.productName = 'Product name is required';
    }
    
    if (variantCombinations.some(v => !v.price || parseFloat(v.price) <= 0)) {
      errors.variants = 'All variants must have a valid price';
    }
    
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      errors.slug = 'URL handle can only contain lowercase letters, numbers, and hyphens';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Initialize data for edit mode
  useEffect(() => {
    if (isEdit && product) {
      // Extract variant options from existing variants
      const optionsMap = new Map<string, Set<string>>();
      product.variants?.forEach((variant: any) => {
        Object.entries(variant.options || {}).forEach(([key, value]) => {
          if (!optionsMap.has(key)) {
            optionsMap.set(key, new Set());
          }
          optionsMap.get(key)?.add(value as string);
        });
      });

      const options = Array.from(optionsMap.entries()).map(([name, values]) => ({
        name,
        values: Array.from(values)
      }));
      setVariantOptions(options);

      // Set variant combinations
      const combinations = product.variants?.map((variant: any) => ({
        id: variant.id,
        options: variant.options || {},
        price: variant.price.toString(),
        compareAtPrice: variant.compareAtPrice?.toString() || '',
        cost: variant.cost?.toString() || '',
        stock: variant.stock.toString(),
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        weight: variant.weight?.toString() || '',
        weightUnit: variant.weightUnit || 'kg',
        images: [],
        imageUrls: variant.images?.map((img: any) => img.url) || [],
        trackQuantity: variant.trackQuantity ?? true,
        continueSellingWhenOutOfStock: variant.continueSellingWhenOutOfStock ?? false
      })) || [];
      setVariantCombinations(combinations);
    }
  }, [isEdit, product]);

  // Generate all possible combinations when variant options change
  useEffect(() => {
    if (isEdit) return; // Don't regenerate in edit mode

    if (variantOptions.length === 0) {
      setVariantCombinations([{
        id: 'default',
        options: {},
        price: '',
        compareAtPrice: '',
        cost: '',
        stock: '0',
        sku: '',
        barcode: '',
        weight: '',
        weightUnit: 'kg',
        images: [],
        imageUrls: [],
        trackQuantity: true,
        continueSellingWhenOutOfStock: false
      }]);
      return;
    }

    const generateCombinations = (options: VariantOption[]): Record<string, string>[] => {
      if (options.length === 0) return [{}];
      
      const [first, ...rest] = options;
      const restCombinations = generateCombinations(rest);
      
      return first.values.flatMap(value => 
        restCombinations.map(combo => ({
          ...combo,
          [first.name]: value
        }))
      );
    };

    const combinations = generateCombinations(variantOptions);
    const newVariants = combinations.map((combo, index) => ({
      id: `variant-${index}`,
      options: combo,
      price: '',
      compareAtPrice: '',
      cost: '',
      stock: '0',
      sku: '',
      barcode: '',
      weight: '',
      weightUnit: 'kg' as const,
      images: [],
      imageUrls: [],
      trackQuantity: true,
      continueSellingWhenOutOfStock: false
    }));

    // Preserve existing data when regenerating
    setVariantCombinations(current => {
      return newVariants.map(newVar => {
        const existing = current.find(c => 
          JSON.stringify(c.options) === JSON.stringify(newVar.options)
        );
        return existing || newVar;
      });
    });
  }, [variantOptions, isEdit]);

  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addVariantOption = () => {
    if (!newOptionName.trim()) return;
    
    setVariantOptions(current => [
      ...current,
      { name: newOptionName.trim(), values: [] }
    ]);
    setNewOptionName('');
  };

  const removeVariantOption = (index: number) => {
    setVariantOptions(current => current.filter((_, i) => i !== index));
  };

  const addOptionValue = (optionIndex: number) => {
    if (!newOptionValue.trim()) return;
    
    setVariantOptions(current => 
      current.map((opt, i) => 
        i === optionIndex 
          ? { ...opt, values: [...opt.values, newOptionValue.trim()] }
          : opt
      )
    );
    setNewOptionValue('');
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    setVariantOptions(current => 
      current.map((opt, i) => 
        i === optionIndex 
          ? { ...opt, values: opt.values.filter((_, vi) => vi !== valueIndex) }
          : opt
      )
    );
  };

  const updateVariantField = (variantId: string, field: keyof VariantCombination, value: any) => {
    setVariantCombinations(current =>
      current.map(variant =>
        variant.id === variantId
          ? { ...variant, [field]: value }
          : variant
      )
    );
  };

  const handleProductImageUpload = (files: FileList) => {
    const newImages = Array.from(files);
    setProductImages([...productImages, ...newImages]);
  };

  const removeProductImage = (index: number, isUrl: boolean = false) => {
    if (isUrl) {
      setProductImageUrls(productImageUrls.filter((_, i) => i !== index));
    } else {
      setProductImages(productImages.filter((_, i) => i !== index));
    }
  };

  const handleImageUpload = (variantId: string, files: FileList) => {
    const newImages = Array.from(files);
    setVariantCombinations(current =>
      current.map(variant =>
        variant.id === variantId
          ? { ...variant, images: [...variant.images, ...newImages] }
          : variant
      )
    );
  };

  const removeImage = (variantId: string, index: number, isUrl: boolean = false) => {
    setVariantCombinations(current =>
      current.map(variant =>
        variant.id === variantId
          ? {
              ...variant,
              images: isUrl ? variant.images : variant.images.filter((_, i) => i !== index),
              imageUrls: isUrl ? variant.imageUrls.filter((_, i) => i !== index) : variant.imageUrls
            }
          : variant
      )
    );
  };

  const getVariantName = (options: Record<string, string>) => {
    return Object.entries(options)
      .map(([key, value]) => value)
      .join(' / ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      const firstError = Object.values(validationErrors)[0];
      setError(firstError);
      return;
    }
    
    setLoading(true);

    try {
      // Upload product images first
      const uploadedProductImageUrls = [...productImageUrls];
      for (const image of productImages) {
        const formData = new FormData();
        formData.append('file', image);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          uploadedProductImageUrls.push(url);
        }
      }

      // Upload variant images
      const variantsWithImageUrls = await Promise.all(
        variantCombinations.map(async (variant) => {
          const uploadedImageUrls = [...variant.imageUrls];
          
          for (const image of variant.images) {
            const formData = new FormData();
            formData.append('file', image);
            
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            if (uploadRes.ok) {
              const { url } = await uploadRes.json();
              uploadedImageUrls.push(url);
            }
          }
          
          return {
            ...variant,
            uploadedImageUrls
          };
        })
      );

      const payload = {
        name: productName,
        description: productDescription,
        productType,
        categoryId: categoryId === 'no-category' ? null : categoryId || null,
        metaTitle: metaTitle || productName,
        metaDescription: metaDescription || productDescription,
        slug,
        isActive,
        tags,
        images: uploadedProductImageUrls,
        requiresShipping,
        weight: requiresShipping ? parseFloat(weight) || 0 : 0,
        weightUnit,
        dimensions: requiresShipping ? dimensions : null,
        trackQuantity,
        continueSellingWhenOutOfStock,
        variants: variantsWithImageUrls.map(v => ({
          id: isEdit ? v.id : undefined,
          name: variantOptions.length > 0 ? getVariantName(v.options) : 'Default',
          sku: v.sku || undefined,
          barcode: v.barcode || undefined,
          price: parseFloat(v.price),
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
          cost: v.cost ? parseFloat(v.cost) : undefined,
          stock: parseInt(v.stock, 10),
          weight: v.weight ? parseFloat(v.weight) : undefined,
          weightUnit: v.weightUnit,
          options: v.options,
          images: v.uploadedImageUrls,
          trackQuantity: v.trackQuantity,
          continueSellingWhenOutOfStock: v.continueSellingWhenOutOfStock
        }))
      };

      const url = isEdit 
        ? `/api/stores/${storeId}/products/${product.id}`
        : `/api/stores/${storeId}/products`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || `Failed to ${isEdit ? 'update' : 'create'} product`);
      } else {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/dashboard/stores/${storeId}/products`);
          router.refresh();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
      <div className="nuvi-page-header">
        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
          <div>
            <h1 className="nuvi-page-title">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="nuvi-page-description">
              {isEdit 
                ? 'Update your product information' 
                : 'Create a new product for your store'}
            </p>
          </div>
          <div className="nuvi-flex nuvi-gap-md nuvi-items-center">
            {isEdit && lastSaved && (
              <span className="text-sm text-gray-500">
                {autoSaving ? 'Saving...' : `Saved ${new Date(lastSaved).toLocaleTimeString()}`}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!productName}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              type="submit" 
              disabled={loading || Object.keys(validationErrors).length > 0}
              className="nuvi-btn nuvi-btn-primary"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
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
                        value={productName}
                        onChange={(e) => {
                          setProductName(e.target.value);
                          if (validationErrors.productName) {
                            setValidationErrors({...validationErrors, productName: ''});
                          }
                        }}
                        placeholder="Short sleeve t-shirt"
                        required
                        className={validationErrors.productName ? 'border-red-500' : ''}
                      />
                      {validationErrors.productName && (
                        <p className="text-xs text-red-500">{validationErrors.productName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productCategory">Product Category</Label>
                      <Input
                        id="productCategory"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        placeholder="e.g., Apparel, Electronics, Home & Garden"
                        className="flex-1"
                      />
                      <p className="text-xs text-gray-500">Used for organization and reporting</p>
                    </div>
                  </div>

                  {/* Minimal Product Type Selection */}
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                      <button
                        type="button"
                        onClick={() => setProductType('physical')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          productType === 'physical' 
                            ? 'bg-white shadow-sm text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Package className="h-3.5 w-3.5" />
                        Physical
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductType('digital')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          productType === 'digital' 
                            ? 'bg-white shadow-sm text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FileCode className="h-3.5 w-3.5" />
                        Digital
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductType('service')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          productType === 'service' 
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
                        productName={productName}
                        productType={productType}
                        onGenerated={(description) => {
                          setProductDescription(description);
                          setShowAIGenerator(false);
                        }}
                      />
                    )}
                    
                    <RichTextEditor
                      content={productDescription}
                      onChange={setProductDescription}
                      placeholder="Describe your product in detail..."
                    />
                  </div>

                  {/* Product Images */}
                  <div className="space-y-2">
                    <Label>Product Images</Label>
                    <div className="flex flex-wrap gap-2">
                      {/* Existing images */}
                      {productImageUrls.map((url, index) => (
                        <div key={`url-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductImage(index, true)}
                            className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* New images preview */}
                      {productImages.map((file, index) => (
                        <div key={`file-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductImage(index, false)}
                            className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleProductImageUpload(e.target.files)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Add Image</span>
                      </button>
                    </div>
                  </div>
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
                      checked={trackQuantity}
                      onCheckedChange={setTrackQuantity}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Continue selling when out of stock</Label>
                      <p className="text-sm text-gray-500">Allow customers to purchase when inventory reaches 0</p>
                    </div>
                    <Switch
                      checked={continueSellingWhenOutOfStock}
                      onCheckedChange={setContinueSellingWhenOutOfStock}
                      disabled={!trackQuantity}
                    />
                  </div>

                  {!trackQuantity && (
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
                  {variantOptions.length > 0 ? (
                    <p className="text-sm text-gray-500">
                      Inventory is tracked at the variant level. Set quantities in the Variants tab.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <Label>Available quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variantCombinations[0]?.stock || '0'}
                        onChange={(e) => updateVariantField(variantCombinations[0]?.id || 'default', 'stock', e.target.value)}
                        disabled={!trackQuantity}
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
                  {productType !== 'physical' ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex gap-2">
                      <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700 font-medium">
                          {productType === 'digital' ? 'Digital products' : 'Services'} don't require shipping
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          This product will be delivered {productType === 'digital' ? 'electronically' : 'as a service'}.
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
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0.0"
                            className="flex-1"
                          />
                          <Select value={weightUnit} onValueChange={(value: any) => setWeightUnit(value)}>
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
                              value={dimensions.length}
                              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
                              placeholder="Length"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={dimensions.width}
                              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
                              placeholder="Width"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={dimensions.height}
                              onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
                              placeholder="Height"
                            />
                          </div>
                        </div>
                        <Select value={dimensions.unit} onValueChange={(value) => setDimensions({...dimensions, unit: value})}>
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
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={productName || "Product title"}
                    />
                    <p className="text-xs text-gray-500">{metaTitle.length || 0} of 70 characters used</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta description</Label>
                    <Textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder={productDescription || "Product description"}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">{metaDescription.length || 0} of 160 characters used</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL handle</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">/products/</span>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value);
                          if (validationErrors.slug) {
                            setValidationErrors({...validationErrors, slug: ''});
                          }
                        }}
                        placeholder="product-url-handle"
                        className={`flex-1 ${validationErrors.slug ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {validationErrors.slug && (
                      <p className="text-xs text-red-500">{validationErrors.slug}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Options</CardTitle>
                  <p className="text-sm text-gray-500">
                    Add options like size or color to create variants
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newOptionName}
                      onChange={(e) => setNewOptionName(e.target.value)}
                      placeholder="Option name (e.g., Size, Color)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariantOption())}
                    />
                    <Button
                      type="button"
                      onClick={addVariantOption}
                      disabled={!newOptionName.trim()}
                      size="sm"
                    >
                      Add Option
                    </Button>
                  </div>

                  {variantOptions.map((option, optionIndex) => (
                    <div key={optionIndex} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{option.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariantOption(optionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {option.values.map((value, valueIndex) => (
                          <span
                            key={valueIndex}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-gray-100"
                          >
                            {value}
                            <button
                              type="button"
                              onClick={() => removeOptionValue(optionIndex, valueIndex)}
                              className="hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder={`Add ${option.name.toLowerCase()} value`}
                          value={newOptionValue}
                          onChange={(e) => setNewOptionValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addOptionValue(optionIndex);
                            }
                          }}
                          className="h-8"
                        />
                        <Button
                          type="button"
                          onClick={() => addOptionValue(optionIndex)}
                          size="sm"
                          className="h-8"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Variant Details */}
              {variantCombinations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variant Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {variantCombinations.map((variant, index) => (
                        <div key={variant.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <h4 className="font-medium text-sm mb-3">
                                {Object.keys(variant.options).length > 0 
                                  ? getVariantName(variant.options)
                                  : 'Default Variant'}
                              </h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Price *</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variant.price}
                                  onChange={(e) => updateVariantField(variant.id, 'price', e.target.value)}
                                  placeholder="0.00"
                                  className="h-8"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Compare at price</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variant.compareAtPrice}
                                  onChange={(e) => updateVariantField(variant.id, 'compareAtPrice', e.target.value)}
                                  placeholder="0.00"
                                  className="h-8"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Cost per item</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variant.cost}
                                  onChange={(e) => updateVariantField(variant.id, 'cost', e.target.value)}
                                  placeholder="0.00"
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Quantity</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={variant.stock}
                                  onChange={(e) => updateVariantField(variant.id, 'stock', e.target.value)}
                                  placeholder="0"
                                  className="h-8"
                                  disabled={!trackQuantity}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs">SKU (Stock Keeping Unit)</Label>
                              <Input
                                value={variant.sku}
                                onChange={(e) => updateVariantField(variant.id, 'sku', e.target.value)}
                                placeholder="ABC-123"
                                className="h-8"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Barcode (ISBN, UPC, GTIN, etc.)</Label>
                              <Input
                                value={variant.barcode}
                                onChange={(e) => updateVariantField(variant.id, 'barcode', e.target.value)}
                                placeholder="1234567890"
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
              <Select value={isActive ? 'active' : 'draft'} onValueChange={(value) => setIsActive(value === 'active')}>
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
                <Select value={categoryId} onValueChange={setCategoryId}>
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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
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
    
    {/* Product Preview Modal */}
    <ProductPreview
      isOpen={showPreview}
      onClose={() => setShowPreview(false)}
      product={{
        name: productName,
        description: productDescription,
        productType: productType,
        price: variantCombinations[0]?.price || '0',
        compareAtPrice: variantCombinations[0]?.compareAtPrice,
        images: [...productImageUrls, ...productImages.map(file => URL.createObjectURL(file))],
        tags: Array.isArray(tags) ? tags : [],
        inStock: parseInt(variantCombinations[0]?.stock || '0') > 0
      }}
    />
    </TooltipProvider>
  );
}