/**
 * Online Payments Page
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge, type BadgeProps } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateOnlinePayment, useDeleteOnlinePayment, useUpdateOnlinePayment } from '../../hooks/useFees';
import { useOnlinePaymentsSWR, invalidateOnlinePayments } from '../../hooks/swr';
import type { OnlinePayment } from '../../types/fees.types';
import { OnlinePaymentForm } from './forms';

const OnlinePaymentsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  // Fetch online payments using SWR
  const { data, isLoading, error } = useOnlinePaymentsSWR(filters);
  const createOnlinePayment = useCreateOnlinePayment();
  const updateOnlinePayment = useUpdateOnlinePayment();
  const deleteOnlinePayment = useDeleteOnlinePayment();

  const columns: Column<OnlinePayment>[] = [
    {
      key: 'student_name',
      label: 'Student',
      render: (payment) => payment.student_name || '-',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (payment) => <span className="font-bold">₹{parseFloat(payment.amount).toLocaleString()}</span>,
      sortable: true,
    },
    {
      key: 'gateway',
      label: 'Gateway',
      render: (payment) => payment.gateway || 'N/A',
      sortable: true,
    },
    {
      key: 'transaction_id',
      label: 'Transaction ID',
      render: (payment) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs">{payment.transaction_id || '-'}</span>
          <span className="text-[10px] text-muted-foreground">Order: {payment.order_id || '-'}</span>
        </div>
      ),
    },
    {
      key: 'payment_mode',
      label: 'Mode',
      render: (payment) => <span className="capitalize">{payment.payment_mode?.replace('_', ' ') || '-'}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (payment) => new Date(payment.created_at).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (payment) => {
        const statusColors: Record<string, BadgeProps['variant']> = {
          pending: 'secondary',
          success: 'success',
          failed: 'destructive',
          refunded: 'warning',
        };
        return (
          <Badge variant={statusColors[payment.status] || 'default'}>
            {payment.status || 'Unknown'}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (payment) => (
        <Badge variant={payment.is_active ? 'default' : 'secondary'}>
          {payment.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'success', label: 'Success' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
      ],
    },
    {
      name: 'gateway',
      label: 'Gateway',
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
        console.log('Creating online payment...');
        const result = await createOnlinePayment.mutateAsync(data);
        console.log('Create result:', result);
        toast.success('Online payment created successfully');
      } else if (sidebarMode === 'edit' && selectedPayment) {
        console.log('Updating online payment...');
        const result = await updateOnlinePayment.mutateAsync({ id: selectedPayment.id, data });
        console.log('Update result:', result);
        toast.success('Online payment updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedPayment(null);
      await invalidateOnlinePayments();
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
      await deleteOnlinePayment.mutateAsync(selectedPayment.id);
      toast.success('Online payment deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
      await invalidateOnlinePayments();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete online payment');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedPayment(null);
  };

  return (
    <div className="">
      <DataTable
        title="Online Payments"
        description="View and manage online payments"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateOnlinePayments()}
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
        title={sidebarMode === 'create' ? 'Create Online Payment' : `Payment #${selectedPayment?.id}` || 'Online Payment'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedPayment ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-3xl font-bold">₹{parseFloat(selectedPayment.amount).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                via {selectedPayment.gateway} ({selectedPayment.payment_mode})
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              <p className="mt-1 text-lg font-semibold">{selectedPayment.student_name || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction ID</h3>
                <p className="mt-1 font-mono text-sm break-all">{selectedPayment.transaction_id || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Order ID</h3>
                <p className="mt-1 font-mono text-sm break-all">{selectedPayment.order_id || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Date</h3>
              <p className="mt-1">{new Date(selectedPayment.created_at).toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={
                  selectedPayment.status === 'success' ? 'success' :
                    selectedPayment.status === 'failed' ? 'destructive' :
                      selectedPayment.status === 'refunded' ? 'warning' : 'secondary'
                }>
                  {selectedPayment.status || 'Unknown'}
                </Badge>
                <Badge variant={selectedPayment.is_active ? 'outline' : 'secondary'}>
                  {selectedPayment.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {selectedPayment.response_data && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Response Data</h3>
                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32 whitespace-pre-wrap font-mono">
                  {selectedPayment.response_data}
                </pre>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <OnlinePaymentForm
            onlinePayment={sidebarMode === 'edit' ? selectedPayment : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Online Payment"
        description="Are you sure you want to delete this online payment? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteOnlinePayment.isPending}
      />
    </div>
  );
};

export default OnlinePaymentsPage;
