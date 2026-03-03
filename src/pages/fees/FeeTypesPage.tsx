/**
 * Fee Types Page
 */

import { useState, useMemo } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeType, useUpdateFeeType, useDeleteFeeType } from '../../hooks/useFees';
import { useFeeTypesSWR, useFeeGroupsSWR, invalidateFeeTypes } from '../../hooks/swr';
import type { FeeType, FeeTypeCreateInput } from '../../types/fees.types';
import { FeeTypeForm } from './forms/FeeTypeForm';
import { toast } from 'sonner';

const FeeTypesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);

  const { data, isLoading, error } = useFeeTypesSWR(filters);
  const createFeeType = useCreateFeeType();
  const updateFeeType = useUpdateFeeType();
  const deleteFeeType = useDeleteFeeType();

  // Fetch fee groups to resolve names
  const { data: feeGroupsData } = useFeeGroupsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create lookup map for fee groups
  const feeGroupMap = useMemo(() => {
    if (!feeGroupsData?.results) return {};
    return feeGroupsData.results.reduce((acc, group) => {
      acc[group.id] = group.name;
      return acc;
    }, {} as Record<number, string>);
  }, [feeGroupsData]);

  const columns: Column<FeeType>[] = useMemo(() => [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'fee_group_name',
      label: 'Fee Group',
      sortable: false,
      render: (feeType) => feeType.fee_group_name || feeGroupMap[feeType.fee_group] || '-'
    },
    { key: 'code', label: 'Code', sortable: true },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (feeType) => feeType.description || '-'
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (feeType) => (
        <Badge variant={feeType.is_active ? 'success' : 'destructive'}>
          {feeType.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], [feeGroupMap]);

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
    setSelectedFeeType(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (feeType: FeeType) => {
    setSelectedFeeType(feeType);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeTypeCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeType.mutateAsync(data);
        toast.success('Fee type created successfully');
      } else if (sidebarMode === 'edit' && selectedFeeType) {
        await updateFeeType.mutateAsync({ id: selectedFeeType.id, data });
        toast.success('Fee type updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedFeeType(null);
      await invalidateFeeTypes();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
      console.error('Form submission error:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeeType) return;

    if (confirm('Are you sure you want to delete this fee type?')) {
      try {
        await deleteFeeType.mutateAsync(selectedFeeType.id);
        toast.success('Fee type deleted successfully');
        setIsSidebarOpen(false);
        setSelectedFeeType(null);
        await invalidateFeeTypes();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete fee type');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedFeeType(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Types List"
        description="View and manage all fee types"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeTypes()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee types..."
        addButtonLabel="Add Fee Type"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Type' : selectedFeeType?.name || 'Fee Type'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedFeeType ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="mt-1 text-lg font-semibold">{selectedFeeType.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fee Group</h3>
              <p className="mt-1 text-lg">{selectedFeeType.fee_group_name || feeGroupMap[selectedFeeType.fee_group] || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Code</h3>
              <p className="mt-1 text-lg">{selectedFeeType.code}</p>
            </div>
            {selectedFeeType.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{selectedFeeType.description}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedFeeType.is_active ? 'success' : 'destructive'}>
                  {selectedFeeType.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeTypeForm
            feeType={sidebarMode === 'edit' ? selectedFeeType : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>
    </div>
  );
};

export default FeeTypesPage;
