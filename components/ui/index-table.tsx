'use client';

import React from 'react';

interface IndexTableProps {
  children: React.ReactNode;
  selectable?: boolean;
  itemCount: number;
  selectedItemsCount?: number;
  onSelectionChange?: (selectedItems: string[]) => void;
  hasMore?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function IndexTable({
  children,
  selectable = false,
  itemCount,
  selectedItemsCount = 0,
  onSelectionChange,
  hasMore = false,
  loading = false,
  emptyState
}: IndexTableProps) {
  if (loading && itemCount === 0) {
    return (
      <div className="nuvi-card nuvi-p-8 nuvi-text-center nuvi-text-secondary">
        Loading...
      </div>
    );
  }

  if (!loading && itemCount === 0 && emptyState) {
    return <div className="nuvi-card">{emptyState}</div>;
  }

  return (
    <div className="nuvi-card nuvi-overflow-hidden">
      <div className="nuvi-overflow-x-auto">
        <table className="nuvi-w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

interface RowProps {
  id: string;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Row({ id, selected = false, onClick, children }: RowProps) {
  return (
    <tr
      className={`
        ${selected ? 'nuvi-bg-primary-50' : ''}
        hover:nuvi-bg-muted/30 nuvi-transition-colors nuvi-cursor-pointer
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface CellProps {
  children: React.ReactNode;
  className?: string;
}

export function Cell({ children, className = '' }: CellProps) {
  return (
    <td className={`nuvi-px-4 nuvi-py-3 ${className}`}>
      {children}
    </td>
  );
}

IndexTable.Row = Row;
IndexTable.Cell = Cell;