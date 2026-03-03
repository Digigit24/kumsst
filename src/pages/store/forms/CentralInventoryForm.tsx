/**
 * Central Inventory Form - Create/Edit inventory items
 */

import { Controller, useForm } from 'react-hook-form';
import { CentralStoreDropdown } from '../../../components/common/CentralStoreDropdown';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';

interface CentralInventoryFormProps {
  inventory?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const CentralInventoryForm = ({ inventory, onSubmit, onCancel }: CentralInventoryFormProps) => {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: inventory || {
      central_store: '',
      item_name: '',
      item: '',
      quantity_on_hand: 0,
      quantity_allocated: 0,
      quantity_available: 0,
      min_stock_level: 0,
      reorder_point: 0,
      max_stock_level: 0,
      unit_cost: '0.00',
      is_active: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Controller
            name="central_store"
            control={control}
            rules={{ required: 'Store is required' }}
            render={({ field }: { field: any }) => (
              <CentralStoreDropdown
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.central_store && (errors.central_store.message as string)}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="item_name">Item Name *</Label>
          <Input
            id="item_name"
            {...register('item_name', { required: 'Item Name is required' })}
          />
          {errors.item_name && <p className="text-sm text-red-500">{errors.item_name.message as string}</p>}
        </div>


      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantity_on_hand">Quantity On Hand *</Label>
          <Input
            id="quantity_on_hand"
            type="number"
            {...register('quantity_on_hand', { required: 'Required', valueAsNumber: true })}
          />
          {errors.quantity_on_hand && <p className="text-sm text-red-500">{errors.quantity_on_hand.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="quantity_allocated">Quantity Allocated</Label>
          <Input
            id="quantity_allocated"
            type="number"
            {...register('quantity_allocated', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="quantity_available">Quantity Available</Label>
          <Input
            id="quantity_available"
            type="number"
            {...register('quantity_available', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="min_stock_level">Min Stock Level *</Label>
          <Input
            id="min_stock_level"
            type="number"
            {...register('min_stock_level', { required: 'Required', valueAsNumber: true })}
          />
          {errors.min_stock_level && <p className="text-sm text-red-500">{errors.min_stock_level.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="reorder_point">Reorder Point *</Label>
          <Input
            id="reorder_point"
            type="number"
            {...register('reorder_point', { required: 'Required', valueAsNumber: true })}
          />
          {errors.reorder_point && <p className="text-sm text-red-500">{errors.reorder_point.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="max_stock_level">Max Stock Level *</Label>
          <Input
            id="max_stock_level"
            type="number"
            {...register('max_stock_level', { required: 'Required', valueAsNumber: true })}
          />
          {errors.max_stock_level && <p className="text-sm text-red-500">{errors.max_stock_level.message as string}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="unit_cost">Unit Cost *</Label>
        <Input
          id="unit_cost"
          {...register('unit_cost', { required: 'Unit cost is required' })}
          placeholder="0.00"
        />
        {errors.unit_cost && <p className="text-sm text-red-500">{errors.unit_cost.message as string}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {inventory ? 'Update' : 'Create'} Inventory
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
