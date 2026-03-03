/**
 * Student Attendance Form Component
 * For marking/editing student attendance
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useMarkStudentAttendance, useUpdateStudentAttendance } from '../../hooks/useAttendance';
import { useStudents } from '../../hooks/useStudents';
import { useClassesSWR, useSectionsFilteredByClass } from '../../hooks/useAcademicSWR';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import type { StudentAttendance, StudentAttendanceCreateInput } from '../../types/attendance.types';

interface StudentAttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: StudentAttendance | null;
  studentId?: number;
  classId?: number;
  sectionId?: number;
  onSuccess?: () => void;
}

export const StudentAttendanceForm: React.FC<StudentAttendanceFormProps> = ({
  open,
  onOpenChange,
  attendance,
  studentId,
  classId,
  sectionId,
  onSuccess,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const isEdit = !!attendance;

  // Fetch students, classes, and sections for dropdowns
  const { data: studentsData } = useStudents({ page_size: DROPDOWN_PAGE_SIZE });
  const { results: classes = [] } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  // Prefetch all sections once, filter client-side by class — instant switching
  const { results: sections = [] } = useSectionsFilteredByClass(
    selectedClass ? Number(selectedClass) : undefined
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StudentAttendanceCreateInput>({
    defaultValues: {
      student: studentId || 0,
      class_obj: classId || 0,
      section: sectionId || 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'present',
    },
  });

  const createMutation = useMarkStudentAttendance();
  const updateMutation = useUpdateStudentAttendance();

  const status = watch('status');
  const studentValue = watch('student');
  const classValue = watch('class_obj');
  const sectionValue = watch('section');

  useEffect(() => {
    if (attendance) {
      setValue('student', attendance.student);
      setValue('class_obj', attendance.class_obj);
      setValue('section', attendance.section);
      setValue('date', attendance.date);
      setValue('status', attendance.status as any);
      setValue('check_in_time', attendance.check_in_time || '');
      setValue('check_out_time', attendance.check_out_time || '');
      setValue('remarks', attendance.remarks || '');
      setDate(new Date(attendance.date));
      setSelectedClass(String(attendance.class_obj));
    }
  }, [attendance, setValue]);

  const onSubmit = async (data: StudentAttendanceCreateInput) => {
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
      reset();
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Mark'} Student Attendance</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update' : 'Mark'} attendance for the student
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Class */}
          <div className="space-y-2">
            <Label htmlFor="class_obj">Class *</Label>
            <Select
              value={classValue ? String(classValue) : ''}
              onValueChange={(value) => {
                const numValue = Number(value);
                setValue('class_obj', numValue);
                setSelectedClass(value);
                setValue('section', 0); // Reset section when class changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((classItem) => (
                  <SelectItem key={classItem.id} value={String(classItem.id)}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.class_obj && <p className="text-sm text-red-500">Class is required</p>}
          </div>

          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Select
              value={sectionValue ? String(sectionValue) : ''}
              onValueChange={(value) => setValue('section', Number(value))}
              disabled={!selectedClass}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedClass ? "Select section" : "Select class first"} />
              </SelectTrigger>
              <SelectContent>
                {sections?.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.section && <p className="text-sm text-red-500">Section is required</p>}
          </div>

          {/* Student */}
          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <Select
              value={studentValue ? String(studentValue) : ''}
              onValueChange={(value) => setValue('student', Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {studentsData?.results?.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.full_name} ({student.admission_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.student && <p className="text-sm text-red-500">Student is required</p>}
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
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Check-in/Check-out Times */}
          {(status === 'present' || status === 'late') && (
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
          )}

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
