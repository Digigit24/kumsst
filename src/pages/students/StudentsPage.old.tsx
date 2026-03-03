/**
 * Students List Page
 * Displays all students from API
 */

import { useState } from 'react';
import { useStudents } from '../../hooks/useStudents';
import type { StudentFilters } from '../../types/students.types';

export const StudentsPage = () => {
  const [filters, setFilters] = useState<StudentFilters>({ page: 1, page_size: 20 });
  const { data, isLoading, error, refetch } = useStudents(filters);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Students</h1>
        <p className="text-gray-600">List of all students</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>

        <button
          onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Next Page
        </button>

        {filters.page && filters.page > 1 && (
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Previous Page
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-lg">Loading students...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Data Display - JSON */}
      {!isLoading && !error && data && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">API Response Metadata</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Count:</span> {data.count}</p>
              <p><span className="font-medium">Next:</span> {data.next || 'null'}</p>
              <p><span className="font-medium">Previous:</span> {data.previous || 'null'}</p>
              <p><span className="font-medium">Results Count:</span> {data.results.length}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Full API Response (JSON)</h2>
            </div>
            <pre className="p-4 overflow-auto max-h-[600px] text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
