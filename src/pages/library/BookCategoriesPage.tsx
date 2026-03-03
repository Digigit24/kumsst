/**
 * Book Categories Page
 * Manage book categories (Fiction, Non-Fiction, Reference, etc.)
 */

import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { invalidateBookCategories, useBookCategoriesSWR } from '../../hooks/swr';
import { useDebounce } from '../../hooks/useDebounce';
import { useBookCategoryDetail } from '../../hooks/useLibrary';
import type { BookCategoryFilters, BookCategoryListItem } from '../../types/library.types';
import { BookCategoryForm } from './forms/BookCategoryForm';

export const BookCategoriesPage = () => {
  const [filters, setFilters] = useState<BookCategoryFilters>({ page: 1, page_size: 20 });
  const debouncedFilters = useDebounce(filters, 500);
  const { data, isLoading, error } = useBookCategoriesSWR(debouncedFilters);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: selectedCategory } = useBookCategoryDetail(selectedCategoryId);

  // Define table columns
  const columns: Column<BookCategoryListItem>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      className: 'font-medium',
      render: (category) => (
        <code className="px-2 py-1 bg-muted rounded text-sm">
          {category.code}
        </code>
      ),
    },
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (category) => (
        <span className="font-medium">{category.name}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (category) => (
        <Badge variant={category.is_active ? 'success' : 'destructive'}>
          {category.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    {
      name: 'is_active',
      label: 'Active Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleRowClick = (category: BookCategoryListItem) => {
    setSelectedCategoryId(category.id);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategoryId(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleFormSuccess = () => {
    invalidateBookCategories();
    handleCloseSidebar();
  };

  return (
    <div className="p-6">
      <DataTable
        title="Book Categories"
        description="Manage book categories such as Fiction, Non-Fiction, Reference, Science, History, and other classifications"
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : error ? String(error) : null}
        onRefresh={() => invalidateBookCategories()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search categories by name..."
        addButtonLabel="Add Category"
      />

      {/* Detail/Create/Edit Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'Add New Category'
            : sidebarMode === 'edit'
              ? 'Edit Category'
              : selectedCategory?.name || 'Category Details'
        }
        mode={sidebarMode}
        width="lg"
      >
        {sidebarMode === 'create' && (
          <BookCategoryForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
          />
        )}

        {sidebarMode === 'edit' && selectedCategory && (
          <BookCategoryForm
            mode="edit"
            category={selectedCategory}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
          />
        )}

        {sidebarMode === 'view' && selectedCategory && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Edit Category
              </button>
            </div>

            {/* Category Details */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Code</label>
                    <p className="font-medium">
                      <code className="px-2 py-1 bg-background rounded text-sm">
                        {selectedCategory.code}
                      </code>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Category Name</label>
                    <p className="font-medium text-lg">{selectedCategory.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant={selectedCategory.is_active ? 'success' : 'destructive'}>
                        {selectedCategory.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  {selectedCategory.description && (
                    <div>
                      <label className="text-sm text-muted-foreground">Description</label>
                      <p className="text-sm">{selectedCategory.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p>{new Date(selectedCategory.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Updated At</label>
                    <p>{new Date(selectedCategory.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default BookCategoriesPage;
