/**
 * Stock Receipt Form - Create/Edit stock receipts
 */

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CollegeDropdown } from '../../../components/common/CollegeDropdown';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useAuth } from '../../../hooks/useAuth';
import { useStoreItems, useVendors } from '../../../hooks/useStore';

interface StockReceiptFormProps {
  receipt?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const StockReceiptForm = ({ receipt, onSubmit, onCancel }: StockReceiptFormProps) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm({
    defaultValues: receipt || {
      item: '',
      vendor: '',
      quantity: '',
      unit_price: '',
      total_amount: '',
      receive_date: new Date().toISOString().split('T')[0],
      invoice_number: '',
      remarks: '',
      is_active: true,
    },
  });

  // Fetch vendors and items for dropdowns
  const { data: vendorsData } = useVendors({ is_active: true, page_size: DROPDOWN_PAGE_SIZE });
  const { data: itemsData } = useStoreItems({ is_active: true, page_size: DROPDOWN_PAGE_SIZE });

  const quantity = watch('quantity');
  const unitPrice = watch('unit_price');

  const { user } = useAuth();
  const isSuperAdmin = (user as any)?.is_superuser || (user as any)?.user_type === 'super_admin';

  // Auto-calculate total amount
  useEffect(() => {
    if (quantity && unitPrice) {
      const total = parseFloat(quantity) * parseFloat(unitPrice);
      setValue('total_amount', total.toFixed(2));
    }
  }, [quantity, unitPrice, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSuperAdmin && (
        <div>
          <Label htmlFor="college">College (Super Admin Only)</Label>
          <Controller
            name="college"
            control={control}
            rules={{ required: 'College is required for Super Admin' }}
            render={({ field }) => (
              <CollegeDropdown
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.college?.message as string}
              />
            )}
          />
        </div>
      )}

      <div>
        <Label htmlFor="vendor">Vendor *</Label>
        <Controller
          name="vendor"
          control={control}
          rules={{ required: 'Vendor is required' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendorsData?.results?.map((vendor: any) => (
                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.vendor && <p className="text-sm text-red-500">{errors.vendor.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="item">Item *</Label>
        <Controller
          name="item"
          control={control}
          rules={{ required: 'Item is required' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {itemsData?.results?.map((item: any) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.item && <p className="text-sm text-red-500">{errors.item.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="invoice_number">Invoice Number *</Label>
        <Input
          id="invoice_number"
          {...register('invoice_number', { required: 'Invoice number is required' })}
        />
        {errors.invoice_number && <p className="text-sm text-red-500">{errors.invoice_number.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          {...register('quantity', { required: 'Quantity is required', min: 1 })}
        />
        {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="unit_price">Unit Price *</Label>
        <Input
          id="unit_price"
          type="number"
          step="0.01"
          {...register('unit_price', { required: 'Unit price is required', min: 0 })}
        />
        {errors.unit_price && <p className="text-sm text-red-500">{errors.unit_price.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="total_amount">Total Amount</Label>
        <Input
          id="total_amount"
          type="number"
          step="0.01"
          {...register('total_amount')}
          readOnly
          className="bg-muted"
        />
      </div>

      <div>
        <Label htmlFor="receive_date">Receive Date *</Label>
        <Input
          id="receive_date"
          type="date"
          {...register('receive_date', { required: 'Receive date is required' })}
        />
        {errors.receive_date && <p className="text-sm text-red-500">{errors.receive_date.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          {...register('remarks')}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {receipt ? 'Update' : 'Create'} Stock Receipt
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
