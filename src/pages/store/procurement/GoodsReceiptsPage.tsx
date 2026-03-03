import { Edit, Eye, Package, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
  useCreateGoodsReceipt,
  useDeleteGoodsReceipt,
  useGoodsReceipts,
  usePostGoodsReceiptToInventory,
  useSubmitGoodsReceiptForInspection,
  useUpdateGoodsReceipt,
} from '../../../hooks/useProcurement';
import { PaginatedResponse } from '../../../types/core.types';
import { GoodsReceiptNote, GoodsReceiptNoteCreateInput } from '../../../types/store.types';
import { GoodsReceiptForm } from './forms/GoodsReceiptForm';
import { GoodsReceiptDetailDialog } from './GoodsReceiptDetailDialog';

export const GoodsReceiptsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceiptNote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grnToDelete, setGrnToDelete] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [grnToView, setGrnToView] = useState<number | null>(null);

  const { data, isLoading, refetch, error } = useGoodsReceipts(filters);
  const createMutation = useCreateGoodsReceipt();
  const updateMutation = useUpdateGoodsReceipt();
  const deleteMutation = useDeleteGoodsReceipt();
  const inspectionMutation = useSubmitGoodsReceiptForInspection();
  const inventoryMutation = usePostGoodsReceiptToInventory();

  const handleCreate = () => {
    setSelectedGRN(null);
    setIsFormOpen(true);
  };

  const handleEdit = (grn: GoodsReceiptNote) => {
    setSelectedGRN(grn);
    setIsFormOpen(true);
  };

  const handleView = (id: number) => {
    setGrnToView(id);
    setDetailDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setGrnToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!grnToDelete) return;

    try {
      await deleteMutation.mutateAsync(grnToDelete);
      toast.success('Goods receipt deleted successfully');
      refetch();
      setDeleteDialogOpen(false);
      setGrnToDelete(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete goods receipt');
    }
  };

  const handleSubmit = async (formData: GoodsReceiptNoteCreateInput) => {
    try {
      if (selectedGRN) {
        await updateMutation.mutateAsync({ id: selectedGRN.id, data: formData });
        toast.success('Goods receipt updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Goods receipt created successfully');
      }
      setIsFormOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save goods receipt');
    }
  };

  const handleSubmitForInspection = async (grn: GoodsReceiptNote) => {
    try {
      await inspectionMutation.mutateAsync({ id: grn.id, data: grn });
      toast.success('GRN submitted for inspection');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to submit for inspection');
    }
  };

  const handlePostToInventory = async (grn: GoodsReceiptNote) => {
    try {
      await inventoryMutation.mutateAsync({ id: grn.id, data: grn });
      toast.success('GRN posted to inventory successfully');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to post to inventory');
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      received: 'secondary',
      pending_inspection: 'default',
      inspected: 'default',
      approved: 'outline',
      posted_to_inventory: 'outline',
      rejected: 'destructive',
    };
    return variants[status] || 'default';
  };

  const columns: Column<GoodsReceiptNote>[] = [
    {
      key: 'grn_number',
      label: 'GRN Number',
      render: (row) => <span className="font-semibold">{row.grn_number}</span>,
      sortable: true,
    },
    {
      key: 'receipt_date',
      label: 'Receipt Date',
      render: (row) => new Date(row.receipt_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'invoice_number',
      label: 'Invoice Number',
      render: (row) => row.invoice_number || '-',
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (row) => `Supplier #${row.supplier}`, // Need supplier details if available
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
      key: 'invoice_amount',
      label: 'Amount',
      render: (row) => row.invoice_amount ? `₹${parseFloat(row.invoice_amount).toLocaleString()}` : '-',
    },
    {
      key: 'id',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'received' && (
            <Button size="sm" onClick={() => handleSubmitForInspection(row)}>
              <Send className="h-4 w-4 mr-1" />
              Inspect
            </Button>
          )}
          {row.status === 'approved' && (
            <Button size="sm" variant="outline" onClick={() => handlePostToInventory(row)}>
              <Package className="h-4 w-4 mr-1" />
              Post to Inventory
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goods Receipt Notes (GRN)</h1>
          <p className="text-muted-foreground">Track goods received from suppliers</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Create GRN
        </Button>
      </div>

      <DataTable
        title={undefined}
        columns={columns}
        data={data as PaginatedResponse<GoodsReceiptNote> | null}
        isLoading={isLoading}
        error={error ? (error as any).message || 'Error loading data' : null}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedGRN ? 'Edit Goods Receipt' : 'Create New Goods Receipt'}</DialogTitle>
          </DialogHeader>
          <GoodsReceiptForm
            goodsReceipt={selectedGRN}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Goods Receipt"
        description="Are you sure you want to delete this goods receipt? This action cannot be undone."
      />

      <GoodsReceiptDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        grnId={grnToView}
      />
    </div>
  );
};
