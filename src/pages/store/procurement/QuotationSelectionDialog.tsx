/**
 * Quotation Selection Dialog - Compare quotations and select the best one
 * Shows comparable cards with: grand total, delivery days, terms, rating, warnings
 * One-click "Select this quotation" to mark as selected
 */

import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Award, Calendar, CheckCircle, DollarSign, Eye, FileText, Loader2, Plus, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { getMediaBaseUrl } from '../../../config/api.config';
import { purchaseOrderKeys, requirementKeys, useCreatePurchaseOrder, useCreateQuotation, useMarkQuotationSelected, useRequirement, useRequirementQuotations } from '../../../hooks/useProcurement';
import { QuotationForm } from './forms/QuotationForm';
import { QuotationEditDialog } from './QuotationEditDialog';

interface QuotationSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirementId: number | null;
  onSuccess?: () => void;
}

export const QuotationSelectionDialog = ({
  open,
  onOpenChange,
  requirementId,
  onSuccess,
}: QuotationSelectionDialogProps) => {
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const { data: quotations, isLoading } = useRequirementQuotations(requirementId || 0);
  const { data: requirement } = useRequirement(requirementId || 0);
  const markSelectedMutation = useMarkQuotationSelected();
  const createQuotationMutation = useCreateQuotation();
  const createPOMutation = useCreatePurchaseOrder();


  if (quotations && quotations.length > 0) {
    console.log('First quotation:', quotations[0]);
    console.log('Fields check:', {
      quotation_number: quotations[0]?.quotation_number,
      grand_total: quotations[0]?.grand_total,
      total_amount: quotations[0]?.total_amount,
      delivery_days: quotations[0]?.delivery_days,
      delivery_time_days: quotations[0]?.delivery_time_days,
      valid_until: quotations[0]?.valid_until,
      vendor_name: quotations[0]?.vendor_name,
      vendor_verified: quotations[0]?.vendor_verified,
    });
  }


  // Normalize API field names / types
  const getDisplayDeliveryDays = (quotation: any) =>
    quotation?.delivery_days ?? quotation?.delivery_time_days ?? 0;

  const getDisplayGrandTotal = (quotation: any) =>
    Number(quotation?.grand_total ?? quotation?.total_amount ?? 0);

  const getDisplayTax = (quotation: any) => Number(quotation?.tax_amount ?? 0);

  const getDisplayFileUrl = (quotation: any) =>
    quotation?.quotation_file_url || quotation?.quotation_file || '';

  const handleCreateQuotation = async (data: any) => {
    try {
      // Add requirement ID to quotation data
      const quotationData = data instanceof FormData
        ? data
        : Object.entries(data || {}).reduce((formData, [key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
          return formData;
        }, new FormData());

      if (requirementId) {
        quotationData.append('requirement', String(requirementId));
      }

      await createQuotationMutation.mutateAsync(quotationData);

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: requirementKeys.quotations(requirementId || 0) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });

      toast.success('Quotation created successfully!');
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Create quotation error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create quotation');
    }
  };

  const handleToggleSelectQuotation = async (quotationId: number, currentlySelected: boolean) => {
    try {

      setSelectedQuotationId(quotationId);

      if (currentlySelected) {
        // Unselect this quotation

        const result = await markSelectedMutation.mutateAsync({ id: quotationId, data: { is_selected: false } });

        toast.success('Quotation unselected');
      } else {
        // First, unselect all other quotations
        const otherSelectedQuotations = quotations?.filter((q: any) => q.is_selected && q.id !== quotationId) || [];


        for (const otherQuotation of otherSelectedQuotations) {

          await markSelectedMutation.mutateAsync({ id: otherQuotation.id, data: { is_selected: false } });
        }

        // Then select this quotation

        const result = await markSelectedMutation.mutateAsync({ id: quotationId, data: { is_selected: true } });

        toast.success('Quotation selected! You can now create a Purchase Order.');
      }

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: requirementKeys.quotations(requirementId || 0) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });

      setSelectedQuotationId(null);

    } catch (error: any) {

      toast.error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to update quotation selection');
      setSelectedQuotationId(null);
    }
  };

  const handleCreatePurchaseOrder = async () => {
    try {


      // Get the selected quotation
      const selectedQuotation = quotations?.find((q: any) => q.is_selected);


      if (!selectedQuotation) {
        toast.error('Please select a quotation first');
        return;
      }

      // Minimal validation - only require supplier and grand total
      const validationErrors = [];
      if (!selectedQuotation.supplier) validationErrors.push('Supplier is missing');
      if (!getDisplayGrandTotal(selectedQuotation) || getDisplayGrandTotal(selectedQuotation) <= 0) validationErrors.push('Total amount is missing or zero');

      if (validationErrors.length > 0) {
        throw new Error(`Cannot create PO - Quotation is incomplete:\n${validationErrors.join('\n')}`);
      }

      // Generate PO number (format: PO-YYYYMMDD-XXXX where XXXX is random)
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const poNumber = `PO-${timestamp}-${randomSuffix}`;

      // Use delivery days or default to 30 days
      const deliveryDays = getDisplayDeliveryDays(selectedQuotation) || 30;

      // Create Purchase Order from selected quotation
      const poData = {
        po_number: poNumber,
        requirement: requirementId,
        quotation: selectedQuotation.id,
        supplier: selectedQuotation.supplier,
        po_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payment_terms: selectedQuotation.payment_terms || 'As per agreement',
        delivery_terms: selectedQuotation.delivery_time_days
          ? `Delivery in ${selectedQuotation.delivery_time_days} days`
          : 'As per quotation',
        total_amount: String(getDisplayGrandTotal(selectedQuotation) - getDisplayTax(selectedQuotation)),
        tax_amount: String(getDisplayTax(selectedQuotation)),
        grand_total: String(getDisplayGrandTotal(selectedQuotation)),
        status: 'draft',
        items: selectedQuotation.items && selectedQuotation.items.length > 0
          ? selectedQuotation.items.map((item: any) => ({
            item_description: item.item_description || '',
            quantity: item.quantity || 0,
            unit: item.unit || 'piece',
            unit_price: String(item.unit_price || 0),
            tax_rate: String(item.tax_rate || 0),
            tax_amount: String(item.tax_amount || 0),
            total_amount: String(item.total_amount || 0),
            specifications: item.specifications || '',
            quotation_item: item.id || null,
          }))
          : [], // Empty items array if no items
      };

      console.log('Creating PO with data:', poData);
      const result = await createPOMutation.mutateAsync(poData);
      console.log('PO created successfully:', result);

      // Invalidate queries to refresh everything
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(requirementId || 0) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.quotations(requirementId || 0) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });

      toast.success(`Purchase Order ${poNumber} created successfully!`);
      onSuccess?.();
      onOpenChange(false);
      console.log('=== END CREATE PO DEBUG ===');
    } catch (error: any) {
      console.error('=== CREATE PO ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      toast.error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to create Purchase Order');
    }
  };

  const isQuotationComplete = (quotation: any) => {
    return (
      getDisplayDeliveryDays(quotation) > 0 &&
      getDisplayGrandTotal(quotation) > 0 &&
      quotation.items && quotation.items.length > 0
    );
  };

  const getFullFileUrl = (url: string) => {
    if (!url) return '';

    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL is relative (starts with /), build full URL
    if (url.startsWith('/')) {
      const mediaBaseUrl = getMediaBaseUrl();
      return `${mediaBaseUrl}${url}`;
    }

    return url;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getWarnings = (quotation: any) => {
    const warnings = [];

    if (getDisplayDeliveryDays(quotation) > 30) {
      warnings.push('Long delivery time (>30 days)');
    }

    if (!quotation.vendor_verified) {
      warnings.push('Vendor not verified');
    }

    if (quotation.total_amount > quotation.requirement_estimate * 1.2) {
      warnings.push('Price exceeds estimate by >20%');
    }

    return warnings;
  };

  const getLowestPrice = () => {
    if (!quotations || quotations.length === 0) return null;
    return Math.min(...quotations.map((q: any) => getDisplayGrandTotal(q) || 0));
  };

  const getFastestDelivery = () => {
    if (!quotations || quotations.length === 0) return null;
    return Math.min(...quotations.map((q: any) => getDisplayDeliveryDays(q) || 999));
  };

  const lowestPrice = getLowestPrice();
  const fastestDelivery = getFastestDelivery();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compare & Select Quotation
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Step 1: Review and compare quotations • Step 2: Select the best one • Step 3: Create Purchase Order
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Quotation
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading quotations...</p>
            </div>
          </div>
        ) : quotations && quotations.length > 0 ? (
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {/* Info Alert */}
            <Alert className="mb-6">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Compare quotations carefully.</strong> Review pricing, delivery times, and vendor terms.
                Click "Select This Quotation" on your preferred option, then use the "Create Purchase Order" button at the bottom.
                You can change your selection at any time before creating the PO.
              </AlertDescription>
            </Alert>

            {/* Quotations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotations.map((quotation: any) => {
                const warnings = getWarnings(quotation);
                const displayGrandTotal = getDisplayGrandTotal(quotation);
                const displayTax = getDisplayTax(quotation);
                const displayDelivery = getDisplayDeliveryDays(quotation);
                const fileUrl = getDisplayFileUrl(quotation);
                const isLowestPrice = displayGrandTotal === lowestPrice;
                const isFastestDelivery = displayDelivery === fastestDelivery;
                const isSelected = quotation.is_selected;

                return (
                  <Card
                    key={quotation.id}
                    className={`relative transition-all ${isSelected
                        ? 'border-green-500 border-2 shadow-lg'
                        : selectedQuotationId === quotation.id
                          ? 'border-primary border-2'
                          : 'hover:shadow-md'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}

                    <CardContent className="p-5">
                      {/* Vendor Info */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{quotation.vendor_name}</h3>
                            <p className="text-xs text-muted-foreground">{quotation.quotation_number}</p>
                          </div>
                          {quotation.vendor_verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        {quotation.vendor_rating && (
                          <div className="flex items-center gap-1">
                            {getRatingStars(quotation.vendor_rating)}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({quotation.vendor_rating}/5)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Price - Highlighted */}
                      <div className="bg-primary/5 rounded-lg p-4 mb-4 relative">
                        {isLowestPrice && (
                          <div className="absolute -top-2 -right-2">
                            <Badge variant="default" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Lowest Price
                            </Badge>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mb-1">Grand Total</div>
                        <div className="text-3xl font-bold text-primary">
                          ₹{displayGrandTotal?.toLocaleString() || '0'}
                        </div>
                        {displayTax > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            (incl. ₹{displayTax?.toLocaleString()} tax)
                          </div>
                        )}
                      </div>

                      {/* Key Details */}
                      <div className="space-y-3 mb-4">
                        {/* Delivery Time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Delivery</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{displayDelivery} days</span>
                            {isFastestDelivery && (
                              <Badge variant="secondary" className="text-xs">Fastest</Badge>
                            )}
                          </div>
                        </div>

                        {/* Valid Until */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Valid Until</span>
                          </div>
                          <span className="font-medium">
                            {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>

                        {/* Payment Terms */}
                        {quotation.payment_terms && (
                          <div className="pt-2 border-t">
                            <div className="text-xs text-muted-foreground mb-1">Payment Terms</div>
                            <div className="text-sm">{quotation.payment_terms}</div>
                          </div>
                        )}

                        {/* Warranty */}
                        {quotation.warranty_period && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Warranty</span>
                            <span className="font-medium">{quotation.warranty_period}</span>
                          </div>
                        )}
                      </div>

                      {/* Warnings */}
                      {warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                              {warnings.map((warning, idx) => (
                                <p key={idx} className="text-xs text-yellow-800">
                                  {warning}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {quotation.notes && (
                        <div className="mb-4">
                          <div className="text-xs text-muted-foreground mb-1">Notes</div>
                          <div className="text-sm bg-muted/30 rounded p-2">{quotation.notes}</div>
                        </div>
                      )}

                      {/* Quotation File Preview */}
                      {fileUrl && (
                        <div className="mb-4 border rounded-lg overflow-hidden">
                          <div className="bg-muted px-3 py-2 text-xs font-medium flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            Uploaded Quotation
                          </div>
                          {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={getFullFileUrl(fileUrl)}
                              alt="Quotation preview"
                              className="w-full h-32 object-cover cursor-pointer"
                              onClick={() => setEditingQuotation(quotation)}
                              onError={(e) => {
                                console.error('Failed to load image:', fileUrl);
                              }}
                            />
                          ) : (
                            <div className="p-4 bg-gray-50 text-center cursor-pointer" onClick={() => setEditingQuotation(quotation)}>
                              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Click to view document</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {/* Warning for incomplete quotations */}
                        {!isQuotationComplete(quotation) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-blue-800">ℹ️ Additional Details (Optional)</p>
                                {(getDisplayDeliveryDays(quotation) <= 0 || (!quotation.items || quotation.items.length === 0)) && (
                                  <>
                                    <p className="text-xs text-blue-700">You can add:</p>
                                    <ul className="text-xs text-blue-700 list-disc list-inside">
                                      {getDisplayDeliveryDays(quotation) <= 0 && <li>Delivery days (optional)</li>}
                                      {(!quotation.items || quotation.items.length === 0) && <li>Items breakdown (optional)</li>}
                                    </ul>
                                  </>
                                )}
                                {getDisplayGrandTotal(quotation) <= 0 && (
                                  <p className="text-xs text-amber-700 font-semibold">⚠️ Missing: Price/Amount (required)</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Select/Unselect Button - Always shown */}
                        <Button
                          className="w-full"
                          variant={isSelected ? 'default' : 'outline'}
                          disabled={markSelectedMutation.isPending}
                          onClick={() => handleToggleSelectQuotation(quotation.id, isSelected)}
                        >
                          {markSelectedMutation.isPending && selectedQuotationId === quotation.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {isSelected ? 'Unselecting...' : 'Selecting...'}
                            </>
                          ) : isSelected ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Selected (Click to Unselect)
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Select This Quotation
                            </>
                          )}
                        </Button>

                        {/* View/Edit Button */}
                        <Button
                          className="w-full"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuotation(quotation)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {isQuotationComplete(quotation) ? 'View Details' : 'View & Fill Details'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-blue-600 mb-1">Total Quotations</div>
                <div className="text-2xl font-bold text-blue-900">{quotations.length}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-xs text-green-600 mb-1">Lowest Price</div>
                <div className="text-2xl font-bold text-green-900">₹{lowestPrice?.toLocaleString() ?? '0'}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-xs text-purple-600 mb-1">Fastest Delivery</div>
                <div className="text-2xl font-bold text-purple-900">{fastestDelivery} days</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No quotations received yet</p>
              <p className="text-sm text-muted-foreground">
                Quotations from vendors will appear here for comparison
              </p>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="shrink-0 border-t bg-background">
          <div className="p-4 flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex items-center gap-4">
              {quotations?.filter((q: any) => q.is_selected).length > 0 ? (
                <>
                  <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Quotation selected
                  </div>
                  <Button
                    size="lg"
                    onClick={handleCreatePurchaseOrder}
                    disabled={createPOMutation.isPending}
                  >
                    {createPOMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Purchase Order
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a quotation to create a Purchase Order
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Create Quotation Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
          </DialogHeader>
          <QuotationForm
            onSubmit={handleCreateQuotation}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Quotation Dialog */}
      {editingQuotation && (
        <QuotationEditDialog
          open={!!editingQuotation}
          onOpenChange={(open) => !open && setEditingQuotation(null)}
          quotation={editingQuotation}
          requirement={requirement}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: requirementKeys.quotations(requirementId || 0) });
            setEditingQuotation(null);
          }}
        />
      )}
    </Dialog>
  );
};
