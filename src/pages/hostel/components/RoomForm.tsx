import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useCreateRoomType, useHostels, useRoomTypes } from '../../../hooks/useHostel';

interface CreateRoomTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostelId: number;
  onSuccess: (roomType: any) => void;
}

const CreateRoomTypeDialog = ({ open, onOpenChange, hostelId, onSuccess }: CreateRoomTypeDialogProps) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      monthly_fee: '',
      capacity: '',
      hostel: hostelId, // Set the current hostel
      is_active: true,
    },
  });

  const createRoomType = useCreateRoomType();

  const onSubmit = async (data: any) => {
    try {
      const newRoomType = await createRoomType.mutateAsync({
        ...data,
        hostel: hostelId, // Ensure hostel is set
      });
      toast.success('Room type created successfully');
      reset();
      onOpenChange(false);
      onSuccess(newRoomType); // Trigger callback with new room type
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create room type');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Room Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="rt_name">Name *</Label>
            <Input id="rt_name" {...register('name', { required: 'Name is required' })} placeholder="e.g., Standard AC" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rt_capacity">Capacity (Beds) *</Label>
            <Input
              id="rt_capacity"
              type="number"
              {...register('capacity', { required: 'Capacity is required', min: 1 })}
              placeholder="e.g., 2"
            />
            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message as string}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rt_fee">Monthly Fee *</Label>
            <Input
              id="rt_fee"
              type="number"
              {...register('monthly_fee', { required: 'Fee is required', min: 0 })}
              placeholder="e.g., 5000"
            />
            {errors.monthly_fee && <p className="text-sm text-destructive">{errors.monthly_fee.message as string}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface RoomFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const RoomForm = ({ item, onSubmit, onCancel }: RoomFormProps) => {
  const [isCreateTypeOpen, setCreateTypeOpen] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      room_number: '',
      floor: '',
      capacity: '',
      occupied_beds: 0,
      hostel: '',
      room_type: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const hostel = watch('hostel');
  const roomType = watch('room_type');

  // Fetch hostels for dropdown
  const { data: hostelsData } = useHostels({ page_size: DROPDOWN_PAGE_SIZE });

  // Fetch room types for dropdown (filter by selected hostel)
  const { data: roomTypesData, isLoading: roomTypesLoading } = useRoomTypes(hostel ? { hostel, page_size: DROPDOWN_PAGE_SIZE } : { page_size: DROPDOWN_PAGE_SIZE });

  const hostelOptions = hostelsData?.results?.map((h: any) => ({
    value: h.id,
    label: h.name,
    subtitle: h.hostel_type,
  })) || [];

  const roomTypeOptions = roomTypesData?.results?.map((rt: any) => ({
    value: rt.id,
    label: rt.name,
    subtitle: `₹${rt.monthly_fee}/month | Capacity: ${rt.capacity}`,
  })) || [];

  const handleRoomTypeCreated = (newRoomType: any) => {
    // If the new room type has capacity, we can auto-fill that too if needed
    if (newRoomType.capacity) {
      setValue('capacity', newRoomType.capacity);
    }
    // Select the newly created room type
    setValue('room_type', newRoomType.id);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="room_number">Room Number *</Label>
          <Input id="room_number" {...register('room_number', { required: 'Room number is required' })} placeholder="e.g., 101, A-101" />
          {errors.room_number && <p className="text-sm text-destructive">{errors.room_number.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Hostel *</Label>
          <SearchableSelect
            options={hostelOptions}
            value={hostel}
            onChange={(value) => {
              setValue('hostel', value);
              setValue('room_type', '');
            }}
            placeholder="Select hostel..."
            searchPlaceholder="Search hostels..."
          />
          {errors.hostel && <p className="text-sm text-destructive">{errors.hostel.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Room Type *</Label>
          <SearchableSelect
            options={roomTypeOptions}
            value={roomType}
            onChange={(value) => setValue('room_type', value)}
            placeholder={hostel ? "Select room type..." : "Select hostel first"}
            searchPlaceholder="Search room types..."
            disabled={!hostel}
            isLoading={roomTypesLoading}
            onCreate={() => setCreateTypeOpen(true)}
            createLabel="Create Room Type"
            emptyText={hostel ? "No room types found." : "Select a hostel to load types."}
          />
          {errors.room_type && <p className="text-sm text-destructive">{errors.room_type.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">Floor *</Label>
          <Input id="floor" {...register('floor', { required: 'Floor is required' })} placeholder="e.g., Ground, 1st, 2nd" />
          {errors.floor && <p className="text-sm text-destructive">{errors.floor.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input id="capacity" type="number" {...register('capacity', { required: 'Capacity is required' })} placeholder="e.g., 4" />
          {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupied_beds">Occupied Beds</Label>
          <Input id="occupied_beds" type="number" {...register('occupied_beds')} placeholder="e.g., 2" />
          <p className="text-xs text-muted-foreground">Leave as 0 for new rooms</p>
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

      {/* Internal Create Room Type Dialog */}
      {hostel && (
        <CreateRoomTypeDialog
          open={isCreateTypeOpen}
          onOpenChange={setCreateTypeOpen}
          hostelId={Number(hostel)}
          onSuccess={handleRoomTypeCreated}
        />
      )}
    </>
  );
};
