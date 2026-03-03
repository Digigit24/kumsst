/**
 * Marks Register Form
 * Create/Edit marks registers
 */

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useExamsSWR, useSubjectsSWR, useAllSectionsSWR } from '../../../hooks/swr';

interface MarksRegisterFormData {
  max_marks: number;
  pass_marks: number;
  is_active: boolean;
  exam?: number;
  subject?: number;
  section?: number | null;
}

interface MarksRegisterFormProps {
  register?: any | null;
  onSubmit: (data: MarksRegisterFormData) => void;
  onCancel: () => void;
}

export const MarksRegisterForm = ({ register, onSubmit, onCancel }: MarksRegisterFormProps) => {
  const [formData, setFormData] = useState<MarksRegisterFormData>({
    max_marks: 100,
    pass_marks: 40,
    is_active: true,
    exam: undefined,
    subject: undefined,
    section: null,
  });

  // Fetch real data from API (SWR cached)
  const { data: examsData, isLoading: isLoadingExams } = useExamsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: sectionsData, isLoading: isLoadingSections } = useAllSectionsSWR();

  const exams = examsData?.results || [];
  const subjects = subjectsData?.results || [];
  const sections = sectionsData?.results || [];

  useEffect(() => {
    if (register) {
      setFormData({
        max_marks: register.max_marks || 100,
        pass_marks: register.pass_marks || 40,
        is_active: register.is_active ?? true,
        exam: register.exam,
        subject: register.subject,
        section: register.section,
      });
    }
  }, [register]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof MarksRegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = isLoadingExams || isLoadingSubjects || isLoadingSections;

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
        <Label htmlFor="section">Section</Label>
        <Select
          value={formData.section?.toString() || ''}
          onValueChange={(value) => handleChange('section', value ? parseInt(value) : null)}
          disabled={isLoadingSections}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingSections ? "Loading sections..." : "Select section (optional)"} />
          </SelectTrigger>
          <SelectContent>
            {sections.length === 0 && !isLoadingSections && (
              <div className="p-2 text-sm text-muted-foreground">No sections available</div>
            )}
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id.toString()}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="pass_marks">Passing Marks *</Label>
          <Input
            id="pass_marks"
            type="number"
            value={formData.pass_marks || ''}
            onChange={(e) => handleChange('pass_marks', parseInt(e.target.value))}
            required
            min="1"
          />
        </div>
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
          {register ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
