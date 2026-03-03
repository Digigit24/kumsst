/**
 * Hostels Page - Manage hostels
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateHostel, useDeleteHostel, useUpdateHostel } from '../../hooks/useHostel';
import { useHostelsSWR, invalidateHostels } from '../../hooks/swr';
import { HostelForm } from './components/HostelForm';

const HostelsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, error, refresh } = useHostelsSWR(filters);
  const create = useCreateHostel();
  const update = useUpdateHostel();
  const del = useDeleteHostel();

  const columns: Column<any>[] = [
    { key: 'name', label: 'Name', render: (item) => <span className="font-semibold text-primary">{item.name}</span>, sortable: true },
    { key: 'hostel_type', label: 'Type', render: (item) => item.hostel_type, sortable: true },
    { key: 'capacity', label: 'Capacity', render: (item) => item.capacity },
    { key: 'contact_number', label: 'Contact', render: (item) => item.contact_number },
    { key: 'college', label: 'College', render: (item) => item.college_name || `College #${item.college}` },
    { key: 'warden', label: 'Warden', render: (item) => item.warden_name || `Warden #${item.warden}` },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ];

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Hostel created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Hostel updated successfully');
      }
      setIsSidebarOpen(false);
      invalidateHostels();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save hostel');
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
      toast.success('Hostel deleted successfully');
      setDeleteDialogOpen(false);
      setIsSidebarOpen(false);
      setSelected(null);
      invalidateHostels();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete hostel');
    }
  };

  return (
    <div>
      <DataTable title="Hostels" description="Manage hostels" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Hostel" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Hostel' : sidebarMode === 'edit' ? 'Edit Hostel' : 'Hostel Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDeleteClick} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <HostelForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Name</label><p className="text-base font-semibold">{selected.name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Type</label><p className="text-base">{selected.hostel_type}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Address</label><p className="text-base">{selected.address}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Capacity</label><p className="text-base">{selected.capacity}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Contact Number</label><p className="text-base">{selected.contact_number}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">College</label><p className="text-base">{selected.college_name || `College #${selected.college}`}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Warden</label><p className="text-base">{selected.warden_name || `Warden #${selected.warden}`}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.is_active ? 'default' : 'secondary'}>{selected.is_active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        )}
      </DetailSidebar>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Hostel"
        description={`Are you sure you want to delete ${selected?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={del.isPending}
      />
    </div>
  );
};

export default HostelsPage;
