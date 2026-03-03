import { Edit, Package, Plus, Printer, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  useConfirmReceipt,
  useCreateMaterialIssue,
  useDeleteMaterialIssue,
  useDispatchMaterialIssue,
  useGeneratePdf,
  usePatchMaterialIssue,
  useUpdateMaterialIssue,
} from '../../hooks/useMaterialIssues';
import { useMaterialIssuesSWR, invalidateMaterialIssues } from '../../hooks/swr';
import { materialIssuesApi } from '../../services/store.service';
import { MaterialIssueForm } from './forms/MaterialIssueForm';
import { MaterialIssuePrintDialog } from './MaterialIssuePrintDialog';

export const MaterialIssuesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [minToPrint, setMinToPrint] = useState<any>(null);

  const { data, isLoading, refresh } = useMaterialIssuesSWR(filters);
  const createMutation = useCreateMaterialIssue();
  const updateMutation = useUpdateMaterialIssue();
  const deleteMutation = useDeleteMaterialIssue();
  const dispatchMutation = useDispatchMaterialIssue();
  const confirmReceiptMutation = useConfirmReceipt();
  const generatePdfMutation = useGeneratePdf();
  const patchMutation = usePatchMaterialIssue();

  const handleCreate = () => {
    setSelectedIssue(null);
    setIsFormOpen(true);
  };

  const handleEdit = (issue: any) => {
    setSelectedIssue(issue);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setIssueToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!issueToDelete) return;

    try {
      await deleteMutation.mutateAsync(issueToDelete);
      toast.success('Material issue deleted successfully');
      refresh();
      setDeleteDialogOpen(false);
      setIssueToDelete(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete material issue');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // Clean data
      const cleanedData = { ...data };

      if (cleanedData.items && Array.isArray(cleanedData.items)) {
        cleanedData.items = cleanedData.items.map((item: any) => {
          const cleanedItem = { ...item };
          Object.keys(cleanedItem).forEach(key => {
            if (cleanedItem[key] === '') {
              delete cleanedItem[key];
            }
          });
          return cleanedItem;
        });
      }

      const optionalFields = [
        'dispatch_date',
        'receipt_date',
        'min_document',
        'internal_notes',
        'receipt_confirmation_notes',
        'issued_by',
        'received_by',
        'transport_mode',
        'vehicle_number',
        'driver_name',
        'driver_contact',
      ];

      optionalFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === null) {
          delete cleanedData[field];
        }
      });

      const hasFile = cleanedData.min_document instanceof File;

      let payload = cleanedData;
      if (hasFile) {
        const formData = new FormData();
        Object.keys(cleanedData).forEach(key => {
          if (key === 'items') {
            formData.append('items', JSON.stringify(cleanedData.items));
          } else if (cleanedData[key] !== undefined && cleanedData[key] !== null) {
            formData.append(key, cleanedData[key]);
          }
        });
        payload = formData;
      }

      if (selectedIssue) {
        await updateMutation.mutateAsync({ id: selectedIssue.id, data: payload });
        toast.success('Material issue updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Material issue created successfully');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      console.error('Material Issue Error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save material issue');
    }
  };

  const handleDispatch = async (issue: any) => {
    try {
      await dispatchMutation.mutateAsync({ id: issue.id, data: {} });
      toast.success('Material dispatched successfully');
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to dispatch');
    }
  };

  const handleStartTransit = async (issue: any) => {
    try {
      await patchMutation.mutateAsync({
        id: issue.id,
        data: { status: 'in_transit' }
      });
      toast.success('Transit started successfully');
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to start transit');
    }
  };

  const handleConfirmReceipt = async (issue: any) => {
    if (confirmingId) return;

    try {
      setConfirmingId(issue.id);
      await confirmReceiptMutation.mutateAsync({ id: issue.id, data: { notes: 'Material receipt confirmed' } });
      toast.success('Receipt confirmed successfully');
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to confirm receipt');
    } finally {
      setConfirmingId(null);
    }
  };

  const handlePrint = async (issue: any) => {
    try {
      const fullMIN = await materialIssuesApi.get(issue.id);
      setMinToPrint(fullMIN);
      setPrintDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load MIN details");
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'min_number',
      label: 'MIN Number',
      render: (row) => <span className="font-semibold">{row.min_number}</span>,
      sortable: true,
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      render: (row) => new Date(row.issue_date).toLocaleDateString(),
    },
    {
      key: 'central_store_name',
      label: 'From Store',
      render: (row) => row.central_store_name || `Store #${row.central_store}`,
    },
    {
      key: 'receiving_college_name',
      label: 'To College',
      render: (row) => row.receiving_college_name || `College #${row.receiving_college}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
          prepared: 'secondary',
          dispatched: 'default',
          received: 'outline',
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const isDispatching = dispatchMutation.isPending && dispatchMutation.variables?.id === row.id;
        const isConfirming = confirmReceiptMutation.isPending && confirmReceiptMutation.variables?.id === row.id;
        const isGeneratingPdf = generatePdfMutation.isPending && generatePdfMutation.variables === row.id;
        const isDeleting = deleteMutation.isPending && deleteMutation.variables === row.id;
        const isStartingTransit = patchMutation.isPending && patchMutation.variables?.id === row.id;

        const isAnyActionPending = isDispatching || isConfirming || isGeneratingPdf || isDeleting || isStartingTransit;

        return (
          <div className="flex gap-2">
            {row.status === 'prepared' && (
              <Button
                size="sm"
                onClick={() => handleDispatch(row)}
                loading={isDispatching}
                disabled={isAnyActionPending}
              >
                <Truck className="h-4 w-4 mr-1" />
                Dispatch
              </Button>
            )}
            {row.status === 'dispatched' && (
              <Button
                size="sm"
                onClick={() => handleStartTransit(row)}
                loading={isStartingTransit}
                disabled={isAnyActionPending}
              >
                <Truck className="h-4 w-4 mr-1" />
                In Transit
              </Button>
            )}
            {row.status === 'in_transit' && (
              <Button
                size="sm"
                onClick={() => handleConfirmReceipt(row)}
                loading={isConfirming}
                disabled={isAnyActionPending}
              >
                <Package className="h-4 w-4 mr-1" />
                Confirm
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePrint(row)}
              disabled={isAnyActionPending}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(row)}
              disabled={isAnyActionPending}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.id)}
              disabled={isAnyActionPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Issues</h1>
          <p className="text-muted-foreground">Track material transfers from central stores</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Create Material Issue
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data || null}
        isLoading={isLoading}
        error={null}
        onRefresh={refresh}
        onFiltersChange={setFilters}
        filters={filters}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIssue ? 'Edit Material Issue' : 'Create New Material Issue'}</DialogTitle>
          </DialogHeader>
          <MaterialIssueForm
            materialIssue={selectedIssue}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <MaterialIssuePrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        min={minToPrint}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Material Issue"
        description="Are you sure you want to delete this material issue? This action cannot be undone."
      />
    </div>
  );
};
