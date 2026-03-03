/**
 * InlineCreateProgram Component
 * Allows creating a new Program without leaving the current form
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacultiesSWR } from '@/hooks/useAcademicSWR';
import { programApi } from '@/services/academic.service';
import type { ProgramCreateInput } from '@/types/academic.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateProgramProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (programId: number) => void;
  collegeId?: number;
}

export function InlineCreateProgram({
  open,
  onOpenChange,
  onSuccess,
  collegeId,
}: InlineCreateProgramProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ProgramCreateInput>({
    defaultValues: {
      program_type: 'UG',
      duration: 4,
      duration_type: 'Year',
      display_order: 0,
      is_active: true,
    },
  });

  const { results: faculties = [] } = useFacultiesSWR({ is_active: true, page_size: DROPDOWN_PAGE_SIZE });

  const selectedFaculty = watch('faculty');
  const selectedProgramType = watch('program_type');
  const selectedDurationType = watch('duration_type');

  const onSubmit = async (data: ProgramCreateInput) => {
    try {
      setIsLoading(true);
      // Remove college from payload - backend gets it from x-college-id header
      const { college, ...payload } = data;
      const newProgram = await programApi.create(payload as ProgramCreateInput);
      toast.success('Program created successfully');
      reset();
      onSuccess(newProgram.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create program error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create program');
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
      title="Create New Program"
      description="Add a new academic program to the system"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={isLoading}
      size="lg"
    >
      <div className="grid gap-4">
        {/* Faculty */}
        <div className="space-y-2">
          <Label htmlFor="faculty">
            Faculty <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedFaculty?.toString()}
            onValueChange={(value) => setValue('faculty', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              {faculties?.map((faculty) => (
                <SelectItem key={faculty.id} value={faculty.id.toString()}>
                  {faculty.name} ({faculty.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.faculty && (
            <p className="text-sm text-destructive">{errors.faculty.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Program Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              {...register('code', { required: 'Program code is required' })}
              placeholder="e.g., BSC-CS"
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
              placeholder="e.g., BSc CS"
            />
            {errors.short_name && (
              <p className="text-sm text-destructive">{errors.short_name.message}</p>
            )}
          </div>
        </div>

        {/* Program Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Program Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', { required: 'Program name is required' })}
            placeholder="e.g., Bachelor of Science in Computer Science"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Program Type */}
          <div className="space-y-2">
            <Label htmlFor="program_type">
              Program Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedProgramType}
              onValueChange={(value) => setValue('program_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                <SelectItem value="Diploma">Diploma</SelectItem>
                <SelectItem value="Certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>
            {errors.program_type && (
              <p className="text-sm text-destructive">{errors.program_type.message}</p>
            )}
          </div>

          {/* Duration Type */}
          <div className="space-y-2">
            <Label htmlFor="duration_type">
              Duration Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedDurationType}
              onValueChange={(value) => setValue('duration_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Year">Year</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Semester">Semester</SelectItem>
              </SelectContent>
            </Select>
            {errors.duration_type && (
              <p className="text-sm text-destructive">
                {errors.duration_type.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">
              Duration <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              {...register('duration', {
                required: 'Duration is required',
                valueAsNumber: true,
              })}
              placeholder="4"
            />
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          {/* Total Credits */}
          <div className="space-y-2">
            <Label htmlFor="total_credits">Total Credits</Label>
            <Input
              id="total_credits"
              type="number"
              min="0"
              {...register('total_credits', { valueAsNumber: true })}
              placeholder="120"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register('description')}
            placeholder="Brief description of the program"
          />
        </div>
      </div>
    </InlineCreateModal>
  );
}
