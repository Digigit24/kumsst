import { Printer } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { PurchaseOrder } from '../../../types/store.types';

interface PurchaseOrderPrintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    po: PurchaseOrder | null;
}

const parseNumber = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === '') return 0;
    const parsed = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (val: string | number | undefined | null) => {
    return `₹${parseNumber(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const PurchaseOrderPrintDialog = ({ open, onOpenChange, po }: PurchaseOrderPrintDialogProps) => {
    if (!po) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] flex flex-col p-0 bg-white">
                <div className="flex-1 overflow-y-auto p-8" id="print-content">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b pb-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Purchase Order</h1>
                            <p className="text-muted-foreground font-mono text-lg">{po.po_number}</p>
                        </div>
                        <div className="text-right">
                            <Badge variant={po.status === 'sent' ? 'default' : 'outline'} className="mb-2 uppercase px-3 py-1">
                                {po.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-sm text-muted-foreground">Date: {new Date(po.po_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-12 mb-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2 uppercase text-xs tracking-wider">Vendor Details</h3>
                            {po.supplier_details ? (
                                <div className="text-sm space-y-2 text-gray-600">
                                    <p className="font-bold text-lg text-gray-900">{po.supplier_details.name}</p>
                                    <div className="space-y-1">
                                        <p><span className="font-medium text-gray-700">Contact:</span> {po.supplier_details.contact_person}</p>
                                        <p>{po.supplier_details.email}</p>
                                        <p>{po.supplier_details.phone}</p>
                                    </div>
                                    {po.supplier_details.address && (
                                        <p className="mt-2 text-gray-600 max-w-xs">{po.supplier_details.address}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No supplier details available</p>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2 uppercase text-xs tracking-wider">Delivery To</h3>
                            <div className="text-sm space-y-2 text-gray-600">
                                <p className="font-bold text-lg text-gray-900">Central Store</p>
                                <div className="space-y-1">
                                    <p>{po.delivery_address_line1}</p>
                                    {po.delivery_address_line2 && <p>{po.delivery_address_line2}</p>}
                                    <p>{po.delivery_city}, {po.delivery_state} - {po.delivery_pincode}</p>
                                </div>
                                <p className="mt-4 font-medium text-gray-900">
                                    Expected Delivery: <span className="font-normal">{new Date(po.expected_delivery_date).toLocaleDateString()}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8 border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[40%] font-semibold text-gray-900">Item Description</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900">Quantity</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900">Unit Price</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {po.items && po.items.length > 0 ? (
                                    po.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <span className="font-medium block text-gray-900">{item.item_description}</span>
                                                {item.specifications && <p className="text-xs text-muted-foreground mt-1">{item.specifications}</p>}
                                                {item.hsn_code && <p className="text-xs text-muted-foreground mt-0.5">HSN: {item.hsn_code}</p>}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-gray-900">{item.quantity} {item.unit}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right font-bold text-gray-900">{formatCurrency(item.total_amount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No items found in this purchase order.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-72 bg-gray-50 p-6 rounded-lg space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(po.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax Amount:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(po.tax_amount)}</span>
                            </div>
                            {parseNumber(po.discount_amount) > 0 && (
                                <div className="flex justify-between text-sm text-green-700">
                                    <span>Discount:</span>
                                    <span>-{formatCurrency(po.discount_amount)}</span>
                                </div>
                            )}
                            {parseNumber(po.shipping_charges) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span>{formatCurrency(po.shipping_charges)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200 mt-2">
                                <span>Grand Total:</span>
                                <span>{formatCurrency(po.grand_total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    {(po.payment_terms || po.delivery_terms || po.special_instructions) && (
                        <div className="border-t pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                            {po.payment_terms && (
                                <div>
                                    <span className="font-semibold block mb-2 text-gray-900 uppercase text-xs tracking-wider">Payment Terms</span>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded border">{po.payment_terms}</p>
                                </div>
                            )}
                            {po.delivery_terms && (
                                <div>
                                    <span className="font-semibold block mb-2 text-gray-900 uppercase text-xs tracking-wider">Delivery Terms</span>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded border">{po.delivery_terms}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Bar */}
                <div className="border-t p-4 flex justify-between bg-white print:hidden">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Purchase Order
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
