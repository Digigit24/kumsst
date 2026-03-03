import {
    Calendar,
    CheckCircle, ClipboardCheck,
    FileText, Loader2, Package,
    ThumbsUp,
    Truck
} from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Stepper, StepperStep } from '../../../components/workflow/Stepper';
import {
    useGoodsReceipt,
    usePostGoodsReceiptToInventory,
    useSubmitGoodsReceiptForInspection
} from '../../../hooks/useProcurement';
import { GoodsReceiptNote, GRNItem } from '../../../types/store.types';

interface GoodsReceiptDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    grnId: number | null;
    onSuccess?: () => void;
}

export const GoodsReceiptDetailDialog = ({
    open,
    onOpenChange,
    grnId,
    onSuccess
}: GoodsReceiptDetailDialogProps) => {
    const { data: grn, isLoading, refetch } = useGoodsReceipt(grnId || 0) as { data: GoodsReceiptNote, isLoading: boolean, refetch: () => void };
    const inspectionMutation = useSubmitGoodsReceiptForInspection();
    const inventoryMutation = usePostGoodsReceiptToInventory();

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

    const steps: StepperStep[] = useMemo(() => {
        if (!grn) return [];

        return [
            {
                id: 'receive',
                title: 'Goods Received',
                description: 'Initial physical receipt',
                icon: Truck,
                status: grn.status === 'received' ? 'current' : 'completed',
            },
            {
                id: 'inspect',
                title: 'Inspection',
                description: 'Quality check of items',
                icon: ClipboardCheck,
                status:
                    grn.status === 'pending_inspection'
                        ? 'current'
                        : grn.status === 'rejected'
                            ? 'rejected'
                            : ['inspected', 'approved', 'posted_to_inventory'].includes(grn.status)
                                ? 'completed'
                                : 'upcoming',
            },
            {
                id: 'approve',
                title: 'Approval',
                description: 'Review inspection results',
                icon: ThumbsUp,
                status:
                    grn.status === 'inspected'
                        ? 'current'
                        : grn.status === 'rejected'
                            ? 'rejected'
                            : ['approved', 'posted_to_inventory'].includes(grn.status)
                                ? 'completed'
                                : 'upcoming',
            },
            {
                id: 'inventory',
                title: 'Post to Inventory',
                description: 'Update central stock levels',
                icon: Package,
                status:
                    grn.status === 'approved'
                        ? 'current'
                        : grn.status === 'posted_to_inventory'
                            ? 'completed'
                            : 'upcoming',
            },
        ];
    }, [grn]);

    const handleSubmitForInspection = async () => {
        if (!grn) return;
        try {
            await inspectionMutation.mutateAsync({ id: grn.id, data: grn });
            toast.success('GRN submitted for inspection');
            refetch();
            onSuccess?.();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to submit for inspection');
        }
    };

    const handlePostToInventory = async () => {
        if (!grn) return;
        try {
            await inventoryMutation.mutateAsync({ id: grn.id, data: grn });
            toast.success('GRN posted to inventory successfully');
            refetch();
            onSuccess?.();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to post to inventory');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
                <DialogHeader className="p-6 pb-4 shrink-0 border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5" />
                                Goods Receipt Details
                            </DialogTitle>
                            {grn && (
                                <div className="flex items-center gap-3">
                                    <p className="text-lg font-semibold">{grn.grn_number}</p>
                                    <Badge
                                        variant={getStatusVariant(grn.status)}
                                        className="capitalize"
                                    >
                                        {grn.status?.replace(/_/g, ' ')}
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
                            <p className="text-muted-foreground">Loading GRN details...</p>
                        </div>
                    </div>
                ) : grn ? (
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="grid grid-cols-12 gap-6 p-6">
                            {/* Left: Stepper */}
                            <div className="col-span-3">
                                <Stepper steps={steps} orientation="vertical" />
                            </div>

                            {/* Right: Content */}
                            <div className="col-span-9 space-y-6">

                                {/* Current Action Cards Based on Status */}
                                {grn.status === 'received' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-2">Next Step: Quality Inspection</h3>
                                        <p className="text-sm text-blue-800 mb-3">
                                            Goods have been successfully received. Submit them for quality inspection.
                                        </p>
                                        <Button size="sm" onClick={handleSubmitForInspection} disabled={inspectionMutation.isPending}>
                                            {inspectionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Submit for Inspection
                                        </Button>
                                    </div>
                                )}

                                {grn.status === 'pending_inspection' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-purple-900 mb-2">Inspection Pending</h3>
                                        <p className="text-sm text-purple-800">
                                            Waiting for the quality inspector to review the received items.
                                        </p>
                                    </div>
                                )}

                                {grn.status === 'approved' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-green-900 mb-2">Next Step: Post to Inventory</h3>
                                        <p className="text-sm text-green-800 mb-3">
                                            Inspection approved. You can now post the accepted quantities to the central inventory.
                                        </p>
                                        <Button size="sm" onClick={handlePostToInventory} disabled={inventoryMutation.isPending}>
                                            {inventoryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            <Package className="h-4 w-4 mr-2" />
                                            Post Items to Inventory
                                        </Button>
                                    </div>
                                )}

                                {grn.status === 'posted_to_inventory' && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-emerald-900 mb-2">
                                            <CheckCircle className="h-5 w-5" />
                                            <h3 className="font-semibold">Workflow Complete</h3>
                                        </div>
                                        <p className="text-sm text-emerald-800">
                                            These goods have been successfully received, approved, and updated in the system inventory.
                                        </p>
                                    </div>
                                )}


                                {/* Basic Info */}
                                <div className="bg-muted/30 rounded-lg p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Receipt Information
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Receipt Date</span>
                                            <span className="font-medium flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(grn.receipt_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">PO Number</span>
                                            <span className="font-medium">PO #{grn.purchase_order}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Supplier</span>
                                            <span className="font-medium">Supplier #{grn.supplier}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Central Store</span>
                                            <span className="font-medium">Store #{grn.central_store}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Invoice Number</span>
                                            <span className="font-medium">{grn.invoice_number}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Invoice Date</span>
                                            <span className="font-medium">{grn.invoice_date ? new Date(grn.invoice_date).toLocaleDateString() : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Invoice Amount</span>
                                            <span className="font-semibold text-primary">₹{parseFloat(grn.invoice_amount || '0').toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Freight Charges</span>
                                            <span className="font-medium">₹{parseFloat(grn.freight_charges || '0').toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {grn.remarks && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-muted-foreground/30">
                                            <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                                            <p className="text-sm">{grn.remarks}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Transport Details (If present) */}
                                {(grn.vehicle_number || grn.transporter_name || grn.lr_number) && (
                                    <div className="border border-s border-s-4 border-s-muted-foreground/30 p-4 rounded-r-lg">
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-muted-foreground" />
                                            Transport & Logistics
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            {grn.vehicle_number && (
                                                <div>
                                                    <span className="text-muted-foreground">Vehicle Number:</span> <span className="font-medium">{grn.vehicle_number}</span>
                                                </div>
                                            )}
                                            {grn.transporter_name && (
                                                <div>
                                                    <span className="text-muted-foreground">Transporter:</span> <span className="font-medium">{grn.transporter_name}</span>
                                                </div>
                                            )}
                                            {grn.lr_number && (
                                                <div>
                                                    <span className="text-muted-foreground">LR Number:</span> <span className="font-medium">{grn.lr_number}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Items Table */}
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        Received Items
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="p-3 text-left text-xs">#</th>
                                                    <th className="p-3 text-left text-xs">Item Description</th>
                                                    <th className="p-3 text-left text-xs">Batch/Serial No.</th>
                                                    <th className="p-3 text-right text-xs">Ordered Qty</th>
                                                    <th className="p-3 text-right text-xs">Received Qty</th>
                                                    <th className="p-3 text-right text-xs">Accepted Qty</th>
                                                    <th className="p-3 text-right text-xs">Rejected Qty</th>
                                                    <th className="p-3 text-center text-xs">Quality Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {grn.items?.length ? grn.items.map((item: GRNItem, index: number) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="p-3 text-sm">{index + 1}</td>
                                                        <td className="p-3">
                                                            <p className="text-sm font-medium">{item.item_description}</p>
                                                        </td>
                                                        <td className="p-3 text-sm text-muted-foreground">
                                                            {item.batch_number || item.serial_number || '-'}
                                                        </td>
                                                        <td className="p-3 text-right text-sm">{item.ordered_quantity} {item.unit}</td>
                                                        <td className="p-3 text-right text-sm font-semibold">{item.received_quantity} {item.unit}</td>
                                                        <td className="p-3 text-right text-sm text-green-600">{item.accepted_quantity}</td>
                                                        <td className="p-3 text-right text-sm text-red-600">
                                                            {item.rejected_quantity > 0 ? item.rejected_quantity : '-'}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Badge
                                                                variant={item.quality_status === 'passed' ? 'outline' : item.quality_status === 'failed' ? 'destructive' : 'secondary'}
                                                                className="text-xs capitalize px-2 py-0"
                                                            >
                                                                {item.quality_status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={8} className="p-4 text-center text-muted-foreground text-sm">
                                                            No items found for this GRN.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-muted-foreground">Goods receipt not found</p>
                    </div>
                )}

                {/* Action Bar */}
                {!isLoading && grn && (
                    <div className="shrink-0 border-t bg-background">
                        <div className="p-4 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>

                            {/* Duplicate primary action buttons in the bottom bar for easy access */}
                            {grn.status === 'received' && (
                                <Button onClick={handleSubmitForInspection} disabled={inspectionMutation.isPending}>
                                    {inspectionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit for Inspection
                                </Button>
                            )}
                            {grn.status === 'approved' && (
                                <Button onClick={handlePostToInventory} disabled={inventoryMutation.isPending}>
                                    {inventoryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <Package className="h-4 w-4 mr-2" />
                                    Post Items to Inventory
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
