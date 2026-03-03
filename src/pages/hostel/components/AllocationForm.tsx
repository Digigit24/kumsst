import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { useHostels, useHostelBeds } from '../../../hooks/useHostel';
import { useQuery } from '@tanstack/react-query';
import { buildApiUrl, getDefaultHeaders } from '../../../config/api.config';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';

interface AllocationFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AllocationForm = ({ item, onSubmit, onCancel }: AllocationFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      student: '',
      hostel: '',
      room: '',
      bed: '',
      from_date: '',
      to_date: '',
      remarks: '',
      is_current: true,
      is_active: true,
    },
  });

  const isCurrent = watch('is_current');
  const isActive = watch('is_active');
  const student = watch('student');
  const hostel = watch('hostel');
  const room = watch('room');
  const bed = watch('bed');

  // Fetch students
  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const token = localStorage.getItem('kumss_auth_token');
      const response = await fetch(buildApiUrl(`/api/v1/students/students/?page_size=${DROPDOWN_PAGE_SIZE}`), {
        headers: {
          ...getDefaultHeaders(),
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
  });

  // Fetch hostels
  const { data: hostelsData } = useHostels({ page_size: DROPDOWN_PAGE_SIZE });

  // Fetch rooms (would need a rooms API endpoint)
  const { data: roomsData } = useQuery({
    queryKey: ['rooms', hostel],
    enabled: !!hostel,
    queryFn: async () => {
      const token = localStorage.getItem('kumss_auth_token');
      const response = await fetch(buildApiUrl(`/api/v1/hostel/rooms/?hostel=${hostel}&page_size=${DROPDOWN_PAGE_SIZE}`), {
        headers: {
          ...getDefaultHeaders(),
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return response.json();
    },
  });

  // Fetch beds
  const { data: bedsData } = useHostelBeds(room ? { room, page_size: DROPDOWN_PAGE_SIZE } : { page_size: DROPDOWN_PAGE_SIZE });

  const studentOptions = studentsData?.results?.map((s: any) => ({
    value: s.id,
    label: s.full_name || `${s.first_name} ${s.last_name}`,
    subtitle: s.admission_number,
  })) || [];

  const hostelOptions = hostelsData?.results?.map((h: any) => ({
    value: h.id,
    label: h.name,
    subtitle: h.hostel_type,
  })) || [];

  const roomOptions = roomsData?.results?.map((r: any) => ({
    value: r.id,
    label: r.room_number || `Room #${r.id}`,
    subtitle: r.room_type_name,
  })) || [];

  const bedOptions = bedsData?.results?.map((b: any) => ({
    value: b.id,
    label: b.bed_number,
    subtitle: b.status,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Student *</Label>
        <SearchableSelect
          options={studentOptions}
          value={student}
          onChange={(value) => setValue('student', value)}
          placeholder="Select student..."
          searchPlaceholder="Search students..."
        />
        {errors.student && <p className="text-sm text-destructive">{errors.student.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Hostel *</Label>
        <SearchableSelect
          options={hostelOptions}
          value={hostel}
          onChange={(value) => {
            setValue('hostel', value);
            setValue('room', '');
            setValue('bed', '');
          }}
          placeholder="Select hostel..."
          searchPlaceholder="Search hostels..."
        />
        {errors.hostel && <p className="text-sm text-destructive">{errors.hostel.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Room *</Label>
        <SearchableSelect
          options={roomOptions}
          value={room}
          onChange={(value) => {
            setValue('room', value);
            setValue('bed', '');
          }}
          placeholder={hostel ? "Select room..." : "Select hostel first"}
          searchPlaceholder="Search rooms..."
          disabled={!hostel}
        />
        {errors.room && <p className="text-sm text-destructive">{errors.room.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Bed *</Label>
        <SearchableSelect
          options={bedOptions}
          value={bed}
          onChange={(value) => setValue('bed', value)}
          placeholder={room ? "Select bed..." : "Select room first"}
          searchPlaceholder="Search beds..."
          disabled={!room}
        />
        {errors.bed && <p className="text-sm text-destructive">{errors.bed.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="from_date">From Date *</Label>
        <Input id="from_date" type="date" {...register('from_date', { required: 'From date is required' })} />
        {errors.from_date && <p className="text-sm text-destructive">{errors.from_date.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="to_date">To Date *</Label>
        <Input id="to_date" type="date" {...register('to_date', { required: 'To date is required' })} />
        {errors.to_date && <p className="text-sm text-destructive">{errors.to_date.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea id="remarks" {...register('remarks')} placeholder="Enter any remarks" rows={3} />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="is_current" checked={isCurrent} onCheckedChange={(checked) => setValue('is_current', checked)} />
        <Label htmlFor="is_current" className="cursor-pointer">Current Allocation</Label>
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
