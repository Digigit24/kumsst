/**
 * Purchase Order Form
 */

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { VendorDropdown } from '../../../../components/common/VendorDropdown';
import { CentralStoreDropdown } from '../../../../components/common/CentralStoreDropdown';

interface PurchaseOrderFormProps {
  purchaseOrder?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const PurchaseOrderForm = ({ purchaseOrder, onSubmit, onCancel }: PurchaseOrderFormProps) => {
  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
    defaultValues: purchaseOrder || {
      po_number: '',
      po_date: '',
      supplier: '',
      quotation: '',
      requirement: '',
      central_store: '',
      status: 'draft',
      expected_delivery_date: '',
      delivery_address: '',
      billing_address: '',
      payment_terms: '',
      delivery_terms: '',
      special_instructions: '',
      terms_conditions: '',
      subtotal: '',
      tax_amount: '',
      discount_amount: '',
      shipping_charges: '',
      other_charges: '',
      grand_total: '',
      remarks: '',
      metadata: '',
      is_active: true,
      items: [
        {
          item_description: '',
          quantity: 0,
          unit: '',
          unit_price: '',
          discount_percent: '',
          discount_amount: '',
          tax_percent: '',
          tax_amount: '',
          total: '',
          expected_delivery_date: '',
          specifications: '',
          remarks: '',
          is_active: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="po_number" required>PO Number</Label>
              <Input
                id="po_number"
                {...register('po_number', { required: 'PO number is required' })}
              />
              {errors.po_number && <p className="text-sm text-red-500">{String(errors.po_number.message)}</p>}
            </div>

            <div>
              <Label htmlFor="po_date" required>PO Date</Label>
              <Input
                id="po_date"
                type="date"
                {...register('po_date', { required: 'PO date is required' })}
              />
              {errors.po_date && <p className="text-sm text-red-500">{String(errors.po_date.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="supplier"
                control={control}
                rules={{ required: 'Supplier is required' }}
                render={({ field }) => (
                  <VendorDropdown
                    value={field.value}
                    onChange={field.onChange}
                    required
                    error={errors.supplier?.message ? String(errors.supplier.message) : undefined}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="central_store"
                control={control}
                rules={{ required: 'Central store is required' }}
                render={({ field }) => (
                  <CentralStoreDropdown
                    value={field.value}
                    onChange={field.onChange}
                    required
                    error={errors.central_store?.message ? String(errors.central_store.message) : undefined}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quotation">Quotation ID</Label>
              <Input
                id="quotation"
                type="number"
                {...register('quotation', { valueAsNumber: true })}
                placeholder="Related quotation"
              />
            </div>

            <div>
              <Label htmlFor="requirement">Requirement ID</Label>
              <Input
                id="requirement"
                type="number"
                {...register('requirement', { valueAsNumber: true })}
                placeholder="Related requirement"
              />
            </div>

            <div>
              <Label htmlFor="expected_delivery_date">Expected Delivery</Label>
              <Input
                id="expected_delivery_date"
                type="date"
                {...register('expected_delivery_date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={watch('status')}
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent to Supplier</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Textarea
                id="delivery_address"
                {...register('delivery_address')}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="billing_address">Billing Address</Label>
              <Textarea
                id="billing_address"
                {...register('billing_address')}
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Textarea
                id="payment_terms"
                {...register('payment_terms')}
                rows={2}
                placeholder="e.g., Net 30 days, 50% advance"
              />
            </div>

            <div>
              <Label htmlFor="delivery_terms">Delivery Terms</Label>
              <Textarea
                id="delivery_terms"
                {...register('delivery_terms')}
                rows={2}
                placeholder="e.g., FOB, CIF, delivery within 15 days"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              {...register('special_instructions')}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="terms_conditions">Terms & Conditions</Label>
            <Textarea
              id="terms_conditions"
              {...register('terms_conditions')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase Order Items</CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                item_description: '',
                quantity: 0,
                unit: '',
                unit_price: '',
                discount_percent: '',
                discount_amount: '',
                tax_percent: '',
                tax_amount: '',
                total: '',
                expected_delivery_date: '',
                specifications: '',
                remarks: '',
                is_active: true,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Item {index + 1}</CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`items.${index}.item_description`} required>Item Description</Label>
                  <Input
                    id={`items.${index}.item_description`}
                    {...register(`items.${index}.item_description`, { required: 'Item description is required' })}
                  />
                  {Array.isArray(errors.items) && errors.items[index]?.item_description && (
                    <p className="text-sm text-red-500">
                      {String(errors.items[index]?.item_description?.message)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.quantity`} required>Quantity</Label>
                    <Input
                      id={`items.${index}.quantity`}
                      type="number"
                      {...register(`items.${index}.quantity`, {
                        required: 'Required',
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.unit`} required>Unit</Label>
                    <Input
                      id={`items.${index}.unit`}
                      {...register(`items.${index}.unit`, { required: 'Unit is required' })}
                      placeholder="e.g., kg, pcs, ltr"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.unit_price`} required>Unit Price</Label>
                    <Input
                      id={`items.${index}.unit_price`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`, { required: 'Required' })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.discount_percent`}>Discount %</Label>
                    <Input
                      id={`items.${index}.discount_percent`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.discount_percent`)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.discount_amount`}>Discount Amt</Label>
                    <Input
                      id={`items.${index}.discount_amount`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.discount_amount`)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.tax_percent`}>Tax %</Label>
                    <Input
                      id={`items.${index}.tax_percent`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.tax_percent`)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.tax_amount`}>Tax Amount</Label>
                    <Input
                      id={`items.${index}.tax_amount`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.tax_amount`)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.total`}>Total Amount</Label>
                    <Input
                      id={`items.${index}.total`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.total`)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.expected_delivery_date`}>Expected Delivery</Label>
                    <Input
                      id={`items.${index}.expected_delivery_date`}
                      type="date"
                      {...register(`items.${index}.expected_delivery_date`)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`items.${index}.specifications`}>Specifications</Label>
                  <Textarea
                    id={`items.${index}.specifications`}
                    {...register(`items.${index}.specifications`)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor={`items.${index}.remarks`}>Remarks</Label>
                  <Textarea
                    id={`items.${index}.remarks`}
                    {...register(`items.${index}.remarks`)}
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`items.${index}.is_active`}
                    {...register(`items.${index}.is_active`)}
                  />
                  <Label htmlFor={`items.${index}.is_active`}>Active</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                {...register('subtotal')}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="tax_amount">Tax Amount</Label>
              <Input
                id="tax_amount"
                type="number"
                step="0.01"
                {...register('tax_amount')}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="discount_amount">Discount Amount</Label>
              <Input
                id="discount_amount"
                type="number"
                step="0.01"
                {...register('discount_amount')}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="shipping_charges">Shipping Charges</Label>
              <Input
                id="shipping_charges"
                type="number"
                step="0.01"
                {...register('shipping_charges')}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="other_charges">Other Charges</Label>
              <Input
                id="other_charges"
                type="number"
                step="0.01"
                {...register('other_charges')}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="grand_total" required>Grand Total</Label>
              <Input
                id="grand_total"
                type="number"
                step="0.01"
                {...register('grand_total', { required: 'Grand total is required' })}
                placeholder="0.00"
              />
              {errors.grand_total && <p className="text-sm text-red-500">{String(errors.grand_total.message)}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {purchaseOrder ? 'Update' : 'Create'} Purchase Order
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
