import { useState, useMemo } from 'react';
import { Package, CheckCircle, XCircle, FileText, Loader2, Send, ThumbsUp, DollarSign, ShoppingCart, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Stepper, StepperStep } from '../../../components/workflow/Stepper';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  useRequirement,
  useSubmitRequirement,
  useApproveRequirement,
  useRejectRequirement,
  usePurchaseOrders,
} from '../../../hooks/useProcurement';
import { QuotationSelectionDialog } from './QuotationSelectionDialog';
import { ReceiveGoodsDialog } from './ReceiveGoodsDialog';
import { ProcurementRequirement, RequirementItem } from '../../../types/store.types';

interface RequirementDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirementId: number | null;
  onSuccess?: () => void;
}

export const RequirementDetailDialog = ({
  open,
  onOpenChange,
  requirementId,
  onSuccess,
}: RequirementDetailDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [showReceiveGoodsDialog, setShowReceiveGoodsDialog] = useState(false);

  const { data: requirement, isLoading } = useRequirement(requirementId || 0) as { data: ProcurementRequirement, isLoading: boolean };
  const submitMutation = useSubmitRequirement();
  const approveMutation = useApproveRequirement();
  const rejectMutation = useRejectRequirement();

  // Fetch purchase orders for this requirement
  const { data: purchaseOrdersResponse } = usePurchaseOrders(
    requirement?.status === 'po_created' || requirement?.status === 'fulfilled'
      ? { requirement: requirementId }
      : undefined
  );

  // Get the first PO (should only be one per requirement)
  const purchaseOrderId = purchaseOrdersResponse?.results?.[0]?.id || null;

  // Build stepper steps based on requirement status
  const steps: StepperStep[] = useMemo(() => {
    if (!requirement) return [];

    const allSteps: StepperStep[] = [
      {
        id: 'define',
        title: 'Define requirement items',
        description: 'Add items and specifications',
        icon: Package,
        status: requirement.status === 'draft' ? 'current' : 'completed',
      },
      {
        id: 'approvals',
        title: 'Approvals',
        description: 'Submit and wait for approval',
        icon: ThumbsUp,
        status:
          requirement.status === 'submitted' || requirement.status === 'pending_approval'
            ? 'current'
            : requirement.status === 'rejected'
            ? 'rejected'
            : requirement.status === 'draft'
            ? 'upcoming'
            : 'completed',
      },
      {
        id: 'quotations',
        title: 'Collect quotations',
        description: 'Get quotes from vendors',
        icon: DollarSign,
        status:
          requirement.status === 'approved'
            ? 'current'
            : ['quotations_received', 'po_created', 'fulfilled'].includes(requirement.status)
            ? 'completed'
            : 'upcoming',
      },
      {
        id: 'select_quote',
        title: 'Select quotation',
        description: 'Choose best quote',
        icon: CheckCircle,
        status:
          requirement.status === 'quotations_received'
            ? 'current'
            : ['po_created', 'fulfilled'].includes(requirement.status)
            ? 'completed'
            : 'upcoming',
      },
      {
        id: 'create_po',
        title: 'Create PO',
        description: 'Generate purchase order',
        icon: ShoppingCart,
        status:
          requirement.status === 'po_created' || requirement.status === 'fulfilled'
            ? 'completed'
            : 'upcoming',
      },
      {
        id: 'receive_grn',
        title: 'Receive GRN',
        description: 'Accept delivery',
        icon: Truck,
        status:
          requirement.status === 'po_created'
            ? 'current'
            : requirement.status === 'fulfilled'
            ? 'completed'
            : 'upcoming',
      },
      {
        id: 'post_inventory',
        title: 'Post to inventory',
        description: 'Update stock levels',
        icon: Package,
        status: requirement.status === 'fulfilled' ? 'completed' : 'upcoming',
      },
    ];

    return allSteps;
  }, [requirement]);

  const handleSubmit = async () => {
    if (!requirement) return;
    try {
      await submitMutation.mutateAsync({ id: requirement.id, data: {} });
      toast.success('Requirement submitted for approval!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to submit requirement');
    }
  };

  const handleApprove = async () => {
    if (!requirement) return;
    try {
      await approveMutation.mutateAsync({ id: requirement.id, data: {} });
      toast.success('Requirement approved!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to approve requirement');
    }
  };

  const handleReject = async () => {
    if (!requirement) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: requirement.id, data: { rejection_reason: rejectionReason } });
      toast.success('Requirement rejected');
      setShowRejectForm(false);
      setRejectionReason('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to reject requirement');
    }
  };

  const totalEstimate = requirement?.items?.reduce(
    (sum: number, item: RequirementItem) => sum + (item.quantity || 0) * (parseFloat(item.estimated_unit_price || '0') || 0),
    0
  ) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                Requirement Details
              </DialogTitle>
              {requirement && (
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold">{requirement.requirement_number}</p>
                  <Badge
                    variant={
                      requirement.status === 'fulfilled'
                        ? 'default'
                        : requirement.status === 'rejected'
                        ? 'destructive'
                        : 'outline'
                    }
                    className="capitalize"
                  >
                    {requirement.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading requirement details...</p>
            </div>
          </div>
        ) : requirement ? (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-12 gap-6 p-6">
              {/* Left: Stepper */}
              <div className="col-span-3">
                <Stepper steps={steps} orientation="vertical" />
              </div>

              {/* Right: Content */}
              <div className="col-span-9 space-y-6">
                {/* Basic Info */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Requirement Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Required By:</span>{' '}
                      <span className="font-medium">
                        {new Date(requirement.required_by_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>{' '}
                      <Badge variant={requirement.urgency === 'urgent' ? 'destructive' : 'outline'} className="capitalize">
                        {requirement.urgency}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Store:</span>{' '}
                      <span className="font-medium">Store #{requirement.central_store}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estimated Total:</span>{' '}
                      <span className="font-semibold">₹{totalEstimate.toFixed(2)}</span>
                    </div>
                  </div>
                  {requirement.justification && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Justification</p>
                      <p className="text-sm">{requirement.justification}</p>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div>
                  <h3 className="font-semibold mb-3">Requirement Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left text-xs">#</th>
                          <th className="p-3 text-left text-xs">Item Description</th>
                          <th className="p-3 text-right text-xs">Quantity</th>
                          <th className="p-3 text-left text-xs">Unit</th>
                          <th className="p-3 text-right text-xs">Est. Unit Price</th>
                          <th className="p-3 text-right text-xs">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requirement.items?.map((item: RequirementItem, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm">{index + 1}</td>
                            <td className="p-3">
                              <p className="text-sm font-medium">{item.item_description}</p>
                              {item.specifications && (
                                <p className="text-xs text-muted-foreground">{item.specifications}</p>
                              )}
                            </td>
                            <td className="p-3 text-right text-sm">{item.quantity}</td>
                            <td className="p-3 text-sm">{item.unit}</td>
                            <td className="p-3 text-right text-sm">₹{parseFloat(item.estimated_unit_price || '0').toFixed(2)}</td>
                            <td className="p-3 text-right font-semibold text-sm">
                              ₹{((item.quantity || 0) * (parseFloat(item.estimated_unit_price || '0') || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t bg-muted/50">
                        <tr>
                          <td colSpan={5} className="p-3 text-right font-semibold">
                            Total Estimate:
                          </td>
                          <td className="p-3 text-right font-bold text-lg">₹{totalEstimate.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Current Step Actions */}
                {requirement.status === 'draft' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Next Step: Submit for Approval</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Once submitted, this requirement will be sent to the approver for review.
                    </p>
                  </div>
                )}

                {requirement.status === 'submitted' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">Pending Approval</h3>
                    <p className="text-sm text-purple-800">
                      This requirement is waiting for approval. The approver can approve or reject it.
                    </p>
                  </div>
                )}

                {requirement.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Next Step: Collect Quotations</h3>
                    <p className="text-sm text-green-800 mb-3">
                      Requirement approved! Now you can add quotations from vendors.
                    </p>
                    <Button size="sm" onClick={() => setShowQuotationDialog(true)}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      View & Add Quotations
                    </Button>
                  </div>
                )}

                {requirement.status === 'quotations_received' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">Next Step: Select Quotation</h3>
                    <p className="text-sm text-yellow-800 mb-3">
                      Compare quotations and select the best one to create a purchase order.
                    </p>
                    <Button size="sm" onClick={() => setShowQuotationDialog(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      View & Select Quotations
                    </Button>
                  </div>
                )}

                {requirement.status === 'po_created' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-2">Next Step: Receive Goods</h3>
                    <p className="text-sm text-orange-800 mb-3">
                      Purchase order created. When goods arrive, create a GRN to receive them.
                    </p>
                    <Button size="sm" onClick={() => setShowReceiveGoodsDialog(true)}>
                      <Truck className="h-4 w-4 mr-2" />
                      Receive Goods (GRN)
                    </Button>
                  </div>
                )}

                {requirement.status === 'fulfilled' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-900 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <h3 className="font-semibold">Requirement Fulfilled</h3>
                    </div>
                    <p className="text-sm text-emerald-800">
                      This procurement requirement has been completed and posted to inventory.
                    </p>
                  </div>
                )}

                {/* Rejection Display */}
                {requirement.status === 'rejected' && requirement.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-900 mb-2">
                       <XCircle className="h-5 w-5" />
                       <h3 className="font-semibold">Requirement Rejected</h3>
                    </div>
                    <p className="text-sm text-red-800 mb-2">Reason:</p>
                    <p className="text-sm text-red-900 font-medium">{requirement.rejection_reason}</p>
                  </div>
                )}

                {/* Rejection Form */}
                {showRejectForm && (
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <Label className="text-red-900 font-semibold mb-2">Rejection Reason *</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this requirement is being rejected..."
                      rows={3}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReject}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirm Rejection
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowRejectForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Requirement not found</p>
          </div>
        )}

        {/* Action Bar */}
        {!isLoading && requirement && (
          <div className="shrink-0 border-t bg-background">
            <div className="p-4 flex items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>

              <div className="flex items-center gap-2">
                {/* Draft: Submit */}
                {requirement.status === 'draft' && (
                  <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                    {submitMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                )}

                {/* Submitted: Approve or Reject */}
                {requirement.status === 'submitted' && (
                  <>
                    {!showRejectForm && (
                      <Button variant="outline" onClick={() => setShowRejectForm(true)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    )}
                    <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                      {approveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <QuotationSelectionDialog
        open={showQuotationDialog}
        onOpenChange={setShowQuotationDialog}
        requirementId={requirementId}
        onSuccess={() => {
          setShowQuotationDialog(false);
          onSuccess?.();
        }}
      />

      <ReceiveGoodsDialog
        open={showReceiveGoodsDialog}
        onOpenChange={setShowReceiveGoodsDialog}
        purchaseOrderId={purchaseOrderId}
        onSuccess={() => {
          setShowReceiveGoodsDialog(false);
          onSuccess?.();
        }}
      />
    </Dialog>
  );
};
