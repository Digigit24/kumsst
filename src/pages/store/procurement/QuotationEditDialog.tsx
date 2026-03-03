/**
 * Quotation Edit Dialog - View quotation image and fill in details
 * Shows uploaded quotation file (image/PDF) and allows editing quotation details
 */

import { FileText, Image as ImageIcon, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { getMediaBaseUrl } from '../../../config/api.config';
import { useUpdateQuotation } from '../../../hooks/useProcurement';
import { handleFormError, validateNumericField } from '../../../utils/formErrorHandler';

interface QuotationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: any;
  requirement?: any;
  onSuccess?: () => void;
}

interface QuotationItem {
  item_description: string;
  quantity: number | string;
  unit: string;
  unit_price: number | string;
  tax_rate: number | string;
  tax_amount: number;
  total_amount: number;
  specifications?: string;
}

const normalizeItem = (item: any): QuotationItem => ({
  item_description: item?.item_description || '',
  quantity: item?.quantity || '',
  unit: item?.unit || 'piece',
  unit_price: item?.unit_price || '',
  tax_rate: item?.tax_rate || '',
  tax_amount: Number(item?.tax_amount) || 0,
  total_amount: Number(item?.total_amount) || 0,
  specifications: item?.specifications || '',
});

export const QuotationEditDialog = ({
  open,
  onOpenChange,
  quotation,
  requirement,
  onSuccess,
}: QuotationEditDialogProps) => {
  const updateQuotationMutation = useUpdateQuotation();
  const [fileError, setFileError] = useState(false);

  const [formData, setFormData] = useState({
    delivery_days: quotation?.delivery_days || '',
    payment_terms: quotation?.payment_terms || '',
    warranty_period: quotation?.warranty_period || '',
    notes: quotation?.notes || '',
    valid_until: quotation?.valid_until || '',
    total_amount: quotation?.total_amount || '',
    tax_amount: quotation?.tax_amount || '',
    grand_total: quotation?.grand_total || '',
  });

  const [items, setItems] = useState<QuotationItem[]>(
    (quotation?.items || []).map(normalizeItem)
  );

  useEffect(() => {
    if (quotation) {
      setFormData({
        delivery_days: quotation.delivery_days || '',
        payment_terms: quotation.payment_terms || '',
        warranty_period: quotation.warranty_period || '',
        notes: quotation.notes || '',
        valid_until: quotation.valid_until || '',
        total_amount: quotation.total_amount || '',
        tax_amount: quotation.tax_amount || '',
        grand_total: quotation.grand_total || '',
      });

      // Auto-copy items from requirement if quotation has no items
      if ((!quotation.items || quotation.items.length === 0) && requirement?.items && requirement.items.length > 0) {
        console.log('Auto-copying items from requirement:', requirement.items);
        const autoItems: QuotationItem[] = requirement.items.map((reqItem: any) => {
          const qty = reqItem.quantity || 0;
          const unitPrice = Number(reqItem.estimated_unit_price) || 0;
          const taxRate = 18;
          const subtotal = qty * unitPrice;
          const taxAmount = (subtotal * taxRate) / 100;

          return {
            item_description: reqItem.item_description || '',
            quantity: reqItem.quantity || '',
            unit: reqItem.unit || 'piece',
            unit_price: reqItem.estimated_unit_price || '',
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total_amount: subtotal + taxAmount,
            specifications: reqItem.specifications || '',
          };
        });
        setItems(autoItems.map(normalizeItem));
        toast.success(`Auto-populated ${autoItems.length} items from requirement`);
      } else {
        setItems((quotation.items || []).map(normalizeItem));
      }

      setFileError(false);
    }
  }, [quotation, requirement]);

  // Auto-calculate totals whenever items change
  useEffect(() => {
    if (!items || items.length === 0) return;
    const totals = calculateTotals();
    setFormData((prev) => ({
      ...prev,
      total_amount: totals.total,
      tax_amount: totals.tax,
      grand_total: totals.grand,
    }));
  }, [items]);

  // Auto-calculate grand total when using manual totals (no items added)
  useEffect(() => {
    if (items && items.length > 0) return;
    setFormData((prev) => {
      const computedGrand = (Number(prev.total_amount) || 0) + (Number(prev.tax_amount) || 0);
      if (Number(prev.grand_total) === computedGrand) return prev;
      return { ...prev, grand_total: computedGrand || '' };
    });
  }, [items, formData.total_amount, formData.tax_amount]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_description: '',
        quantity: '',
        unit: 'piece',
        unit_price: '',
        tax_rate: 18,
        tax_amount: 0,
        total_amount: 0,
        specifications: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-calculate amounts
    const item = updatedItems[index];
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const taxRate = Number(item.tax_rate) || 0;
    const subtotal = qty * unitPrice;
    item.tax_amount = (subtotal * taxRate) / 100;
    item.total_amount = subtotal + item.tax_amount;

    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const total = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    const tax = items.reduce((sum, item) => sum + item.tax_amount, 0);
    return { total, tax, grand: total + tax };
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!validateNumericField(formData.delivery_days, 'Delivery Days', { min: 1, required: true })) {
        return;
      }

      // Check if items are provided (validation)
      const hasItems = items && items.length > 0;

      if (!hasItems) {
        toast.error('Please add at least one item to the quotation');
        return;
      }

      // Validate items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.item_description?.trim()) {
          toast.error(`Item ${i + 1}: Description is required`);
          return;
        }
        if (!validateNumericField(item.quantity, `Item ${i + 1} Quantity`, { min: 0, required: true })) {
          return;
        }
        if (!validateNumericField(item.unit_price, `Item ${i + 1} Unit Price`, { min: 0, required: true })) {
          return;
        }
      }

      // Ensure required base fields are always sent (PUT requires full payload)
      const baseFields = {
        quotation_number: quotation?.quotation_number || '',
        quotation_date: quotation?.quotation_date || new Date().toISOString().split('T')[0],
        requirement: quotation?.requirement || quotation?.requirement_id || quotation?.requirement?.id || null,
        supplier: quotation?.supplier || quotation?.supplier_id || null,
      };

      if (!baseFields.requirement || !baseFields.supplier || !baseFields.quotation_number) {
        toast.error('Quotation is missing required details (number, supplier, or requirement). Please re-upload or contact admin.');
        return;
      }

      // Use calculated totals from items
      const totals = calculateTotals();
      const updateData = {
        ...baseFields,
        ...formData,
        total_amount: totals.total,
        tax_amount: totals.tax,
        grand_total: totals.grand,
        items: items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          tax_rate: Number(item.tax_rate)
        })),
        status: 'received',
      };

      console.log('Saving quotation data:', updateData);

      await updateQuotationMutation.mutateAsync({
        id: quotation.id,
        data: updateData,
      });

      toast.success('Quotation details saved successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      handleFormError(error, undefined, 'Failed to save quotation details');
    }
  };

  const getFileType = (url: string) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'document';
  };

  const getFullFileUrl = (url: string) => {
    if (!url) return '';

    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL is relative (starts with /), build the full URL
    if (url.startsWith('/')) {
      const mediaBaseUrl = getMediaBaseUrl();
      return `${mediaBaseUrl}${url}`;
    }

    // Default: return as is
    return url;
  };

  const rawFileUrl = quotation?.quotation_file_url || quotation?.quotation_file || '';
  const fileType = getFileType(rawFileUrl);
  const fileUrl = getFullFileUrl(rawFileUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Quotation Details - {quotation?.quotation_number}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            View the uploaded quotation file and fill in the details
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-6 p-6 min-h-0">
          {/* Left: Quotation File Viewer */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Uploaded Quotation</span>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open in new tab
              </a>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
              {!fileUrl ? (
                <div className="text-center space-y-2 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto" />
                  <p>No quotation file available</p>
                </div>
              ) : fileError ? (
                <div className="text-center space-y-2 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto" />
                  <p>Unable to preview the quotation file.</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Open in a new tab
                  </a>
                </div>
              ) : fileType === 'image' ? (
                <img
                  src={fileUrl}
                  alt="Quotation"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.error('Image failed to load:', fileUrl);
                    setFileError(true);
                  }}
                />
              ) : fileType === 'pdf' ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-0"
                  title="Quotation PDF"
                  onError={() => setFileError(true)}
                />
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Document preview not available</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right: Editable Form */}
          <div className="overflow-y-auto space-y-6">
            {/* Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delivery_days" required>Delivery Days</Label>
                    <Input
                      id="delivery_days"
                      type="number"
                      value={formData.delivery_days}
                      onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="e.g., 15"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Input
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="e.g., 50% advance, 50% on delivery"
                  />
                </div>
                <div>
                  <Label htmlFor="warranty_period">Warranty Period</Label>
                  <Input
                    id="warranty_period"
                    value={formData.warranty_period}
                    onChange={(e) => setFormData({ ...formData, warranty_period: e.target.value })}
                    placeholder="e.g., 1 year"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or remarks"
                    rows={3}
                  />
                </div>


              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Quotation Items</CardTitle>
                <Button size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                    <div>
                      <Label>Item Description *</Label>
                      <Input
                        value={item.item_description}
                        onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                        placeholder="e.g., Laptop Dell Inspiron 15"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          placeholder="piece, kg, etc."
                        />
                      </div>
                      <div>
                        <Label>Unit Price (₹) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Tax Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </div>
                      <div>
                        <Label>Tax Amount (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={Number(item.tax_amount || 0).toFixed(2)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label>Total (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={Number(item.total_amount || 0).toFixed(2)}
                          disabled
                          className="bg-muted font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Specifications</Label>
                      <Textarea
                        value={item.specifications || ''}
                        onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                        placeholder="Technical specifications"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No items added yet</p>
                    <p className="text-sm">Click "Add Item" to get started</p>
                  </div>
                )}

                {/* Totals Summary */}
                {items.length > 0 && (
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-semibold">₹{calculateTotals().total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Tax:</span>
                      <span className="font-semibold">₹{calculateTotals().tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Grand Total:</span>
                      <span className="text-primary">₹{calculateTotals().grand.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <div className="shrink-0 border-t bg-background">
          <div className="p-4 flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateQuotationMutation.isPending}>
              {updateQuotationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Quotation Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
