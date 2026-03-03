/**
 * Staff Attendance Form Component
 * For marking/editing staff attendance
 */

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useUsers } from '../../hooks/useAccounts';
import { useMarkStaffAttendance, useUpdateStaffAttendance } from '../../hooks/useAttendance';
import { cn } from '../../lib/utils';
import type { StaffAttendance, StaffAttendanceCreateInput } from '../../types/attendance.types';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

interface StaffAttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: StaffAttendance | null;
  teacherId?: number;
  onSuccess?: () => void;
}

export const StaffAttendanceForm: React.FC<StaffAttendanceFormProps> = ({
  open,
  onOpenChange,
  attendance,
  teacherId,
  onSuccess,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const isEdit = !!attendance;

  // Fetch teachers for dropdown
  const { data: teachersData } = useUsers({ user_type: 'teacher', page_size: DROPDOWN_PAGE_SIZE });

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<StaffAttendanceCreateInput>({
    defaultValues: {
      teacher: teacherId || undefined,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'present',
      check_in_time: '',
      check_out_time: '',
      remarks: '',
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && !attendance) {
      // Reset to default values when opening for new entry
      reset({
        teacher: teacherId || undefined,
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'present',
        check_in_time: '',
        check_out_time: '',
        remarks: '',
      });
      setDate(new Date());
    }
  }, [open, attendance, teacherId, reset]);

  // Update form when editing existing attendance
  useEffect(() => {
    if (attendance && open) {
      reset({
        teacher: attendance.teacher,
        date: attendance.date,
        status: attendance.status,
        check_in_time: attendance.check_in_time || '',
        check_out_time: attendance.check_out_time || '',
        remarks: attendance.remarks || '',
      });
      setDate(new Date(attendance.date));
    }
  }, [attendance, open, reset]);

  const createMutation = useMarkStaffAttendance();
  const updateMutation = useUpdateStaffAttendance();


  const status = watch('status');

  const onSubmit = async (data: StaffAttendanceCreateInput) => {
    try {
      if (isEdit && attendance) {
        await updateMutation.mutateAsync({
          id: attendance.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
      onOpenChange(false);
      // Reset form after successful submission
      reset({
        teacher: undefined,
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'present',
        check_in_time: '',
        check_out_time: '',
        remarks: '',
      });
    } catch (error) {
      console.error('Failed to save staff attendance:', error);
      toast.error('Failed to save staff attendance. Check console for details.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Mark'} Staff Attendance</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update' : 'Mark'} attendance for the staff member
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Teacher */}
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher *</Label>
            <Controller
              name="teacher"
              control={control}
              rules={{ required: 'Teacher is required' }}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(value) => {
                    const numVal = parseInt(value, 10);
                    if (!isNaN(numVal)) {
                      field.onChange(numVal);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersData?.results?.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={String(teacher.teacher_id)}
                        disabled={!teacher.teacher_id}
                      >
                        {teacher.full_name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teacher && <p className="text-sm text-red-500">{errors.teacher.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      setValue('date', format(newDate, 'yyyy-MM-dd'));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Input
              id="status"
              {...register('status', { required: true })}
              placeholder="e.g., present, absent, late, on_leave"
            />
            {errors.status && <p className="text-sm text-red-500">Status is required</p>}
          </div>

          {/* Check-in/Check-out Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in_time">Check-in Time</Label>
              <Input
                id="check_in_time"
                type="time"
                {...register('check_in_time')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_out_time">Check-out Time</Label>
              <Input
                id="check_out_time"
                type="time"
                {...register('check_out_time')}
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEdit
                  ? 'Update'
                  : 'Mark Attendance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
