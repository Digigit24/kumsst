/**
 * InlineCreateSubject Component
 * Allows creating a new Subject without leaving the current form
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { subjectApi } from '@/services/academic.service';
import type { SubjectCreateInput } from '@/types/academic.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateSubjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (subjectId: number) => void;
  collegeId?: number;
}

export function InlineCreateSubject({
  open,
  onOpenChange,
  onSuccess,
  collegeId,
}: InlineCreateSubjectProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<SubjectCreateInput>({
    defaultValues: {
      subject_type: 'Theory',
      credits: 3,
      theory_hours: 3,
      practical_hours: 0,
      max_marks: 100,
      pass_marks: 40,
      is_active: true,
    },
  });

  const selectedSubjectType = watch('subject_type');

  const onSubmit = async (data: SubjectCreateInput) => {
    try {
      setIsLoading(true);
      // Remove college from payload - backend gets it from x-college-id header
      const { college, ...payload } = data;
      const newSubject = await subjectApi.create(payload as SubjectCreateInput);
      toast.success('Subject created successfully');
      reset();
      onSuccess(newSubject.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create subject error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create subject');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <InlineCreateModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Subject"
      description="Add a new subject to the system"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={isLoading}
      size="lg"
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Subject Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              {...register('code', { required: 'Subject code is required' })}
              placeholder="e.g., CS101"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Short Name */}
          <div className="space-y-2">
            <Label htmlFor="short_name">
              Short Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="short_name"
              {...register('short_name', { required: 'Short name is required' })}
              placeholder="e.g., DS"
            />
            {errors.short_name && (
              <p className="text-sm text-destructive">{errors.short_name.message}</p>
            )}
          </div>
        </div>

        {/* Subject Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Subject Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', { required: 'Subject name is required' })}
            placeholder="e.g., Data Structures"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Subject Type */}
          <div className="space-y-2">
            <Label htmlFor="subject_type">
              Subject Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedSubjectType}
              onValueChange={(value) => setValue('subject_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Theory">Theory</SelectItem>
                <SelectItem value="Practical">Practical</SelectItem>
                <SelectItem value="Both">Theory + Practical</SelectItem>
              </SelectContent>
            </Select>
            {errors.subject_type && (
              <p className="text-sm text-destructive">{errors.subject_type.message}</p>
            )}
          </div>

          {/* Credits */}
          <div className="space-y-2">
            <Label htmlFor="credits">
              Credits <span className="text-destructive">*</span>
            </Label>
            <Input
              id="credits"
              type="number"
              min="1"
              {...register('credits', {
                required: 'Credits are required',
                valueAsNumber: true,
              })}
              placeholder="3"
            />
            {errors.credits && (
              <p className="text-sm text-destructive">{errors.credits.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Theory Hours */}
          <div className="space-y-2">
            <Label htmlFor="theory_hours">Theory Hours</Label>
            <Input
              id="theory_hours"
              type="number"
              min="0"
              {...register('theory_hours', { valueAsNumber: true })}
              placeholder="3"
            />
          </div>

          {/* Practical Hours */}
          <div className="space-y-2">
            <Label htmlFor="practical_hours">Practical Hours</Label>
            <Input
              id="practical_hours"
              type="number"
              min="0"
              {...register('practical_hours', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Max Marks */}
          <div className="space-y-2">
            <Label htmlFor="max_marks">
              Max Marks <span className="text-destructive">*</span>
            </Label>
            <Input
              id="max_marks"
              type="number"
              min="1"
              {...register('max_marks', {
                required: 'Max marks are required',
                valueAsNumber: true,
              })}
              placeholder="100"
            />
            {errors.max_marks && (
              <p className="text-sm text-destructive">{errors.max_marks.message}</p>
            )}
          </div>

          {/* Pass Marks */}
          <div className="space-y-2">
            <Label htmlFor="pass_marks">
              Pass Marks <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pass_marks"
              type="number"
              min="1"
              {...register('pass_marks', {
                required: 'Pass marks are required',
                valueAsNumber: true,
              })}
              placeholder="40"
            />
            {errors.pass_marks && (
              <p className="text-sm text-destructive">{errors.pass_marks.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the subject"
            rows={2}
          />
        </div>
      </div>
    </InlineCreateModal>
  );
}
