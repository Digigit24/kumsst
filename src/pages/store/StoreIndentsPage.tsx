import deliveryTruckGif from '@/assets/delivery-truck.gif';
import { Edit, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  useCreateStoreIndent,
  useDeleteStoreIndent,
  useSubmitStoreIndent,
  useUpdateStoreIndent,
} from '../../hooks/useStoreIndents';
import { useStoreIndentsSWR, invalidateStoreIndents } from '../../hooks/swr';
import { StoreIndentForm } from './forms/StoreIndentForm';
import { StoreIndentPipeline } from './forms/StoreIndentPipeline';

const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'secondary',
    pending_college_approval: 'default',
    pending_super_admin: 'default',
    super_admin_approved: 'outline',
    rejected_by_college: 'destructive',
    rejected_by_super_admin: 'destructive',
    partially_fulfilled: 'secondary',
    fulfilled: 'outline',
    cancelled: 'destructive',
  };
  return variants[status] || 'default';
};

const getPriorityVariant = (priority: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    low: 'secondary',
    medium: 'default',
    high: 'outline',
    urgent: 'destructive',
  };
  return variants[priority] || 'default';
};

export const StoreIndentsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indentToDelete, setIndentToDelete] = useState<number | null>(null);

  const { data, isLoading, refresh } = useStoreIndentsSWR(filters);
  const createMutation = useCreateStoreIndent();
  const updateMutation = useUpdateStoreIndent();
  const deleteMutation = useDeleteStoreIndent();
  const submitMutation = useSubmitStoreIndent();

  const handleCreate = () => {
    setSelectedIndent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (indent: any) => {
    setSelectedIndent(indent);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setIndentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!indentToDelete) return;

    try {
      await deleteMutation.mutateAsync(indentToDelete);
      toast.success('Indent deleted successfully');
      refresh();
      setDeleteDialogOpen(false);
      setIndentToDelete(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete indent');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedIndent) {
        await updateMutation.mutateAsync({ id: selectedIndent.id, data });
        toast.success('Indent updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Indent created successfully');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      console.error('Store Indent Error:', error);

      // Parse validation errors
      let errorMessage = 'Failed to save indent';

      if (error.response?.data) {
        const errors = error.response.data;

        // Handle items validation errors
        if (errors.items && Array.isArray(errors.items)) {
          errors.items.forEach((itemError: any, index: number) => {
            if (itemError.central_store_item) {
              toast.error(`Item ${index + 1}: ${itemError.central_store_item[0]}`);
            }
          });
          return;
        }

        // Handle other field errors
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && errors[firstErrorKey]) {
          const errorValue = Array.isArray(errors[firstErrorKey])
            ? errors[firstErrorKey][0]
            : errors[firstErrorKey];
          errorMessage = `${firstErrorKey}: ${errorValue}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleSubmitIndent = async (indent: any) => {
    try {
      await submitMutation.mutateAsync({ id: indent.id, data: {} });
      toast.success('Indent submitted for college admin approval');
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to submit indent');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'indent_number',
      label: 'Indent Number',
      render: (row) => <span className="font-semibold">{row.indent_number}</span>,
      sortable: true,
    },
    {
      key: 'required_by_date',
      label: 'Required By',
      render: (row) => new Date(row.required_by_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => (
        <Badge variant={getPriorityVariant(row.priority)} className="capitalize">
          {row.priority}
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
      key: 'college',
      label: 'College',
      render: (row) => row.college_name || `College #${row.college}`,
    },
    {
      key: 'central_store',
      label: 'Central Store',
      render: (row) => row.central_store_name || `Store #${row.central_store}`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const isSubmitting = submitMutation.isPending && submitMutation.variables?.id === row.id;
        // For delete, we might not have variables if it's separate dialog, but if we use mutation directly or tracking ID:
        // Actually delete is handled via dialog using 'indentToDelete'.
        // But the 'submit' button triggers mutation directly.
        // We should add loading to Submit button.

        return (
          <div className="flex gap-2">
            {row.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => handleSubmitIndent(row)}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-1" />
                Submit
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => handleEdit(row)} disabled={isSubmitting}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)} disabled={isSubmitting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Custom loading screen with delivery truck animation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="relative">
          <img
            src={deliveryTruckGif}
            alt="Loading indents..."
            className="w-64 h-64 object-contain"
          />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Store Indents...
          </h3>
          <p className="text-muted-foreground">
            Fetching your indent requests from the warehouse
          </p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Indents</h1>
          <p className="text-muted-foreground">Manage store indent requests</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Create Indent
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data || null}
        isLoading={isLoading}
        onPageChange={(page: number) => setFilters({ ...filters, page })}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className={`${selectedIndent ? 'max-w-4xl' : 'max-w-5xl'} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>{selectedIndent ? 'Edit Indent' : 'Create New Indent'}</DialogTitle>
          </DialogHeader>
          {selectedIndent ? (
            <StoreIndentForm
              indent={selectedIndent}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          ) : (
            <StoreIndentPipeline
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={createMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Indent"
        description="Are you sure you want to delete this indent? This action cannot be undone."
      />
    </div>
  );
};
