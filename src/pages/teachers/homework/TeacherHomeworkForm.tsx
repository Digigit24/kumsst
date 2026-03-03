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
import { useAuth } from '@/hooks/useAuth';
import { useTeachersSWR } from '@/hooks/useTeachersSWR';
import { teachersApi } from '@/services/teachers.service';
import { HomeworkCreateInput } from '@/types/academic.types';
import { isSuperAdmin } from '@/utils/auth.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import useSWR from 'swr';
import { z } from 'zod';

const homeworkSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    subject: z.number().min(1, 'Subject is required'),
    class_obj: z.number().min(1, 'Class is required'),
    section: z.number().nullable().optional(),
    due_date: z.string().min(1, 'Due date is required'),
    is_active: z.boolean().default(true),
    teacher: z.number().optional(),
});

type HomeworkFormValues = z.infer<typeof homeworkSchema>;

interface TeacherHomeworkFormProps {
    mode: 'create' | 'edit';
    homeworkId?: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const TeacherHomeworkForm: React.FC<TeacherHomeworkFormProps> = ({
    mode,
    homeworkId,
    onSuccess,
    onCancel,
}) => {
    const { user } = useAuth();
    const isAdmin = isSuperAdmin(user as any) || user?.user_type === 'college_admin';
    const [isLoading, setIsLoading] = useState(false);


    // Resolve teacher ID using SWR for caching and ensuring valid ID
    const { data: resolvedTeacherId } = useSWR(
        user?.id ? ['resolve-teacher-id', user.id] : null,
        async () => {
            try {
                const response = await teachersApi.list({ user: user?.id });
                if (response.results && response.results.length > 0) {
                    console.log('Resolved Teacher ID from API:', response.results[0].id);
                    return response.results[0].id;
                }
            } catch (e) {
                console.warn('Teacher ID resolution failed', e);
            }
            // Fallback to session ID if API yields nothing (legacy behavior)
            if (user?.teacher_id) {
                return user.teacher_id;
            }
            return null;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60 * 60 * 1000, // 1 hour cache
            shouldRetryOnError: false,
        }
    );

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
    } = useForm<HomeworkFormValues>({
        resolver: zodResolver(homeworkSchema),
        defaultValues: {
            title: '',
            description: '',
            subject: 0,
            class_obj: 0,
            section: null,
            is_active: true,
            due_date: format(new Date(), 'yyyy-MM-dd'),
            teacher: undefined,
        },
    });

    const currentClassId = watch('class_obj');

