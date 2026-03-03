/**
 * InlineCreateAcademicYear Component
 * Allows creating a new Academic Year without leaving the current form
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { academicYearApi } from '@/services/core.service';
import type { AcademicYearCreateInput } from '@/types/core.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateAcademicYearProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (yearId: number) => void;
  collegeId?: number;
}

export function InlineCreateAcademicYear({
  open,
  onOpenChange,
  onSuccess,
  collegeId,
}: InlineCreateAcademicYearProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } =
    useForm<AcademicYearCreateInput>({
      defaultValues: {
        college: collegeId || 1,
        is_current: false,
        is_active: true,
      },
    });

  const isCurrent = watch('is_current');

  const onSubmit = async (data: AcademicYearCreateInput) => {
    try {
      setIsLoading(true);
      // Remove college from payload - backend gets it from x-college-id header
      const { college, ...payload } = data;
      const newYear = await academicYearApi.create(payload as AcademicYearCreateInput);
      toast.success('Academic year created successfully');
      reset();
      onSuccess(newYear.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create academic year error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create academic year');
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
      title="Create New Academic Year"
      description="Add a new academic year to the system"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={isLoading}
      size="md"
    >
      <div className="grid gap-4">
        {/* Year Name */}
        <div className="space-y-2">
          <Label htmlFor="year">
            Year <span className="text-destructive">*</span>
          </Label>
          <Input
            id="year"
            {...register('year', { required: 'Year is required' })}
            placeholder="e.g., 2024-2025"
          />
          {errors.year && (
            <p className="text-sm text-destructive">{errors.year.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Format: YYYY-YYYY (e.g., 2024-2025)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date', { required: 'Start date is required' })}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">{errors.start_date.message}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end_date">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              {...register('end_date', { required: 'End date is required' })}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        {/* Is Current Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="is_current" className="text-base">
              Current Academic Year
            </Label>
            <p className="text-xs text-muted-foreground">
              Mark this as the currently active academic year
            </p>
          </div>
          <Switch
            id="is_current"
            checked={isCurrent}
            onCheckedChange={(checked) => setValue('is_current', checked)}
          />
        </div>
      </div>
    </InlineCreateModal>
  );
}
