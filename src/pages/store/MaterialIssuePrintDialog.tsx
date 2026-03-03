import { Printer } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { MaterialIssueNote } from '../../types/store.types';

interface MaterialIssuePrintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    min: MaterialIssueNote | null;
}

export const MaterialIssuePrintDialog = ({ open, onOpenChange, min }: MaterialIssuePrintDialogProps) => {
    if (!min) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] flex flex-col p-0 bg-white">
                <div className="flex-1 overflow-y-auto p-8" id="print-content">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b pb-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Material Issue Note</h1>
                            <p className="text-muted-foreground font-mono text-lg">{min.min_number}</p>
                        </div>
                        <div className="text-right">
                            <Badge variant={min.status === 'received' ? 'default' : 'secondary'} className="mb-2 uppercase px-3 py-1">
                                {min.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-sm text-muted-foreground">Issue Date: {new Date(min.issue_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-12 mb-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2 uppercase text-xs tracking-wider">From</h3>
                            <div className="text-sm space-y-2 text-gray-600">
                                <p className="font-bold text-lg text-gray-900">{min.central_store_name || `Store #${min.central_store}`}</p>
                                <p className="text-muted-foreground">Central Store</p>
                                {min.issued_by_name && <p>Issued By: {min.issued_by_name}</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2 uppercase text-xs tracking-wider">To</h3>
                            <div className="text-sm space-y-2 text-gray-600">
                                <p className="font-bold text-lg text-gray-900">{min.receiving_college_name || `College #${min.receiving_college}`}</p>
                                {min.indent_number && <p>Ref Indent: {min.indent_number}</p>}
                                {min.transport_mode && <p>Transport: {min.transport_mode}</p>}
                                {min.vehicle_number && <p>Vehicle: {min.vehicle_number}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8 border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[40%] font-semibold text-gray-900">Item</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900">Issued Quantity</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Batch / Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {min.items && min.items.length > 0 ? (
                                    min.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <span className="font-medium block text-gray-900">{item.item_name || `Item #${item.item}`}</span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-gray-900">{item.issued_quantity} {item.unit}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {item.batch_number && <Badge variant="outline" className="text-xs">Batch: {item.batch_number}</Badge>}
                                                    {item.remarks && <p className="text-sm text-gray-500">{item.remarks}</p>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No items found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer Notes */}
                    {((min as any).remarks || min.internal_notes) && (
                        <div className="border-t pt-6 mb-8">
                            <h4 className="font-semibold text-sm mb-2 text-gray-900">Remarks / Notes</h4>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded">{(min as any).remarks || min.internal_notes}</p>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-12 pt-12 border-t border-dashed">
                        <div className="text-center">
                            <div className="h-16 border-b border-gray-300 w-3/4 mx-auto mb-2"></div>
                            <p className="text-sm font-semibold text-gray-900">Store In-Charge Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16 border-b border-gray-300 w-3/4 mx-auto mb-2"></div>
                            <p className="text-sm font-semibold text-gray-900">Receiver Signature</p>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="border-t p-4 flex justify-between bg-white print:hidden">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print MIN
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
