import { Edit, Eye, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
  useCreateRequirement,
  useDeleteRequirement,
  useRequirements,
  useSubmitRequirement,
  useUpdateRequirement,
} from '../../../hooks/useProcurement';
import { ProcurementRequirement } from '../../../types/store.types';
import { RequirementForm } from './forms/RequirementForm';
import { RequirementDetailDialog } from './RequirementDetailDialog';

export const RequirementsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<ProcurementRequirement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [requirementToView, setRequirementToView] = useState<number | null>(null);

  const { data, isLoading, refetch, error } = useRequirements(filters);
  const createMutation = useCreateRequirement();
  const updateMutation = useUpdateRequirement();
  const deleteMutation = useDeleteRequirement();
  const submitMutation = useSubmitRequirement();

  const handleCreate = () => {
    setSelectedRequirement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (requirement: ProcurementRequirement) => {
    setSelectedRequirement(requirement);
    setIsFormOpen(true);
  };

  const handleView = (id: number) => {
    setRequirementToView(id);
    setDetailDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setRequirementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!requirementToDelete) return;

    try {
      await deleteMutation.mutateAsync(requirementToDelete);
      toast.success('Requirement deleted successfully');
      refetch();
      setDeleteDialogOpen(false);
      setRequirementToDelete(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete requirement');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedRequirement) {
        await updateMutation.mutateAsync({ id: selectedRequirement.id, data });
        toast.success('Requirement updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Requirement created successfully');
      }
      setIsFormOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save requirement');
    }
  };

  const handleSubmitForApproval = async (requirement: ProcurementRequirement) => {
    try {
      await submitMutation.mutateAsync({ id: requirement.id, data: requirement });
      toast.success('Requirement submitted for approval');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to submit requirement');
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      draft: 'secondary',
      submitted: 'default',
      pending_approval: 'default',
      approved: 'outline',
      rejected: 'destructive',
      quotation_received: 'default',
      po_created: 'outline',
      fulfilled: 'outline',
      cancelled: 'destructive',
    };
    return variants[status] || 'default';
  };

  const getUrgencyVariant = (urgency: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'outline',
      urgent: 'destructive',
    };
    return variants[urgency] || 'default';
  };

  const columns: Column<ProcurementRequirement>[] = [
    {
      key: 'requirement_number',
      label: 'Req. Number',
      render: (row) => <span className="font-semibold">{row.requirement_number}</span>,
      sortable: true,
    },
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <div className="max-w-xs truncate" title={row.title}>
          {row.title}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'required_by_date',
      label: 'Required By',
      render: (row) => new Date(row.required_by_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'urgency', // Using 'urgency' directly as key is fine if data matches
      label: 'Urgency',
      render: (row) => (
        <Badge variant={getUrgencyVariant(row.urgency)} className="capitalize">
          {row.urgency}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)} className="capitalize">
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'id', // Use ID for actions key to be unique, but label is Actions
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'draft' && (
            <Button size="sm" onClick={() => handleSubmitForApproval(row)}>
              <Send className="h-4 w-4 mr-1" />
              Submit
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => handleView(row.id)}>
            <Eye className="h-4 w-4" />
          </Button>
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
      <DataTable
        title="Procurement Requirements"
        description="Manage procurement requirements and requests"
        onAdd={handleCreate}
        addButtonLabel="Create Requirement"
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
            <DialogTitle>{selectedRequirement ? 'Edit Requirement' : 'Create New Requirement'}</DialogTitle>
          </DialogHeader>
          <RequirementForm
            requirement={selectedRequirement}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Requirement"
        description="Are you sure you want to delete this requirement? This action cannot be undone."
      />

      <RequirementDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        requirementId={requirementToView}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
