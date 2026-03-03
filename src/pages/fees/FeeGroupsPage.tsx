/**
 * Fee Groups Page
 */

import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeGroup, useUpdateFeeGroup, useDeleteFeeGroup } from '../../hooks/useFees';
import { useFeeGroupsSWR, invalidateFeeGroups } from '../../hooks/swr';
import type { FeeGroup, FeeGroupCreateInput } from '../../types/fees.types';
import { FeeGroupForm } from './forms/FeeGroupForm';
import { toast } from 'sonner';

const FeeGroupsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFeeGroup, setSelectedFeeGroup] = useState<FeeGroup | null>(null);

  const { data, isLoading, error } = useFeeGroupsSWR(filters);
  const createFeeGroup = useCreateFeeGroup();
  const updateFeeGroup = useUpdateFeeGroup();
  const deleteFeeGroup = useDeleteFeeGroup();

  const columns: Column<FeeGroup>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    {
      key: 'is_active',
      label: 'Status',
      render: (feeGroup) => (
        <Badge variant={feeGroup.is_active ? 'success' : 'destructive'}>
          {feeGroup.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedFeeGroup(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (feeGroup: FeeGroup) => {
    setSelectedFeeGroup(feeGroup);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeGroupCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeGroup.mutateAsync(data);
        toast.success('Fee group created successfully');
      } else if (sidebarMode === 'edit' && selectedFeeGroup) {
        await updateFeeGroup.mutateAsync({ id: selectedFeeGroup.id, data });
        toast.success('Fee group updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedFeeGroup(null);
      await invalidateFeeGroups();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedFeeGroup) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFeeGroup) return;
    try {
      await deleteFeeGroup.mutateAsync(selectedFeeGroup.id);
      toast.success('Fee group deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedFeeGroup(null);
      await invalidateFeeGroups();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee group');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedFeeGroup(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Groups List"
        description="View and manage all fee groups"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeGroups()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee groups..."
        addButtonLabel="Add Fee Group"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Group' : selectedFeeGroup?.name || 'Fee Group'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedFeeGroup ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="mt-1 text-lg font-semibold">{selectedFeeGroup.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Code</h3>
              <p className="mt-1 text-lg">{selectedFeeGroup.code}</p>
            </div>
            {selectedFeeGroup.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{selectedFeeGroup.description}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedFeeGroup.is_active ? 'success' : 'destructive'}>
                  {selectedFeeGroup.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeGroupForm
            feeGroup={sidebarMode === 'edit' ? selectedFeeGroup : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Group"
        description="Are you sure you want to delete this fee group? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeGroup.isPending}
      />
    </div >
  );
};

export default FeeGroupsPage;
