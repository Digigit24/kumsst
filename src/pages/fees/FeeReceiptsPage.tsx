/**
 * Fee Receipts Page
 */

import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeReceipt, useUpdateFeeReceipt, useDeleteFeeReceipt } from '../../hooks/useFees';
import { useFeeReceiptsSWR, invalidateFeeReceipts } from '../../hooks/swr';
import type { FeeReceipt, FeeReceiptCreateInput } from '../../types/fees.types';
import { FeeReceiptForm } from './forms/FeeReceiptForm';
import { toast } from 'sonner';

const FeeReceiptsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeReceipt | null>(null);

  const { data, isLoading, error } = useFeeReceiptsSWR(filters);
  const createFeeReceipt = useCreateFeeReceipt();
  const updateFeeReceipt = useUpdateFeeReceipt();
  const deleteFeeReceipt = useDeleteFeeReceipt();

  const columns: Column<FeeReceipt>[] = [
    { key: 'receipt_number', label: 'Receipt Number', sortable: true },
    { key: 'collection_name', label: 'Collection', sortable: false },
    {
      key: 'receipt_file',
      label: 'Receipt File',
      render: (receipt) => (
        <a
          href={receipt.receipt_file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View File
        </a>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (receipt) => (
        <Badge variant={receipt.is_active ? 'success' : 'destructive'}>
          {receipt.is_active ? 'Active' : 'Inactive'}
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
    setSelectedReceipt(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (receipt: FeeReceipt) => {
    setSelectedReceipt(receipt);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeReceiptCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeReceipt.mutateAsync(data);
        toast.success('Fee receipt created successfully');
      } else if (sidebarMode === 'edit' && selectedReceipt) {
        await updateFeeReceipt.mutateAsync({ id: selectedReceipt.id, data });
        toast.success('Fee receipt updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedReceipt(null);
      await invalidateFeeReceipts();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
      console.error('Form submission error:', err);
    }
  };

  const handleDelete = () => {
    if (!selectedReceipt) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReceipt) return;
    try {
      await deleteFeeReceipt.mutateAsync(selectedReceipt.id);
      toast.success('Fee receipt deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedReceipt(null);
      await invalidateFeeReceipts();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee receipt');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedReceipt(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Receipts"
        description="View and manage fee receipts"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeReceipts()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee receipts..."
        addButtonLabel="Add Fee Receipt"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Receipt' : 'Fee Receipt Details'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedReceipt ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Receipt Number</h3>
              <p className="mt-1 text-lg font-semibold">{selectedReceipt.receipt_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Collection</h3>
              <p className="mt-1 text-lg">{selectedReceipt.collection_name || `ID: ${selectedReceipt.collection}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Receipt File</h3>
              <p className="mt-1">
                <a
                  href={selectedReceipt.receipt_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View File
                </a>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedReceipt.is_active ? 'success' : 'destructive'}>
                  {selectedReceipt.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeReceiptForm
            feeReceipt={sidebarMode === 'edit' ? selectedReceipt : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Receipt"
        description="Are you sure you want to delete this fee receipt? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeReceipt.isPending}
      />
    </div >
  );
};

export default FeeReceiptsPage;
