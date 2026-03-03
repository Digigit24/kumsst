/**
 * Fee Structures Page
 */

import { useMemo, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeStructure, useUpdateFeeStructure, useDeleteFeeStructure } from '../../hooks/useFees';
import { useFeeStructuresSWR, invalidateFeeStructures } from '../../hooks/swr';
import type { FeeStructure, FeeStructureCreateInput } from '../../types/fees.types';
import { FeeStructureForm } from './forms';
import { FeeStructureCreationPipeline } from './forms/FeeStructureCreationPipeline';
import { toast } from 'sonner';

const FeeStructuresPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);
  const [usePipeline, setUsePipeline] = useState(false); // Toggle between form and pipeline

  const { data, isLoading, error } = useFeeStructuresSWR(filters);
  const createFeeStructure = useCreateFeeStructure();
  const updateFeeStructure = useUpdateFeeStructure();
  const deleteFeeStructure = useDeleteFeeStructure();

  const columns: Column<FeeStructure>[] = useMemo(() => [
    { key: 'student_name', label: 'Student', sortable: false },
    { key: 'fee_master_name', label: 'Fee Master', sortable: false },
    { key: 'amount', label: 'Amount', render: (structure) => `₹${structure.amount}` },
    { key: 'due_date', label: 'Due Date', sortable: true },
    { key: 'paid_amount', label: 'Paid', render: (structure) => `₹${structure.paid_amount}` },
    { key: 'balance', label: 'Balance', render: (structure) => `₹${structure.balance}` },
    {
      key: 'is_paid',
      label: 'Payment Status',
      render: (structure) => (
        <Badge variant={structure.is_paid ? 'success' : 'warning'}>
          {structure.is_paid ? 'Paid' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (structure) => (
        <Badge variant={structure.is_active ? 'success' : 'destructive'}>
          {structure.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  const filterConfig: FilterConfig[] = [
    {
      name: 'is_paid',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Paid' },
        { value: 'false', label: 'Pending' },
      ],
    },
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
    setSelectedStructure(null);
    setSidebarMode('create');
    setUsePipeline(false); // Default to standard form
    setIsSidebarOpen(true);
  };

  const handleAddWithPipeline = () => {
    setSelectedStructure(null);
    setSidebarMode('create');
    setUsePipeline(true); // Use pipeline wizard
    setIsSidebarOpen(true);
  };

  const handleRowClick = (structure: FeeStructure) => {
    setSelectedStructure(structure);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeStructureCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeStructure.mutateAsync(data);
        toast.success('Fee structure created successfully');
      } else if (sidebarMode === 'edit' && selectedStructure) {
        await updateFeeStructure.mutateAsync({ id: selectedStructure.id, data });
        toast.success('Fee structure updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedStructure(null);
      await invalidateFeeStructures();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
      console.error('Form submission error:', err);
    }
  };

  const handleDelete = () => {
    if (!selectedStructure) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStructure) return;
    try {
      await deleteFeeStructure.mutateAsync(selectedStructure.id);
      toast.success('Fee structure deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedStructure(null);
      await invalidateFeeStructures();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee structure');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedStructure(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Structures"
        description="View and manage student fee structures"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeStructures()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee structures..."
        addButtonLabel="Add Fee Structure"
        customActions={
          <Button
            onClick={handleAddWithPipeline}
            variant="outline"
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Quick Create Wizard
          </Button>
        }
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? usePipeline
              ? 'Quick Create Wizard'
              : 'Create Fee Structure'
            : 'Fee Structure Details'
        }
        mode={sidebarMode}
        width={usePipeline ? '5xl' : 'lg'} // Larger sidebar for pipeline
      >
        {sidebarMode === 'view' && selectedStructure ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              <p className="mt-1 text-lg font-semibold">{selectedStructure.student_name || `ID: ${selectedStructure.student}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fee Master</h3>
              <p className="mt-1 text-lg">{selectedStructure.fee_master_name || `ID: ${selectedStructure.fee_master}`}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p className="mt-1 text-2xl font-bold">₹{selectedStructure.amount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                <p className="mt-1 text-lg">{selectedStructure.due_date}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Paid Amount</h3>
                <p className="mt-1 text-xl font-semibold text-green-600">₹{selectedStructure.paid_amount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
                <p className="mt-1 text-xl font-semibold text-red-600">₹{selectedStructure.balance}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
              <p className="mt-1">
                <Badge variant={selectedStructure.is_paid ? 'success' : 'warning'}>
                  {selectedStructure.is_paid ? 'Paid' : 'Pending'}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedStructure.is_active ? 'success' : 'destructive'}>
                  {selectedStructure.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : sidebarMode === 'create' && usePipeline ? (
          <FeeStructureCreationPipeline
            onSubmit={async () => {
              setIsSidebarOpen(false);
              await invalidateFeeStructures();
            }}
            onCancel={handleCloseSidebar}
          />
        ) : (
          <FeeStructureForm
            feeStructure={sidebarMode === 'edit' ? selectedStructure : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Structure"
        description="Are you sure you want to delete this fee structure? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeStructure.isPending}
      />
    </div>
  );
};

export default FeeStructuresPage;
