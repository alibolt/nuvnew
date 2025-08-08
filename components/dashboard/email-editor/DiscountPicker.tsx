'use client';

import { useState, useEffect } from 'react';
import { Search, Tag, Percent, Calendar, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Discount {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minimumPurchase?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

interface DiscountPickerProps {
  store: any;
  onSelectDiscount: (discount: Discount) => void;
  selectedDiscountId?: string;
}

export function DiscountPicker({ store, onSelectDiscount, selectedDiscountId }: DiscountPickerProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, [store.subdomain]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/discounts`);
      if (response.ok) {
        const data = await response.json();
        // Filter only active discounts
        const activeDiscounts = (data.discounts || []).filter((d: Discount) => d.isActive);
        setDiscounts(activeDiscounts);
      } else {
        console.error('Failed to fetch discounts');
        setDiscounts([]);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discounts');
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscounts = discounts.filter(discount =>
    discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discount.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDiscountDisplay = (discount: Discount) => {
    if (discount.discountType === 'percentage') {
      return `${discount.discountValue}% OFF`;
    } else if (discount.discountType === 'fixed') {
      return `$${discount.discountValue} OFF`;
    } else {
      return 'FREE SHIPPING';
    }
  };

  const getDiscountBadgeColor = (type: string) => {
    switch(type) {
      case 'percentage': return 'bg-green-100 text-green-800';
      case 'fixed': return 'bg-blue-100 text-blue-800';
      case 'free_shipping': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedDiscount = discounts.find(d => d.id === selectedDiscountId);

  return (
    <div className="relative">
      {/* Selected Discount Display */}
      {selectedDiscount ? (
        <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">{selectedDiscount.code}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDiscountBadgeColor(selectedDiscount.discountType)}`}>
                  {getDiscountDisplay(selectedDiscount)}
                </span>
              </div>
              {selectedDiscount.description && (
                <p className="text-sm text-gray-600 mb-2">{selectedDiscount.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {selectedDiscount.minimumPurchase && (
                  <span>Min. purchase: ${selectedDiscount.minimumPurchase}</span>
                )}
                {selectedDiscount.usageLimit && (
                  <span>Uses: {selectedDiscount.usedCount}/{selectedDiscount.usageLimit}</span>
                )}
                {selectedDiscount.expiresAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expires: {new Date(selectedDiscount.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowPicker(true)}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary hover:bg-gray-50 transition-all"
        >
          <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Select Discount Code</p>
          <p className="text-xs text-gray-500 mt-1">Choose from your active discounts</p>
        </button>
      )}

      {/* Discount Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Select Discount Code</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Discount List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredDiscounts.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No discounts found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery ? 'Try a different search' : 'Create discounts in the Discounts section'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredDiscounts.map((discount) => (
                    <div
                      key={discount.id}
                      onClick={() => {
                        onSelectDiscount(discount);
                        setShowPicker(false);
                      }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedDiscountId === discount.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{discount.code}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDiscountBadgeColor(discount.discountType)}`}>
                              {getDiscountDisplay(discount)}
                            </span>
                          </div>
                          {discount.description && (
                            <p className="text-sm text-gray-600 mb-2">{discount.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {discount.minimumPurchase && discount.minimumPurchase > 0 && (
                              <span>Min: ${discount.minimumPurchase}</span>
                            )}
                            {discount.usageLimit && (
                              <span>
                                {discount.usageLimit - discount.usedCount} uses left
                              </span>
                            )}
                            {discount.expiresAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(discount.expiresAt) < new Date() ? (
                                  <span className="text-red-600">Expired</span>
                                ) : (
                                  `Expires ${new Date(discount.expiresAt).toLocaleDateString()}`
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedDiscountId === discount.id && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowPicker(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}