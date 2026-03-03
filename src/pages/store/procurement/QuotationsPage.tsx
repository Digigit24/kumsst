import { CheckCircle, FileText, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
  useCreateQuotation,
  useDeleteQuotation,
  useMarkQuotationSelected,
  useQuotations,
} from '../../../hooks/useProcurement';
import { PaginatedResponse } from '../../../types/core.types';
import { SupplierQuotation } from '../../../types/store.types';
import { QuotationForm } from './forms/QuotationForm';

export const QuotationsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<SupplierQuotation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<number | null>(null);

  const { data, isLoading, refetch, error } = useQuotations(filters);
  const createMutation = useCreateQuotation();
  const deleteMutation = useDeleteQuotation();
  const selectMutation = useMarkQuotationSelected();

  const handleCreate = () => {
    setSelectedQuotation(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setQuotationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quotationToDelete) return;

    try {
      await deleteMutation.mutateAsync(quotationToDelete);
      toast.success('Quotation deleted successfully');
      refetch();
      setDeleteDialogOpen(false);
      setQuotationToDelete(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete quotation');
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success('Quotation uploaded successfully');
      setIsFormOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to upload quotation');
    }
  };

  const handleMarkSelected = async (quotation: SupplierQuotation) => {
    try {
      await selectMutation.mutateAsync({ id: quotation.id, data: quotation });
      toast.success('Quotation marked as selected');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to select quotation');
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      received: 'secondary',
      under_review: 'default',
      accepted: 'outline',
      rejected: 'destructive',
    };
    return variants[status] || 'default';
  };

  const columns: Column<SupplierQuotation>[] = [
    {
      key: 'quotation_number',
      label: 'Quotation Number',
      render: (row) => <span className="font-semibold">{row.quotation_number}</span>,
      sortable: true,
    },
    {
      key: 'quotation_date',
      label: 'Date',
      render: (row) => new Date(row.quotation_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (row) => row.supplier_details?.name || `Supplier #${row.supplier}`,
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
      key: 'is_selected',
      label: 'Selected',
      render: (row) => row.is_selected ? (
        <Badge variant="outline">
          <CheckCircle className="h-3 w-3 mr-1" />
          Yes
        </Badge>
      ) : (
        <Badge variant="secondary">No</Badge>
      ),
    },
    {
      key: 'grand_total',
      label: 'Amount',
      render: (row) => row.grand_total ? `₹${parseFloat(row.grand_total).toLocaleString()}` : '-',
    },
    {
      key: 'quotation_file_url',
      label: 'Document',
      render: (row) => row.quotation_file_url ? (
        <a
          href={row.quotation_file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
        >
          <FileText className="h-4 w-4" />
          View
        </a>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {!row.is_selected && row.status !== 'rejected' && (
            <Button size="sm" onClick={() => handleMarkSelected(row)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Select
            </Button>
          )}
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
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Upload and review supplier quotations</p>
        </div>
        <Button onClick={handleCreate}>
          <Upload className="h-4 w-4 mr-1" />
          Upload Quotation
        </Button>
      </div>

      <DataTable
        title={undefined}
        columns={columns}
        data={data as PaginatedResponse<SupplierQuotation> | null}
        isLoading={isLoading}
        error={error ? (error as any).message || 'Error loading data' : null}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Quotation</DialogTitle>
          </DialogHeader>
          <QuotationForm
            quotation={selectedQuotation}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Quotation"
        description="Are you sure you want to delete this quotation? This action cannot be undone."
      />
    </div>
  );
};
