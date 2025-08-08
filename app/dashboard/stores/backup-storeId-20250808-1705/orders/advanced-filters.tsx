'use client';

import { useState } from 'react';
import { CalendarDays, Filter, X, Search } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export function AdvancedFilters({ onFiltersChange, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: ''
    },
    statusFilters: {
      order: [] as string[],
      financial: [] as string[],
      fulfillment: [] as string[]
    },
    amountRange: {
      min: '',
      max: ''
    },
    customerType: '',
    paymentMethod: '',
    shippingMethod: '',
    hasDiscount: '',
    tags: ''
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Count active filters
    let count = 0;
    if (newFilters.dateRange.start || newFilters.dateRange.end) count++;
    if (newFilters.statusFilters.order.length > 0) count++;
    if (newFilters.statusFilters.financial.length > 0) count++;
    if (newFilters.statusFilters.fulfillment.length > 0) count++;
    if (newFilters.amountRange.min || newFilters.amountRange.max) count++;
    if (newFilters.customerType) count++;
    if (newFilters.paymentMethod) count++;
    if (newFilters.shippingMethod) count++;
    if (newFilters.hasDiscount) count++;
    if (newFilters.tags) count++;
    
    setActiveFiltersCount(count);
  };

  const handleStatusChange = (type: 'order' | 'financial' | 'fulfillment', status: string) => {
    const newFilters = { ...filters };
    const statusArray = newFilters.statusFilters[type];
    
    if (statusArray.includes(status)) {
      newFilters.statusFilters[type] = statusArray.filter(s => s !== status);
    } else {
      newFilters.statusFilters[type] = [...statusArray, status];
    }
    
    updateFilters(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: { start: '', end: '' },
      statusFilters: { order: [], financial: [], fulfillment: [] },
      amountRange: { min: '', max: '' },
      customerType: '',
      paymentMethod: '',
      shippingMethod: '',
      hasDiscount: '',
      tags: ''
    };
    
    setFilters(resetFilters);
    setActiveFiltersCount(0);
    onReset();
  };

  const orderStatuses = [
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'archived', label: 'Archived' }
  ];

  const financialStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'authorized', label: 'Authorized' },
    { value: 'paid', label: 'Paid' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'voided', label: 'Voided' }
  ];

  const fulfillmentStatuses = [
    { value: 'unfulfilled', label: 'Unfulfilled' },
    { value: 'partial', label: 'Partially Fulfilled' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'restocked', label: 'Restocked' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filters Panel */}
          <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDays className="inline h-4 w-4 mr-1" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <div className="space-y-1">
                  {orderStatuses.map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statusFilters.order.includes(status.value)}
                        onChange={() => handleStatusChange('order', status.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Financial Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="space-y-1">
                  {financialStatuses.map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statusFilters.financial.includes(status.value)}
                        onChange={() => handleStatusChange('financial', status.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fulfillment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment Status</label>
                <div className="space-y-1">
                  {fulfillmentStatuses.map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statusFilters.fulfillment.includes(status.value)}
                        onChange={() => handleStatusChange('fulfillment', status.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Amount</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.amountRange.min}
                    onChange={(e) => updateFilters({
                      ...filters,
                      amountRange: { ...filters.amountRange, min: e.target.value }
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Min amount"
                  />
                  <input
                    type="number"
                    value={filters.amountRange.max}
                    onChange={(e) => updateFilters({
                      ...filters,
                      amountRange: { ...filters.amountRange, max: e.target.value }
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Max amount"
                  />
                </div>
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                <select
                  value={filters.customerType}
                  onChange={(e) => updateFilters({
                    ...filters,
                    customerType: e.target.value
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All customers</option>
                  <option value="new">New customers</option>
                  <option value="returning">Returning customers</option>
                  <option value="guest">Guest checkout</option>
                </select>
              </div>

              {/* Has Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Applied</label>
                <select
                  value={filters.hasDiscount}
                  onChange={(e) => updateFilters({
                    ...filters,
                    hasDiscount: e.target.value
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All orders</option>
                  <option value="yes">With discount</option>
                  <option value="no">Without discount</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => updateFilters({
                    ...filters,
                    tags: e.target.value
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Enter tags (comma separated)"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}