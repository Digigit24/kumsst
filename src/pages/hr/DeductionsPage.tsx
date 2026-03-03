/**
 * Deductions Page - Manage HR deductions
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useCreateDeduction, useUpdateDeduction, useDeleteDeduction } from '../../hooks/useHR';
import { useDeductionsSWR, invalidateDeductions } from '../../hooks/swr';
import { DeductionForm } from './forms/DeductionForm';
import { toast } from 'sonner';
import { MinusCircle, Palette, ShieldCheck, Sparkles } from 'lucide-react';

const DeductionsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedDeduction, setSelectedDeduction] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useDeductionsSWR(filters);
  const createDeduction = useCreateDeduction();
  const updateDeduction = useUpdateDeduction();
  const deleteDeduction = useDeleteDeduction();

  const rows = useMemo(() => data?.results || [], [data]);
  const metrics = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r: any) => r.is_active).length;
    const types: Record<string, number> = {};
    rows.forEach((r: any) => {
      const key = (r.deduction_type || 'other').toLowerCase();
      types[key] = (types[key] || 0) + 1;
    });
    const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';
    return { total, active, types, topType };
  }, [rows]);

  const columns: Column<any>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      render: (item) => (
        <span className="font-semibold text-primary">{item.name}</span>
      ),
      sortable: true,
    },
    {
      key: 'code',
      label: 'Code',
      render: (item) => item.code,
      sortable: true,
    },
    {
      key: 'deduction_type',
      label: 'Type',
      render: (item) => item.deduction_type,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => `Rs. ${Number(item.amount || 0).toLocaleString()}`,
    },
    {
      key: 'percentage',
      label: 'Percentage',
      render: (item) => `${item.percentage}%`,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  const handleRowClick = (item: any) => {
    setSelectedDeduction(item);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleAddNew = () => {
    setSelectedDeduction(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createDeduction.mutateAsync(formData);
        toast.success('Deduction created successfully');
      } else {
        await updateDeduction.mutateAsync({ id: selectedDeduction.id, data: formData });
        toast.success('Deduction updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save deduction');
    }
  };

  const handleDelete = async () => {
    if (!selectedDeduction) return;

    if (window.confirm('Are you sure you want to delete this deduction?')) {
      try {
        await deleteDeduction.mutateAsync(selectedDeduction.id);
        toast.success('Deduction deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete deduction');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-widest text-primary/70">Deductions</p>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          Smart Deductions <Sparkles className="h-5 w-5 text-primary" />
        </h1>
        <p className="text-muted-foreground">Keep policies tidy with quick visibility into rules.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Policies</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.total}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-emerald-500/20">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.active}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background border-amber-500/20">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Top Type</CardTitle>
            <Palette className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="text-lg font-semibold capitalize">{metrics.topType}</CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Deduction Library</CardTitle>
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
            addButtonLabel="Add Deduction"
          />
        </CardContent>
      </Card>

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Deduction' : sidebarMode === 'edit' ? 'Edit Deduction' : 'Deduction Details'}
        mode={sidebarMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        data={selectedDeduction}
      >
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <DeductionForm
            deduction={sidebarMode === 'edit' ? selectedDeduction : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        )}

        {sidebarMode === 'view' && selectedDeduction && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-base font-semibold">{selectedDeduction.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Code</label>
              <p className="text-base">{selectedDeduction.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-base">{selectedDeduction.deduction_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-base">Rs. {Number(selectedDeduction.amount || 0).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Percentage</label>
              <p className="text-base">{selectedDeduction.percentage}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={selectedDeduction.is_active ? 'default' : 'secondary'}>
                {selectedDeduction.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default DeductionsPage;

