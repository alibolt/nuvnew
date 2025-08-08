'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, X, Percent, DollarSign, Truck, Gift,
  Calendar, Info, Plus, Trash2, Users, ShoppingCart, Package, Bot
} from 'lucide-react';
import { toast } from 'sonner';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
}

interface DiscountFormPanelProps {
  store: StoreData;
  discountId?: string;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function DiscountFormPanel({ 
  store, 
  discountId, 
  isEdit = false, 
  onSave, 
  onCancel 
}: DiscountFormPanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIBanner, setShowAIBanner] = useState(false);
  const aiDataApplied = useRef(false);
  
  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'>('percentage');
  const [value, setValue] = useState('');
  const [buyXValue, setBuyXValue] = useState('1');
  const [getYValue, setGetYValue] = useState('1');
  
  // Minimum requirements
  const [minimumRequirements, setMinimumRequirements] = useState<'none' | 'amount' | 'quantity'>('none');
  const [minimumAmount, setMinimumAmount] = useState('');
  const [minimumQuantity, setMinimumQuantity] = useState('');
  
  // Applies to
  const [appliesTo, setAppliesTo] = useState<'all' | 'specific_products' | 'specific_categories' | 'specific_customers'>('all');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [customerIds, setCustomerIds] = useState<string[]>([]);
  const [customerGroups, setCustomerGroups] = useState<string[]>([]);
  
  // Usage limits
  const [usageLimit, setUsageLimit] = useState('');
  const [onePerCustomer, setOnePerCustomer] = useState(false);
  
