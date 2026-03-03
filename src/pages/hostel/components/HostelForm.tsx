import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { useQuery } from '@tanstack/react-query';
import { buildApiUrl, getDefaultHeaders } from '../../../config/api.config';

interface HostelFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const HostelForm = ({ item, onSubmit, onCancel }: HostelFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      name: '',
      hostel_type: '',
      address: '',
      capacity: '',
      contact_number: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name', { required: 'Name is required' })} placeholder="e.g., Boys Hostel A" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hostel_type">Hostel Type *</Label>
        <Input id="hostel_type" {...register('hostel_type', { required: 'Hostel type is required' })} placeholder="e.g., Boys, Girls, Staff" />
        {errors.hostel_type && <p className="text-sm text-destructive">{errors.hostel_type.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea id="address" {...register('address', { required: 'Address is required' })} placeholder="Enter hostel address" rows={3} />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity *</Label>
        <Input id="capacity" type="number" {...register('capacity', { required: 'Capacity is required' })} placeholder="e.g., 100" />
        {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_number">Contact Number *</Label>
        <Input id="contact_number" {...register('contact_number', { required: 'Contact number is required' })} placeholder="e.g., +91 9876543210" />
        {errors.contact_number && <p className="text-sm text-destructive">{errors.contact_number.message as string}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="is_active" checked={isActive} onCheckedChange={(checked) => setValue('is_active', checked as boolean)} />
        <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
};
