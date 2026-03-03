import { useState, useEffect } from 'react';
import { Package, Truck, FileText, CheckCircle, XCircle, Upload, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
  usePurchaseOrder,
  useCreateGoodsReceipt,
  useSubmitGoodsReceiptForInspection,
  usePostGoodsReceiptToInventory,
} from '../../../hooks/useProcurement';
import { PurchaseOrder, PurchaseOrderItem } from '../../../types/store.types';
import { handleFormError } from '../../../utils/formErrorHandler';

interface ReceiveGoodsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrderId: number | null;
  onSuccess?: () => void;
}

interface ReceivedItem {
  po_item_id: number;
  item_description: string;
  ordered_quantity: number;
  unit: string;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  rejection_reason: string;
  batch_number: string;
  remarks: string;
}

export const ReceiveGoodsDialog = ({
  open,
  onOpenChange,
  purchaseOrderId,
  onSuccess,
}: ReceiveGoodsDialogProps) => {
  const [step, setStep] = useState<'receive' | 'inspection'>('receive');
  const [grnNumber, setGrnNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [challanNumber, setChallanNumber] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [grnId, setGrnId] = useState<number | null>(null);

  const { data: purchaseOrder, isLoading } = usePurchaseOrder(purchaseOrderId || 0) as { data: PurchaseOrder, isLoading: boolean };
  const createGRNMutation = useCreateGoodsReceipt();
  const submitInspectionMutation = useSubmitGoodsReceiptForInspection();
  const postInventoryMutation = usePostGoodsReceiptToInventory();

  // Initialize items from PO
  useEffect(() => {
    if (open && purchaseOrder && !isLoading) {
      // Auto-generate GRN number
      const autoGrnNumber = `GRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      setGrnNumber(autoGrnNumber);

      // Initialize invoice amount from PO grand total
      setInvoiceAmount(purchaseOrder.grand_total?.toString() || '');

      // Initialize received items from PO items
      const items: ReceivedItem[] = purchaseOrder.items?.map((item: PurchaseOrderItem) => ({
        po_item_id: item.id!,
        item_description: item.item_description,
        ordered_quantity: item.quantity || 0,
        unit: item.unit || 'pcs',
        received_quantity: item.quantity || 0, // Default to ordered quantity
        accepted_quantity: item.quantity || 0,
        rejected_quantity: 0,
        rejection_reason: '',
        batch_number: '',
        remarks: '',
      })) || [];

      setReceivedItems(items);
      setStep('receive');
      setGrnId(null);
    }
  }, [open, purchaseOrder, isLoading]);

  const handleReceivedQuantityChange = (index: number, value: number) => {
    setReceivedItems(prev => {
      const updated = [...prev];
      const newReceived = Math.max(0, value);
      updated[index] = {
        ...updated[index],
        received_quantity: newReceived,
        accepted_quantity: newReceived, // Auto-fill accepted
        rejected_quantity: 0,
      };
      return updated;
    });
  };

  const handleAcceptedQuantityChange = (index: number, value: number) => {
    setReceivedItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newAccepted = Math.max(0, Math.min(value, item.received_quantity));
      const newRejected = item.received_quantity - newAccepted;

      updated[index] = {
        ...item,
        accepted_quantity: newAccepted,
        rejected_quantity: newRejected,
      };
      return updated;
    });
  };

  const handleCreateGRN = async () => {
    // Validate required fields
    if (!grnNumber.trim()) {
      toast.error('Please provide a GRN number');
      return;
    }

    if (!receiptDate) {
      toast.error('Please provide a receipt date');
      return;
    }

    if (!invoiceAmount || parseFloat(invoiceAmount) <= 0) {
      toast.error('Please provide a valid invoice amount');
      return;
    }

    // Allow GRN creation even with no items (for POs with only totals)
    const hasItems = receivedItems.length > 0;

    if (hasItems) {
      // Only check quantities if there are items
      if (receivedItems.every(item => item.received_quantity === 0)) {
        toast.error('Please enter received quantities');
        return;
      }

      // Check if rejected items have reasons
      const rejectedWithoutReason = receivedItems.some(
        item => item.rejected_quantity > 0 && !item.rejection_reason.trim()
      );
      if (rejectedWithoutReason) {
        toast.error('Please provide rejection reasons for rejected items');
        return;
      }
    }

    try {
      const grnData = {
        grn_number: grnNumber,
        purchase_order: purchaseOrder.id,
        receipt_date: receiptDate,
        vehicle_number: vehicleNumber || null,
        driver_name: driverName || null,
        invoice_number: invoiceNumber || null,
        invoice_amount: invoiceAmount,
        challan_number: challanNumber || null,
        status: 'received',
        items: hasItems
          ? receivedItems
              .filter(item => item.received_quantity > 0)
              .map(item => ({
                po_item: item.po_item_id,
                received_quantity: item.received_quantity,
                accepted_quantity: item.accepted_quantity,
                rejected_quantity: item.rejected_quantity,
                rejection_reason: item.rejection_reason || null,
                batch_number: item.batch_number || null,
                remarks: item.remarks || null,
              }))
          : [], // Empty items array for POs with only totals
      };

      console.log('Creating GRN with data:', grnData);
      const result = await createGRNMutation.mutateAsync(grnData as any);

      setGrnId(result.id);
      setStep('inspection');
      toast.success('GRN created successfully! Ready for inspection.');
    } catch (error: any) {
      handleFormError(error, undefined, 'Failed to create GRN');
    }
  };

  const handleSubmitForInspection = async () => {
    if (!grnId) return;

    try {
      await submitInspectionMutation.mutateAsync({ id: grnId, data: {} });
      toast.success('GRN submitted for inspection!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      handleFormError(error, undefined, 'Failed to submit for inspection');
    }
  };

  const handlePostToInventory = async () => {
    if (!grnId) return;

    try {
      await postInventoryMutation.mutateAsync({ id: grnId, data: {} });
      toast.success('Goods posted to inventory successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      handleFormError(error, undefined, 'Failed to post to inventory');
    }
  };

  const totalReceived = receivedItems.reduce((sum, item) => sum + item.received_quantity, 0);
  const totalAccepted = receivedItems.reduce((sum, item) => sum + item.accepted_quantity, 0);
  const totalRejected = receivedItems.reduce((sum, item) => sum + item.rejected_quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {step === 'receive' ? 'Receive Goods (GRN)' : 'Inspection & Posting'}
          </DialogTitle>
          {purchaseOrder && (
            <p className="text-sm text-muted-foreground mt-1">
              PO: {purchaseOrder.po_number} | Supplier: {purchaseOrder.supplier_details?.name}
            </p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading purchase order...</p>
            </div>
          </div>
        ) : purchaseOrder ? (
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {/* Status Chips */}
            <div className="flex items-center gap-2 mb-6">
              <Badge variant={step === 'receive' ? 'default' : 'outline'}>
                1. Receive Goods
              </Badge>
              <div className="h-px w-8 bg-border" />
              <Badge variant={step === 'inspection' ? 'default' : 'secondary'}>
                2. Inspection & Post
              </Badge>
            </div>

            {step === 'receive' ? (
              <>
                {/* GRN Info */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label required>GRN Number</Label>
                    <Input
                      value={grnNumber}
                      onChange={(e) => setGrnNumber(e.target.value)}
                      placeholder="GRN-2026-0001"
                    />
                  </div>
                  <div>
                    <Label required>Receipt Date</Label>
                    <Input
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Vehicle Number</Label>
                    <Input
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="MH-01-AB-1234"
                    />
                  </div>
                </div>

                {/* Transport & Documents */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Driver Name</Label>
                    <Input
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Driver name"
                    />
                  </div>
                  <div>
                    <Label>Invoice Number</Label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="INV-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label required>Invoice Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Challan Number</Label>
                    <Input
                      value={challanNumber}
                      onChange={(e) => setChallanNumber(e.target.value)}
                      placeholder="CH-001"
                    />
                  </div>
                  <div>
                    <Label>LR Number</Label>
                    <Input
                      value={lrNumber}
                      onChange={(e) => setLrNumber(e.target.value)}
                      placeholder="LR-001"
                    />
                  </div>
                </div>

                {/* Items Table with Accept/Reject */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Receive Items</h3>
                  {receivedItems.length === 0 ? (
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900">
                        <strong>Simplified Receipt</strong>
                        <p className="text-sm text-blue-800 mt-1">
                          This Purchase Order has no item breakdown. GRN will be created with total amounts only.
                          The PO total is <strong>₹{purchaseOrder?.grand_total || '0'}</strong>.
                        </p>
                        <p className="text-xs text-blue-700 mt-2">
                          Fill in the receipt details above and click "Create GRN" to record the goods receipt.
                        </p>
                      </AlertDescription>
                    </Alert>
                  ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left text-xs">#</th>
                          <th className="p-3 text-left text-xs">Item Description</th>
                          <th className="p-3 text-right text-xs">Ordered</th>
                          <th className="p-3 text-right text-xs">Received</th>
                          <th className="p-3 text-right text-xs">Accepted</th>
                          <th className="p-3 text-right text-xs">Rejected</th>
                          <th className="p-3 text-left text-xs">Batch/Lot</th>
                          <th className="p-3 text-left text-xs">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receivedItems.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm">{index + 1}</td>
                            <td className="p-3">
                              <p className="text-sm font-medium">{item.item_description}</p>
                              <p className="text-xs text-muted-foreground">{item.unit}</p>
                            </td>
                            <td className="p-3 text-right text-sm font-semibold">
                              {item.ordered_quantity}
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                value={item.received_quantity || ''}
                                onChange={(e) =>
                                  handleReceivedQuantityChange(index, parseInt(e.target.value) || 0)
                                }
                                className="w-24 text-right"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                max={item.received_quantity}
                                value={item.accepted_quantity || ''}
                                onChange={(e) =>
                                  handleAcceptedQuantityChange(index, parseInt(e.target.value) || 0)
                                }
                                className="w-24 text-right bg-green-50"
                              />
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={item.rejected_quantity > 0 ? 'destructive' : 'secondary'}
                                className="w-16 justify-center"
                              >
                                {item.rejected_quantity}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Input
                                value={item.batch_number}
                                onChange={(e) =>
                                  setReceivedItems(prev => {
                                    const updated = [...prev];
                                    updated[index].batch_number = e.target.value;
                                    return updated;
                                  })
                                }
                                placeholder="Batch"
                                className="w-28"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={item.remarks}
                                onChange={(e) =>
                                  setReceivedItems(prev => {
                                    const updated = [...prev];
                                    updated[index].remarks = e.target.value;
                                    return updated;
                                  })
                                }
                                placeholder="Remarks"
                                className="w-32"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t bg-muted/50">
                        <tr>
                          <td colSpan={3} className="p-3 text-right font-semibold">
                            Total:
                          </td>
                          <td className="p-3 text-right font-bold">{totalReceived}</td>
                          <td className="p-3 text-right font-bold text-green-600">{totalAccepted}</td>
                          <td className="p-3 text-center">
                            <Badge variant={totalRejected > 0 ? 'destructive' : 'secondary'}>
                              {totalRejected}
                            </Badge>
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  )}
                </div>

                {/* Rejection Reasons */}
                {receivedItems.some(item => item.rejected_quantity > 0) && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Rejection Reasons</h3>
                    <div className="space-y-3">
                      {receivedItems
                        .filter(item => item.rejected_quantity > 0)
                        .map((item, idx) => (
                          <div key={idx} className="border border-red-200 rounded-lg p-3 bg-red-50">
                            <Label className="text-red-900 font-medium mb-2 block">
                              {item.item_description} ({item.rejected_quantity} {item.unit} rejected)
                            </Label>
                            <Textarea
                              value={item.rejection_reason}
                              onChange={(e) =>
                                setReceivedItems(prev => {
                                  const updated = [...prev];
                                  const originalIdx = receivedItems.indexOf(item);
                                  updated[originalIdx].rejection_reason = e.target.value;
                                  return updated;
                                })
                              }
                              placeholder="Explain why this item is being rejected (damage, quality issue, etc.)"
                              rows={2}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Upload Section */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Documents
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Invoice
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Challan
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload LR Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload scanned copies of invoice, delivery challan, and LR
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Inspection & Posting Step */}
                <Alert className="mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>GRN {grnNumber} created successfully!</strong>
                    <br />
                    Received: {totalReceived} | Accepted: {totalAccepted} | Rejected: {totalRejected}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      You can either submit this GRN for quality inspection or post directly to inventory.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSubmitForInspection}
                        disabled={submitInspectionMutation.isPending}
                      >
                        {submitInspectionMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Submit for Inspection
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePostToInventory}
                        disabled={postInventoryMutation.isPending}
                      >
                        {postInventoryMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        <Package className="h-4 w-4 mr-2" />
                        Post to Inventory
                      </Button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">GRN Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">GRN Number:</span>{' '}
                        <span className="font-semibold">{grnNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Receipt Date:</span>{' '}
                        <span className="font-semibold">
                          {new Date(receiptDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Invoice:</span>{' '}
                        <span className="font-semibold">{invoiceNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Challan:</span>{' '}
                        <span className="font-semibold">{challanNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Purchase order not found</p>
          </div>
        )}

        {/* Action Bar */}
        {!isLoading && purchaseOrder && (
          <div className="shrink-0 border-t bg-background">
            <div className="p-4 flex items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>

              {step === 'receive' && (
                <Button
                  onClick={handleCreateGRN}
                  disabled={createGRNMutation.isPending}
                >
                  {createGRNMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create GRN
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
