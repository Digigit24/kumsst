/**
 * Prepare Dispatch Dialog - Auto-generate MIN from approved indent
 * Workflow: Show indent items → Allow quantity edits → Prepare MIN → Dispatch
 */

import { AlertCircle, ArrowRight, FileText, Loader2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useCreateMaterialIssue, useDispatchMaterialIssue } from '../../hooks/useMaterialIssues';
import { usePatchStoreIndent, useStoreIndent } from '../../hooks/useStoreIndents';

interface PrepareDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indentId: number | null;
  onSuccess?: () => void;
}

export const PrepareDispatchDialog = ({
  open,
  onOpenChange,
  indentId,
  onSuccess,
}: PrepareDispatchDialogProps) => {
  const navigate = useNavigate();
  const [minNumber, setMinNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [minId, setMinId] = useState<number | null>(null);
  const [step, setStep] = useState<'prepare' | 'dispatch'>('prepare');

  // Fetch full indent details with items
  const { data: indent, isLoading: isLoadingIndent } = useStoreIndent(indentId || 0);

  const createMutation = useCreateMaterialIssue();
  const dispatchMutation = useDispatchMaterialIssue();

  // Initialize items from indent when dialog opens
  useEffect(() => {
    if (open && indent && !isLoadingIndent) {
      // Auto-generate MIN number
      const autoMinNumber = `MIN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      setMinNumber(autoMinNumber);
      setRemarks('');

      // Convert indent items to MIN items with available quantities
      const minItems = indent.items?.map((item: any) => ({
        indent_item: item.id,
        central_store_item: item.central_store_item,
        item_name: item.central_store_item_name || item.store_item_name || `Item #${item.central_store_item}`,
        requested_quantity: item.requested_quantity,
        approved_quantity: item.approved_quantity || item.requested_quantity,
        available_quantity: item.available_quantity || item.approved_quantity || item.requested_quantity, // This should come from backend
        issued_quantity: Math.min(
          item.approved_quantity || item.requested_quantity,
          item.available_quantity || item.approved_quantity || item.requested_quantity
        ),
        unit: item.unit,
        has_shortage: false,
        shortage_reason: '',
      })) || [];

      setItems(minItems);
      setStep('prepare');
      setMinId(null);
    }
  }, [open, indent, isLoadingIndent]);

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQuantity = Math.max(0, Math.min(quantity, item.available_quantity));

      updated[index] = {
        ...item,
        issued_quantity: newQuantity,
        has_shortage: newQuantity < item.approved_quantity,
      };
      return updated;
    });
  };

  const handleMaxIssue = (index: number) => {
    setItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      updated[index] = {
        ...item,
        issued_quantity: Math.min(item.approved_quantity, item.available_quantity),
        has_shortage: item.available_quantity < item.approved_quantity,
      };
      return updated;
    });
  };

  const handlePrepareMIN = async () => {
    if (!minNumber.trim()) {
      toast.error('Please provide a MIN number');
      return;
    }

    if (items.every(item => item.issued_quantity === 0)) {
      toast.error('Please issue at least one item');
      return;
    }

    try {
      const minData = {
        min_number: minNumber,
        indent: indent.id,
        central_store: typeof indent.central_store === 'object' ? indent.central_store.id : indent.central_store,
        receiving_college: typeof indent.college === 'object' ? indent.college.id : indent.college,
        issue_date: issueDate,
        status: 'prepared',
        remarks: remarks,
        items: items
          .filter(item => item.issued_quantity > 0)
          .map(item => ({
            indent_item: item.indent_item,
            // Ensure we send the ID, not the object
            item: typeof item.central_store_item === 'object' ? item.central_store_item.id : item.central_store_item,
            issued_quantity: item.issued_quantity,
            unit: item.unit,
            has_shortage: item.has_shortage,
            shortage_reason: item.shortage_reason || '',
          })),
      };

      console.log('Sending MIN Data:', JSON.stringify(minData, null, 2));

      const result = await createMutation.mutateAsync(minData);
      setMinId(result.id);
      setStep('dispatch');
      toast.success('MIN prepared successfully! Ready to dispatch.');
    } catch (error: any) {
      console.error('Prepare MIN error:', error);
      console.error('Prepare MIN error details:', JSON.stringify(error, null, 2));
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to prepare MIN');
    }
  };

  const patchIndentMutation = usePatchStoreIndent();

  const handleDispatch = async () => {
    if (!minId) return;

    try {
      await dispatchMutation.mutateAsync({
        id: minId,
        data: {
          dispatch_date: new Date().toISOString().split('T')[0],
        },
      });

      // Update Indent Status
      if (indentId) {
        const allFulfilled = items.every(item => item.issued_quantity >= item.approved_quantity);
        console.log('Checking Fulfillment:', { allFulfilled, items });

        const newStatus = allFulfilled ? 'fulfilled' : 'partially_fulfilled';
        console.log(`Patching Indent ${indentId} to status: ${newStatus}`);

        try {
          await patchIndentMutation.mutateAsync({
            id: indentId,
            data: { status: newStatus }
          });
          console.log('Indent status patched successfully');
        } catch (patchError) {
          console.error('Failed to patch indent status:', patchError);
          // Don't block success just because patch failed, but warn user
          toast.error('Material dispatched, but failed to update indent status.');
        }
      }

      toast.success('Material dispatched successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Dispatch error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to dispatch');
    }
  };

  const totalIssued = items.reduce((sum, item) => sum + item.issued_quantity, 0);
  const hasShortages = items.some(item => item.has_shortage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {step === 'prepare' ? 'Prepare Dispatch' : 'Dispatch Material'}
          </DialogTitle>
        </DialogHeader>

        {isLoadingIndent ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading indent details...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {/* Status Chips */}
            <div className="flex items-center gap-2 mb-6">
              <Badge variant={step === 'prepare' ? 'default' : 'outline'}>
                1. Prepare MIN
              </Badge>
              <div className="h-px w-8 bg-border" />
              <Badge variant={step === 'dispatch' ? 'default' : 'secondary'}>
                2. Dispatch
              </Badge>
            </div>

            {/* Indent Info */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Indent Number</Label>
                  <p className="font-semibold">{indent?.indent_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">College</Label>
                  <p>{indent?.college_name || `College #${indent?.college}`}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Required By</Label>
                  <p>{new Date(indent?.required_by_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {step === 'prepare' ? (
              <>
                {/* MIN Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label required>MIN Number</Label>
                    <Input
                      value={minNumber}
                      onChange={(e) => setMinNumber(e.target.value)}
                      placeholder="MIN-2026-0001"
                    />
                  </div>
                  <div>
                    <Label required>Issue Date</Label>
                    <Input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Items to Issue</Label>
                    <Badge variant="secondary">{items.length} items</Badge>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left text-xs">#</th>
                          <th className="p-3 text-left text-xs">Item</th>
                          <th className="p-3 text-right text-xs">Approved</th>
                          <th className="p-3 text-right text-xs">Available</th>
                          <th className="p-3 text-right text-xs">Issue Qty</th>
                          <th className="p-3 text-left text-xs">Unit</th>
                          <th className="p-3 text-center text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm">{index + 1}</td>
                            <td className="p-3">
                              <p className="text-sm font-medium">{item.item_name}</p>
                              {item.has_shortage && (
                                <p className="text-xs text-destructive">Shortage detected</p>
                              )}
                            </td>
                            <td className="p-3 text-right text-sm">{item.approved_quantity}</td>
                            <td className="p-3 text-right">
                              <Badge
                                variant={
                                  item.available_quantity >= item.approved_quantity
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {item.available_quantity}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                max={item.available_quantity}
                                value={item.issued_quantity}
                                onChange={(e) =>
                                  handleQuantityChange(index, parseInt(e.target.value) || 0)
                                }
                                className="w-24 text-right"
                              />
                            </td>
                            <td className="p-3 text-sm">{item.unit}</td>
                            <td className="p-3 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMaxIssue(index)}
                                className="text-xs"
                              >
                                Max
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Remarks/Dispatch Notes */}
                <div className="mt-6">
                  <Label htmlFor="remarks">Dispatch Notes / Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Any additional notes for the shipment..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-2"
                    rows={2}
                  />
                </div>

                {/* Warnings */}
                {hasShortages && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Shortages detected:</strong> Some items have insufficient stock.
                      The indent will be marked as "Partially Fulfilled".
                    </AlertDescription>
                  </Alert>
                )}

                {totalIssued === 0 && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No items selected for issue. Please adjust quantities.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <>
                {/* Dispatch Summary */}
                <div className="space-y-4">
                  <Alert>
                    <Package className="h-4 w-4" />
                    <AlertDescription>
                      <strong>MIN {minNumber} is ready for dispatch.</strong>
                      <br />
                      Total items: {items.filter(i => i.issued_quantity > 0).length} | Total
                      quantity: {totalIssued}
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <Label className="text-sm font-semibold mb-2 block">Dispatch Details</Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">From:</span>{' '}
                        {indent?.central_store_name || `Store #${indent?.central_store}`}
                      </div>
                      <div>
                        <span className="text-muted-foreground">To:</span>{' '}
                        {indent?.college_name || `College #${indent?.college}`}
                      </div>
                      <div>
                        <span className="text-muted-foreground">MIN Number:</span> {minNumber}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dispatch Date:</span>{' '}
                        {new Date().toLocaleDateString()}
                      </div>
                      {remarks && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Notes:</span> {remarks}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <Label className="text-sm font-semibold mb-2 block">Items Summary</Label>
                    <div className="space-y-2">
                      {items
                        .filter(item => item.issued_quantity > 0)
                        .map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.item_name}</span>
                            <span className="font-semibold">
                              {item.issued_quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Smart Action Bar */}
        {!isLoadingIndent && (
          <div className="shrink-0 border-t bg-background">
            <div className="p-4 flex items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <div className="flex items-center gap-2">
                {step === 'dispatch' && (
                  <Button variant="outline" onClick={() => window.print()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Print MIN
                  </Button>
                )}
                {step === 'prepare' ? (
                  <Button
                    onClick={handlePrepareMIN}
                    disabled={totalIssued === 0 || createMutation.isPending}
                  >
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Package className="h-4 w-4 mr-2" />
                    Prepare MIN
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/store/transfers-workflow', { state: { newMinId: minId } });
                    }}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Go to Transfers
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
