/**
 * Bulk Attendance Form Component
 * For marking attendance for multiple students at once
 */

import { format } from 'date-fns';
import { CalendarIcon, Search, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useClassesSWR, useSectionsFilteredByClass } from '../../hooks/useAcademicSWR';
import { useBulkMarkAttendance } from '../../hooks/useAttendance';
import { useStudents } from '../../hooks/useStudents';
import { cn } from '../../lib/utils';
import type { BulkAttendanceCreateInput } from '../../types/attendance.types';
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
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

interface BulkAttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const BulkAttendanceForm: React.FC<BulkAttendanceFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<'present' | 'absent' | 'late' | 'excused' | 'half_day'>('present');
  const [remarks, setRemarks] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch classes, sections, and students
  const { results: classes = [] } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  // Prefetch all sections once, filter client-side by class — instant switching
  const { results: sections = [] } = useSectionsFilteredByClass(
    selectedClass ? Number(selectedClass) : undefined
  );
  const { data: studentsData } = useStudents({
    page_size: DROPDOWN_PAGE_SIZE,
    current_class: selectedClass ? Number(selectedClass) : undefined,
    current_section: selectedSection ? Number(selectedSection) : undefined,
  });

  const bulkMutation = useBulkMarkAttendance();

  // Filter students based on search query
  const filteredStudents = studentsData?.results?.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelectAll = () => {
    setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
  };

  const handleDeselectAll = () => {
    setSelectedStudents(new Set());
  };

  const toggleStudent = (id: number, checked: boolean) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const onSubmit = async () => {
    if (!selectedClass || !selectedSection || selectedStudents.size === 0) {
      setErrorMessage('Please select class, section, and at least one student');
      return;
    }

    // Clear any previous errors
    setErrorMessage('');

    try {
      const data: BulkAttendanceCreateInput = {
        class_obj: Number(selectedClass),
        section: Number(selectedSection),
        date: format(date, 'yyyy-MM-dd'),
        student_ids: Array.from(selectedStudents.values()),
        status,
        remarks: remarks?.trim() || undefined,
      };

      const result = await bulkMutation.mutateAsync(data);

      // Success
      toast.success(`Successfully marked ${status} for ${selectedStudents.size} student(s)`);
      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setSelectedClass('');
      setSelectedSection('');
      setSelectedStudents(new Set());
      setSearchQuery('');
      setRemarks('');
      setStatus('present');
      setErrorMessage('');
    } catch (error: any) {
      console.error('Failed to mark bulk attendance:', error);

      // Extract error message
      let message = 'Failed to mark attendance';

      if (error?.errors) {
        // If there are specific field errors, show them
        const errorDetails = Object.entries(error.errors)
          .map(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              return `${field}: ${msgs.join(', ')}`;
            }
            return `${field}: ${msgs}`;
          })
          .join('\n');
        message = errorDetails || error.message || message;
      } else if (error?.message) {
        message = error.message;
      }

      if (error?.status === 500) {
        message = 'Server error occurred. Please check:\n- Class and section IDs are valid\n- Selected students belong to the class\n- Date is valid\n\nOriginal error: ' + message;
      }

      setErrorMessage(message);
      toast.error('Failed to mark attendance. See error details below.');
    }
  };

  useEffect(() => {
    if (!open) {
      // Reset when dialog closes
      setSelectedClass('');
      setSelectedSection('');
      setSelectedStudents(new Set());
      setSearchQuery('');
      setRemarks('');
      setStatus('present');
      setErrorMessage('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Mark Student Attendance</DialogTitle>
          <DialogDescription>
            Select class and section, then mark attendance for multiple students
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
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
                    if (newDate) setDate(newDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Class and Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setSelectedSection('');
                  setSelectedStudents(new Set());
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
            </div>

            <div className="space-y-2">
              <Label>Section *</Label>
              <Select
                value={selectedSection}
                onValueChange={(value) => {
                  setSelectedSection(value);
                  setSelectedStudents(new Set());
                }}
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
            </div>
          </div>

          {/* Default Status */}
          <div className="space-y-2">
            <Label>Status for selected students</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
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

          {/* Student Selection */}
          {selectedClass && selectedSection && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Students ({filteredStudents.length})</Label>
                <div className="space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
                    Clear
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Student List */}
              <div className="border rounded-md max-h-[340px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No students found
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredStudents.map((student) => {
                      const isSelected = selectedStudents.has(student.id);
                      return (
                        <div
                          key={student.id}
                          className="grid grid-cols-3 items-center gap-3 p-3 hover:bg-accent"
                        >
                          <div className="space-y-1">
                            <div className="font-medium">{student.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {student.admission_number}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.current_class_name || '—'}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              size="sm"
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={() => toggleStudent(student.id, !isSelected)}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks (optional)</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add a note for this batch update"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={
              !selectedClass ||
              !selectedSection ||
              selectedStudents.size === 0 ||
              bulkMutation.isPending
            }
          >
            {bulkMutation.isPending ? 'Marking...' : `Mark ${status} (${selectedStudents.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
