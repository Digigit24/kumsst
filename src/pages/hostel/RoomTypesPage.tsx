/**
 * Room Types Page - Manage room types
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { invalidateRoomTypes, useRoomTypesSWR } from '../../hooks/swr';
import { useCreateRoomType, useDeleteRoomType, useUpdateRoomType } from '../../hooks/useHostel';
import { RoomTypeForm } from './components/RoomTypeForm';

const RoomTypesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, error, refresh } = useRoomTypesSWR(filters);
  const create = useCreateRoomType();
  const update = useUpdateRoomType();
  const del = useDeleteRoomType();

  const columns: Column<any>[] = [
    { key: 'name', label: 'Name', render: (item) => <span className="font-semibold text-primary">{item.name}</span>, sortable: true },
    { key: 'hostel', label: 'Hostel', render: (item) => item.hostel_name || `Hostel #${item.hostel}`, sortable: true },
    { key: 'capacity', label: 'Capacity', render: (item) => item.capacity },
    { key: 'monthly_fee', label: 'Monthly Fee', render: (item) => `₹${item.monthly_fee}` },
    { key: 'features', label: 'Features', render: (item) => item.features || '-' },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ];

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Room type created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Room type updated successfully');
      }
      setIsSidebarOpen(false);
      invalidateRoomTypes();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save room type');
    }
  };

  const handleDeleteClick = () => {
    if (!selected) return;
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await del.mutateAsync(selected.id);
      toast.success('Room type deleted successfully');
      setDeleteDialogOpen(false);
      setIsSidebarOpen(false);
      setSelected(null);
      invalidateRoomTypes();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete room type');
    }
  };

  return (
    <div>
      <DataTable title="Room Types" description="Manage room types" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Room Type" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Room Type' : sidebarMode === 'edit' ? 'Edit Room Type' : 'Room Type Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDeleteClick} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <RoomTypeForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Name</label><p className="text-base font-semibold">{selected.name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Hostel</label><p className="text-base">{selected.hostel_name || `Hostel #${selected.hostel}`}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Capacity</label><p className="text-base">{selected.capacity}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Monthly Fee</label><p className="text-base">₹{selected.monthly_fee}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Features</label><p className="text-base">{selected.features || '-'}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.is_active ? 'default' : 'secondary'}>{selected.is_active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        )}
      </DetailSidebar>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Room Type"
        description={`Are you sure you want to delete ${selected?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={del.isPending}
      />
    </div>
  );
};

export default RoomTypesPage;
