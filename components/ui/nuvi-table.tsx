'use client';

import React, { useState, ReactNode } from 'react';
import { 
  Search, Filter, Download, Plus, Edit, Trash2, Eye, EyeOff,
  MoreHorizontal, ChevronLeft, ChevronRight, SortAsc, Package
} from 'lucide-react';

export interface NuviTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: any) => ReactNode;
}

export interface NuviTableProps {
  columns: NuviTableColumn[];
  data: any[];
  selectable?: boolean;
  striped?: boolean;
  compact?: boolean;
  
  // Selection
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  
  // Actions
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  customActions?: (item: any) => ReactNode;
  
  // Bulk Actions
  bulkActions?: Array<{
    label: string;
    icon?: any;
    onClick: (selectedRows: string[]) => void;
    destructive?: boolean;
  }>;
  
  // Search & Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  
  filters?: ReactNode;
  
  // Pagination
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  // Empty State
  emptyMessage?: string;
  
  // Loading
  loading?: boolean;
}

export function NuviTable({
  columns,
  data,
  selectable = false,
  striped = false,
  compact = true,
  selectedRows = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  customActions,
  bulkActions = [],
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  filters,
  totalItems,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  emptyMessage = "No data found",
  loading = false
}: NuviTableProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  
  const handleSelectAll = () => {
    if (selectAll) {
      onSelectionChange?.([]);
      setSelectAll(false);
    } else {
      const allIds = data.map(item => item.id || item._id || data.indexOf(item).toString());
      onSelectionChange?.(allIds);
      setSelectAll(true);
    }
  };
  
  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      onSelectionChange?.(selectedRows.filter(rowId => rowId !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedRows, id];
      onSelectionChange?.(newSelected);
      if (newSelected.length === data.length) {
        setSelectAll(true);
      }
    }
  };
  
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };
  
  const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : 1;
  const showPagination = totalItems && totalItems > itemsPerPage;
  
  // Calculate page range for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  
  return (
    <div>
      {/* Header with Search and Actions */}
      {(searchable || filters || bulkActions.length > 0) && (
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {searchable && (
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9CA3AF' 
                }} />
                <input 
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{
                    padding: '6px 8px 6px 32px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '13px',
                    width: '200px'
                  }}
                />
              </div>
            )}
            {filters}
          </div>
          
          {/* Primary Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="nuvi-btn nuvi-btn-xs nuvi-btn-secondary">
              <Download size={12} style={{ marginRight: '4px' }} />
              Export
            </button>
            <button className="nuvi-btn nuvi-btn-xs nuvi-btn-primary">
              <Plus size={12} style={{ marginRight: '4px' }} />
              Add New
            </button>
          </div>
        </div>
      )}
      
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && bulkActions.length > 0 && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#E0F2FE', 
          borderRadius: '6px', 
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #BAE6FD'
        }}>
          <span style={{ fontSize: '13px', color: '#075985', fontWeight: '500' }}>
            {selectedRows.length} items selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {bulkActions.map((action, idx) => (
              <button 
                key={idx}
                onClick={() => action.onClick(selectedRows)}
                className={`nuvi-btn nuvi-btn-xs ${action.destructive ? 'nuvi-btn-destructive' : 'nuvi-btn-secondary'}`}
              >
                {action.icon && <action.icon size={12} style={{ marginRight: '4px' }} />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Table */}
      <div style={{ 
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxSizing: 'border-box'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          tableLayout: 'fixed',
          backgroundColor: 'white',
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#111827'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: 'white',
              borderBottom: '1px solid #E5E7EB',
              boxSizing: 'border-box'
            }}>
              {selectable && (
                <th style={{ 
                  width: '40px', 
                  padding: '10px 12px',
                  textAlign: 'left',
                  backgroundColor: 'white',
                  borderBottom: 'none',
                  verticalAlign: 'middle',
                  boxSizing: 'border-box'
                }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    style={{ margin: 0, verticalAlign: 'middle' }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th 
                  key={column.key}
                  style={{ 
                    textAlign: column.align || 'left', 
                    padding: '10px 12px', 
                    fontWeight: '600',
                    color: '#9CA3AF',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    lineHeight: '1.5',
                    width: column.width,
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    borderBottom: 'none',
                    verticalAlign: 'middle',
                    boxSizing: 'border-box'
                  }}
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete || onView || customActions) && (
                <th style={{ 
                  textAlign: 'right', 
                  padding: '10px 12px', 
                  fontWeight: '600',
                  color: '#9CA3AF',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  lineHeight: '1.5',
                  backgroundColor: 'white',
                  borderBottom: 'none',
                  verticalAlign: 'middle',
                  boxSizing: 'border-box'
                }}>
                  ACTIONS
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{ color: '#6B7280' }}>Loading...</div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{ color: '#6B7280' }}>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => {
                const itemId = item.id || item._id || rowIndex.toString();
                const isSelected = selectedRows.includes(itemId);
                
                return (
                  <tr 
                    key={itemId}
                    style={{ 
                      backgroundColor: isSelected ? '#F0F9FF' : (striped && rowIndex % 2 === 1) ? '#F9FAFB' : 'white',
                      borderBottom: rowIndex === data.length - 1 ? 'none' : '1px solid #F3F4F6',
                      boxSizing: 'border-box'
                    }}
                  >
                    {selectable && (
                      <td style={{ 
                        padding: '12px',
                        verticalAlign: 'middle',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: '#111827',
                        backgroundColor: 'inherit',
                        boxSizing: 'border-box'
                      }}>
                        <input 
                          type="checkbox"
                          className="nuvi-checkbox-custom" 
                          checked={isSelected}
                          onChange={() => handleSelectRow(itemId)}
                          style={{ margin: 0, verticalAlign: 'middle' }}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td 
                        key={column.key}
                        style={{ 
                          padding: '12px',
                          textAlign: column.align || 'left',
                          verticalAlign: 'middle',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          color: '#111827',
                          backgroundColor: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView || customActions) && (
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right',
                        verticalAlign: 'middle',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: '#111827',
                        backgroundColor: 'inherit',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {customActions ? (
                            customActions(item)
                          ) : (
                            <>
                              {onView && (
                                <button 
                                  onClick={() => onView(item)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              {onEdit && (
                                <button 
                                  onClick={() => onEdit(item)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {onDelete && (
                                <button 
                                  onClick={() => onDelete(item)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                                    e.currentTarget.style.color = '#DC2626';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6B7280';
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {showPagination && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px'
          }}>
            <span style={{ color: '#6B7280' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" 
                disabled={currentPage === 1}
                onClick={() => onPageChange?.(currentPage - 1)}
              >
                <ChevronLeft size={14} />
              </button>
              
              {currentPage > 3 && (
                <>
                  <button 
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                    onClick={() => onPageChange?.(1)}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span style={{ padding: '0 8px' }}>...</span>}
                </>
              )}
              
              {getPageNumbers().map(page => (
                <button 
                  key={page}
                  className={`nuvi-btn nuvi-btn-ghost nuvi-btn-xs ${page === currentPage ? 'nuvi-btn-active' : ''}`}
                  onClick={() => onPageChange?.(page)}
                >
                  {page}
                </button>
              ))}
              
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span style={{ padding: '0 8px' }}>...</span>}
                  <button 
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                    onClick={() => onPageChange?.(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange?.(currentPage + 1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}