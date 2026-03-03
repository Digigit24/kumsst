import { InlineCreateClass } from '@/components/common/InlineCreateClass';
import { InlineCreateSection } from '@/components/common/InlineCreateSection';
import { InlineCreateSubject } from '@/components/common/InlineCreateSubject';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelectWithCreate } from '@/components/ui/searchable-select-with-create';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useClassesSWR, useSectionsFilteredByClass, useSubjectsSWR } from '@/hooks/useAcademicSWR';
import { teachersApi } from '@/services/teachers.service';
import { AssignmentCreateInput } from '@/types/academic.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const assignmentSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    subject: z.number().min(1, 'Subject is required'),
    class_obj: z.number().min(1, 'Class is required'),
    section: z.number().nullable().optional(),
    due_date: z.string().min(1, 'Due date is required'),
    max_marks: z.coerce.number().min(1, 'Max marks must be at least 1'),
    allow_late_submission: z.boolean().default(false),
    late_submission_penalty: z.coerce.number().default(0),
    is_active: z.boolean().default(true),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface TeacherAssignmentFormProps {
    mode: 'create' | 'edit';
    assignmentId?: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const TeacherAssignmentForm: React.FC<TeacherAssignmentFormProps> = ({
    mode,
    assignmentId,
    onSuccess,
    onCancel,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // Inline create states
    const [showCreateClass, setShowCreateClass] = useState(false);
    const [showCreateSection, setShowCreateSection] = useState(false);
    const [showCreateSubject, setShowCreateSubject] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        reset,
        setValue
    } = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            title: '',
            description: '',
            subject: 0,
            class_obj: 0,
            section: null,
            max_marks: 100,
            allow_late_submission: false,
            late_submission_penalty: 0,
            is_active: true,
            due_date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const currentClassId = watch('class_obj');

    // Hooks for data
    const { results: classes = [], refresh: refetchClasses } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    // Prefetch all sections once, filter client-side by class — instant switching
    const { results: sections = [], refresh: refetchSections } = useSectionsFilteredByClass(
        currentClassId || undefined
    );
    const { results: subjects = [], refresh: refetchSubjects } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    useEffect(() => {
        // Reset section if class changes and current section is not in new class
        if (currentClassId) {
            // We don't necessarily want to force clear section every time class changes if we are in edit mode initial load
            // But for manual change it is good.
            // If we wanted to be smarter, we could check if current section is valid for new class.
            // For now, simpler is better, but maybe only if section is already set?
            // Actually, the useSections hook will update `sectionsData`, so let's check validation.
            // Or typically, simple behavior: clear section on class change.
        }
    }, [currentClassId]);

    // State for default labels in edit mode (in case they are not in the paginated list)
    const [presets, setPresets] = useState<{
        class?: { id: number; label: string; subtitle?: string };
        section?: { id: number; label: string; subtitle?: string };
        subject?: { id: number; label: string; subtitle?: string };
    }>({});

    // ... (hooks)

    useEffect(() => {
        const fetchAssignment = async () => {
            if (mode === 'edit' && assignmentId) {
                try {
                    setIsFetching(true);
                    const data = await teachersApi.getAssignment(assignmentId);

                    // Set presets for dropdowns
                    setPresets({
                        class: data.class_obj && data.class_name ? {
                            id: data.class_obj,
                            label: data.class_name
                        } : undefined,
                        section: data.section && data.section_name ? {
                            id: data.section,
                            label: data.section_name
                        } : undefined,
                        subject: data.subject && data.subject_name ? {
                            id: data.subject,
                            label: data.subject_name, // You might want to format this like `${name} (${code})` if possible, but name is safe fallback
                        } : undefined
                    });

                    // Formatting due date to yyyy-MM-dd for input type="date"
                    const formattedDate = data.due_date ? format(new Date(data.due_date), 'yyyy-MM-dd') : '';
                    reset({
                        title: data.title,
                        description: data.description,
                        subject: data.subject,
                        class_obj: data.class_obj,
                        section: data.section || null,
                        max_marks: data.max_marks,
                        allow_late_submission: data.allow_late_submission,
                        late_submission_penalty: data.late_submission_penalty,
                        is_active: data.is_active,
                        due_date: formattedDate,
                    });
                } catch (error) {
                    toast.error('Failed to load assignment details');
                    onCancel();
                } finally {
                    setIsFetching(false);
                }
            }
        };

        fetchAssignment();
    }, [mode, assignmentId, reset, onCancel]);

    // Helper to merge presets with data options
    const getClassOptions = () => {
        const options = classes.map(c => ({
            label: c.name,
            value: c.id,
            subtitle: `${c.program_name} • Sem ${c.semester}`
        })) || [];

        if (presets.class && !options.find(o => o.value === presets.class!.id)) {
            return [{ value: presets.class.id, label: presets.class.label, subtitle: presets.class.subtitle }, ...options];
        }
        return options;
    };

    const getSectionOptions = () => {
        const options = sections.map(s => ({
            label: s.name,
            value: s.id,
            subtitle: `Max ${s.max_students} students`
        })) || [];

        if (presets.section && !options.find(o => o.value === presets.section!.id)) {
            return [{ value: presets.section.id, label: presets.section.label, subtitle: presets.section.subtitle }, ...options];
        }
        return options;
    };

    const getSubjectOptions = () => {
        const options = subjects.map(s => ({
            label: `${s.name} (${s.code})`,
            value: s.id,
            subtitle: `Credits: ${s.credits}`
        })) || [];

        if (presets.subject && !options.find(o => o.value === presets.subject!.id)) {
            // For subject, we might only have name from 'presets', so we display what we have
            return [{ value: presets.subject.id, label: presets.subject.label, subtitle: presets.subject.subtitle }, ...options];
        }
        return options;
    };

    const onSubmit = async (values: AssignmentFormValues) => {
        try {
            setIsLoading(true);
            const payload: AssignmentCreateInput = {
                ...values,
                due_date: values.due_date,
                assignment_file: null,
                teacher: 0,
            };

            if (mode === 'create') {
                await teachersApi.createAssignment(payload);
                toast.success('Assignment created successfully');
            } else if (assignmentId) {
                await teachersApi.updateAssignment(assignmentId, payload);
                toast.success('Assignment updated successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to save assignment');
        } finally {
            setIsLoading(false);
        }
    };

    // Callback handlers for inline creation
    const handleClassCreated = (newClassId: number) => {
        refetchClasses().then(() => {
            setValue('class_obj', newClassId);
            setValue('section', null); // clear section
        });
    };

    const handleSectionCreated = (newSectionId: number) => {
        refetchSections().then(() => {
            setValue('section', newSectionId);
        });
    };

    const handleSubjectCreated = (newSubjectId: number) => {
        refetchSubjects().then(() => {
            setValue('subject', newSubjectId);
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-1">
                {/* ... (Title input) ... */}
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    {isFetching ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Input
                            id="title"
                            placeholder="Assignment Title"
                            {...register('title')}
                        />
                    )}
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Controller
                            name="class_obj"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelectWithCreate
                                    options={getClassOptions()}
                                    value={field.value}
                                    onChange={(val) => {
                                        field.onChange(Number(val));
                                        setValue('section', null);
                                    }}
                                    onCreateNew={() => setShowCreateClass(true)}
                                    placeholder="Select Class"
                                    createButtonText="Create New Class"
                                    isLoading={classes.length === 0}
                                />
                            )}
                        />
                        {errors.class_obj && <p className="text-sm text-destructive">{errors.class_obj.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Section (Optional)</Label>
                        <Controller
                            name="section"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelectWithCreate
                                    options={getSectionOptions()}
                                    value={field.value || ''}
                                    onChange={(val) => field.onChange(val ? Number(val) : null)}
                                    onCreateNew={() => setShowCreateSection(true)}
                                    placeholder="Select Section"
                                    createButtonText="Create New Section"
                                    disabled={!currentClassId}
                                    isLoading={currentClassId ? sections.length === 0 : false}
                                    emptyText={!currentClassId ? "Select a class first" : "No sections found"}
                                    emptyActionText={!currentClassId ? "" : "Create one to continue"}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Subject</Label>
                    <Controller
                        name="subject"
                        control={control}
                        render={({ field }) => (
                            <SearchableSelectWithCreate
                                options={getSubjectOptions()}
                                value={field.value}
                                onChange={(val) => field.onChange(Number(val))}
                                onCreateNew={() => setShowCreateSubject(true)}
                                placeholder="Select Subject"
                                createButtonText="Create New Subject"
                                isLoading={subjects.length === 0}
                            />
                        )}
                    />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                    {isFetching ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <Textarea
                            id="description"
                            placeholder="Detailed description of the assignment..."
                            rows={4}
                            {...register('description')}
                        />
                    )}
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            type="date"
                            {...register('due_date')}
                        />
                        {errors.due_date && <p className="text-sm text-destructive">{errors.due_date.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max_marks">Max Marks</Label>
                        <Input
                            id="max_marks"
                            type="number"
                            {...register('max_marks')}
                        />
                        {errors.max_marks && <p className="text-sm text-destructive">{errors.max_marks.message}</p>}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <Controller
                            name="allow_late_submission"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="allow_late_submission"
                                />
                            )}
                        />
                        <Label htmlFor="allow_late_submission" className="cursor-pointer">
                            Allow Late Submission
                        </Label>
                    </div>

                    <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="is_active"
                                />
                            )}
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                            Is Active
                        </Label>
                    </div>
                </div>

                {watch('allow_late_submission') && (
                    <div className="space-y-2">
                        <Label htmlFor="late_submission_penalty">Late Submission Penalty (Marks)</Label>
                        <Input
                            id="late_submission_penalty"
                            type="number"
                            {...register('late_submission_penalty')}
                        />
                        {errors.late_submission_penalty && <p className="text-sm text-destructive">{errors.late_submission_penalty.message}</p>}
                    </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Assignment' : 'Update Assignment'}
                    </Button>
                </div>
            </form>

            {/* Inline Creation Modals */}
            <InlineCreateClass
                open={showCreateClass}
                onOpenChange={setShowCreateClass}
                onSuccess={handleClassCreated}
            />

            {currentClassId && (
                <InlineCreateSection
                    open={showCreateSection}
                    onOpenChange={setShowCreateSection}
                    onSuccess={handleSectionCreated}
                    classId={currentClassId}
                />
            )}

            <InlineCreateSubject
                open={showCreateSubject}
                onOpenChange={setShowCreateSubject}
                onSuccess={handleSubjectCreated}
            />
        </>
    );
};
