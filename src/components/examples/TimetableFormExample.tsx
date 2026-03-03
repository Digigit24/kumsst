/**
 * Example: TimetableForm with Inline Dependency Creation
 * This demonstrates the inline creation pattern for academic forms
 *
 * Dependencies: Class → Section → Subject, Classroom, ClassTime
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelectWithCreate } from '@/components/ui/searchable-select-with-create';
import { InlineCreateClass } from '@/components/common/InlineCreateClass';
import { InlineCreateSection } from '@/components/common/InlineCreateSection';
import { InlineCreateSubject } from '@/components/common/InlineCreateSubject';
import { useClassesSWR, useAllSectionsSWR, useSubjectsSWR } from '@/hooks/swr';
import { timetableApi } from '@/services/academic.service';
import type { TimetableCreateInput } from '@/types/academic.types';

interface TimetableFormExampleProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  collegeId?: number;
}

export function TimetableFormExample({
  onSuccess,
  onCancel,
  collegeId = 1,
}: TimetableFormExampleProps) {
  // Form state
  const { register, handleSubmit, formState: { errors }, watch, setValue } =
    useForm<TimetableCreateInput>({
      defaultValues: {
        college: collegeId,
        is_active: true,
      },
    });

  // Inline creation modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data with SWR caching and refresh capabilities
  const { data: classesData, refresh: refetchClasses, isLoading: loadingClasses } =
    useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const { data: sectionsData, refresh: refetchSections, isLoading: loadingSections } =
    useAllSectionsSWR();

  const { data: subjectsData, refresh: refetchSubjects, isLoading: loadingSubjects } =
    useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const classes = classesData?.results || [];
  const allSections = sectionsData?.results || [];
  const subjects = subjectsData?.results || [];

  // Watch form values for dependency filtering
  const selectedClassId = watch('class_obj');

  // Filter sections based on selected class
  const filteredSections = selectedClassId
    ? allSections.filter(section => section.class_obj === selectedClassId)
    : [];

  // Clear dependent fields when parent changes
  useEffect(() => {
    if (selectedClassId) {
      setValue('section', null as any);
    }
  }, [selectedClassId, setValue]);

  // Inline creation success handlers
  const handleClassCreated = async (classId: number) => {
    await refetchClasses();
    setValue('class_obj', classId);
    setShowClassModal(false);
  };

  const handleSectionCreated = async (sectionId: number) => {
    await refetchSections();
    setValue('section', sectionId);
    setShowSectionModal(false);
  };

  const handleSubjectCreated = async (subjectId: number) => {
    await refetchSubjects();
    setValue('subject_assignment', subjectId);
    setShowSubjectModal(false);
  };

  // Form submission
  const onSubmit = async (data: TimetableCreateInput) => {
    try {
      setIsSubmitting(true);
      const result = await timetableApi.create(data);
      toast.success('Timetable entry created successfully');
      onSuccess?.(result);
    } catch (error: any) {
      console.error('Create timetable error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create timetable entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Class Selection with Inline Create */}
        <div className="space-y-2">
          <Label htmlFor="class_obj">
            Class <span className="text-destructive">*</span>
          </Label>
          <SearchableSelectWithCreate
            options={classes.map((cls) => ({
              value: cls.id,
              label: cls.name,
              subtitle: cls.program_name,
            }))}
            value={selectedClassId}
            onChange={(value) => setValue('class_obj', value as number)}
            onCreateNew={() => setShowClassModal(true)}
            placeholder="Select class"
            searchPlaceholder="Search classes..."
            emptyText="No classes found"
            emptyActionText="Create a class to continue"
            createButtonText="Create New Class"
            isLoading={loadingClasses}
          />
          {errors.class_obj && (
            <p className="text-sm text-destructive">Class is required</p>
          )}
        </div>

        {/* Section Selection with Inline Create */}
        <div className="space-y-2">
          <Label htmlFor="section">
            Section <span className="text-destructive">*</span>
          </Label>
          <SearchableSelectWithCreate
            options={filteredSections.map((section) => ({
              value: section.id,
              label: section.name,
              subtitle: section.class_name,
            }))}
            value={watch('section')}
            onChange={(value) => setValue('section', value as number)}
            onCreateNew={() => {
              if (!selectedClassId) {
                toast.error('Please select a class first');
                return;
              }
              setShowSectionModal(true);
            }}
            placeholder="Select section"
            searchPlaceholder="Search sections..."
            emptyText={selectedClassId ? "No sections found for this class" : "Select a class first"}
            emptyActionText="Create a section to continue"
            createButtonText="Create New Section"
            disabled={!selectedClassId}
            isLoading={loadingSections}
          />
          {errors.section && (
            <p className="text-sm text-destructive">Section is required</p>
          )}
        </div>

        {/* Subject Selection with Inline Create */}
        <div className="space-y-2">
          <Label htmlFor="subject_assignment">
            Subject <span className="text-destructive">*</span>
          </Label>
          <SearchableSelectWithCreate
            options={subjects.map((subject) => ({
              value: subject.id,
              label: `${subject.name} (${subject.code})`,
              subtitle: subject.subject_type,
            }))}
            value={watch('subject_assignment')}
            onChange={(value) => setValue('subject_assignment', value as number)}
            onCreateNew={() => setShowSubjectModal(true)}
            placeholder="Select subject"
            searchPlaceholder="Search subjects..."
            emptyText="No subjects found"
            emptyActionText="Create a subject to continue"
            createButtonText="Create New Subject"
            isLoading={loadingSubjects}
          />
          {errors.subject_assignment && (
            <p className="text-sm text-destructive">Subject is required</p>
          )}
        </div>

        {/* Other fields (Day, Time, etc.) */}
        <div className="space-y-2">
          <Label htmlFor="day_of_week">
            Day of Week <span className="text-destructive">*</span>
          </Label>
          <Input
            id="day_of_week"
            type="number"
            min="0"
            max="6"
            {...register('day_of_week', {
              required: 'Day is required',
              valueAsNumber: true,
            })}
            placeholder="0-6 (Monday=0, Sunday=6)"
          />
          {errors.day_of_week && (
            <p className="text-sm text-destructive">{errors.day_of_week.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Timetable Entry'}
          </Button>
        </div>
      </form>

      {/* Inline Creation Modals */}
      <InlineCreateClass
        open={showClassModal}
        onOpenChange={setShowClassModal}
        onSuccess={handleClassCreated}
        collegeId={collegeId}
      />

      <InlineCreateSection
        open={showSectionModal}
        onOpenChange={setShowSectionModal}
        onSuccess={handleSectionCreated}
        classId={selectedClassId || 0}
        collegeId={collegeId}
      />

      <InlineCreateSubject
        open={showSubjectModal}
        onOpenChange={setShowSubjectModal}
        onSuccess={handleSubjectCreated}
        collegeId={collegeId}
      />
    </div>
  );
}
