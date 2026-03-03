/**
 * Leave Approvals Page - Manage leave approvals
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateLeaveApproval, useUpdateLeaveApproval, useDeleteLeaveApproval } from '../../hooks/useHR';
import { useLeaveApprovalsSWR, invalidateLeaveApprovals } from '../../hooks/swr';
import { LeaveApprovalForm } from './forms/LeaveApprovalForm';
import { toast } from 'sonner';

const LeaveApprovalsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useLeaveApprovalsSWR(filters);
  const create = useCreateLeaveApproval();
  const update = useUpdateLeaveApproval();
  const del = useDeleteLeaveApproval();

  const columns: Column<any>[] = useMemo(() => [
    { key: 'application', label: 'Application ID', render: (item) => <span className="font-semibold text-primary">{item.application}</span>, sortable: true },
    { key: 'approver_name', label: 'Approver', render: (item) => item.approver_name || 'N/A' },
    { key: 'status', label: 'Status', render: (item) => <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>{item.status}</Badge> },
    { key: 'approval_date', label: 'Approval Date', render: (item) => new Date(item.approval_date).toLocaleDateString(), sortable: true },
  ], []);

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Leave approval created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Leave approval updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save leave approval');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (window.confirm('Are you sure you want to delete this leave approval?')) {
      try {
        await del.mutateAsync(selected.id);
        toast.success('Leave approval deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete leave approval');
      }
    }
  };

  return (
    <div>
      <DataTable title="Leave Approvals" description="Manage leave approvals" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Leave Approval" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Leave Approval' : sidebarMode === 'edit' ? 'Edit Leave Approval' : 'Leave Approval Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDelete} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <LeaveApprovalForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Application ID</label><p className="text-base font-semibold">{selected.application}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Approver</label><p className="text-base">{selected.approver_name || 'N/A'}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.status === 'approved' ? 'default' : selected.status === 'rejected' ? 'destructive' : 'secondary'}>{selected.status}</Badge></div>
            <div><label className="text-sm font-medium text-muted-foreground">Approval Date</label><p className="text-base">{new Date(selected.approval_date).toLocaleDateString()}</p></div>
            {selected.remarks && <div><label className="text-sm font-medium text-muted-foreground">Remarks</label><p className="text-base">{selected.remarks}</p></div>}
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default LeaveApprovalsPage;
