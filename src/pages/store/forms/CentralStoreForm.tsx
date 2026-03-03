/**
 * Central Store Form - Create/Edit central stores
 */

import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { UserSearchableDropdown } from '../../../components/common/UserSearchableDropdown';

interface CentralStoreFormProps {
  store?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const CentralStoreForm = ({ store, onSubmit, onCancel }: CentralStoreFormProps) => {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: store || {
      name: '',
      code: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      contact_phone: '',
      contact_email: '',
      manager: '',
      is_active: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Store Name *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Store name is required' })}
          />
          {errors.name && <p className="text-sm text-red-500">{String(errors.name.message)}</p>}
        </div>

        <div>
          <Label htmlFor="code">Store Code *</Label>
          <Input
            id="code"
            {...register('code', { required: 'Store code is required' })}
          />
          {errors.code && <p className="text-sm text-red-500">{String(errors.code.message)}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="address_line1">Address Line 1 *</Label>
        <Input
          id="address_line1"
          {...register('address_line1', { required: 'Address is required' })}
        />
        {errors.address_line1 && <p className="text-sm text-red-500">{String(errors.address_line1.message)}</p>}
      </div>

      <div>
        <Label htmlFor="address_line2">Address Line 2</Label>
        <Input
          id="address_line2"
          {...register('address_line2')}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register('city', { required: 'City is required' })}
          />
          {errors.city && <p className="text-sm text-red-500">{String(errors.city.message)}</p>}
        </div>

        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            {...register('state', { required: 'State is required' })}
          />
          {errors.state && <p className="text-sm text-red-500">{String(errors.state.message)}</p>}
        </div>

        <div>
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            {...register('pincode', { required: 'Pincode is required' })}
          />
          {errors.pincode && <p className="text-sm text-red-500">{String(errors.pincode.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_phone">Contact Phone *</Label>
          <Input
            id="contact_phone"
            {...register('contact_phone', { required: 'Phone is required' })}
          />
          {errors.contact_phone && <p className="text-sm text-red-500">{String(errors.contact_phone.message)}</p>}
        </div>

        <div>
          <Label htmlFor="contact_email">Contact Email *</Label>
          <Input
            id="contact_email"
            type="email"
            {...register('contact_email', { required: 'Email is required' })}
          />
          {errors.contact_email && <p className="text-sm text-red-500">{String(errors.contact_email.message)}</p>}
        </div>
      </div>

      <div>
        <Controller
          name="manager"
          control={control}
          rules={{ required: 'Manager is required' }}
          render={({ field }) => (
            <UserSearchableDropdown
              value={field.value}
              onChange={field.onChange}
              userType="staff"
              required
              label="Store Manager"
              placeholder="Search and select manager..."
              error={errors.manager?.message ? String(errors.manager.message) : undefined}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {store ? 'Update' : 'Create'} Store
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
