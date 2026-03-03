import { useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Column, DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  useInspections,
  useCreateInspection,
  useUpdateInspection,
  useDeleteInspection,
} from '../../../hooks/useProcurement';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { InspectionForm } from './forms/InspectionForm';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { InspectionNote } from '../../../types/store.types';

export const InspectionsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<InspectionNote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<number | null>(null);

  const { data, isLoading, refetch, error } = useInspections(filters);
  const createMutation = useCreateInspection();
  const updateMutation = useUpdateInspection();
  const deleteMutation = useDeleteInspection();

  const handleCreate = () => {
    setSelectedInspection(null);
    setIsFormOpen(true);
  };

  const handleEdit = (inspection: InspectionNote) => {
    setSelectedInspection(inspection);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setInspectionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!inspectionToDelete) return;

    try {
      await deleteMutation.mutateAsync(inspectionToDelete);
      toast.success('Inspection deleted successfully');
      refetch();
      setDeleteDialogOpen(false);
      setInspectionToDelete(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete inspection');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedInspection) {
        await updateMutation.mutateAsync({ id: selectedInspection.id, data });
        toast.success('Inspection updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Inspection created successfully');
      }
      setIsFormOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save inspection');
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      passed: 'outline',
      failed: 'destructive',
      partial: 'default',
      pending: 'secondary',
    };
    return variants[status] || 'default';
  };

  const getRecommendationVariant = (recommendation: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      accept: 'outline',
      reject: 'destructive',
      partial_accept: 'default',
    };
    return variants[recommendation] || 'default';
  };

  const columns: Column<InspectionNote>[] = [
    {
      key: 'grn_number',
      label: 'GRN Number',
      render: (row) => <span className="font-semibold">{row.grn || `GRN #${row.grn}`}</span>,
      sortable: true,
    },
    {
      key: 'inspection_date',
      label: 'Inspection Date',
      render: (row) => new Date(row.inspection_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'inspector',
      label: 'Inspector',
      render: (row) => `Inspector #${row.inspector}`,
    },
    {
      key: 'overall_status',
      label: 'Status',
      render: (row) => (
        <Badge variant={getStatusVariant(row.overall_status)} className="capitalize">
          {row.overall_status}
        </Badge>
      ),
    },
    {
      key: 'quality_rating',
      label: 'Quality Rating',
      render: (row) => (
        <div className="flex items-center gap-1">
          <span>{row.quality_rating || 0}</span>
          <span className="text-yellow-500">★</span>
        </div>
      ),
    },
    {
      key: 'packaging_condition',
      label: 'Packaging',
      render: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.packaging_condition || 'Not rated'}
        </Badge>
      ),
    },
    {
      key: 'recommendation',
      label: 'Recommendation',
      render: (row) => (
        <Badge variant={getRecommendationVariant(row.recommendation)} className="capitalize">
          {row.recommendation.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Inspections</h1>
          <p className="text-muted-foreground">Track quality inspections for goods received</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Create Inspection
        </Button>
      </div>

      <DataTable
        title={undefined}
        columns={columns as Column<any>[]}
        data={data || null}
        isLoading={isLoading}
        error={error ? (error as any).message || 'Error loading data' : null}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInspection ? 'Edit Inspection' : 'Create New Inspection'}</DialogTitle>
          </DialogHeader>
          <InspectionForm
            inspection={selectedInspection}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Inspection"
        description="Are you sure you want to delete this inspection? This action cannot be undone."
      />
    </div>
  );
};
