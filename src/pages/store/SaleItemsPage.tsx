/**
 * Sale Items Page
 */

import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateSaleItem, useUpdateSaleItem, useDeleteSaleItem } from '../../hooks/useStore';
import { useSaleItemsSWR, invalidateSaleItems } from '../../hooks/swr';
import { SaleItemForm } from './forms/SaleItemForm';
import { toast } from 'sonner';

const SaleItemsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedSaleItem, setSelectedSaleItem] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useSaleItemsSWR(filters);
  const createSaleItem = useCreateSaleItem();
  const updateSaleItem = useUpdateSaleItem();
  const deleteSaleItem = useDeleteSaleItem();

  const columns: Column<any>[] = [
    {
      key: 'sale',
      label: 'Sale',
      render: (saleItem) => saleItem.sale_number || `Sale #${saleItem.sale}`,
      sortable: true,
    },
    {
      key: 'item',
      label: 'Item',
      render: (saleItem) => saleItem.item_name || `Item #${saleItem.item}`,
      sortable: true,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (saleItem) => (
        <span className="font-semibold">{saleItem.quantity}</span>
      ),
      sortable: true,
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (saleItem) => (
        <span>₹{parseFloat(saleItem.unit_price).toFixed(2)}</span>
      ),
      sortable: true,
    },
    {
      key: 'total_price',
      label: 'Total Price',
      render: (saleItem) => (
        <span className="font-semibold text-primary">
          ₹{parseFloat(saleItem.total_price).toFixed(2)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (saleItem) => (
        <Badge variant={saleItem.is_active ? 'default' : 'secondary'}>
          {saleItem.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'sale',
      label: 'Sale ID',
      type: 'text',
    },
    {
      name: 'item',
      label: 'Item ID',
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
    setSelectedSaleItem(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (saleItem: any) => {
    setSelectedSaleItem(saleItem);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createSaleItem.mutateAsync(data);
        toast.success('Sale item created successfully');
      } else if (sidebarMode === 'edit' && selectedSaleItem) {
        await updateSaleItem.mutateAsync({ id: selectedSaleItem.id, data });
        toast.success('Sale item updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedSaleItem(null);
      refresh();
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!selectedSaleItem) return;

    if (confirm('Are you sure you want to delete this sale item?')) {
      try {
        await deleteSaleItem.mutateAsync(selectedSaleItem.id);
        toast.success('Sale item deleted successfully');
        setIsSidebarOpen(false);
        setSelectedSaleItem(null);
        refresh();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete sale item');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedSaleItem(null);
  };

  return (
    <div className="">
      <DataTable
        title="Sale Items"
        description="View and manage sale items"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search sale items..."
        addButtonLabel="Add Sale Item"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Sale Item' : `Sale Item #${selectedSaleItem?.id}` || 'Sale Item'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedSaleItem ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Sale</h3>
              <p className="mt-1 text-lg font-semibold">
                {selectedSaleItem.sale_number || `Sale #${selectedSaleItem.sale}`}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
              <p className="mt-1">
                {selectedSaleItem.item_name || `Item #${selectedSaleItem.item}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                <p className="mt-1 font-semibold">{selectedSaleItem.quantity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Unit Price</h3>
                <p className="mt-1">₹{parseFloat(selectedSaleItem.unit_price).toFixed(2)}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Price</h3>
              <p className="mt-1 text-xl font-bold text-primary">
                ₹{parseFloat(selectedSaleItem.total_price).toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
              <p className="mt-1">
                <Badge variant={selectedSaleItem.is_active ? 'default' : 'secondary'}>
                  {selectedSaleItem.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <SaleItemForm
            saleItem={sidebarMode === 'edit' ? selectedSaleItem : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>
    </div>
  );
};

export default SaleItemsPage;
