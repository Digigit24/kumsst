/**
 * Categories Page
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCategoriesSWR } from '../../hooks/swr';
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '../../hooks/useStore';
import { CategoryForm } from './forms/CategoryForm';

const CategoriesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useCategoriesSWR(filters);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const columns: Column<any>[] = [
    {
      key: 'code',
      label: 'Code',
      render: (category) => (
        <span className="font-semibold text-primary">{category.code}</span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      render: (category) => category.name,
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      render: (category) => (
        <span className="text-muted-foreground">
          {category.description || 'No description'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (category) => (
        <Badge variant={category.is_active ? 'default' : 'secondary'}>
          {category.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'code',
      label: 'Code',
      type: 'text',
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedCategory(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (category: any) => {
    setSelectedCategory(category);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createCategory.mutateAsync(data);
        toast.success('Category created successfully');
      } else if (sidebarMode === 'edit' && selectedCategory) {
        await updateCategory.mutateAsync({ id: selectedCategory.id, data });
        toast.success('Category updated successfully');
      }
      setIsSidebarOpen(false);
      setTimeout(() => {
        setSelectedCategory(null);
        setSidebarMode('view');
      }, 300);
      refresh();
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory.mutateAsync(selectedCategory.id);
        toast.success('Category deleted successfully');
        setIsSidebarOpen(false);
        setTimeout(() => {
          setSelectedCategory(null);
          setSidebarMode('view');
        }, 300);
        refresh();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete category');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      setSelectedCategory(null);
      setSidebarMode('view');
    }, 300);
  };

  return (
    <div className="">
      <DataTable
        title="Categories"
        description="View and manage store categories"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search categories..."
        addButtonLabel="Add Category"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Category' : selectedCategory?.name || 'Category'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedCategory ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Code</h3>
              <p className="mt-1 text-lg font-semibold text-primary">
                {selectedCategory.code}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="mt-1 text-lg font-semibold">
                {selectedCategory.name}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCategory.description || 'No description'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
              <p className="mt-1">
                <Badge variant={selectedCategory.is_active ? 'default' : 'secondary'}>
                  {selectedCategory.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <CategoryForm
            category={sidebarMode === 'edit' ? selectedCategory : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>
    </div>
  );
};

export default CategoriesPage;
