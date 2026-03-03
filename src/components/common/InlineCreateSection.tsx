/**
 * InlineCreateSection Component
 * Allows creating a new Section without leaving the current form
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sectionApi } from '@/services/academic.service';
import type { SectionCreateInput } from '@/types/academic.types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (sectionId: number) => void;
  classId: number;
  collegeId?: number;
}

export function InlineCreateSection({
  open,
  onOpenChange,
  onSuccess,
  classId,
  collegeId,
}: InlineCreateSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SectionCreateInput>({
    defaultValues: {
      class_obj: classId,
      max_students: 30,
      is_active: true,
    },
  });

  // Reset form with correct classId when it changes or modal opens
  useEffect(() => {
    if (open && classId) {
      reset({
        class_obj: classId,
        max_students: 30,
        is_active: true,
      });
    }
  }, [open, classId, reset]);

  const onSubmit = async (data: SectionCreateInput) => {
    try {
      setIsLoading(true);
      // Remove college from payload - backend gets it from x-college-id header
      const { college, ...payload } = data;
      const newSection = await sectionApi.create(payload as SectionCreateInput);
      toast.success('Section created successfully');
      reset();
      onSuccess(newSection.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create section error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create section');
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
      title="Create New Section"
      description="Add a new section to the selected class"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={isLoading}
      size="md"
    >
      <div className="grid gap-4">
        {/* Section Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Section Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', { required: 'Section name is required' })}
            placeholder="e.g., A, B, Morning, Evening"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Common names: A, B, C, Morning, Evening, Weekend
          </p>
        </div>

        {/* Max Students */}
        <div className="space-y-2">
          <Label htmlFor="max_students">Max Students</Label>
          <Input
            id="max_students"
            type="number"
            min="1"
            {...register('max_students', { valueAsNumber: true })}
            placeholder="30"
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of students allowed in this section
          </p>
        </div>
      </div>
    </InlineCreateModal>
  );
}
