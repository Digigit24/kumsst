/**
 * Student Marks Form
 * Create/Edit student marks entry
 */

import { useState, useEffect } from 'react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useMarksRegistersSWR } from '../../../hooks/swr';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../../services/students.service';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Loader2 } from 'lucide-react';

interface StudentMarksFormData {
  theory_marks: number | null;
  practical_marks: number | null;
  internal_marks: number | null;
  total_marks: number;
  grade: string | null;
  is_absent: boolean;
  is_active: boolean;
  register?: number;
  student?: number;
}

interface StudentMarksFormProps {
  marks?: any | null;
  onSubmit: (data: StudentMarksFormData) => void;
  onCancel: () => void;
}

export const StudentMarksForm = ({ marks, onSubmit, onCancel }: StudentMarksFormProps) => {
  const [formData, setFormData] = useState<StudentMarksFormData>({
    theory_marks: null,
    practical_marks: null,
    internal_marks: null,
    total_marks: 0,
    grade: null,
    is_absent: false,
    is_active: true,
    register: undefined,
    student: undefined,
  });

  // Fetch marks registers (SWR cached)
  const { data: registersData, isLoading: isLoadingRegisters } = useMarksRegistersSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', { page_size: DROPDOWN_PAGE_SIZE, is_active: true }],
    queryFn: () => studentApi.list({ page_size: DROPDOWN_PAGE_SIZE, is_active: true }),
  });

  const registers = registersData?.results || [];
  const students = studentsData?.results || [];

  useEffect(() => {
    if (marks) {
      setFormData({
        theory_marks: marks.theory_marks ?? null,
        practical_marks: marks.practical_marks ?? null,
        internal_marks: marks.internal_marks ?? null,
        total_marks: marks.total_marks || 0,
        grade: marks.grade || null,
        is_absent: marks.is_absent || false,
        is_active: marks.is_active ?? true,
        register: marks.register,
        student: marks.student,
      });
    }
  }, [marks]);

  // Calculate total marks when component marks change
  useEffect(() => {
    const theory = formData.theory_marks || 0;
    const practical = formData.practical_marks || 0;
    const internal = formData.internal_marks || 0;
    const total = theory + practical + internal;
    setFormData(prev => ({ ...prev, total_marks: total }));
  }, [formData.theory_marks, formData.practical_marks, formData.internal_marks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof StudentMarksFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = isLoadingRegisters || isLoadingStudents;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register">Marks Register *</Label>
        <Select
          value={formData.register?.toString()}
          onValueChange={(value) => handleChange('register', parseInt(value))}
          disabled={isLoadingRegisters}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingRegisters ? "Loading registers..." : "Select marks register"} />
          </SelectTrigger>
          <SelectContent>
            {registers.length === 0 && !isLoadingRegisters && (
              <div className="p-2 text-sm text-muted-foreground">No marks registers available</div>
            )}
            {registers.map((reg) => (
              <SelectItem key={reg.id} value={reg.id.toString()}>
                Register #{reg.id} - {reg.exam_schedule_name || 'Exam Schedule'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="student">Student *</Label>
        <Select
          value={formData.student?.toString()}
          onValueChange={(value) => handleChange('student', parseInt(value))}
          disabled={isLoadingStudents}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingStudents ? "Loading students..." : "Select student"} />
          </SelectTrigger>
          <SelectContent>
            {students.length === 0 && !isLoadingStudents && (
              <div className="p-2 text-sm text-muted-foreground">No students available</div>
            )}
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.full_name} (Roll: {student.roll_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="theory_marks">Theory Marks</Label>
          <Input
            id="theory_marks"
            type="number"
            value={formData.theory_marks || ''}
            onChange={(e) => handleChange('theory_marks', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0"
            min="0"
            step="0.01"
            disabled={formData.is_absent}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="practical_marks">Practical Marks</Label>
          <Input
            id="practical_marks"
            type="number"
            value={formData.practical_marks || ''}
            onChange={(e) => handleChange('practical_marks', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0"
            min="0"
            step="0.01"
            disabled={formData.is_absent}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="internal_marks">Internal Marks</Label>
          <Input
            id="internal_marks"
            type="number"
            value={formData.internal_marks || ''}
            onChange={(e) => handleChange('internal_marks', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0"
            min="0"
            step="0.01"
            disabled={formData.is_absent}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="total_marks">Total Marks</Label>
        <Input
          id="total_marks"
          type="number"
          value={formData.total_marks || 0}
          readOnly
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">Grade</Label>
        <Select
          value={formData.grade || ''}
          onValueChange={(value) => handleChange('grade', value)}
          disabled={formData.is_absent}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+ (90-100)</SelectItem>
            <SelectItem value="A">A (80-89)</SelectItem>
            <SelectItem value="B+">B+ (70-79)</SelectItem>
            <SelectItem value="B">B (60-69)</SelectItem>
            <SelectItem value="C">C (50-59)</SelectItem>
            <SelectItem value="D">D (40-49)</SelectItem>
            <SelectItem value="F">F (Below 40)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_absent"
          checked={formData.is_absent || false}
          onCheckedChange={(checked) => {
            handleChange('is_absent', checked);
            if (checked) {
              setFormData(prev => ({
                ...prev,
                theory_marks: null,
                practical_marks: null,
                internal_marks: null,
                total_marks: 0,
                grade: null,
              }));
            }
          }}
        />
        <Label htmlFor="is_absent">Mark as Absent</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active || false}
          onCheckedChange={(checked) => handleChange('is_active', checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {marks ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
