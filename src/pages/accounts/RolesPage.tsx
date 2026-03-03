/**
 * Roles Management Page
 * Complete CRUD interface for roles with permissions management
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { roleApi } from '../../services/accounts.service';
import type { RoleFilters, RoleListItem } from '../../types/accounts.types';
import { RoleForm } from './components/RoleForm';

const RolesPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<RoleFilters>({ page: 1, page_size: 20 });
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch roles list
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roles', filters],
    queryFn: () => roleApi.list(filters),
  });

  // Fetch selected role details
  const { data: selectedRole } = useQuery({
    queryKey: ['role', selectedRoleId],
    queryFn: () => selectedRoleId ? roleApi.get(selectedRoleId) : null,
    enabled: !!selectedRoleId,
  });

  // Define table columns
  const columns: Column<RoleListItem>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (role) => (
        <code className="px-2 py-1 bg-muted rounded text-sm font-medium">
          {role.code}
        </code>
      ),
    },
    {
      key: 'name',
      label: 'Role Name',
      sortable: true,
      render: (role) => (
        <p className="font-medium">{role.name}</p>
      ),
    },
    {
      key: 'college_name',
      label: 'College',
      render: (role) => (
        <span className="text-sm">{role.college_name}</span>
      ),
    },
    {
      key: 'display_order',
      label: 'Display Order',
      render: (role) => (
        <span className="text-sm">{role.display_order}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (role) => (
        <Badge variant={role.is_active ? 'success' : 'destructive'}>
          {role.is_active ? 'Active' : 'Inactive'}
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

  const handleRowClick = (role: RoleListItem) => {
    setSelectedRoleId(role.id);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoleId(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedRoleId(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    if (selectedRoleId) {
      queryClient.invalidateQueries({ queryKey: ['role', selectedRoleId] });
    }
    handleCloseSidebar();
  };

  const handleSubmit = async (formData: any) => {
    if (sidebarMode === 'create') {
      await roleApi.create(formData);
    } else if (selectedRole) {
      await roleApi.update(selectedRole.id, formData);
    }
  };

  return (
    <div className="p-6">
      <DataTable
        title="Roles & Permissions"
        description="Manage roles and their permissions in the system"
        data={data ?? null}
        columns={columns}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : error ? String(error) : null}
        onRefresh={refetch}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search by role name or code..."
        addButtonLabel="Add Role"
      />

      {/* Detail/Create/Edit Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'Add New Role'
            : sidebarMode === 'edit'
              ? 'Edit Role'
              : selectedRole?.name || 'Role Details'
        }
        mode={sidebarMode}
        width="xl"
      >
        {sidebarMode === 'create' && (
          <RoleForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'edit' && selectedRole && (
          <RoleForm
            mode="edit"
            role={selectedRole}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'view' && selectedRole && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Edit Role
              </button>
            </div>

            {/* Role Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Code</label>
                    <p className="font-medium">
                      <code className="px-2 py-1 bg-background rounded text-sm">{selectedRole.code}</code>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Display Order</label>
                    <p className="font-medium">{selectedRole.display_order}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground">Role Name</label>
                    <p className="font-medium text-lg">{selectedRole.name}</p>
                  </div>
                  {selectedRole.description && (
                    <div className="col-span-2">
                      <label className="text-sm text-muted-foreground">Description</label>
                      <p className="font-medium">{selectedRole.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-muted-foreground">College</label>
                    <p className="font-medium">{selectedRole.college_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <Badge variant={selectedRole.is_active ? 'success' : 'destructive'}>
                      {selectedRole.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Permissions</h3>
                {selectedRole.permissions && Object.keys(selectedRole.permissions).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedRole.permissions).map(([module, perms]: [string, any]) => (
                      <div key={module} className="bg-background p-3 rounded-md">
                        <h4 className="font-medium capitalize mb-2">{module}</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(perms).map(([action, enabled]: [string, any]) => (
                            enabled && (
                              <Badge key={action} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No permissions assigned</p>
                )}
              </div>

              {/* Audit Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p>{new Date(selectedRole.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Updated At</label>
                    <p>{new Date(selectedRole.updated_at).toLocaleString()}</p>
                  </div>
                  {selectedRole.created_by_name && (
                    <div>
                      <label className="text-xs text-muted-foreground">Created By</label>
                      <p>{selectedRole.created_by_name}</p>
                    </div>
                  )}
                  {selectedRole.updated_by_name && (
                    <div>
                      <label className="text-xs text-muted-foreground">Updated By</label>
                      <p>{selectedRole.updated_by_name}</p>
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

export default RolesPage;
