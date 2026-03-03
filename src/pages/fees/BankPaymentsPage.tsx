/**
 * Bank Payments Page
 */

import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateBankPayment, useUpdateBankPayment, useDeleteBankPayment } from '../../hooks/useFees';
import { useBankPaymentsSWR, invalidateBankPayments } from '../../hooks/swr';
import { BankPaymentForm } from './forms/BankPaymentForm';
import { toast } from 'sonner';

const BankPaymentsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  // Fetch bank payments using SWR
  const { data, isLoading, error } = useBankPaymentsSWR(filters);
  const createBankPayment = useCreateBankPayment();
  const updateBankPayment = useUpdateBankPayment();
  const deleteBankPayment = useDeleteBankPayment();

  const columns: Column<any>[] = [
    {
      key: 'bank_name',
      label: 'Bank Name',
      sortable: true,
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (payment) => payment.branch || 'N/A',
    },
    {
      key: 'cheque_dd_number',
      label: 'Cheque/DD Number',
      render: (payment) => payment.cheque_dd_number || 'N/A',
    },
    {
      key: 'cheque_dd_date',
      label: 'Cheque/DD Date',
      render: (payment) => payment.cheque_dd_date ? new Date(payment.cheque_dd_date).toLocaleDateString() : 'N/A',
      sortable: true,
    },
    {
      key: 'transaction_id',
      label: 'Transaction ID',
      render: (payment) => payment.transaction_id || 'N/A',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (payment) => (
        <Badge variant={payment.is_active ? 'default' : 'secondary'}>
          {payment.is_active ? 'Active' : 'Inactive'}
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
    setSelectedPayment(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (payment: any) => {
    setSelectedPayment(payment);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    console.log('handleFormSubmit called with data:', data);
    try {
      if (sidebarMode === 'create') {
        console.log('Creating bank payment...');
        const result = await createBankPayment.mutateAsync(data);
        console.log('Create result:', result);
        toast.success('Bank payment created successfully');
      } else if (sidebarMode === 'edit' && selectedPayment) {
        console.log('Updating bank payment...');
        const result = await updateBankPayment.mutateAsync({ id: selectedPayment.id, data });
        console.log('Update result:', result);
        toast.success('Bank payment updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedPayment(null);
      await invalidateBankPayments();
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast.error(err?.message || err?.error || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedPayment) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPayment) return;
    try {
      await deleteBankPayment.mutateAsync(selectedPayment.id);
      toast.success('Bank payment deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
      await invalidateBankPayments();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete bank payment');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedPayment(null);
  };

  return (
    <div className="">
      <DataTable
        title="Bank Payments"
        description="View and manage bank payments"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateBankPayments()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search payments..."
        addButtonLabel="Add Payment"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Bank Payment' : `Payment #${selectedPayment?.id}` || 'Bank Payment'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedPayment ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Bank Name</h3>
              <p className="mt-1 text-lg font-semibold">{selectedPayment.bank_name}</p>
            </div>
            {selectedPayment.branch && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Branch</h3>
                <p className="mt-1">{selectedPayment.branch}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {selectedPayment.cheque_dd_number && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cheque/DD Number</h3>
                  <p className="mt-1">{selectedPayment.cheque_dd_number}</p>
                </div>
              )}
              {selectedPayment.cheque_dd_date && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cheque/DD Date</h3>
                  <p className="mt-1">{new Date(selectedPayment.cheque_dd_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            {selectedPayment.transaction_id && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction ID</h3>
                <p className="mt-1 font-mono text-sm">{selectedPayment.transaction_id}</p>
              </div>
            )}
            {selectedPayment.collection_name && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fee Collection</h3>
                <p className="mt-1">{selectedPayment.collection_name}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedPayment.is_active ? 'default' : 'secondary'}>
                  {selectedPayment.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <BankPaymentForm
            bankPayment={sidebarMode === 'edit' ? selectedPayment : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Bank Payment"
        description="Are you sure you want to delete this bank payment? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteBankPayment.isPending}
      />
    </div>
  );
};

export default BankPaymentsPage;
