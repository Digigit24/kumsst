/**
 * Vendor Form - Create/Edit vendors
 */

import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';

interface VendorFormProps {
  vendor?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const VendorForm = ({ vendor, onSubmit, onCancel }: VendorFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: vendor || {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      is_active: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Vendor Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Vendor name is required' })}
        />
        {errors.name && <p className="text-sm text-red-500">{String(errors.name.message)}</p>}
      </div>

      <div>
        <Label htmlFor="contact_person">Contact Person *</Label>
        <Input
          id="contact_person"
          {...register('contact_person', { required: 'Contact person is required' })}
        />
        {errors.contact_person && <p className="text-sm text-red-500">{String(errors.contact_person.message)}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && <p className="text-sm text-red-500">{String(errors.email.message)}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          {...register('phone', { required: 'Phone is required' })}
        />
        {errors.phone && <p className="text-sm text-red-500">{String(errors.phone.message)}</p>}
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          {...register('address', { required: 'Address is required' })}
        />
        {errors.address && <p className="text-sm text-red-500">{String(errors.address.message)}</p>}
      </div>

      <div>
        <Label htmlFor="gstin">GSTIN</Label>
        <Input
          id="gstin"
          {...register('gstin')}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {vendor ? 'Update' : 'Create'} Vendor
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
