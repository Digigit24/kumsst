/**
 * Leave Balances Page - Manage leave balances
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateLeaveBalance, useUpdateLeaveBalance, useDeleteLeaveBalance } from '../../hooks/useHR';
import { useLeaveBalancesSWR, invalidateLeaveBalances } from '../../hooks/swr';
import { LeaveBalanceForm } from './forms/LeaveBalanceForm';
import { toast } from 'sonner';

const LeaveBalancesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useLeaveBalancesSWR(filters);
  const create = useCreateLeaveBalance();
  const update = useUpdateLeaveBalance();
  const del = useDeleteLeaveBalance();

  const columns: Column<any>[] = useMemo(() => [
    { key: 'teacher_name', label: 'Teacher', render: (item) => <span className="font-semibold text-primary">{item.teacher_name || 'N/A'}</span>, sortable: true },
    { key: 'leave_type_name', label: 'Leave Type', render: (item) => item.leave_type_name },
    { key: 'academic_year_name', label: 'Academic Year', render: (item) => item.academic_year_name || item.academic_year },
    { key: 'total_days', label: 'Total Days', render: (item) => item.total_days },
    { key: 'used_days', label: 'Used Days', render: (item) => item.used_days },
    { key: 'balance_days', label: 'Balance Days', render: (item) => <Badge variant={item.balance_days > 0 ? 'default' : 'secondary'}>{item.balance_days}</Badge> },
  ], []);

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Leave balance created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Leave balance updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save leave balance');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (window.confirm('Are you sure you want to delete this leave balance?')) {
      try {
        await del.mutateAsync(selected.id);
        toast.success('Leave balance deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete leave balance');
      }
    }
  };

  return (
    <div>
      <DataTable title="Leave Balances" description="Manage leave balances" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Leave Balance" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Leave Balance' : sidebarMode === 'edit' ? 'Edit Leave Balance' : 'Leave Balance Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDelete} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <LeaveBalanceForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Teacher</label><p className="text-base font-semibold">{selected.teacher_name || 'N/A'}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Leave Type</label><p className="text-base">{selected.leave_type_name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Academic Year</label><p className="text-base">{selected.academic_year_name || selected.academic_year}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Total Days</label><p className="text-base">{selected.total_days}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Used Days</label><p className="text-base">{selected.used_days}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Balance Days</label><Badge variant={selected.balance_days > 0 ? 'default' : 'secondary'}>{selected.balance_days}</Badge></div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default LeaveBalancesPage;
