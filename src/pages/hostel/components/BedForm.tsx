import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { useQuery } from '@tanstack/react-query';
import { buildApiUrl, getDefaultHeaders } from '../../../config/api.config';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';

interface BedFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const BedForm = ({ item, onSubmit, onCancel }: BedFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      bed_number: '',
      room: '',
      status: 'available',
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const room = watch('room');

  // Fetch rooms
  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const token = localStorage.getItem('kumss_auth_token');
      const response = await fetch(buildApiUrl(`/api/v1/hostel/rooms/?page_size=${DROPDOWN_PAGE_SIZE}`), {
        headers: {
          ...getDefaultHeaders(),
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return response.json();
    },
  });

  const roomOptions = roomsData?.results?.map((r: any) => ({
    value: r.id,
    label: r.room_number || `Room #${r.id}`,
    subtitle: r.room_type_name,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="bed_number">Bed Number *</Label>
        <Input id="bed_number" {...register('bed_number', { required: 'Bed number is required' })} placeholder="e.g., B-101" />
        {errors.bed_number && <p className="text-sm text-destructive">{errors.bed_number.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Room *</Label>
        <SearchableSelect
          options={roomOptions}
          value={room}
          onChange={(value) => setValue('room', value)}
          placeholder="Select room..."
          searchPlaceholder="Search rooms..."
        />
        {errors.room && <p className="text-sm text-destructive">{errors.room.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Input id="status" {...register('status', { required: 'Status is required' })} placeholder="e.g., available, occupied, maintenance" />
        {errors.status && <p className="text-sm text-destructive">{errors.status.message as string}</p>}
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
