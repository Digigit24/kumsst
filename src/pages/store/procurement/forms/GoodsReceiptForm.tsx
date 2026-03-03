/**
 * Goods Receipt Note (GRN) Form
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

interface GoodsReceiptFormProps {
  goodsReceipt?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const GoodsReceiptForm = ({ goodsReceipt, onSubmit, onCancel }: GoodsReceiptFormProps) => {
  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
    defaultValues: goodsReceipt || {
      grn_number: '',
      receipt_date: '',
      purchase_order: '',
      supplier: '',
      central_store: '',
      invoice_number: '',
      invoice_date: '',
      invoice_amount: '',
      delivery_challan_number: '',
      delivery_challan_date: '',
      lr_number: '',
      vehicle_number: '',
      transporter_name: '',
      freight_charges: '',
      received_by: '',
      status: 'received',
      remarks: '',
      metadata: '',
      is_active: true,
      items: [
        {
          item_description: '',
          ordered_quantity: 0,
          received_quantity: 0,
          accepted_quantity: 0,
          rejected_quantity: 0,
          unit: '',
          unit_price: '',
          total: '',
          batch_number: '',
          serial_number: '',
          expiry_date: '',
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
              <Label htmlFor="grn_number" required>GRN Number</Label>
              <Input
                id="grn_number"
                {...register('grn_number', { required: 'GRN number is required' })}
              />
              {errors.grn_number && <p className="text-sm text-red-500">{String(errors.grn_number.message)}</p>}
            </div>

            <div>
              <Label htmlFor="receipt_date" required>Receipt Date</Label>
              <Input
                id="receipt_date"
                type="date"
                {...register('receipt_date', { required: 'Receipt date is required' })}
              />
              {errors.receipt_date && <p className="text-sm text-red-500">{String(errors.receipt_date.message)}</p>}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase_order">Purchase Order ID</Label>
              <Input
                id="purchase_order"
                type="number"
                {...register('purchase_order', { valueAsNumber: true })}
                placeholder="Related PO"
              />
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
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="inspection_pending">Inspection Pending</SelectItem>
                  <SelectItem value="inspected">Inspected</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="posted_to_inventory">Posted to Inventory</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice & Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                {...register('invoice_number')}
              />
            </div>

            <div>
              <Label htmlFor="invoice_date">Invoice Date</Label>
              <Input
                id="invoice_date"
                type="date"
                {...register('invoice_date')}
              />
            </div>

            <div>
              <Label htmlFor="invoice_amount">Invoice Amount</Label>
              <Input
                id="invoice_amount"
                type="number"
                step="0.01"
                {...register('invoice_amount')}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="delivery_challan_number">Delivery Challan Number</Label>
              <Input
                id="delivery_challan_number"
                {...register('delivery_challan_number')}
              />
            </div>

            <div>
              <Label htmlFor="delivery_challan_date">Delivery Challan Date</Label>
              <Input
                id="delivery_challan_date"
                type="date"
                {...register('delivery_challan_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lr_number">LR Number</Label>
              <Input
                id="lr_number"
                {...register('lr_number')}
                placeholder="Lorry Receipt Number"
              />
            </div>

            <div>
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
              <Input
                id="vehicle_number"
                {...register('vehicle_number')}
              />
            </div>

            <div>
              <Label htmlFor="transporter_name">Transporter Name</Label>
              <Input
                id="transporter_name"
                {...register('transporter_name')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="freight_charges">Freight Charges</Label>
              <Input
                id="freight_charges"
                type="number"
                step="0.01"
                {...register('freight_charges')}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="received_by">Received By</Label>
              <Input
                id="received_by"
                {...register('received_by')}
                placeholder="Name of receiver"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Received Items</CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                item_description: '',
                ordered_quantity: 0,
                received_quantity: 0,
                accepted_quantity: 0,
                rejected_quantity: 0,
                unit: '',
                unit_price: '',
                total: '',
                batch_number: '',
                serial_number: '',
                expiry_date: '',
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

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.ordered_quantity`}>Ordered Qty</Label>
                    <Input
                      id={`items.${index}.ordered_quantity`}
                      type="number"
                      {...register(`items.${index}.ordered_quantity`, { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.received_quantity`} required>Received Qty</Label>
                    <Input
                      id={`items.${index}.received_quantity`}
                      type="number"
                      {...register(`items.${index}.received_quantity`, {
                        required: 'Required',
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.accepted_quantity`}>Accepted Qty</Label>
                    <Input
                      id={`items.${index}.accepted_quantity`}
                      type="number"
                      {...register(`items.${index}.accepted_quantity`, { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.rejected_quantity`}>Rejected Qty</Label>
                    <Input
                      id={`items.${index}.rejected_quantity`}
                      type="number"
                      {...register(`items.${index}.rejected_quantity`, { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.unit`} required>Unit</Label>
                    <Input
                      id={`items.${index}.unit`}
                      {...register(`items.${index}.unit`, { required: 'Unit is required' })}
                      placeholder="e.g., kg, pcs, ltr"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.unit_price`}>Unit Price</Label>
                    <Input
                      id={`items.${index}.unit_price`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`)}
                      placeholder="0.00"
                    />
                  </div>

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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.batch_number`}>Batch Number</Label>
                    <Input
                      id={`items.${index}.batch_number`}
                      {...register(`items.${index}.batch_number`)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.serial_number`}>Serial Number</Label>
                    <Input
                      id={`items.${index}.serial_number`}
                      {...register(`items.${index}.serial_number`)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.expiry_date`}>Expiry Date</Label>
                    <Input
                      id={`items.${index}.expiry_date`}
                      type="date"
                      {...register(`items.${index}.expiry_date`)}
                    />
                  </div>
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

      {/* Remarks */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              rows={3}
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
          {goodsReceipt ? 'Update' : 'Create'} Goods Receipt
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
