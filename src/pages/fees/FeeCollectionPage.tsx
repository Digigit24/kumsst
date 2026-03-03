/**
 * Consolidated Fee Collection Page
 * Combines: Fee Collections, Bank Payments, Online Payments
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

// Hooks
import { invalidateFeeCollections, useFeeCollectionsSWR } from '../../hooks/swr';
import {
  useCreateFeeCollection,
  useDeleteFeeCollection,
  useUpdateFeeCollection,
} from '../../hooks/useFees';

// Forms
import { FeeCollectionForm } from './forms';

const FeeCollectionPage = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      </div>

      <CollectionsTab />
    </div>
  );
};

// ============== COLLECTIONS TAB ==============
const CollectionsTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useFeeCollectionsSWR(filters);
  const createMutation = useCreateFeeCollection();
  const updateMutation = useUpdateFeeCollection();
  const deleteMutation = useDeleteFeeCollection();

  const columns: Column<any>[] = [
    { key: 'student_name', label: 'Student', sortable: false },
    { key: 'payment_date', label: 'Date', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => <span className="font-bold text-green-600">₹{parseFloat(item.amount || 0).toLocaleString()}</span>
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (item) => (
        <Badge variant="outline" className="capitalize">
          {item.payment_method?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'completed' ? 'success' : item.status === 'pending' ? 'secondary' : 'destructive'}>
          {item.status}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'payment_method', label: 'Method', type: 'select', options: [
        { value: '', label: 'All' },
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'upi', label: 'UPI' },
        { value: 'net_banking', label: 'Net Banking' },
      ]
    },
    {
      name: 'status', label: 'Status', type: 'select', options: [
        { value: '', label: 'All' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
      ]
    },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: any) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Collection created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Collection updated');
      }
      setIsSidebarOpen(false);
      setSelectedItem(null);
      await invalidateFeeCollections();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);
  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Collection deleted');
      setIsSidebarOpen(false);
      setSelectedItem(null);
      setIsDeleteDialogOpen(false);
      await invalidateFeeCollections();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        title="Fee Collections"
        description="Track and manage all fee payments"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={invalidateFeeCollections}
        onAdd={handleAdd}
        onRowClick={(item) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); }}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search collections..."
        addButtonLabel="Collect Fee"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Collect Fee' : `Collection #${selectedItem?.id || ''}`} mode={sidebarMode} width="lg">
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Amount Collected</p>
              <p className="text-3xl font-bold text-green-600">₹{parseFloat(selectedItem.amount).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Student</p><p className="font-medium">{selectedItem.student_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Date</p><p>{selectedItem.payment_date}</p></div>
              <div><p className="text-sm text-muted-foreground">Method</p><Badge variant="outline" className="capitalize">{selectedItem.payment_method?.replace('_', ' ')}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.status === 'completed' ? 'success' : 'secondary'}>{selectedItem.status}</Badge></div>
            </div>
            {selectedItem.transaction_id && <div><p className="text-sm text-muted-foreground">Transaction ID</p><p className="font-mono">{selectedItem.transaction_id}</p></div>}
            {selectedItem.remarks && <div><p className="text-sm text-muted-foreground">Remarks</p><p>{selectedItem.remarks}</p></div>}
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setSidebarMode('edit')} className="flex-1">Edit</Button>
              <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (sidebarMode === 'create' || sidebarMode === 'edit') ? (
          <FeeCollectionForm feeCollection={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        ) : null}
      </DetailSidebar>
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Delete Collection" description="Are you sure?" confirmLabel="Delete" onConfirm={confirmDelete} loading={deleteMutation.isPending} />
    </div>
  );
};



export default FeeCollectionPage;
