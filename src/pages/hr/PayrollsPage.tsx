/**
 * Payrolls Page - Manage payrolls
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useCreatePayroll, useUpdatePayroll, useDeletePayroll } from '../../hooks/useHR';
import { usePayrollsSWR, invalidatePayrolls } from '../../hooks/swr';
import { PayrollForm } from './forms/PayrollForm';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';

const PayrollsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = usePayrollsSWR(filters);
  const create = useCreatePayroll();
  const update = useUpdatePayroll();
  const del = useDeletePayroll();

  const rows = useMemo(() => data?.results || [], [data]);
  const metrics = useMemo(() => {
    let paid = 0, pending = 0, net = 0;
    for (const r of rows) {
      if (r.status === 'paid') paid++;
      else if (r.status === 'pending') pending++;
      net += Number(r.net_salary) || 0;
    }
    return { total: rows.length, paid, pending, net };
  }, [rows]);

  const columns: Column<any>[] = useMemo(() => [
    { key: 'teacher_name', label: 'Teacher', render: (item: any) => <span className="font-semibold text-primary">{item.teacher_name || 'N/A'}</span>, sortable: true },
    { key: 'month', label: 'Month', render: (item: any) => item.month, sortable: true },
    { key: 'year', label: 'Year', render: (item: any) => item.year, sortable: true },
    { key: 'gross_salary', label: 'Gross Salary', render: (item: any) => `Rs. ${Number(item.gross_salary || 0).toLocaleString()}` },
    { key: 'net_salary', label: 'Net Salary', render: (item: any) => `Rs. ${Number(item.net_salary || 0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (item: any) => <Badge variant={item.status === 'paid' ? 'default' : item.status === 'pending' ? 'secondary' : 'destructive'}>{item.status}</Badge> },
  ], []);

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Payroll created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Payroll updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save payroll');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (window.confirm('Are you sure you want to delete this payroll?')) {
      try {
        await del.mutateAsync(selected.id);
        toast.success('Payroll deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete payroll');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-widest text-primary/70">Payrolls</p>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          Pay Cycle Overview <Sparkles className="h-5 w-5 text-primary" />
        </h1>
        <p className="text-muted-foreground">Stay on top of monthly payouts and statuses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Payrolls</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.total}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-emerald-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.paid}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background border-amber-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.pending}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-background border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Net Payout (sum)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">Rs. {metrics.net.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Payroll List</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable
            columns={columns}
            data={data || null}
            isLoading={isLoading}
            error={error?.message || null}
            filters={filters}
            onFiltersChange={setFilters}
            onRowClick={handleRowClick}
            onRefresh={refresh}
            onAdd={handleAddNew}
            addButtonLabel="Add Payroll"
          />
        </CardContent>
      </Card>

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Payroll' : sidebarMode === 'edit' ? 'Edit Payroll' : 'Payroll Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDelete} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <PayrollForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Teacher</label><p className="text-base font-semibold">{selected.teacher_name || 'N/A'}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Month</label><p className="text-base">{selected.month}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Year</label><p className="text-base">{selected.year}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Gross Salary</label><p className="text-base">Rs. {Number(selected.gross_salary || 0).toLocaleString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Total Allowances</label><p className="text-base">Rs. {Number(selected.total_allowances || 0).toLocaleString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Total Deductions</label><p className="text-base">Rs. {Number(selected.total_deductions || 0).toLocaleString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Net Salary</label><p className="text-base">Rs. {Number(selected.net_salary || 0).toLocaleString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Payment Date</label><p className="text-base">{new Date(selected.payment_date).toLocaleDateString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Payment Method</label><p className="text-base">{selected.payment_method}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.status === 'paid' ? 'default' : selected.status === 'pending' ? 'secondary' : 'destructive'}>{selected.status}</Badge></div>
            {selected.remarks && <div><label className="text-sm font-medium text-muted-foreground">Remarks</label><p className="text-base">{selected.remarks}</p></div>}
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default PayrollsPage;