  // Active dates
  const [hasStartDate, setHasStartDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  
  // Status
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // Check for AI generated data on mount
  useEffect(() => {
    if (!isEdit && !aiDataApplied.current) {
      const storedAIData = sessionStorage.getItem('aiDiscountData');
      if (storedAIData) {
        try {
          const aiData = JSON.parse(storedAIData);
          aiDataApplied.current = true;
          
          // Apply AI data to form
          setCode(aiData.code || '');
          setName(`${aiData.value}% Off Discount`);
          setDescription(`Save ${aiData.value}% on your purchase with code ${aiData.code}`);
          setType(aiData.type || 'percentage');
          setValue(aiData.value?.toString() || '');
          setStatus('active');
          
          setShowAIBanner(true);
          
          // Clear the data from session storage
          sessionStorage.removeItem('aiDiscountData');
          
          // Show success toast
          toast.success(`AI has created discount code "${aiData.code}" with ${aiData.value}% off. Review and save to activate.`);
        } catch (error) {
          console.error('Failed to parse AI discount data:', error);
        }
      }
    }
  }, [isEdit]);
  
  // Load discount data if editing
  useEffect(() => {
    if (isEdit && discountId) {
      loadDiscount();
    }
  }, [isEdit, discountId, store.subdomain]);

  const loadDiscount = async () => {
    if (!discountId) {
      console.error('No discountId provided');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/discounts?status=all`);
      if (response.ok) {
        const data = await response.json();
        const discount = data.discounts?.find((d: any) => d.id === discountId);
        
        if (!discount) {
          console.error('Discount not found');
          toast.error('Discount not found');
          return;
        }
        
        // Populate form fields
        setCode(discount.code || '');
        setName(discount.name || '');
        setDescription(discount.description || '');
        setType(discount.type || 'percentage');
        setValue(discount.value?.toString() || '');
        
        if (discount.type === 'buy_x_get_y' && discount.buyXGetY) {
          setBuyXValue(discount.buyXGetY.buyQuantity?.toString() || '1');
          setGetYValue(discount.buyXGetY.getQuantity?.toString() || '1');
        }
        
        // Minimum requirements
        if (discount.minimumRequirement) {
          if (discount.minimumRequirement.type === 'minimum_amount') {
            setMinimumRequirements('amount');
            setMinimumAmount(discount.minimumRequirement.value?.toString() || '');
          } else if (discount.minimumRequirement.type === 'minimum_quantity') {
            setMinimumRequirements('quantity');
            setMinimumQuantity(discount.minimumRequirement.value?.toString() || '');
          } else {
            setMinimumRequirements('none');
          }
        } else {
          setMinimumRequirements('none');
        }
        
        // Applies to
        setAppliesTo(discount.appliesTo || 'all');
        setProductIds(discount.productIds || []);
        setCategoryIds(discount.categoryIds || []);
        setCustomerIds(discount.customerIds || []);
        setCustomerGroups(discount.customerGroups || []);
        
        // Usage limits
        setUsageLimit(discount.usageLimit?.toString() || '');
        setOnePerCustomer(discount.usageLimitPerCustomer === 1);
        
        // Active dates
        if (discount.startsAt) {
          setHasStartDate(true);
          setStartDate(discount.startsAt);
        }
        if (discount.endsAt) {
          setHasEndDate(true);
          setEndDate(discount.endsAt);
        }
        
        setStatus(discount.status || 'active');
      } else {
        console.error('Failed to load discount');
        toast.error('Failed to load discount');
      }
    } catch (error) {
      console.error('Error loading discount:', error);
      toast.error('Failed to load discount');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!code.trim()) {
      toast.error('Please enter a discount code');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Please enter a discount name');
      return;
    }
    
    if (type === 'percentage' || type === 'fixed_amount') {
      if (!value || parseFloat(value) <= 0) {
        toast.error('Please enter a valid discount value');
        return;
      }
      
      if (type === 'percentage' && parseFloat(value) > 100) {
        toast.error('Percentage discount cannot be more than 100%');
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        type,
        value: type === 'percentage' || type === 'fixed_amount' ? parseFloat(value) : 0,
        status,
        appliesTo,
        productIds,
        categoryIds,
        customerIds,
        customerGroups,
        usageLimitPerCustomer: onePerCustomer ? 1 : undefined
      };
      
      // Add buy X get Y values
      if (type === 'buy_x_get_y') {
        payload.buyXGetY = {
          buyQuantity: parseInt(buyXValue),
          getQuantity: parseInt(getYValue)
        };
      }
      
      // Add minimum requirements
      if (minimumRequirements === 'amount' && minimumAmount) {
        payload.minimumRequirement = {
          type: 'minimum_amount',
          value: parseFloat(minimumAmount)
        };
      } else if (minimumRequirements === 'quantity' && minimumQuantity) {
        payload.minimumRequirement = {
          type: 'minimum_quantity',
          value: parseInt(minimumQuantity)
        };
      } else {
        payload.minimumRequirement = {
          type: 'none'
        };
      }
      
      // Add usage limit
      if (usageLimit) {
        payload.usageLimit = parseInt(usageLimit);
      }
      
      // Add dates
      if (hasStartDate && startDate) {
        payload.startsAt = new Date(startDate).toISOString();
      }
      if (hasEndDate && endDate) {
        payload.endsAt = new Date(endDate).toISOString();
      }
      
      const url = isEdit 
        ? `/api/stores/${store.subdomain}/discounts`
        : `/api/stores/${store.subdomain}/discounts`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { discountId, ...payload } : payload),
      });

      if (response.ok) {
        toast.success(isEdit ? 'Discount updated!' : 'Discount created!');
        onSave();
      } else {
        const error = await response.text();
        toast.error(`Failed to save discount: ${error}`);
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error('Failed to save discount');
    } finally {
      setIsSaving(false);
    }
  };

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(code);
  };

  if (isLoading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-96">
        <div className="nuvi-btn-loading nuvi-mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* AI Banner */}
      {showAIBanner && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">AI-Generated Discount</h3>
                <p className="text-sm text-purple-700">
                  AI has created this discount code. Review the details and save to activate.
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

      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {isEdit ? 'Edit Discount' : 'Create Discount'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {isEdit 
                ? 'Update discount details' 
                : showAIBanner
                  ? 'AI has prepared your discount. Review and customize as needed.'
                  : 'Create a new discount code for your customers'}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Discount')}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-lg">
          {/* Basic Information */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Discount Information</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Discount Code</label>
                <div className="nuvi-flex nuvi-gap-sm">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g., SUMMER2024"
                    className="nuvi-input nuvi-flex-1 nuvi-font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateDiscountCode}
                    className="nuvi-btn nuvi-btn-secondary"
                  >
                    Generate
                  </button>
                </div>
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                  Customers will enter this code at checkout
                </p>
              </div>
              
              <div>
                <label className="nuvi-label">Internal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer Sale 2024"
                  className="nuvi-input"
                  required
                />
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                  For your reference only (not visible to customers)
                </p>
              </div>

              <div>
                <label className="nuvi-label">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional notes about this discount"
                  className="nuvi-textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Discount Type</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-space-y-sm">
                <label className="nuvi-flex nuvi-items-start nuvi-gap-sm nuvi-cursor-pointer">
                  <input
                    type="radio"
                    value="percentage"
                    checked={type === 'percentage'}
                    onChange={(e) => setType('percentage')}
                    className="nuvi-radio nuvi-mt-1"
                  />
                  <div className="nuvi-flex-1">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Percent className="h-4 w-4" />
                      <span className="nuvi-font-medium">Percentage</span>
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Discount by a percentage of the order total
                    </p>
                  </div>
                </label>
                
                <label className="nuvi-flex nuvi-items-start nuvi-gap-sm nuvi-cursor-pointer">
                  <input
                    type="radio"
                    value="fixed_amount"
                    checked={type === 'fixed_amount'}
                    onChange={(e) => setType('fixed_amount')}
                    className="nuvi-radio nuvi-mt-1"
                  />
                  <div className="nuvi-flex-1">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <DollarSign className="h-4 w-4" />
                      <span className="nuvi-font-medium">Fixed Amount</span>
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Discount by a fixed dollar amount
                    </p>
                  </div>
                </label>
                
                <label className="nuvi-flex nuvi-items-start nuvi-gap-sm nuvi-cursor-pointer">
                  <input
                    type="radio"
                    value="free_shipping"
                    checked={type === 'free_shipping'}
                    onChange={(e) => setType('free_shipping')}
                    className="nuvi-radio nuvi-mt-1"
                  />
                  <div className="nuvi-flex-1">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Truck className="h-4 w-4" />
                      <span className="nuvi-font-medium">Free Shipping</span>
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Remove shipping costs from the order
                    </p>
                  </div>
                </label>
                
                <label className="nuvi-flex nuvi-items-start nuvi-gap-sm nuvi-cursor-pointer">
                  <input
                    type="radio"
                    value="buy_x_get_y"
                    checked={type === 'buy_x_get_y'}
                    onChange={(e) => setType('buy_x_get_y')}
                    className="nuvi-radio nuvi-mt-1"
                  />
                  <div className="nuvi-flex-1">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <Gift className="h-4 w-4" />
                      <span className="nuvi-font-medium">Buy X Get Y</span>
                    </div>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Customer buys X quantity and gets Y for free
                    </p>
                  </div>
                </label>
              </div>

              {/* Value Input */}
              {(type === 'percentage' || type === 'fixed_amount') && (
                <div>
                  <label className="nuvi-label">
                    {type === 'percentage' ? 'Percentage Value' : 'Discount Amount'}
                  </label>
                  <div className="nuvi-relative">
                    {type === 'percentage' ? (
                      <Percent className="nuvi-absolute nuvi-right-3 nuvi-top-3 h-4 w-4 nuvi-text-muted" />
                    ) : (
                      <span className="nuvi-absolute nuvi-left-3 nuvi-top-3 nuvi-text-muted">$</span>
                    )}
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={type === 'percentage' ? "10" : "5.00"}
                      className={`nuvi-input ${type === 'fixed_amount' ? 'nuvi-pl-8' : 'nuvi-pr-8'}`}
                      step={type === 'percentage' ? "1" : "0.01"}
                      min="0"
                      max={type === 'percentage' ? "100" : undefined}
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Buy X Get Y Options */}
              {type === 'buy_x_get_y' && (
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div>
                    <label className="nuvi-label">Customer Buys</label>
                    <input
                      type="number"
                      value={buyXValue}
                      onChange={(e) => setBuyXValue(e.target.value)}
                      placeholder="1"
                      className="nuvi-input"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="nuvi-label">Customer Gets</label>
                    <input
                      type="number"
                      value={getYValue}
                      onChange={(e) => setGetYValue(e.target.value)}
                      placeholder="1"
                      className="nuvi-input"
                      min="1"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Minimum Requirements */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Minimum Requirements</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-space-y-sm">
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-cursor-pointer">
                  <input
                    type="radio"
                    value="none"
                    checked={minimumRequirements === 'none'}
                    onChange={(e) => setMinimumRequirements('none')}
                    className="nuvi-radio"
                  />
                  <span>No minimum requirements</span>
                </label>
                
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-cursor-pointer">
                  <input
                    type="radio"
                    value="amount"
                    checked={minimumRequirements === 'amount'}
                    onChange={(e) => setMinimumRequirements('amount')}
                    className="nuvi-radio"
                  />
                  <span>Minimum purchase amount</span>
                </label>
                
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-cursor-pointer">
                  <input
                    type="radio"
                    value="quantity"
                    checked={minimumRequirements === 'quantity'}
                    onChange={(e) => setMinimumRequirements('quantity')}
                    className="nuvi-radio"
                  />
                  <span>Minimum quantity of items</span>
                </label>
              </div>

              {minimumRequirements === 'amount' && (
                <div>
                  <label className="nuvi-label">Minimum Amount</label>
                  <div className="nuvi-relative">
                    <span className="nuvi-absolute nuvi-left-3 nuvi-top-3 nuvi-text-muted">$</span>
                    <input
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => setMinimumAmount(e.target.value)}
                      placeholder="50.00"
                      className="nuvi-input nuvi-pl-8"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              )}
              
              {minimumRequirements === 'quantity' && (
                <div>
                  <label className="nuvi-label">Minimum Quantity</label>
                  <input
                    type="number"
                    value={minimumQuantity}
                    onChange={(e) => setMinimumQuantity(e.target.value)}
                    placeholder="3"
                    className="nuvi-input"
                    min="1"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* Status */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Status</h3>
            </div>
            <div className="nuvi-card-content">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="nuvi-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                {status === 'active' ? 'Customers can use this discount' : 'Discount is not available to customers'}
              </p>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Usage Limits</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Total usage limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Leave blank for unlimited"
                  className="nuvi-input"
                  min="1"
                />
              </div>

              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  checked={onePerCustomer}
                  onChange={(e) => setOnePerCustomer(e.target.checked)}
                  className="nuvi-checkbox"
                />
                <div>
                  <span className="nuvi-font-medium">Limit to one use per customer</span>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    A customer can only use this discount once
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Active Dates */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Active Dates</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  checked={hasStartDate}
                  onChange={(e) => setHasStartDate(e.target.checked)}
                  className="nuvi-checkbox"
                />
                <span>Set start date</span>
              </label>
              
              {hasStartDate && (
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="nuvi-input"
                  required
                />
              )}

              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={(e) => setHasEndDate(e.target.checked)}
                  className="nuvi-checkbox"
                />
                <span>Set end date</span>
              </label>
              
              {hasEndDate && (
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="nuvi-input"
                  required
                />
              )}
            </div>
          </div>

          {/* Applies To */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Applies To</h3>
            </div>
            <div className="nuvi-card-content">
              <select
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value as 'all' | 'specific_products' | 'specific_categories' | 'specific_customers')}
                className="nuvi-select"
              >
                <option value="all">All products</option>
                <option value="specific_products">Specific products</option>
                <option value="specific_categories">Specific categories</option>
                <option value="specific_customers">Specific customers</option>
              </select>
              
              {appliesTo !== 'all' && (
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                  {appliesTo === 'specific_products' 
                    ? 'Product selection will be available in the next update'
                    : appliesTo === 'specific_categories'
                    ? 'Category selection will be available in the next update'
                    : 'Customer selection will be available in the next update'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}