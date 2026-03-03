/**
 * Leave Applications Page - Manage leave applications
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateLeaveApplication, useUpdateLeaveApplication, useDeleteLeaveApplication } from '../../hooks/useHR';
import { useLeaveApplicationsSWR, invalidateLeaveApplications } from '../../hooks/swr';
import { LeaveApplicationForm } from './forms/LeaveApplicationForm';
import { toast } from 'sonner';

const LeaveApplicationsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useLeaveApplicationsSWR(filters);
  const create = useCreateLeaveApplication();
  const update = useUpdateLeaveApplication();
  const del = useDeleteLeaveApplication();

  const columns: Column<any>[] = useMemo(() => [
    { key: 'teacher_name', label: 'Teacher', render: (item) => <span className="font-semibold text-primary">{item.teacher_name || 'N/A'}</span>, sortable: true },
    { key: 'leave_type_name', label: 'Leave Type', render: (item) => item.leave_type_name },
    { key: 'from_date', label: 'From Date', render: (item) => new Date(item.from_date).toLocaleDateString(), sortable: true },
    { key: 'to_date', label: 'To Date', render: (item) => new Date(item.to_date).toLocaleDateString() },
    { key: 'total_days', label: 'Total Days', render: (item) => item.total_days },
    { key: 'status', label: 'Status', render: (item) => <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>{item.status}</Badge> },
  ], []);

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Leave application created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Leave application updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save leave application');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (window.confirm('Are you sure you want to delete this leave application?')) {
      try {
        await del.mutateAsync(selected.id);
        toast.success('Leave application deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete leave application');
      }
    }
  };

  return (
    <div>
      <DataTable title="Leave Applications" description="Manage leave applications" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Leave Application" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Leave Application' : sidebarMode === 'edit' ? 'Edit Leave Application' : 'Leave Application Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDelete} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <LeaveApplicationForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Teacher</label><p className="text-base font-semibold">{selected.teacher_name || 'N/A'}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Leave Type</label><p className="text-base">{selected.leave_type_name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">From Date</label><p className="text-base">{new Date(selected.from_date).toLocaleDateString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">To Date</label><p className="text-base">{new Date(selected.to_date).toLocaleDateString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Total Days</label><p className="text-base">{selected.total_days}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Reason</label><p className="text-base">{selected.reason}</p></div>
            {selected.attachment && <div><label className="text-sm font-medium text-muted-foreground">Attachment</label><p className="text-base">{selected.attachment}</p></div>}
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.status === 'approved' ? 'default' : selected.status === 'rejected' ? 'destructive' : 'secondary'}>{selected.status}</Badge></div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default LeaveApplicationsPage;
