'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, X, Plus } from 'lucide-react';

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
  images: string[];
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
}

interface ProductVariantManagerProps {
  variants: VariantCombination[];
  variantOptions: VariantOption[];
  trackQuantity: boolean;
  onChange: (field: string, value: any) => void;
  isEdit: boolean;
}

export function ProductVariantManager({
  variants,
  variantOptions,
  trackQuantity,
  onChange,
  isEdit
}: ProductVariantManagerProps) {
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  // Generate all possible combinations when variant options change
  useEffect(() => {
    if (isEdit) return; // Don't regenerate in edit mode

    if (variantOptions.length === 0) {
      onChange('variants', [{
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
      trackQuantity: true,
      continueSellingWhenOutOfStock: false
    }));

    // Preserve existing data when regenerating
    const updatedVariants = newVariants.map(newVar => {
      const existing = variants.find(v => 
        JSON.stringify(v.options) === JSON.stringify(newVar.options)
      );
      return existing || newVar;
    });

    onChange('variants', updatedVariants);
  }, [variantOptions, isEdit]);

  const addVariantOption = () => {
    if (!newOptionName.trim()) return;
    
    onChange('variantOptions', [
      ...variantOptions,
      { name: newOptionName.trim(), values: [] }
    ]);
    setNewOptionName('');
  };

  const removeVariantOption = (index: number) => {
    onChange('variantOptions', variantOptions.filter((_, i) => i !== index));
  };

  const addOptionValue = (optionIndex: number) => {
    if (!newOptionValue.trim()) return;
    
    const updatedOptions = variantOptions.map((opt, i) => 
      i === optionIndex 
        ? { ...opt, values: [...opt.values, newOptionValue.trim()] }
        : opt
    );
    onChange('variantOptions', updatedOptions);
    setNewOptionValue('');
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updatedOptions = variantOptions.map((opt, i) => 
      i === optionIndex 
        ? { ...opt, values: opt.values.filter((_, vi) => vi !== valueIndex) }
        : opt
    );
    onChange('variantOptions', updatedOptions);
  };

  const updateVariantField = (variantId: string, field: keyof VariantCombination, value: any) => {
    const updatedVariants = variants.map(variant =>
      variant.id === variantId
        ? { ...variant, [field]: value }
        : variant
    );
    onChange('variants', updatedVariants);
  };

  const getVariantName = (options: Record<string, string>) => {
    return Object.entries(options)
      .map(([key, value]) => value)
      .join(' / ');
  };

  return (
    <>
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
                  value={selectedOptionIndex === optionIndex ? newOptionValue : ''}
                  onChange={(e) => {
                    setNewOptionValue(e.target.value);
                    setSelectedOptionIndex(optionIndex);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (selectedOptionIndex === optionIndex) {
                        addOptionValue(optionIndex);
                      }
                    }
                  }}
                  onFocus={() => setSelectedOptionIndex(optionIndex)}
                  className="h-8"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedOptionIndex(optionIndex);
                    addOptionValue(optionIndex);
                  }}
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
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variant Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {variants.map((variant) => (
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
    </>
  );
}