import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { academicSessionApi } from '../../services/core.service';
import { AcademicSessionForm } from './components/AcademicSessionForm';
import { useDeleteAcademicSession } from '../../hooks/useCore';
const AcademicSessionsPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: 20 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['academic-sessions', filters],
    queryFn: () => academicSessionApi.list(filters),
  });

  const { data: selected } = useQuery({
    queryKey: ['academic-session', selectedId],
    queryFn: () => selectedId ? academicSessionApi.get(selectedId) : null,
    enabled: !!selectedId,
  });

  const deleteMutation = useDeleteAcademicSession();

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Session Name',
      sortable: true,
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'academic_year_label',
      label: 'Academic Year',
      render: (item) => <span className="text-sm">{item.academic_year_label}</span>,
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (item) => <Badge variant="outline">Semester {item.semester}</Badge>,
    },
    {
      key: 'start_date',
      label: 'Duration',
      render: (item) => (
        <span className="text-sm">{new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'is_current',
      label: 'Current',
      render: (item) => item.is_current ? <Badge variant="default">Current</Badge> : <Badge variant="outline">Past/Future</Badge>,
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'semester',
      label: 'Semester',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: '1', label: 'Semester 1' },
        { value: '2', label: 'Semester 2' },
        { value: '3', label: 'Semester 3' },
        { value: '4', label: 'Semester 4' },
        { value: '5', label: 'Semester 5' },
        { value: '6', label: 'Semester 6' },
        { value: '7', label: 'Semester 7' },
        { value: '8', label: 'Semester 8' },
      ],
    },
    {
      name: 'is_current',
      label: 'Current',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Current' },
        { value: 'false', label: 'Past/Future' },
      ],
    },
  ];

  const handleSubmit = async (formData: any) => {
    if (sidebarMode === 'create') {
      await academicSessionApi.create(formData);
    } else if (selected) {
      await academicSessionApi.update(selected.id, formData);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutate(deleteId);
      toast.success('Academic session deleted successfully');
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete academic session');
    }
  };

  return (
    <div className="p-6">
      <DataTable
        title="Academic Sessions"
        description="Manage academic sessions and semesters for your institution"
        data={data ?? null}
        columns={columns}
        isLoading={isLoading}
        error={error ? error.message : null}
        onRefresh={refetch}
        onAdd={() => {
          setSelectedId(null);
          setSidebarMode('create');
          setIsSidebarOpen(true);
        }}
        onRowClick={(item) => {
          setSelectedId(item.id);
          setSidebarMode('view');
          setIsSidebarOpen(true);
        }}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search sessions..."
        addButtonLabel="Add Session"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => { setIsSidebarOpen(false); setSelectedId(null); }}
        title={sidebarMode === 'create' ? 'Add New Session' : sidebarMode === 'edit' ? 'Edit Session' : selected?.name || 'Session Details'}
        mode={sidebarMode}
        width="lg"
      >
        {sidebarMode === 'create' && (
          <AcademicSessionForm
            mode="create"
            onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['academic-sessions'] }); setIsSidebarOpen(false); }}
            onCancel={() => setIsSidebarOpen(false)}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'edit' && selected && (
          <AcademicSessionForm
            mode="edit"
            academicSession={selected}
            onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['academic-sessions'] }); queryClient.invalidateQueries({ queryKey: ['academic-session', selectedId] }); setIsSidebarOpen(false); }}
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
                <h3 className="font-semibold mb-3">Session Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Session Name</label>
                    <p className="font-medium text-lg">{selected.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Academic Year</label>
                    <p className="font-medium">{selected.academic_year_label}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Semester</label>
                    <p className="font-medium">Semester {selected.semester}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Start Date</label>
                      <p className="font-medium">{new Date(selected.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">End Date</label>
                      <p className="font-medium">{new Date(selected.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Current:</span>
                    {selected.is_current ? <Badge variant="default">Yes</Badge> : <Badge variant="outline">No</Badge>}
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
        title="Delete Academic Session"
        description="Are you sure you want to delete this academic session? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};

export default AcademicSessionsPage;
