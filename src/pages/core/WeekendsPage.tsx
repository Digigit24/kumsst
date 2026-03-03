/**
 * Weekends Page - Configure weekend days for institution
 */

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, Column } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { WeekendForm } from './components/WeekendForm';
import { weekendApi } from '../../services/core.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeleteWeekend } from '../../hooks/useCore';

const WeekendsPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: 20 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['weekends', filters],
    queryFn: () => weekendApi.list(filters),
  });

  const { data: selected } = useQuery({
    queryKey: ['weekend', selectedId],
    queryFn: () => selectedId ? weekendApi.get(selectedId) : null,
    enabled: !!selectedId,
  });

  const deleteMutation = useDeleteWeekend();

  const columns: Column<any>[] = [
    {
      key: 'day',
      label: 'Day of Week',
      sortable: true,
      render: (item) => <span className="font-medium">{item.day_display}</span>,
    },
    {
      key: 'college_name',
      label: 'College',
      render: (item) => <span className="text-sm text-muted-foreground">{item.college_name}</span>,
    },
  ];

  const handleSubmit = async (formData: any) => {
    if (sidebarMode === 'create') {
      await weekendApi.create(formData);
    } else if (selected) {
      await weekendApi.update(selected.id, formData);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutate(deleteId);
      toast.success('Weekend deleted successfully');
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete weekend');
    }
  };

  return (
    <div className="p-6">
      <DataTable
        title="Weekends Configuration"
        description="Configure weekend days for your institution"
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : error ? String(error) : null}
        onRefresh={refetch}
        onAdd={() => { setSelectedId(null); setSidebarMode('create'); setIsSidebarOpen(true); }}
        onRowClick={(item) => { setSelectedId(item.id); setSidebarMode('view'); setIsSidebarOpen(true); }}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Search weekends..."
        addButtonLabel="Add Weekend"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => { setIsSidebarOpen(false); setSelectedId(null); }}
        title={sidebarMode === 'create' ? 'Add Weekend Day' : sidebarMode === 'edit' ? 'Edit Weekend Day' : 'Weekend Details'}
        mode={sidebarMode}
        width="lg"
      >
        {sidebarMode === 'create' && (
          <WeekendForm
            mode="create"
            onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['weekends'] }); setIsSidebarOpen(false); }}
            onCancel={() => setIsSidebarOpen(false)}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'edit' && selected && (
          <WeekendForm
            mode="edit"
            weekend={selected}
            onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['weekends'] }); queryClient.invalidateQueries({ queryKey: ['weekend', selectedId] }); setIsSidebarOpen(false); }}
            onCancel={() => setIsSidebarOpen(false)}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'view' && selected && (
          <div className="space-y-6">
            <div className="flex justify-end gap-2">
              <button onClick={() => setSidebarMode('edit')} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Edit
              </button>
              <button onClick={() => setDeleteId(selected.id)} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Weekend Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Day of Week</label>
                    <p className="font-medium text-lg">{selected.day_display}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">College</label>
                    <p className="font-medium">{selected.college_name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p>{new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Updated At</label>
                    <p>{new Date(selected.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailSidebar>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Weekend"
        description="Are you sure you want to delete this weekend configuration? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};

export default WeekendsPage;
