/**
 * Student Categories Page
 * Manage student categories (General, OBC, SC, ST, etc.)
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useState } from 'react';
import { CollegeField } from '../../components/common/CollegeField';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { invalidateStudentCategories, useStudentCategoriesSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useDeleteStudentCategory, useStudentCategory } from '../../hooks/useStudents';
import type { StudentCategoryFilters, StudentCategoryListItem } from '../../types/students.types';
import { getCurrentUserCollege, isSuperAdmin } from '../../utils/auth.utils';
import { StudentCategoryForm } from './components/StudentCategoryForm';

export const StudentCategoriesPage = () => {
  const { user } = useAuth();
  const isSuper = isSuperAdmin(user as any);
  const defaultCollege = getCurrentUserCollege(user as any);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    isSuper ? null : defaultCollege
  );
  const [filters, setFilters] = useState<StudentCategoryFilters>({
    page: 1,
    page_size: 20,
    ...(isSuper ? {} : defaultCollege ? { college: defaultCollege } : {}),
  });
  const { data, isLoading, error, refresh } = useStudentCategoriesSWR(filters);
  const deleteMutation = useDeleteStudentCategory();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<StudentCategoryListItem | null>(null);

  const { data: selectedCategory } = useStudentCategory(selectedCategoryId);
  const { data: collegesData } = useColleges({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const handleCollegeChange = (collegeId: number | string) => {
    const parsed = collegeId === '' ? null : Number(collegeId);
    const normalized = Number.isFinite(parsed) ? (parsed as number) : null;
    setSelectedCollegeId(normalized);
    setFilters(prev => {
      const next = { ...prev, page: 1 };
      if (normalized) {
        return { ...next, college: normalized };
      }
      const { college, ...rest } = next as any;
      return rest;
    });
  };

  // Define table columns
  const columns: Column<StudentCategoryListItem>[] = [
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
      key: 'college_name',
      label: 'College',
      render: (category) => (
        <span className="text-sm text-muted-foreground">{category.college_name}</span>
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
    ...(isSuper ? [{
      name: 'college',
      label: 'College',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Colleges' },
        ...(collegesData?.results.map(c => ({ value: c.id.toString(), label: c.name })) || [])
      ],
    }] : []),
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

  const handleRowClick = (category: StudentCategoryListItem) => {
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

  const handleDelete = (category: StudentCategoryListItem) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteMutation.mutate(categoryToDelete.id);
      invalidateStudentCategories();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedCategoryId(null);
  };

  const handleFormSuccess = () => {
    invalidateStudentCategories();
    handleCloseSidebar();
  };

  return (
    <div className="p-6">
      {isSuper && (
        <div className="mb-4">
          <CollegeField
            value={selectedCollegeId}
            onChange={handleCollegeChange}
            placeholder="Filter by college"
          />
        </div>
      )}
      <DataTable
        title="Student Categories"
        description="Manage student categories such as General, OBC, SC, ST, and other classifications"
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search categories by name or code..."
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
          <StudentCategoryForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
          />
        )}

        {sidebarMode === 'edit' && selectedCategory && (
          <StudentCategoryForm
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
                    <label className="text-sm text-muted-foreground">College</label>
                    <p className="font-medium">{selectedCategory.college_name}</p>
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
                  {selectedCategory.created_by && (
                    <div>
                      <label className="text-xs text-muted-foreground">Created By</label>
                      <p>{selectedCategory.created_by.first_name} {selectedCategory.created_by.last_name}</p>
                    </div>
                  )}
                  {selectedCategory.updated_by && (
                    <div>
                      <label className="text-xs text-muted-foreground">Updated By</label>
                      <p>{selectedCategory.updated_by.first_name} {selectedCategory.updated_by.last_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Student Category"
        description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};
