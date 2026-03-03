/**
 * Stock Receipts Page - Manage stock receipts from vendors
 */

import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateStockReceipt, useUpdateStockReceipt, useDeleteStockReceipt } from '../../hooks/useStore';
import { useStockReceiptsSWR, invalidateStockReceipts } from '../../hooks/swr';
import { StockReceiptForm } from './forms/StockReceiptForm';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StockReceiptsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useStockReceiptsSWR(filters);
  const createReceipt = useCreateStockReceipt();
  const updateReceipt = useUpdateStockReceipt();
  const deleteReceipt = useDeleteStockReceipt();

  const columns: Column<any>[] = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (receipt) => (
        <span className="font-semibold text-primary">{receipt.invoice_number}</span>
      ),
      sortable: true,
    },
    {
      key: 'vendor_name',
      label: 'Vendor',
      render: (receipt) => receipt.vendor_name || `Vendor #${receipt.vendor}`,
      sortable: true,
    },
    {
      key: 'item_name',
      label: 'Item',
      render: (receipt) => receipt.item_name || `Item #${receipt.item}`,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (receipt) => receipt.quantity,
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      render: (receipt) => `₹${receipt.total_amount}`,
    },
    {
      key: 'receive_date',
      label: 'Receive Date',
      render: (receipt) => format(new Date(receipt.receive_date), 'dd MMM yyyy'),
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (receipt) => (
        <Badge variant={receipt.is_active ? 'default' : 'secondary'}>
          {receipt.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search by invoice number...',
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
    setSelectedReceipt(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (receipt: any) => {
    setSelectedReceipt(receipt);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createReceipt.mutateAsync(data);
        toast.success('Stock receipt created successfully');
      } else {
        await updateReceipt.mutateAsync({ id: selectedReceipt.id, data });
        toast.success('Stock receipt updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save stock receipt');
    }
  };

  const handleDelete = async () => {
    if (!selectedReceipt) return;
    
    if (window.confirm('Are you sure you want to delete this stock receipt?')) {
      try {
        await deleteReceipt.mutateAsync(selectedReceipt.id);
        toast.success('Stock receipt deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete stock receipt');
      }
    }
  };

  return (
    <div>
      <DataTable
        title="Stock Receipts"
        description="Manage stock receipts from vendors"
        columns={columns}
        data={data || null}
        isLoading={isLoading}
        error={error?.message || null}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        onRowClick={handleRowClick}
        onRefresh={refresh}
        onAdd={handleAddNew}
        addButtonLabel="Add Stock Receipt"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Stock Receipt' : sidebarMode === 'edit' ? 'Edit Stock Receipt' : 'Stock Receipt Details'}
        mode={sidebarMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        data={selectedReceipt}
      >
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <StockReceiptForm
            receipt={sidebarMode === 'edit' ? selectedReceipt : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        )}

        {sidebarMode === 'view' && selectedReceipt && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
              <p className="text-base font-semibold">{selectedReceipt.invoice_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vendor</label>
              <p className="text-base">{selectedReceipt.vendor_name || `Vendor #${selectedReceipt.vendor}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Item</label>
              <p className="text-base">{selectedReceipt.item_name || `Item #${selectedReceipt.item}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Quantity</label>
              <p className="text-base">{selectedReceipt.quantity}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
              <p className="text-base">₹{selectedReceipt.unit_price}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
              <p className="text-base font-semibold">₹{selectedReceipt.total_amount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Receive Date</label>
              <p className="text-base">{format(new Date(selectedReceipt.receive_date), 'dd MMM yyyy')}</p>
            </div>
            {selectedReceipt.remarks && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                <p className="text-base">{selectedReceipt.remarks}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p>
                <Badge variant={selectedReceipt.is_active ? 'default' : 'secondary'}>
                  {selectedReceipt.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default StockReceiptsPage;
