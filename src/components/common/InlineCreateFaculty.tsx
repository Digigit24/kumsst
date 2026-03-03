/**
 * InlineCreateFaculty Component
 * Allows creating a new Faculty (Department) without leaving the current form
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { facultyApi } from '@/services/academic.service';
import type { FacultyCreateInput } from '@/types/academic.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateFacultyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (facultyId: number) => void;
  collegeId?: number;
}

export function InlineCreateFaculty({
  open,
  onOpenChange,
  onSuccess,
  collegeId,
}: InlineCreateFacultyProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FacultyCreateInput>({
    defaultValues: {
      display_order: 0,
      is_active: true,
    },
  });

  const onSubmit = async (data: FacultyCreateInput) => {
    try {
      setIsLoading(true);
      // Remove college from payload - backend gets it from x-college-id header
      const { college, ...payload } = data;
      const newFaculty = await facultyApi.create(payload as FacultyCreateInput);
      toast.success('Faculty created successfully');
      reset();
      onSuccess(newFaculty.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create faculty error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create faculty');
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
      title="Create New Faculty"
      description="Add a new faculty/department to the system"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={isLoading}
      size="lg"
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Faculty Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              {...register('code', { required: 'Faculty code is required' })}
              placeholder="e.g., ENG"
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
              placeholder="e.g., Engineering"
            />
            {errors.short_name && (
              <p className="text-sm text-destructive">{errors.short_name.message}</p>
            )}
          </div>
        </div>

        {/* Faculty Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Faculty Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', { required: 'Faculty name is required' })}
            placeholder="e.g., Faculty of Engineering"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the faculty"
            rows={3}
          />
        </div>
      </div>
    </InlineCreateModal>
  );
}
