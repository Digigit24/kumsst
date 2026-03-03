/**
 * User Profiles Management Page
 * Displays raw API response data for user profiles
 */

import { useState } from 'react';
import { useUserProfiles } from '../../hooks/useAccounts';
import type { UserProfileFilters } from '../../types/accounts.types';

export const UserProfilesPage = () => {
  const [filters, setFilters] = useState<UserProfileFilters>({ page: 1, page_size: 20 });
  const { data, isLoading, error, refetch } = useUserProfiles(filters);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">User Profiles Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Raw API Response Display - Accounts Module
        </p>
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
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page Size</label>
            <select
              value={filters.page_size}
              onChange={(e) => setFilters({ ...filters, page_size: Number(e.target.value), page: 1 })}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Active Only</label>
            <select
              value={filters.is_active?.toString() || ''}
              onChange={(e) => setFilters({ ...filters, is_active: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined, page: 1 })}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading user profiles...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {(error as any) instanceof Error ? (error as any).message : String(error)}
        </div>
      )}

      {/* Data Display */}
      {data && (
        <>
          {/* Summary */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm">
              <strong>Total Count:</strong> {data.count} |{' '}
              <strong>Page:</strong> {filters.page} |{' '}
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
            <span className="text-sm">
              Page {filters.page || 1}
            </span>
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
};

export default UserProfilesPage;
