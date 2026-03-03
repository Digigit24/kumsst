/**
 * Salary Components Page - Manage salary components
 */

import { useMemo, useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateSalaryComponent, useUpdateSalaryComponent, useDeleteSalaryComponent } from '../../hooks/useHR';
import { useSalaryComponentsSWR, invalidateSalaryComponents } from '../../hooks/swr';
import { SalaryComponentForm } from './forms/SalaryComponentForm';
import { toast } from 'sonner';

const SalaryComponentsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useSalaryComponentsSWR(filters);
  const create = useCreateSalaryComponent();
  const update = useUpdateSalaryComponent();
  const del = useDeleteSalaryComponent();

  const columns: Column<any>[] = useMemo(() => [
    { key: 'component_name', label: 'Component Name', render: (item) => <span className="font-semibold text-primary">{item.component_name}</span>, sortable: true },
    { key: 'component_type', label: 'Type', render: (item) => item.component_type, sortable: true },
    { key: 'amount', label: 'Amount', render: (item) => `₹${item.amount}` },
    { key: 'is_taxable', label: 'Taxable', render: (item) => <Badge variant={item.is_taxable ? 'default' : 'secondary'}>{item.is_taxable ? 'Yes' : 'No'}</Badge> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ], []);

  const handleRowClick = (item: any) => { setSelected(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleAddNew = () => { setSelected(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Salary component created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Salary component updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save salary component');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (window.confirm('Are you sure you want to delete this salary component?')) {
      try {
        await del.mutateAsync(selected.id);
        toast.success('Salary component deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete salary component');
      }
    }
  };

  return (
    <div>
      <DataTable title="Salary Components" description="Manage salary components" columns={columns} data={data || null} isLoading={isLoading} error={error?.message || null}
        filters={filters} onFiltersChange={setFilters} onRowClick={handleRowClick} onRefresh={refresh} onAdd={handleAddNew} addButtonLabel="Add Salary Component" />

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Salary Component' : sidebarMode === 'edit' ? 'Edit Salary Component' : 'Salary Component Details'}
        mode={sidebarMode} onEdit={handleEdit} onDelete={handleDelete} data={selected}>
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <SalaryComponentForm item={sidebarMode === 'edit' ? selected : null} onSubmit={handleFormSubmit} onCancel={() => setIsSidebarOpen(false)} />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Structure ID</label><p className="text-base font-semibold">{selected.structure}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Component Name</label><p className="text-base">{selected.component_name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Component Type</label><p className="text-base">{selected.component_type}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Amount</label><p className="text-base">₹{selected.amount}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Taxable</label><Badge variant={selected.is_taxable ? 'default' : 'secondary'}>{selected.is_taxable ? 'Yes' : 'No'}</Badge></div>
            <div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge variant={selected.is_active ? 'default' : 'secondary'}>{selected.is_active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default SalaryComponentsPage;
