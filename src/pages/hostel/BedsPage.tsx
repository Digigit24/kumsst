/**
 * Hostel Beds Page - Manage hostel beds
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateHostelBed, useDeleteHostelBed, useUpdateHostelBed } from '../../hooks/useHostel';
import { useHostelBedsSWR, invalidateHostelBeds } from '../../hooks/swr';
import { BedForm } from './components/BedForm';

const BedsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, error, refresh } = useHostelBedsSWR(filters);
  const create = useCreateHostelBed();
  const update = useUpdateHostelBed();
  const del = useDeleteHostelBed();

  const columns: Column<any>[] = [
    { key: 'bed_number', label: 'Bed Number', render: (item) => <span className="font-semibold text-primary">{item.bed_number}</span>, sortable: true },
    { key: 'room', label: 'Room', render: (item) => item.room_number || `Room #${item.room}`, sortable: true },
    { key: 'status', label: 'Status', render: (item) => <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>{item.status}</Badge>, sortable: true },
    { key: 'is_active', label: 'Active', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ];

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Bed created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Bed updated successfully');
      }
      setIsSidebarOpen(false);
      invalidateHostelBeds();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save bed');
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
      toast.success('Bed deleted successfully');
      setDeleteDialogOpen(false);
      setIsSidebarOpen(false);
      setSelected(null);
      invalidateHostelBeds();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete bed');
    }
  };

  return (
    <div>
      <DataTable title="Hostel Beds" description="Manage hostel beds" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Bed" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Bed' : sidebarMode === 'edit' ? 'Edit Bed' : 'Bed Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDeleteClick} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <BedForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Bed Number</label><p className="text-base font-semibold">{selected.bed_number}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Room</label><p className="text-base">{selected.room_number || `Room #${selected.room}`}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.status === 'available' ? 'default' : 'secondary'}>{selected.status}</Badge></div>
            <div><label className="text-sm font-medium text-muted-foreground">Active</label><Badge variant={selected.is_active ? 'default' : 'secondary'}>{selected.is_active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        )}
      </DetailSidebar>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Bed"
        description={`Are you sure you want to delete bed ${selected?.bed_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={del.isPending}
      />
    </div>
  );
};

export default BedsPage;
