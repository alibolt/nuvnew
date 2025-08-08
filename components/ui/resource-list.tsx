'use client';

import React from 'react';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

interface ResourceListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedItems: string[]) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: { label: string; value: string }[];
  filterControl?: React.ReactNode;
  hasMore?: boolean;
  onLoadMore?: () => void;
  bulkActions?: React.ReactNode;
  totalCount?: number;
  showHeader?: boolean;
  headerContent?: React.ReactNode;
}

export function ResourceList({
  items,
  renderItem,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  loading = false,
  emptyState,
  sortValue,
  onSortChange,
  sortOptions = [],
  filterControl,
  hasMore = false,
  onLoadMore,
  bulkActions,
  totalCount,
  showHeader = true,
  headerContent
}: ResourceListProps) {
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange?.([]);
    } else {
      const allIds = items.map((item) => item.id || item._id);
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange?.(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange?.([...selectedItems, itemId]);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="nuvi-card">
        <div className="nuvi-p-8 nuvi-text-center nuvi-text-secondary">
          Loading...
        </div>
      </div>
    );
  }

  if (!loading && items.length === 0 && emptyState) {
    return <div className="nuvi-card">{emptyState}</div>;
  }

  return (
    <div className="nuvi-card">
      {showHeader && (sortOptions.length > 0 || filterControl || headerContent) && (
        <div className="nuvi-p-4 nuvi-border-b nuvi-border-border">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-gap-4">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-4 nuvi-flex-1">
              {headerContent}
              {filterControl}
            </div>
            {sortOptions.length > 0 && (
              <select
                value={sortValue}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="nuvi-select nuvi-select-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {selectedItems.length > 0 && bulkActions && (
        <div className="nuvi-p-4 nuvi-bg-primary-50 nuvi-border-b nuvi-border-border">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <span className="nuvi-text-sm nuvi-font-medium">
              {selectedItems.length} selected
            </span>
            {bulkActions}
          </div>
        </div>
      )}

      {selectable && items.length > 0 && (
        <div className="nuvi-p-4 nuvi-border-b nuvi-border-border">
          <label className="nuvi-flex nuvi-items-center nuvi-gap-2">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length && items.length > 0}
              onChange={handleSelectAll}
              className="nuvi-checkbox"
            />
            <span className="nuvi-text-sm nuvi-font-medium">Select all</span>
          </label>
        </div>
      )}

      <div className="nuvi-divide-y nuvi-divide-border">
        {items.map((item, index) => (
          <div key={item.id || item._id || index} className="nuvi-resource-item">
            {selectable && (
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id || item._id)}
                onChange={() => handleSelectItem(item.id || item._id)}
                className="nuvi-checkbox nuvi-mr-4"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="nuvi-p-4 nuvi-text-center">
          <button
            onClick={onLoadMore}
            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
          >
            Load more
          </button>
        </div>
      )}

      {totalCount && totalCount > items.length && (
        <div className="nuvi-p-4 nuvi-text-center nuvi-text-sm nuvi-text-secondary">
          Showing {items.length} of {totalCount} items
        </div>
      )}
    </div>
  );
}