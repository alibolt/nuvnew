'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  actions?: (item: any) => React.ReactNode;
}

export function DataTable({
  columns,
  data,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  pagination,
  emptyMessage = 'No data found',
  actions
}: DataTableProps) {
  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      onSelectionChange?.([]);
    } else {
      const allIds = data.map(item => item.id || item._id);
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      onSelectionChange?.(selectedRows.filter(rowId => rowId !== id));
    } else {
      onSelectionChange?.([...selectedRows, id]);
    }
  };

  const handleSort = (column: string) => {
    if (onSort) {
      const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column, newDirection);
    }
  };

  if (loading) {
    return (
      <div className="nuvi-card">
        <div className="nuvi-p-8 nuvi-text-center nuvi-text-secondary">
          Loading...
        </div>
      </div>
    );
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div className="nuvi-card nuvi-overflow-hidden">
      <div className="nuvi-overflow-x-auto">
        <table className="nuvi-w-full">
          <thead className="nuvi-bg-muted nuvi-border-b">
            <tr>
              {selectable && (
                <th className="nuvi-px-4 nuvi-py-3 nuvi-text-left nuvi-w-12">
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
                  className={`nuvi-px-4 nuvi-py-3 nuvi-text-left nuvi-font-medium nuvi-text-sm ${
                    column.sortable ? 'nuvi-cursor-pointer hover:nuvi-bg-muted-hover' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-1">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="nuvi-w-4 nuvi-h-4" /> : 
                        <ChevronDown className="nuvi-w-4 nuvi-h-4" />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="nuvi-px-4 nuvi-py-3 nuvi-text-right nuvi-font-medium nuvi-text-sm">
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
                const id = item.id || item._id || index.toString();
                const isSelected = selectedRows.includes(id);

                return (
                  <tr
                    key={id}
                    className={`${
                      isSelected ? 'nuvi-bg-primary-50' : ''
                    } hover:nuvi-bg-muted-hover nuvi-transition-colors`}
                  >
                    {selectable && (
                      <td className="nuvi-px-4 nuvi-py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          className="nuvi-checkbox"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="nuvi-px-4 nuvi-py-3 nuvi-text-sm">
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
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="nuvi-flex nuvi-items-center nuvi-gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
            >
              <ChevronLeft className="nuvi-w-4 nuvi-h-4" />
            </button>
            <span className="nuvi-text-sm">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
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