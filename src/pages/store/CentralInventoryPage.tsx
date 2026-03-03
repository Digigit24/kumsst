import { AlertTriangle, Package, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useCentralInventorySWR } from '../../hooks/swr';
import { useCreateCentralInventory, useDeleteCentralInventory, useLowStockItems, useUpdateCentralInventory } from '../../hooks/useCentralInventory';
import { CentralInventoryForm } from './forms/CentralInventoryForm';

export const CentralInventoryPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const { data, isLoading, refresh } = useCentralInventorySWR(filters);
  const { data: lowStockData } = useLowStockItems();
  const createMutation = useCreateCentralInventory();
  const updateMutation = useUpdateCentralInventory();
  const deleteMutation = useDeleteCentralInventory();

  const handleCreate = () => {
    setSelectedItem(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this inventory item?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Item deleted successfully');
        refresh();
      } catch (error: any) {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete item');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'edit' && selectedItem) {
        await updateMutation.mutateAsync({ id: selectedItem.id, data });
        toast.success('Item updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Item created successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Operation failed');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'item_name',
      label: 'Item',
      render: (row) => (
        <span className="font-semibold">{row.item_display || row.item_name || `Item #${row.item}`}</span>
      ),
      sortable: true,
    },
    {
      key: 'central_store_name',
      label: 'Store',
      render: (row) => row.central_store_name || `Store #${row.central_store}`,
    },
    {
      key: 'quantity_available',
      label: 'Available',
      render: (row) => (
        <span className={row.quantity_available < row.min_stock_level ? 'text-destructive font-bold' : ''}>
          {row.quantity_available}
        </span>
      ),
    },
    {
      key: 'quantity_on_hand',
      label: 'On Hand',
      render: (row) => row.quantity_on_hand,
    },
    {
      key: 'min_stock_level',
      label: 'Min Level',
      render: (row) => row.min_stock_level,
    },
    {
      key: 'unit_cost',
      label: 'Unit Cost',
      render: (row) => `₹${parseFloat(row.unit_cost).toFixed(2)}`,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Central Inventory</h1>
          <p className="text-muted-foreground">Manage inventory across central stores</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory Item
        </Button>
      </div>

      {lowStockData && lowStockData.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{lowStockData.length} item(s) below minimum stock level</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(item) => handleDelete(item.id)}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'New Inventory Item' : 'Edit Inventory Item'}
        mode={sidebarMode}
      >
        <CentralInventoryForm
          inventory={selectedItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSidebarOpen(false)}
        />
      </DetailSidebar>
    </div>
  );
};
