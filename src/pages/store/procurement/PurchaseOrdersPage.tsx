import { Check, Edit, Plus, Printer, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
  useAcknowledgePurchaseOrder,
  useCreatePurchaseOrder,
  useDeletePurchaseOrder,
  useGeneratePurchaseOrderPdf,
  usePurchaseOrders,
  useSendPurchaseOrderToSupplier,
  useUpdatePurchaseOrder,
} from '../../../hooks/useProcurement';
import { procurementPurchaseOrdersApi } from '../../../services/store.service';
import { PaginatedResponse } from '../../../types/core.types';
import { PurchaseOrder, PurchaseOrderCreateInput } from '../../../types/store.types';
import { PurchaseOrderForm } from './forms/PurchaseOrderForm';
import { PurchaseOrderPrintDialog } from './PurchaseOrderPrintDialog';

export const PurchaseOrdersPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<number | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [poToPrint, setPoToPrint] = useState<PurchaseOrder | null>(null);

  const { data, isLoading, refetch, error } = usePurchaseOrders(filters);
  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();
  const sendMutation = useSendPurchaseOrderToSupplier();
  const acknowledgeMutation = useAcknowledgePurchaseOrder();
  const pdfMutation = useGeneratePurchaseOrderPdf();

  const handleCreate = () => {
    setSelectedPO(null);
    setIsFormOpen(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setPoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!poToDelete) return;

    try {
      await deleteMutation.mutateAsync(poToDelete);
      toast.success('Purchase order deleted successfully');
      refetch();
      setDeleteDialogOpen(false);
      setPoToDelete(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete purchase order');
    }
  };

  const handleSubmit = async (formData: PurchaseOrderCreateInput) => {
    try {
      if (selectedPO) {
        await updateMutation.mutateAsync({ id: selectedPO.id, data: formData });
        toast.success('Purchase order updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Purchase order created successfully');
      }
      setIsFormOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save purchase order');
    }
  };

  const handleSendToSupplier = async (po: PurchaseOrder) => {
    try {
      await sendMutation.mutateAsync({ id: po.id, data: po });
      toast.success('PO sent to supplier successfully');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to send PO');
    }
  };

  const handleAcknowledge = async (po: PurchaseOrder) => {
    try {
      await acknowledgeMutation.mutateAsync({ id: po.id, data: po });
      toast.success('PO acknowledged successfully');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to acknowledge PO');
    }
  };

  const handlePrint = async (po: PurchaseOrder) => {
    try {
      const fullPO = await procurementPurchaseOrdersApi.get(po.id);
      setPoToPrint(fullPO);
      setPrintDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load Purchase Order details");
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      acknowledged: 'outline',
      partially_received: 'default',
      fulfilled: 'outline',
      cancelled: 'destructive',
    };
    return variants[status] || 'default';
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'po_number',
      label: 'PO Number',
      render: (row) => <span className="font-semibold">{row.po_number}</span>,
      sortable: true,
    },
    {
      key: 'po_date',
      label: 'PO Date',
      render: (row) => new Date(row.po_date).toLocaleDateString(),
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
      key: 'grand_total',
      label: 'Total Amount',
      render: (row) => row.grand_total ? `₹${parseFloat(row.grand_total).toLocaleString()}` : '-',
    },
    {
      key: 'expected_delivery_date',
      label: 'Expected Delivery',
      render: (row) => row.expected_delivery_date ? new Date(row.expected_delivery_date).toLocaleDateString() : '-',
    },
    {
      key: 'id',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'draft' && (
            <Button size="sm" onClick={() => handleSendToSupplier(row)}>
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          )}
          {row.status === 'sent' && (
            <Button size="sm" variant="outline" onClick={() => handleAcknowledge(row)}>
              <Check className="h-4 w-4 mr-1" />
              Acknowledge
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => handlePrint(row)}>
            <Printer className="h-4 w-4 mr-1" />
            Print
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
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage purchase orders and supplier communications</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Create Purchase Order
        </Button>
      </div>

      <DataTable
        title={undefined}
        columns={columns}
        data={data as PaginatedResponse<PurchaseOrder> | null}
        isLoading={isLoading}
        error={error ? (error as any).message || 'Error loading data' : null}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPO ? 'Edit Purchase Order' : 'Create New Purchase Order'}</DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            purchaseOrder={selectedPO}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <PurchaseOrderPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        po={poToPrint}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Purchase Order"
        description="Are you sure you want to delete this purchase order? This action cannot be undone."
      />
    </div>
  );
};
