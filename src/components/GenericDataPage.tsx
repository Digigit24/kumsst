/**
 * Generic Data Page Component
 * Reusable component for displaying API data with filters and pagination
 */

import { ReactNode } from 'react';
import { PaginatedResponse } from '../types/core.types';

interface Filter {
  label: string;
  name: string;
  type: 'select' | 'text' | 'number';
  options?: { value: string | number; label: string }[];
}

interface GenericDataPageProps<T> {
  title: string;
  description: string;
  data: PaginatedResponse<T> | null;
  isLoading: boolean;
  error: string | null;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  refetch: () => void;
  filterConfig?: Filter[];
  children?: ReactNode;
}

export function GenericDataPage<T>({
  title,
  description,
  data,
  isLoading,
  error,
  filters,
  setFilters,
  refetch,
  filterConfig = [],
}: GenericDataPageProps<T>) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      {filterConfig.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-3">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Page Size - Always present */}
            <div>
              <label className="block text-sm font-medium mb-1">Page Size</label>
              <select
                value={filters.page_size || 20}
                onChange={(e) =>
                  setFilters({ ...filters, page_size: Number(e.target.value), page: 1 })
                }
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Dynamic filters */}
            {filterConfig.map((filter) => (
              <div key={filter.name}>
                <label className="block text-sm font-medium mb-1">{filter.label}</label>
                {filter.type === 'select' && filter.options ? (
                  <select
                    value={filters[filter.name]?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters({
                        ...filters,
                        [filter.name]:
                          value === '' ? undefined : value === 'true' ? true : value === 'false' ? false : value,
                        page: 1,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'text' ? (
                  <input
                    type="text"
                    value={filters[filter.name] || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, [filter.name]: e.target.value, page: 1 })
                    }
                    placeholder={`Search ${filter.label.toLowerCase()}...`}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                ) : (
                  <input
                    type="number"
                    value={filters[filter.name] || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, [filter.name]: e.target.value, page: 1 })
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Data Display */}
      {data && (
        <>
          {/* Summary */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm">
              <strong>Total Count:</strong> {data.count} |{' '}
              <strong>Page:</strong> {filters.page || 1} |{' '}
              <strong>Results on this page:</strong> {data.results.length}
            </p>
          </div>

          {/* Raw API Response */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-4">
            <h3 className="text-lg font-semibold mb-3">Raw API Response</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              disabled={!data.previous}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm">Page {filters.page || 1}</span>
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={!data.next}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