    // Hooks for data - using SWR for instant cache display
    const { results: classesResults, refresh: refreshClasses } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    // Prefetch all sections once, filter client-side by class — instant switching
    const { results: sectionsResults, refresh: refreshSections } = useSectionsFilteredByClass(
        currentClassId || undefined
    );
    const { results: subjectsResults, refresh: refreshSubjects } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    // Fetch teachers if admin
    const { results: teachersResults } = useTeachersSWR(
        isAdmin ? { is_active: true, page_size: DROPDOWN_PAGE_SIZE } : null,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            dedupingInterval: 60 * 60 * 1000, // 1 hour cache
        }
    );

    // State for default labels in edit mode (in case they are not in the paginated list)
    const [presets, setPresets] = useState<{
        class?: { id: number; label: string; subtitle?: string };
        section?: { id: number; label: string; subtitle?: string };
        subject?: { id: number; label: string; subtitle?: string };
        teacher?: { id: number; label: string; subtitle?: string };
    }>({});

    useEffect(() => {
        // Reset section if class changes and current section is not in new class
        // Handled by user expectation or validation logic
    }, [currentClassId]);

    const { data: homeworkData, isLoading: isHomeworkLoading } = useSWR(
        mode === 'edit' && homeworkId ? `homework-${homeworkId}` : null,
        () => teachersApi.getHomework(homeworkId!),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60 * 60 * 1000,
        }
    );

    useEffect(() => {
        if (homeworkData && mode === 'edit') {
            const data = homeworkData;

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
                    label: data.subject_name,
                } : undefined,
                teacher: data.teacher && data.teacher_name ? {
                    id: data.teacher,
                    label: data.teacher_name
                } : undefined
            });

            // Formatting due date to yyyy-MM-dd for input type="date"
            const formattedDate = data.due_date ? format(new Date(data.due_date), 'yyyy-MM-dd') : '';
            reset({
                title: data.title,
                description: data.description || '',
                subject: data.subject,
                class_obj: data.class_obj,
                section: data.section || null,
                is_active: data.is_active,
                due_date: formattedDate,
                teacher: (data as any).teacher || undefined, // Type cast if needed
            });
        }
    }, [homeworkData, mode, reset]);

    // Helper to merge presets with data options
    const getClassOptions = () => {
        const options = classesResults.map(c => ({
            label: c.name,
            value: c.id,
            subtitle: `${c.program_name} • Sem ${c.semester}`
        }));

        if (presets.class && !options.find(o => o.value === presets.class!.id)) {
            return [{ value: presets.class.id, label: presets.class.label, subtitle: presets.class.subtitle }, ...options];
        }
        return options;
    };

    const getSectionOptions = () => {
        const options = sectionsResults.map(s => ({
            label: s.name,
            value: s.id,
            subtitle: `Max ${s.max_students} students`
        }));

        if (presets.section && !options.find(o => o.value === presets.section!.id)) {
            return [{ value: presets.section.id, label: presets.section.label, subtitle: presets.section.subtitle }, ...options];
        }
        return options;
    };

    const getSubjectOptions = () => {
        const options = subjectsResults.map(s => ({
            label: `${s.name} (${s.code})`,
            value: s.id,
            subtitle: `Credits: ${s.credits}`
        }));

        if (presets.subject && !options.find(o => o.value === presets.subject!.id)) {
            return [{ value: presets.subject.id, label: presets.subject.label, subtitle: presets.subject.subtitle }, ...options];
        }
        return options;
    };

    const getTeacherOptions = () => {
        const options = teachersResults.map(t => ({
            label: t.full_name,
            value: t.id,
            subtitle: t.employee_id
        }));

        if (presets.teacher && !options.find(o => o.value === presets.teacher!.id)) {
            return [{ value: presets.teacher.id, label: presets.teacher.label, subtitle: presets.teacher.subtitle }, ...options];
        }
        return options;
    };

    const onSubmit = async (values: HomeworkFormValues) => {
        // If not admin, verify we have a teacher profile
        if (!isAdmin && !resolvedTeacherId) {
            toast.error('Teacher profile not found. Please contact support.');
            // We could allow proceed if user selects one (if we showed the dropdown), but for non-admin we don't.
        }

        // Use selected teacher (if admin) or resolved teacher (if teacher)
        const teacherIdToUse = values.teacher || resolvedTeacherId || 0;

        if (!teacherIdToUse) {
            toast.error('Teacher is required');
            return;
        }

        try {
            setIsLoading(true);
            const payload: HomeworkCreateInput = {
                ...values,
                // Handle empty description requirement from backend
                description: values.description && values.description.trim() !== '' ? values.description : ' ',
                due_date: values.due_date,
                attachment: null, // Handle attachment later/if needed
                teacher: teacherIdToUse,
            };

            if (mode === 'create') {
                await teachersApi.createHomework(payload);
                toast.success('Homework created successfully');
            } else if (homeworkId) {
                await teachersApi.updateHomework(homeworkId, payload);
                toast.success('Homework updated successfully');
            }
            onSuccess();
        } catch (error: any) {
            console.error("Homework submission error:", error);
            let message = 'Failed to save homework';

            if (error?.message) {
                if (typeof error.message === 'string') {
                    message = error.message;
                } else if (typeof error.message === 'object') {
                    // Flatten object errors to string to avoid React render crash
                    // If message is like { teacher: ["err"] }
                    try {
                        const parts = [];
                        for (const [k, v] of Object.entries(error.message)) {
                            const val = Array.isArray(v) ? v.join(', ') : String(v);
                            parts.push(`${k}: ${val}`);
                        }
                        message = parts.join(' | ') || JSON.stringify(error.message);
                    } catch (e) {
                        message = "An error occurred (details invalid)";
                    }
                }
            } else if (error?.detail) {
                message = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
            }

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Callback handlers for inline creation
    const handleClassCreated = (newClassId: number) => {
        refreshClasses().then(() => {
            setValue('class_obj', newClassId);
            setValue('section', null);
        });
    };

    const handleSectionCreated = (newSectionId: number) => {
        refreshSections().then(() => {
            setValue('section', newSectionId);
        });
    };

    const handleSubjectCreated = (newSubjectId: number) => {
        refreshSubjects().then(() => {
            setValue('subject', newSubjectId);
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-1">

                {/* Teacher Selection (Admin Only) */}
                {isAdmin && (
                    <div className="space-y-2">
                        <Label>Teacher <span className="text-destructive">*</span></Label>
                        <Controller
                            name="teacher"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelectWithCreate
                                    options={getTeacherOptions()}
                                    value={field.value}
                                    onChange={(val) => field.onChange(Number(val))}
                                    onCreateNew={() => { }} // No inline creation for teachers here
                                    placeholder="Select Teacher"
                                    createButtonText="" // Hide create button
                                    isLoading={teachersResults.length === 0}
                                />
                            )}
                        />
                        {errors.teacher && <p className="text-sm text-destructive">{errors.teacher.message}</p>}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    {isHomeworkLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Input
                            id="title"
                            placeholder="Homework Title"
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
                                    isLoading={classesResults.length === 0}
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
                                    isLoading={currentClassId ? sectionsResults.length === 0 : false}
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
                                isLoading={subjectsResults.length === 0}
                            />
                        )}
                    />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                    {isHomeworkLoading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <Textarea
                            id="description"
                            placeholder="Detailed description of the homework..."
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
                </div>

                <div className="flex flex-wrap gap-4">
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

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Homework' : 'Update Homework'}
                    </Button>
                </div>
            </form>

            <InlineCreateClass
                open={showCreateClass}
                onOpenChange={setShowCreateClass}
                onSuccess={handleClassCreated}
            />

            {!!currentClassId && (
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

