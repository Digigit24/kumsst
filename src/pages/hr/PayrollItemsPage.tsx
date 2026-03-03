/**
 * Payroll Items Page - Manage payroll items
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useCreatePayrollItem, useUpdatePayrollItem, useDeletePayrollItem } from '../../hooks/useHR';
import { usePayrollItemsSWR, invalidatePayrollItems } from '../../hooks/swr';
import { PayrollItemForm } from './forms/PayrollItemForm';
import { toast } from 'sonner';
import { Layers, Sparkles, ToggleRight, Wallet } from 'lucide-react';

const PayrollItemsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = usePayrollItemsSWR(filters);
  const create = useCreatePayrollItem();
  const update = useUpdatePayrollItem();
  const del = useDeletePayrollItem();

  const rows = useMemo(() => data?.results || [], [data]);
  const metrics = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r: any) => r.is_active).length;
    const allowance = rows.filter((r: any) => (r.component_type || '').toLowerCase() === 'allowance').length;
    const deductions = rows.filter((r: any) => (r.component_type || '').toLowerCase() === 'deduction').length;
    const sum = rows.reduce((acc: number, r: any) => acc + (Number(r.amount) || 0), 0);
    return { total, active, allowance, deductions, sum };
  }, [rows]);

  const columns: Column<any>[] = useMemo(() => [
    { key: 'payroll', label: 'Payroll ID', render: (item) => <span className="font-semibold text-primary">{item.payroll}</span>, sortable: true },
    { key: 'component_name', label: 'Component Name', render: (item) => item.component_name, sortable: true },
    { key: 'component_type', label: 'Type', render: (item) => item.component_type },
    { key: 'amount', label: 'Amount', render: (item) => `Rs. ${Number(item.amount || 0).toLocaleString()}` },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ], []);

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Payroll item created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Payroll item updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save payroll item');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (window.confirm('Are you sure you want to delete this payroll item?')) {
      try {
        await del.mutateAsync(selected.id);
        toast.success('Payroll item deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete payroll item');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-widest text-primary/70">Payroll Items</p>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          Components &amp; Adjustments <Sparkles className="h-5 w-5 text-primary" />
        </h1>
        <p className="text-muted-foreground">Allowances and deductions organized in one view.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.total}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-emerald-500/20">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
            <ToggleRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.active}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-background border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Allowances</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.allowance}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Deductions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.deductions}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-background border-slate-500/20">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Total Amount</CardTitle>
            <Wallet className="h-4 w-4 text-slate-600 dark:text-slate-200" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold">Rs. {metrics.sum.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Item Library</CardTitle>
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
            addButtonLabel="Add Payroll Item"
          />
        </CardContent>
      </Card>

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Payroll Item' : sidebarMode === 'edit' ? 'Edit Payroll Item' : 'Payroll Item Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDelete} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <PayrollItemForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Payroll ID</label><p className="text-base font-semibold">{selected.payroll}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Component Name</label><p className="text-base">{selected.component_name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Component Type</label><p className="text-base">{selected.component_type}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Amount</label><p className="text-base">Rs. {Number(selected.amount || 0).toLocaleString()}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.is_active ? 'default' : 'secondary'}>{selected.is_active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default PayrollItemsPage;

