/**
 * Exam Form
 * Create/Edit exams
 */

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { useClassesSWR } from '../../../hooks/useAcademicSWR';
import { useAuth } from '../../../hooks/useAuth';
import { useAcademicSessionsSWR } from '../../../hooks/useCoreSWR';
import { useExamTypes } from '../../../hooks/useExamination';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Exam, ExamCreateInput } from '../../../types/examination.types';
import { getCurrentUserCollege } from '../../../utils/auth.utils';

interface ExamFormProps {
  exam?: Exam | null;
  onSubmit: (data: Partial<Exam>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ExamForm = ({ exam, onSubmit, onCancel, isSubmitting = false }: ExamFormProps) => {
  const { data: examTypesData, isLoading: examTypesLoading } = useExamTypes({ page_size: DROPDOWN_PAGE_SIZE });
  const { results: classes = [], isLoading: classesLoading } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { results: academicSessions = [], isLoading: academicSessionsLoading } = useAcademicSessionsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { user } = useAuth();

  const examTypes = examTypesData?.results || [];
  const defaultCollege = getCurrentUserCollege(user as any) || undefined;

  const [formData, setFormData] = useState<Partial<ExamCreateInput>>({
    name: '',
    code: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
    is_published: false,
    is_active: true,
    exam_type: undefined,
    class_obj: undefined,
    academic_session: undefined,
    college: defaultCollege, // Default to current user's college
  });

  useEffect(() => {
    if (exam) {
      setFormData(exam);
    } else if (defaultCollege) {
      setFormData((prev) => ({ ...prev, college: defaultCollege }));
    }
  }, [exam, defaultCollege]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ExamCreateInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Exam Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Mid-Term Exam 2025"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Exam Code *</Label>
          <Input
            id="code"
            value={formData.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="e.g., MTE2025"
            required
          />
        </div>
      </div>



      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exam_type">Exam Type *</Label>
          {examTypesLoading ? (
            <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <Select
              value={formData.exam_type?.toString()}
              onValueChange={(value) => handleChange('exam_type', parseInt(value))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="academic_session">Academic Session *</Label>
          {academicSessionsLoading ? (
            <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <Select
              value={formData.academic_session?.toString()}
              onValueChange={(value) => handleChange('academic_session', parseInt(value))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {academicSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="class_obj">Class *</Label>
        {classesLoading ? (
          <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <Select
            value={formData.class_obj?.toString()}
            onValueChange={(value) => handleChange('class_obj', parseInt(value))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Exam Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Exam End Date *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registration_start">Registration Start *</Label>
          <Input
            id="registration_start"
            type="date"
            value={formData.registration_start || ''}
            onChange={(e) => handleChange('registration_start', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration_end">Registration End *</Label>
          <Input
            id="registration_end"
            type="date"
            value={formData.registration_end || ''}
            onChange={(e) => handleChange('registration_end', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_published"
          checked={formData.is_published || false}
          onCheckedChange={(checked) => handleChange('is_published', checked)}
        />
        <Label htmlFor="is_published">Published</Label>
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {exam ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
