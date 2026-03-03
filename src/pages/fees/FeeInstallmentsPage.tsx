/**
 * Fee Installments Page
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeInstallment, useDeleteFeeInstallment, useUpdateFeeInstallment } from '../../hooks/useFees';
import { useFeeInstallmentsSWR, invalidateFeeInstallments } from '../../hooks/swr';
import type { FeeInstallment, FeeInstallmentCreateInput } from '../../types/fees.types';
import { FeeInstallmentForm } from './forms/FeeInstallmentForm';

const FeeInstallmentsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<FeeInstallment | null>(null);

  const { data, isLoading, error } = useFeeInstallmentsSWR(filters);
  const createInstallment = useCreateFeeInstallment();
  const updateInstallment = useUpdateFeeInstallment();
  const deleteInstallment = useDeleteFeeInstallment();

  const columns: Column<FeeInstallment>[] = [
    {
      key: 'student_name',
      label: 'Student',
      sortable: true,
      render: (inst) => (
        <div className="flex flex-col">
          <span className="font-medium">{inst.student_name || inst.student_details?.student_name || '-'}</span>
          <span className="text-xs text-muted-foreground">{inst.student_details?.admission_number || ''}</span>
        </div>
      )
    },
    {
      key: 'installment_number',
      label: 'Installment',
      sortable: true,
      render: (inst) => inst.installment_number
    },
    { key: 'amount', label: 'Amount', render: (inst) => `₹${inst.amount}` },
    { key: 'due_date', label: 'Due Date', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      render: (inst) => (
        <Badge variant={inst.is_active ? 'success' : 'destructive'}>
          {inst.is_active ? 'Active' : 'Inactive'}
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
    setSelectedInstallment(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (installment: FeeInstallment) => {
    setSelectedInstallment(installment);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeInstallmentCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createInstallment.mutateAsync(data);
        toast.success('Fee installment created successfully');
      } else if (sidebarMode === 'edit' && selectedInstallment) {
        await updateInstallment.mutateAsync({ id: selectedInstallment.id, data });
        toast.success('Fee installment updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedInstallment(null);
      await invalidateFeeInstallments();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedInstallment) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInstallment) return;
    try {
      await deleteInstallment.mutateAsync(selectedInstallment.id);
      toast.success('Fee installment deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedInstallment(null);
      await invalidateFeeInstallments();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee installment');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedInstallment(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Installments List"
        description="View and manage all fee installments"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeInstallments()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee installments..."
        addButtonLabel="Add Fee Installment"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Installment' : selectedInstallment?.installment_name || 'Fee Installment'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedInstallment ? (
          <div className="space-y-6">
            <div className="bg-muted/40 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Student Details</h3>
              <p className="text-lg font-semibold">{selectedInstallment.student_name || selectedInstallment.student_details?.student_name || '-'}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedInstallment.student_details?.admission_number || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Number</h3>
                <p className="mt-1 text-lg font-semibold">#{selectedInstallment.installment_number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="mt-1 text-lg font-semibold">{selectedInstallment.installment_name}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p className="mt-1 text-2xl font-bold text-primary">₹{selectedInstallment.amount}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
              <p className="mt-1 text-lg">{selectedInstallment.due_date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fee Structure</h3>
              <p className="mt-1">
                ID: #{selectedInstallment.fee_structure}
                {selectedInstallment.fee_structure_details && (
                  <span className="block text-sm text-muted-foreground">
                    Total: ₹{selectedInstallment.fee_structure_details.amount}
                  </span>
                )}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedInstallment.is_active ? 'success' : 'destructive'}>
                  {selectedInstallment.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeInstallmentForm
            feeInstallment={sidebarMode === 'edit' ? selectedInstallment : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Installment"
        description="Are you sure you want to delete this fee installment? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteInstallment.isPending}
      />
    </div >
  );
};

export default FeeInstallmentsPage;
