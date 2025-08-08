'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  actions?: (item: any) => React.ReactNode;
  bulkActions?: React.ReactNode;
  striped?: boolean;
  compact?: boolean;
}

export function DataTable({
  columns,
  data,
  loading = false,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  emptyMessage = 'No data available',
  actions,
  bulkActions,
  striped = false,
  compact = false
}: DataTableProps) {
  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      onSelectionChange?.([]);
    } else {
      const allIds = data.map(item => item.id || item._id);
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectRow = (rowId: string) => {
    if (selectedRows.includes(rowId)) {
      onSelectionChange?.(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectionChange?.([...selectedRows, rowId]);
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="nuvi-inline nuvi-w-4 nuvi-h-4" /> : 
      <ChevronDown className="nuvi-inline nuvi-w-4 nuvi-h-4" />;
  };

  if (loading) {
    return (
      <div className="nuvi-card nuvi-p-8 nuvi-text-center nuvi-text-secondary">
        Loading...
      </div>
    );
  }

  return (
    <div className="nuvi-card nuvi-overflow-hidden">
      {selectedRows.length > 0 && bulkActions && (
        <div className="nuvi-p-4 nuvi-bg-primary-50 nuvi-border-b">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <span className="nuvi-text-sm nuvi-font-medium">
              {selectedRows.length} items selected
            </span>
            {bulkActions}
          </div>
        </div>
      )}

      <div className="nuvi-overflow-x-auto">
        <table className={`nuvi-w-full ${compact ? 'nuvi-text-sm' : ''}`}>
          <thead className="nuvi-bg-muted">
            <tr>
              {selectable && (
                <th className="nuvi-px-4 nuvi-py-3 nuvi-text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="nuvi-checkbox"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`nuvi-px-4 nuvi-py-3 nuvi-text-${column.align || 'left'} nuvi-font-medium nuvi-text-secondary ${
                    column.sortable ? 'nuvi-cursor-pointer hover:nuvi-text-primary' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  {column.header}
                  {column.sortable && renderSortIcon(column.key)}
                </th>
              ))}
              {actions && (
                <th className="nuvi-px-4 nuvi-py-3 nuvi-text-right nuvi-font-medium nuvi-text-secondary">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="nuvi-divide-y nuvi-divide-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="nuvi-px-4 nuvi-py-8 nuvi-text-center nuvi-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowId = item.id || item._id || index.toString();
                const isSelected = selectedRows.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`
                      ${striped && index % 2 === 1 ? 'nuvi-bg-muted/50' : ''}
                      ${isSelected ? 'nuvi-bg-primary-50' : ''}
                      hover:nuvi-bg-muted/30 nuvi-transition-colors
                    `}
                  >
                    {selectable && (
                      <td className="nuvi-px-4 nuvi-py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="nuvi-checkbox"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`nuvi-px-4 nuvi-py-3 nuvi-text-${column.align || 'left'}`}
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="nuvi-px-4 nuvi-py-3 nuvi-text-right">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="nuvi-px-4 nuvi-py-3 nuvi-border-t nuvi-flex nuvi-items-center nuvi-justify-between">
          <div className="nuvi-text-sm nuvi-text-secondary">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="nuvi-flex nuvi-items-center nuvi-gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
            >
              <ChevronLeft className="nuvi-w-4 nuvi-h-4" />
            </button>
            <span className="nuvi-text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
            >
              <ChevronRight className="nuvi-w-4 nuvi-h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}