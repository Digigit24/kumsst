/**
 * Assignment Form Component
 * Reusable form for creating and editing assignments
 */

import { useState, useEffect } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Loader2 } from 'lucide-react';
import type { Assignment, AssignmentCreateInput } from '@/types/assignments.types';
import { useClassesSWR, useSectionsFilteredByClass, useSubjectsSWR } from '@/hooks/useAcademicSWR';
import { useAuth } from '@/hooks/useAuth';

interface AssignmentFormProps {
  assignment?: Assignment | null;
  onSubmit: (data: AssignmentCreateInput | FormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  assignment,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AssignmentCreateInput>({
    title: '',
    description: '',
    subject: 0,
    class_obj: 0,
    section: null,
    due_date: '',
    max_marks: 100,
    assignment_file: null,
    allow_late_submission: false,
    late_submission_penalty: 0,
    is_active: true,
  });

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Fetch dependencies
  const { results: subjects = [] } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { results: classes = [] } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  // Prefetch all sections once, filter client-side by class — instant switching
  const { results: sections = [] } = useSectionsFilteredByClass(formData.class_obj || undefined);

  // Populate form if editing
  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        class_obj: assignment.class_obj,
        section: assignment.section || null,
        due_date: assignment.due_date.split('T')[0], // Format date for input
        max_marks: assignment.max_marks,
        allow_late_submission: assignment.allow_late_submission || false,
        late_submission_penalty: assignment.late_submission_penalty || 0,
        is_active: assignment.is_active,
      });
    }
  }, [assignment]);

  const handleChange = (field: keyof AssignmentCreateInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      return;
    }

    // If there's a file attachment, use FormData
    if (attachmentFile) {
      const formDataWithFile = new FormData();
      formDataWithFile.append('teacher', String(user.id));
      formDataWithFile.append('title', formData.title);
      formDataWithFile.append('description', formData.description);
      formDataWithFile.append('subject', String(formData.subject));
      formDataWithFile.append('class_obj', String(formData.class_obj));
      if (formData.section) {
        formDataWithFile.append('section', String(formData.section));
      }
      formDataWithFile.append('due_date', formData.due_date);
      formDataWithFile.append('max_marks', String(formData.max_marks));
      formDataWithFile.append('allow_late_submission', String(formData.allow_late_submission));
      formDataWithFile.append('late_submission_penalty', String(formData.late_submission_penalty));
      formDataWithFile.append('is_active', String(formData.is_active));
      formDataWithFile.append('assignment_file', attachmentFile);

      onSubmit(formDataWithFile);
    } else {
      // No file, use JSON
      const payload = {
        ...formData,
        teacher: user.id as any,
      };
      onSubmit(payload as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter assignment title"
          required
        />
      </div>

      {/* Subject and Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Select
            value={String(formData.subject || '')}
            onValueChange={(value) => handleChange('subject', Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={String(subject.id)}>
                  {subject.name} ({subject.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class_obj">Class *</Label>
          <Select
            value={String(formData.class_obj || '')}
            onValueChange={(value) => {
              handleChange('class_obj', Number(value));
              handleChange('section', null); // Reset section when class changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={String(cls.id)}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section */}
      <div className="space-y-2">
        <Label htmlFor="section">Section (Optional)</Label>
        <Select
          value={formData.section ? String(formData.section) : undefined}
          onValueChange={(value) => handleChange('section', value ? Number(value) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All sections (no specific section)" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.id} value={String(section.id)}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description & Instructions *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter assignment description and instructions for students"
          rows={6}
          required
        />
      </div>

      {/* Due Date and Max Marks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_marks">Maximum Marks *</Label>
          <Input
            id="max_marks"
            type="number"
            value={formData.max_marks}
            onChange={(e) => handleChange('max_marks', Number(e.target.value))}
            placeholder="100"
            min="1"
            required
          />
        </div>
      </div>

      {/* Late Submission Settings */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allow_late_submission"
            checked={formData.allow_late_submission}
            onChange={(e) => handleChange('allow_late_submission', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="allow_late_submission" className="cursor-pointer">
            Allow late submissions
          </Label>
        </div>

        {formData.allow_late_submission && (
          <div className="space-y-2">
            <Label htmlFor="late_submission_penalty">Late Submission Penalty (%)</Label>
            <Input
              id="late_submission_penalty"
              type="number"
              value={formData.late_submission_penalty}
              onChange={(e) => handleChange('late_submission_penalty', Number(e.target.value))}
              placeholder="0"
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground">
              Percentage of marks to deduct for late submissions
            </p>
          </div>
        )}
      </div>

      {/* Assignment File */}
      <div className="space-y-2">
        <Label htmlFor="assignment_file">Assignment File (Optional)</Label>
        <div className="border-2 border-dashed border-input rounded-lg p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {attachmentFile
                ? `Selected: ${attachmentFile.name}`
                : 'Upload assignment files, documents, or resources'}
            </p>
            <Input
              id="assignment_file"
              type="file"
              onChange={handleFileChange}
              className="max-w-xs"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Accepted formats: PDF, DOC, DOCX, TXT, PNG, JPG (Max 10MB)
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {assignment ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            assignment ? 'Update Assignment' : 'Create Assignment'
          )}
        </Button>
      </div>
    </form>
  );
};
