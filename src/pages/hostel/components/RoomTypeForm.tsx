import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useHostels } from '../../../hooks/useHostel';

interface RoomTypeFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const RoomTypeForm = ({ item, onSubmit, onCancel }: RoomTypeFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      name: '',
      capacity: '',
      features: '',
      monthly_fee: '',
      hostel: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const hostel = watch('hostel');

  // Fetch hostels for dropdown
  const { data: hostelsData } = useHostels({ page_size: DROPDOWN_PAGE_SIZE });

  const hostelOptions = hostelsData?.results?.map((h: any) => ({
    value: h.id,
    label: h.name,
    subtitle: h.hostel_type,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name', { required: 'Name is required' })} placeholder="e.g., Single AC" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Hostel *</Label>
        <SearchableSelect
          options={hostelOptions}
          value={hostel}
          onChange={(value) => setValue('hostel', value)}
          placeholder="Select hostel..."
          searchPlaceholder="Search hostels..."
        />
        {errors.hostel && <p className="text-sm text-destructive">{errors.hostel.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity *</Label>
        <Input id="capacity" type="number" {...register('capacity', { required: 'Capacity is required' })} placeholder="e.g., 2" />
        {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthly_fee">Monthly Fee *</Label>
        <Input id="monthly_fee" type="number" step="0.01" {...register('monthly_fee', { required: 'Monthly fee is required' })} placeholder="e.g., 5000" />
        {errors.monthly_fee && <p className="text-sm text-destructive">{errors.monthly_fee.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Features</Label>
        <Textarea id="features" {...register('features')} placeholder="e.g., AC, Attached Bathroom, Wi-Fi" rows={3} />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="is_active" checked={isActive} onCheckedChange={(checked) => setValue('is_active', checked)} />
        <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
};
