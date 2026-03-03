/**
 * Fee Masters Page
 */

import { useState, useMemo } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeMaster, useUpdateFeeMaster, useDeleteFeeMaster } from '../../hooks/useFees';
import { useFeeMastersSWR, useFeeTypesSWR, invalidateFeeMasters } from '../../hooks/swr';
import { useProgramsSWR } from '../../hooks/useAcademicSWR';
import { useAcademicYears } from '../../hooks/useCore';
import type { FeeMaster, FeeMasterCreateInput } from '../../types/fees.types';
import { FeeMasterForm } from './forms';
import { toast } from 'sonner';

const FeeMastersPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFeeMaster, setSelectedFeeMaster] = useState<any | null>(null);

  // Fetch fee masters using SWR
  const { data, isLoading, error } = useFeeMastersSWR(filters);
  const createFeeMaster = useCreateFeeMaster();
  const updateFeeMaster = useUpdateFeeMaster();
  const deleteFeeMaster = useDeleteFeeMaster();

  // Fetch related data to resolve names - using SWR for instant cache display
  const { data: programsData } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: academicYearsData } = useAcademicYears({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: feeTypesData } = useFeeTypesSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create lookup maps
  const programMap = useMemo(() => {
    if (!programsData?.results) return {};
    return programsData.results.reduce((acc, program) => {
      acc[program.id] = program.name;
      return acc;
    }, {} as Record<number, string>);
  }, [programsData]);

  const academicYearMap = useMemo(() => {
    if (!academicYearsData?.results) return {};
    return academicYearsData.results.reduce((acc, year) => {
      acc[year.id] = year.year || `Year ${year.id}`;
      return acc;
    }, {} as Record<number, string>);
  }, [academicYearsData]);

  const feeTypeMap = useMemo(() => {
    if (!feeTypesData?.results) return {};
    return feeTypesData.results.reduce((acc, feeType) => {
      acc[feeType.id] = feeType.name;
      return acc;
    }, {} as Record<number, string>);
  }, [feeTypesData]);

  const columns: Column<FeeMaster>[] = useMemo(() => [
    {
      key: 'program_name',
      label: 'Program',
      sortable: false,
      render: (fee) => fee.program_name || programMap[fee.program] || '-'
    },
    {
      key: 'academic_year_name',
      label: 'Academic Year',
      sortable: false,
      render: (fee) => fee.academic_year_label || fee.academic_year_name || academicYearMap[fee.academic_year] || '-'
    },
    {
      key: 'fee_type_name',
      label: 'Fee Type',
      sortable: false,
      render: (fee) => fee.fee_type_name || feeTypeMap[fee.fee_type] || '-'
    },
    { key: 'semester', label: 'Semester', sortable: true },
    { key: 'amount', label: 'Amount', render: (fee) => `₹${fee.amount}` },
    {
      key: 'is_active',
      label: 'Status',
      render: (fee) => <Badge variant={fee.is_active ? 'success' : 'destructive'}>{fee.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ], [programMap, academicYearMap, feeTypeMap]);

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
    setSelectedFeeMaster(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (feeMaster: FeeMaster) => {
    setSelectedFeeMaster(feeMaster);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeMasterCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeMaster.mutateAsync(data);
        toast.success('Fee master created successfully');
      } else if (sidebarMode === 'edit' && selectedFeeMaster) {
        await updateFeeMaster.mutateAsync({ id: selectedFeeMaster.id, data });
        toast.success('Fee master updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedFeeMaster(null);
      await invalidateFeeMasters();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedFeeMaster) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFeeMaster) return;
    try {
      await deleteFeeMaster.mutateAsync(selectedFeeMaster.id);
      toast.success('Fee master deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedFeeMaster(null);
      await invalidateFeeMasters();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee master');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedFeeMaster(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Masters List"
        description="View and manage all fee masters"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeMasters()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fees..."
        addButtonLabel="Add Fee Master"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Master' : selectedFeeMaster?.name || 'Fee Master'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedFeeMaster ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Program</h3>
                <p className="mt-1 text-lg">{selectedFeeMaster.program_name || programMap[selectedFeeMaster.program] || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Academic Year</h3>
                <p className="mt-1 text-lg">{selectedFeeMaster.academic_year_name || academicYearMap[selectedFeeMaster.academic_year] || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fee Type</h3>
                <p className="mt-1 text-lg">{selectedFeeMaster.fee_type_name || feeTypeMap[selectedFeeMaster.fee_type] || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Semester</h3>
                <p className="mt-1 text-lg font-semibold">{selectedFeeMaster.semester}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p className="mt-1 text-2xl font-bold text-primary">₹{selectedFeeMaster.amount}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedFeeMaster.is_active ? 'success' : 'destructive'}>
                  {selectedFeeMaster.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeMasterForm
            feeMaster={sidebarMode === 'edit' ? selectedFeeMaster : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Master"
        description="Are you sure you want to delete this fee master? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeMaster.isPending}
      />
    </div >
  );
};

export default FeeMastersPage;
