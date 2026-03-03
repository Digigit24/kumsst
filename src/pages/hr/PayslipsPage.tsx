/**
 * Payslips Page - Manage payslips
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreatePayslip, useUpdatePayslip, useDeletePayslip } from '../../hooks/useHR';
import { usePayslipsSWR, invalidatePayslips } from '../../hooks/swr';
import { PayslipForm } from './forms/PayslipForm';
import { toast } from 'sonner';

const PayslipsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = usePayslipsSWR(filters);
  const create = useCreatePayslip();
  const update = useUpdatePayslip();
  const del = useDeletePayslip();

  const columns: Column<any>[] = useMemo(() => [
    { key: 'slip_number', label: 'Slip Number', render: (item) => <span className="font-semibold text-primary">{item.slip_number}</span>, sortable: true },
    { key: 'payroll', label: 'Payroll ID', render: (item) => item.payroll },
    { key: 'issue_date', label: 'Issue Date', render: (item) => new Date(item.issue_date).toLocaleDateString(), sortable: true },
    { key: 'slip_file', label: 'File', render: (item) => item.slip_file ? 'Available' : 'N/A' },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ], []);

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Payslip created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Payslip updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save payslip');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (window.confirm('Are you sure you want to delete this payslip?')) {
      try {
        await del.mutateAsync(selected.id);
        toast.success('Payslip deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete payslip');
      }
    }
  };

  return (
    <div>
      <DataTable title="Payslips" description="Manage payslips" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Payslip" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Payslip' : sidebarMode === 'edit' ? 'Edit Payslip' : 'Payslip Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDelete} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <PayslipForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Slip Number</label><p className="text-base font-semibold">{selected.slip_number}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Payroll ID</label><p className="text-base">{selected.payroll}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Issue Date</label><p className="text-base">{new Date(selected.issue_date).toLocaleDateString()}</p></div>
            {selected.slip_file && <div><label className="text-sm font-medium text-muted-foreground">File</label><p className="text-base">{selected.slip_file}</p></div>}
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.is_active ? 'default' : 'secondary'}>{selected.is_active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default PayslipsPage;
