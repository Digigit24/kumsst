/**
 * Departments Management Page
 * Complete CRUD interface for departments
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { departmentApi } from '../../services/accounts.service';
import type { DepartmentFilters, DepartmentListItem } from '../../types/accounts.types';
import { DepartmentForm } from './components/DepartmentForm';

const DepartmentsPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DepartmentFilters>({ page: 1, page_size: 20 });
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch departments list
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['departments', filters],
    queryFn: () => departmentApi.list(filters),
  });

  // Fetch selected department details
  const { data: selectedDept } = useQuery({
    queryKey: ['department', selectedDeptId],
    queryFn: () => selectedDeptId ? departmentApi.get(selectedDeptId) : null,
    enabled: !!selectedDeptId,
  });

  // Define table columns
  const columns: Column<DepartmentListItem>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (dept) => (
        <code className="px-2 py-1 bg-muted rounded text-sm font-medium">
          {dept.code}
        </code>
      ),
    },
    {
      key: 'name',
      label: 'Department Name',
      sortable: true,
      render: (dept) => (
        <div>
          <p className="font-medium">{dept.name}</p>
          {dept.short_name && (
            <p className="text-sm text-muted-foreground">{dept.short_name}</p>
          )}
        </div>
      ),
    },
    {
      key: 'college_name',
      label: 'College',
      render: (dept) => (
        <span className="text-sm">{dept.college_name}</span>
      ),
    },
    {
      key: 'hod_name',
      label: 'HOD',
      render: (dept) => (
        <span className="text-sm">{dept.hod_name || 'Not Assigned'}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (dept) => (
        <Badge variant={dept.is_active ? 'success' : 'destructive'}>
          {dept.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    {
      name: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleRowClick = (dept: DepartmentListItem) => {
    setSelectedDeptId(dept.id);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedDeptId(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedDeptId(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    if (selectedDeptId) {
      queryClient.invalidateQueries({ queryKey: ['department', selectedDeptId] });
    }
    handleCloseSidebar();
  };

  const handleSubmit = async (formData: any) => {
    if (sidebarMode === 'create') {
      await departmentApi.create(formData);
    } else if (selectedDept) {
      await departmentApi.update(selectedDept.id, formData);
    }
  };

  return (
    <div className="p-6">
      <DataTable
        title="Departments"
        description="Manage departments in the system"
        data={data ?? null}
        columns={columns}
        isLoading={isLoading}
        error={error ? error.message : null}
        onRefresh={refetch}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search by department name or code..."
        addButtonLabel="Add Department"
      />

      {/* Detail/Create/Edit Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'Add New Department'
            : sidebarMode === 'edit'
              ? 'Edit Department'
              : selectedDept?.name || 'Department Details'
        }
        mode={sidebarMode}
        width="xl"
      >
        {sidebarMode === 'create' && (
          <DepartmentForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'edit' && selectedDept && (
          <DepartmentForm
            mode="edit"
            department={selectedDept}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'view' && selectedDept && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Edit Department
              </button>
            </div>

            {/* Department Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Code</label>
                    <p className="font-medium">
                      <code className="px-2 py-1 bg-background rounded text-sm">{selectedDept.code}</code>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Short Name</label>
                    <p className="font-medium">{selectedDept.short_name || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground">Department Name</label>
                    <p className="font-medium text-lg">{selectedDept.name}</p>
                  </div>
                  {selectedDept.description && (
                    <div className="col-span-2">
                      <label className="text-sm text-muted-foreground">Description</label>
                      <p className="font-medium">{selectedDept.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-muted-foreground">College</label>
                    <p className="font-medium">{selectedDept.college_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Display Order</label>
                    <p className="font-medium">{selectedDept.display_order}</p>
                  </div>
                </div>
              </div>

              {/* Management */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Management</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Head of Department (HOD)</span>
                    <span className="font-medium">{selectedDept.hod_name || 'Not Assigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={selectedDept.is_active ? 'success' : 'destructive'}>
                      {selectedDept.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Audit Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p>{new Date(selectedDept.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Updated At</label>
                    <p>{new Date(selectedDept.updated_at).toLocaleString()}</p>
                  </div>
                  {selectedDept.created_by_name && (
                    <div>
                      <label className="text-xs text-muted-foreground">Created By</label>
                      <p>{selectedDept.created_by_name}</p>
                    </div>
                  )}
                  {selectedDept.updated_by_name && (
                    <div>
                      <label className="text-xs text-muted-foreground">Updated By</label>
                      <p>{selectedDept.updated_by_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw API Data Removed */}
            </div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default DepartmentsPage;