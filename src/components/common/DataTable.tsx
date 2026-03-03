/**
 * Universal DataTable Component
 * Modern, sleek table with search, filters, sorting, and pagination
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DEBOUNCE_DELAYS, useDebouncedCallback } from '@/hooks/useDebounce';
import { PaginatedResponse } from '@/types/core.types';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Database,
  Filter,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface FilterConfig {
  name: string;
  label: string;
  type: 'select' | 'text' | 'checkbox' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface DataTableProps<T> {
  title?: string;
  description?: string;
  data: PaginatedResponse<T> | null | undefined;
  columns: Column<T>[];
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  filters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number) => void;
  filterConfig?: FilterConfig[];
  searchPlaceholder?: string;
  addButtonLabel?: string;
  actions?: (item: T) => React.ReactNode;
  customActions?: React.ReactNode;
  hideToolbar?: boolean;
  searchDebounceDelay?: number;
  mobileCardRender?: (item: T) => React.ReactNode;
}

// Memoized table row component to prevent unnecessary re-renders
interface DataTableRowProps<T> {
  item: T;
  index: number;
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  hasActions: boolean;
  rowClassName?: (item: T) => string;
}

const DataTableRowComponent = <T,>({
  item,
  index,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  actions,
  hasActions,
  rowClassName,
}: DataTableRowProps<T>) => (
  <TableRow
    key={(item as any).id || index}
    onClick={() => onRowClick && onRowClick(item)}
    className={`${onRowClick ? 'cursor-pointer' : ''} group ${rowClassName ? rowClassName(item) : ''}`}
  >
    {columns.map((column) => (
      <TableCell key={column.key} className={column.className}>
        {column.render
          ? column.render(item)
          : (item as any)[column.key]?.toString() || '-'}
      </TableCell>
    ))}
    {hasActions && (
      <TableCell>
        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {actions && actions(item)}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              title="Edit"
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              title="Delete"
            >
              <span className="sr-only">Delete</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    )}
  </TableRow>
);

// Memoize the row component
const MemoizedDataTableRow = memo(DataTableRowComponent) as typeof DataTableRowComponent;

function DataTableInner<T>({
  title,
  description,
  data,
  columns,
  isLoading,
  error,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onRowClick,
  rowClassName,
  filters = {},
  onFiltersChange,
  onPageChange,
  filterConfig = [],
  searchPlaceholder = 'Search...',
  addButtonLabel = 'Add New',
  actions,
  customActions,
  hideToolbar = false,
  searchDebounceDelay,
  mobileCardRender,
}: DataTableProps<T>) {
  const location = useLocation();
  const isFinanceOrAccountant = location.pathname.includes('/finance') || location.pathname.includes('/accountant');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [filterResetKey, setFilterResetKey] = useState(0);

  // Sync local search with external filters
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  // Debounced search callback - uses centralized debounce hook
  const debouncedSearchChange = useDebouncedCallback(
    (searchValue: string) => {
      if (onFiltersChange) {
        onFiltersChange({
          ...filters,
          search: searchValue === '' ? undefined : searchValue,
          page: 1,
        });
      }
    },
    searchDebounceDelay || DEBOUNCE_DELAYS.SEARCH
  );

  // Trigger debounced search when local search changes
  useEffect(() => {
    if (localSearch !== (filters.search || '')) {
      debouncedSearchChange(localSearch);
    }
  }, [localSearch, debouncedSearchChange]);

  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  // Debounced filter change for text/date inputs
  const debouncedFilterChange = useDebouncedCallback(
    (name: string, value: any) => {
      if (onFiltersChange) {
        onFiltersChange({
          ...filters,
          [name]: value === '' ? undefined : value,
          page: 1,
        });
      }
    },
    DEBOUNCE_DELAYS.FILTER
  );

  // Immediate filter change for select/checkbox (discrete selections)
  const handleFilterChange = useCallback((name: string, value: any, debounce = false) => {
    if (debounce) {
      debouncedFilterChange(name, value);
    } else if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [name]: value === '' ? undefined : value,
        page: 1, // Reset to first page when filtering
      });
    }
  }, [debouncedFilterChange, filters, onFiltersChange]);

  // Local search change - updates immediately for responsive feel
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, page: newPage });
      return;
    }
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [filters, onFiltersChange, onPageChange]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, page_size: pageSize, page: 1 });
      return;
    }
    if (onPageChange) {
      onPageChange(1);
    }
  }, [filters, onFiltersChange, onPageChange]);

  const showHeader = Boolean(title || description || onAdd || customActions);

  // Calculate pagination info
  const totalPages = useMemo(() => {
    if (!data?.count) return 1;
    return Math.ceil(data.count / (filters.page_size || 20));
  }, [data?.count, filters.page_size]);

  const currentPage = filters.page || 1;

  // Generate page numbers to display — memoized to avoid recalculation on every render
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange({ page: 1, page_size: filters.page_size || 20 });
    }
    setFilterResetKey(prev => prev + 1);
  }, [filters.page_size, onFiltersChange]);

  const hasActiveFilters = Object.keys(filters).some(
    key => !['page', 'page_size'].includes(key) && filters[key]
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {data?.count !== undefined && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {data.count.toLocaleString()} {data.count === 1 ? 'record' : 'records'}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">

            {customActions}
            {onAdd && (
              <Button onClick={onAdd} className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                {addButtonLabel}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      {!hideToolbar && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 bg-background border-border/50 focus:border-primary/50 transition-all shadow-sm"
            />
            {localSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {filterConfig.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-10 transition-all ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50'}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-10 text-muted-foreground hover:text-destructive"
                title="Clear all filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && filterConfig.length > 0 && (
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 shadow-sm animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground/80">Filter Options</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                Reset all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filterConfig.map((filter) => (
              <div key={filter.name} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options ? (
                  <select
                    value={filters[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 transition-all"
                  >
                    <option value="">All</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'checkbox' ? (
                  <div className="flex items-center space-x-2 h-9">
                    <input
                      type="checkbox"
                      checked={filters[filter.name] || false}
                      onChange={(e) => handleFilterChange(filter.name, e.target.checked)}
                      className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/30 transition-all"
                    />
                    <span className="text-sm text-muted-foreground">Enable</span>
                  </div>
                ) : (
                  <Input
                    key={`${filter.name}-${filterResetKey}`}
                    type={filter.type}
                    defaultValue={filters[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value, true)}
                    placeholder={
                      filter.type === 'date'
                        ? undefined
                        : filter.placeholder || `Filter by ${filter.label.toLowerCase()}...`
                    }
                    className="h-9 border-border/50 focus:border-primary/50"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screen reader status announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading
          ? 'Loading data...'
          : error
            ? `Error: ${error}`
            : data?.results
              ? `Showing ${data.results.length} of ${data.count} results`
              : ''}
      </div>

      {/* Table Container */}
      <div className="border border-border/40 rounded-xl bg-card shadow-sm overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 bg-gradient-to-b from-muted/20 to-transparent">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Loading data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 text-center">
            <div className="inline-flex flex-col items-center gap-3 bg-destructive/5 text-destructive px-6 py-4 rounded-xl border border-destructive/20">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Error loading data</p>
                <p className="text-sm opacity-80 mt-1">{error}</p>
              </div>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try again
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data && data.results && data.results.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center" aria-hidden="true">
                <Database className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground/80">No data found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'There are no records to display'}
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && data && data.results && data.results.length > 0 && (
          <>
            {/* Desktop: Table view */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={column.className}
                      >
                        {column.sortable ? (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                          >
                            {column.label}
                            <span className={`transition-opacity ${sortColumn === column.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                              {sortColumn === column.key && sortDirection === 'desc' ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronUp className="h-3.5 w-3.5" />
                              )}
                            </span>
                          </button>
                        ) : (
                          column.label
                        )}
                      </TableHead>
                    ))}
                    {(onEdit || onDelete || actions) && (
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map((item, index) => (
                    <MemoizedDataTableRow
                      key={(item as any).id || index}
                      item={item}
                      index={index}
                      columns={columns}
                      onRowClick={onRowClick}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      actions={actions}
                      hasActions={Boolean(onEdit || onDelete || actions)}
                      rowClassName={rowClassName}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Card view */}
            <div className="md:hidden space-y-3 p-3">
              {data.results.map((item, index) => (
                mobileCardRender ? (
                  <div key={(item as any).id || index}>
                    {mobileCardRender(item)}
                  </div>
                ) : (
                  <div
                    key={(item as any).id || index}
                    className={`rounded-xl border border-border/50 bg-card p-4 shadow-sm ${onRowClick ? 'cursor-pointer active:bg-muted/50' : ''} ${rowClassName ? rowClassName(item) : ''}`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    <div className="space-y-2">
                      {columns.map((column) => (
                        <div key={column.key} className="flex items-start justify-between gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 min-w-[80px]">
                            {column.label}
                          </span>
                          <span className="text-sm font-medium text-right break-words min-w-0">
                            {column.render
                              ? column.render(item)
                              : (item as any)[column.key]?.toString() || '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                    {(onEdit || onDelete || actions) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                        {actions && actions(item)}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-h-[44px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1.5" />
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-[44px] text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border/40 bg-muted/20">
              {/* Left side - Page size selector */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline">Rows per page:</span>
                <select
                  value={filters.page_size || 20}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-9 rounded-lg border border-border/50 bg-background px-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-muted-foreground">
                  <span className="hidden sm:inline">Showing </span>
                  {Math.min((currentPage - 1) * (filters.page_size || 20) + 1, data.count || 0)}-
                  {Math.min(currentPage * (filters.page_size || 20), data.count || 0)}
                  <span className="hidden sm:inline"> of</span>
                  <span className="sm:hidden">/</span> {(data.count || 0).toLocaleString()}
                </span>
              </div>

              {/* Right side - Pagination controls */}
              <div className="flex items-center gap-1">
                {/* First page */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-8 sm:w-8 hidden sm:flex"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-8 sm:w-8"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!data.previous}
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 px-1">
                  {pageNumbers.map((page, i) =>
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        size="icon"
                        className={`h-10 w-10 sm:h-8 sm:w-8 text-sm font-medium ${currentPage === page
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-muted'
                          }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                {/* Next */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-8 sm:w-8"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!data.next}
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-8 sm:w-8 hidden sm:flex"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;
