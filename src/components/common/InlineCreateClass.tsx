/**
 * InlineCreateClass Component
 * Allows creating a new Class without leaving the current form
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
import { useProgramsSWR } from '@/hooks/useAcademicSWR';
import { useAcademicSessionsSWR } from '@/hooks/useCoreSWR';
import { classApi } from '@/services/academic.service';
import type { ClassCreateInput } from '@/types/academic.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateClassProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (classId: number) => void;
  programId?: number;
  collegeId?: number;
}

export function InlineCreateClass({
  open,
  onOpenChange,
  onSuccess,
  programId,
  collegeId,
}: InlineCreateClassProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ClassCreateInput>({
    defaultValues: {
      program: programId || undefined,
      semester: 1,
      year: 1,
      max_students: 60,
      is_active: true,
    },
  });

  const { results: programs = [] } = useProgramsSWR({
    is_active: true,
    page_size: DROPDOWN_PAGE_SIZE,
    college: collegeId
  });
  const { results: academicSessions = [] } = useAcademicSessionsSWR({
    is_active: true,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const selectedProgram = watch('program');
  const selectedSession = watch('academic_session');

  const onSubmit = async (data: ClassCreateInput) => {
    try {
      setIsLoading(true);
      // Remove college from payload - backend gets it from x-college-id header
      const { college, ...payload } = data;
      const newClass = await classApi.create(payload as ClassCreateInput);
      toast.success('Class created successfully');
      reset();
      onSuccess(newClass.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create class error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create class');
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
      title="Create New Class"
      description="Add a new class to the system"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={isLoading}
      size="lg"
    >
      <div className="grid gap-4">
        {/* Program */}
        <div className="space-y-2">
          <Label htmlFor="program">
            Program <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedProgram?.toString()}
            onValueChange={(value) => setValue('program', parseInt(value))}
            disabled={!!programId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs?.map((program) => (
                <SelectItem key={program.id} value={program.id.toString()}>
                  {program.name} ({program.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.program && (
            <p className="text-sm text-destructive">{errors.program.message}</p>
          )}
        </div>

        {/* Academic Session */}
        <div className="space-y-2">
          <Label htmlFor="academic_session">
            Academic Session <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedSession?.toString()}
            onValueChange={(value) => setValue('academic_session', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select academic session" />
            </SelectTrigger>
            <SelectContent>
              {academicSessions.map((session) => (
                <SelectItem key={session.id} value={session.id.toString()}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.academic_session && (
            <p className="text-sm text-destructive">
              {errors.academic_session.message}
            </p>
          )}
        </div>

        {/* Class Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Class Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', { required: 'Class name is required' })}
            placeholder="e.g., BSc CS 2024 - Semester 1"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Semester */}
          <div className="space-y-2">
            <Label htmlFor="semester">
              Semester <span className="text-destructive">*</span>
            </Label>
            <Input
              id="semester"
              type="number"
              min="1"
              max="12"
              {...register('semester', {
                required: 'Semester is required',
                valueAsNumber: true,
              })}
              placeholder="1"
            />
            {errors.semester && (
              <p className="text-sm text-destructive">{errors.semester.message}</p>
            )}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">
              Year <span className="text-destructive">*</span>
            </Label>
            <Input
              id="year"
              type="number"
              min="1"
              max="6"
              {...register('year', {
                required: 'Year is required',
                valueAsNumber: true,
              })}
              placeholder="1"
            />
            {errors.year && (
              <p className="text-sm text-destructive">{errors.year.message}</p>
            )}
          </div>
        </div>

        {/* Max Students */}
        <div className="space-y-2">
          <Label htmlFor="max_students">Max Students</Label>
          <Input
            id="max_students"
            type="number"
            min="1"
            {...register('max_students', { valueAsNumber: true })}
            placeholder="60"
          />
        </div>
      </div>
    </InlineCreateModal>
  );
}
