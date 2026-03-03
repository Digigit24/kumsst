/**
 * Exam Schedule Form
 * Create/Edit exam schedules
 */

import { useState, useEffect } from 'react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useExams } from '../../../hooks/useExamination';
import { useSubjectsSWR, useClassroomsSWR } from '../../../hooks/useAcademicSWR';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Loader2 } from 'lucide-react';

interface ExamScheduleFormData {
  date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  is_active: boolean;
  exam?: number;
  subject?: number;
  classroom?: number | null;
}

interface ExamScheduleFormProps {
  schedule?: any | null;
  onSubmit: (data: ExamScheduleFormData) => void;
  onCancel: () => void;
}

export const ExamScheduleForm = ({ schedule, onSubmit, onCancel }: ExamScheduleFormProps) => {
  const [formData, setFormData] = useState<ExamScheduleFormData>({
    date: '',
    start_time: '',
    end_time: '',
    max_marks: 100,
    is_active: true,
    exam: undefined,
    subject: undefined,
    classroom: null,
  });

  // Fetch real data from API - using SWR for instant cache display
  const { data: examsData, isLoading: isLoadingExams } = useExams({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { results: subjects, isLoading: isLoadingSubjects } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { results: classrooms, isLoading: isLoadingClassrooms } = useClassroomsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const exams = examsData?.results || [];

  useEffect(() => {
    if (schedule) {
      setFormData({
        date: schedule.date || '',
        start_time: schedule.start_time || '',
        end_time: schedule.end_time || '',
        max_marks: schedule.max_marks || 100,
        is_active: schedule.is_active ?? true,
        exam: schedule.exam,
        subject: schedule.subject,
        classroom: schedule.classroom,
      });
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ExamScheduleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = isLoadingExams || (isLoadingSubjects && subjects.length === 0) || (isLoadingClassrooms && classrooms.length === 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="exam">Exam *</Label>
        <Select
          value={formData.exam?.toString()}
          onValueChange={(value) => handleChange('exam', parseInt(value))}
          disabled={isLoadingExams}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingExams ? "Loading exams..." : "Select exam"} />
          </SelectTrigger>
          <SelectContent>
            {exams.length === 0 && !isLoadingExams && (
              <div className="p-2 text-sm text-muted-foreground">No exams available</div>
            )}
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id.toString()}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Select
          value={formData.subject?.toString()}
          onValueChange={(value) => handleChange('subject', parseInt(value))}
          disabled={isLoadingSubjects}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingSubjects ? "Loading subjects..." : "Select subject"} />
          </SelectTrigger>
          <SelectContent>
            {subjects.length === 0 && !isLoadingSubjects && (
              <div className="p-2 text-sm text-muted-foreground">No subjects available</div>
            )}
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name} ({subject.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Exam Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date || ''}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time *</Label>
          <Input
            id="start_time"
            type="time"
            value={formData.start_time || ''}
            onChange={(e) => handleChange('start_time', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time *</Label>
          <Input
            id="end_time"
            type="time"
            value={formData.end_time || ''}
            onChange={(e) => handleChange('end_time', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_marks">Maximum Marks *</Label>
        <Input
          id="max_marks"
          type="number"
          value={formData.max_marks || ''}
          onChange={(e) => handleChange('max_marks', parseInt(e.target.value))}
          required
          min="1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classroom">Classroom</Label>
        <Select
          value={formData.classroom?.toString() || ''}
          onValueChange={(value) => handleChange('classroom', value ? parseInt(value) : null)}
          disabled={isLoadingClassrooms}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingClassrooms ? "Loading classrooms..." : "Select classroom (optional)"} />
          </SelectTrigger>
          <SelectContent>
            {classrooms.length === 0 && !isLoadingClassrooms && (
              <div className="p-2 text-sm text-muted-foreground">No classrooms available</div>
            )}
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id.toString()}>
                {classroom.room_number} - {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {schedule ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
