/**
 * Fee Refunds Page
 */

import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeRefund, useUpdateFeeRefund, useDeleteFeeRefund } from '../../hooks/useFees';
import { useFeeRefundsSWR, invalidateFeeRefunds } from '../../hooks/swr';
import type { FeeRefund, FeeRefundCreateInput } from '../../types/fees.types';
import { FeeRefundForm } from './forms/FeeRefundForm';
import { toast } from 'sonner';

const FeeRefundsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<FeeRefund | null>(null);

  const { data, isLoading, error } = useFeeRefundsSWR(filters);
  const createFeeRefund = useCreateFeeRefund();
  const updateFeeRefund = useUpdateFeeRefund();
  const deleteFeeRefund = useDeleteFeeRefund();

  const columns: Column<FeeRefund>[] = [
    { key: 'student_name', label: 'Student', sortable: false },
    { key: 'amount', label: 'Amount', render: (refund) => `₹${refund.amount}` },
    { key: 'refund_date', label: 'Refund Date', sortable: true },
    { key: 'payment_method', label: 'Payment Method', sortable: false },
    { key: 'transaction_id', label: 'Transaction ID', sortable: false },
    { key: 'processed_by_name', label: 'Processed By', sortable: false },
    {
      key: 'is_active',
      label: 'Status',
      render: (refund) => (
        <Badge variant={refund.is_active ? 'success' : 'destructive'}>
          {refund.is_active ? 'Active' : 'Inactive'}
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
    setSelectedRefund(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (refund: FeeRefund) => {
    setSelectedRefund(refund);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeRefundCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeRefund.mutateAsync(data);
        toast.success('Fee refund created successfully');
      } else if (sidebarMode === 'edit' && selectedRefund) {
        await updateFeeRefund.mutateAsync({ id: selectedRefund.id, data });
        toast.success('Fee refund updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedRefund(null);
      await invalidateFeeRefunds();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedRefund) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRefund) return;
    try {
      await deleteFeeRefund.mutateAsync(selectedRefund.id);
      toast.success('Fee refund deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedRefund(null);
      await invalidateFeeRefunds();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee refund');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedRefund(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Refunds"
        description="View and manage fee refunds"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeRefunds()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee refunds..."
        addButtonLabel="Add Fee Refund"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Refund' : 'Fee Refund Details'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedRefund ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              <p className="mt-1 text-lg font-semibold">{selectedRefund.student_name || `ID: ${selectedRefund.student}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Refund Amount</h3>
              <p className="mt-1 text-2xl font-bold text-green-600">₹{selectedRefund.amount}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Refund Date</h3>
                <p className="mt-1 text-lg">{selectedRefund.refund_date}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                <p className="mt-1 text-lg">{selectedRefund.payment_method}</p>
              </div>
            </div>
            {selectedRefund.transaction_id && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction ID</h3>
                <p className="mt-1 font-mono text-sm">{selectedRefund.transaction_id}</p>
              </div>
            )}
            {selectedRefund.processed_by_name && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Processed By</h3>
                <p className="mt-1">{selectedRefund.processed_by_name}</p>
              </div>
            )}
            {selectedRefund.reason && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                <p className="mt-1">{selectedRefund.reason}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedRefund.is_active ? 'success' : 'destructive'}>
                  {selectedRefund.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeRefundForm
            feeRefund={sidebarMode === 'edit' ? selectedRefund : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Refund"
        description="Are you sure you want to delete this fee refund? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeRefund.isPending}
      />
    </div>
  );
};

export default FeeRefundsPage;
