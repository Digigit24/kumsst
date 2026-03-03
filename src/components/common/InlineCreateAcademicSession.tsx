/**
 * InlineCreateAcademicSession Component
 * Allows creating a new Academic Session inline
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelectWithCreate } from '@/components/ui/searchable-select-with-create';
import { Switch } from '@/components/ui/switch';
import { useAcademicYears } from '@/hooks/useCore';
import { academicSessionApi } from '@/services/core.service';
import type { AcademicSessionCreateInput } from '@/types/core.types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateAcademicYear } from './InlineCreateAcademicYear';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateAcademicSessionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (sessionId: number) => void;
    collegeId?: number;
}

export function InlineCreateAcademicSession({
    open,
    onOpenChange,
    onSuccess,
    collegeId,
}: InlineCreateAcademicSessionProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);

    // Fetch academic years dropdown
    const { data: yearsData, refetch: refetchYears } = useAcademicYears({ page_size: DROPDOWN_PAGE_SIZE });

    const yearOptions = useMemo(() => {
        if (!yearsData?.results) return [];
        return yearsData.results.map((year) => ({
            value: year.id,
            label: year.year || `Academic Year ${year.id}`,
            subtitle: year.description || `${year.start_date} - ${year.end_date}`,
        }));
    }, [yearsData]);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<AcademicSessionCreateInput>({
        defaultValues: {
            is_current: false,
            is_active: true,
            semester: 1,
        },
    });

    const selectedYear = watch('academic_year');
    const isCurrent = watch('is_current');

    const onSubmit = async (data: AcademicSessionCreateInput) => {
        try {
            if (!data.academic_year) {
                toast.error('Please select an academic year');
                return;
            }

            setIsLoading(true);
            // Remove college from payload - backend gets it from x-college-id header
            // Using generic object spread to safely exclude college even if typed interface doesn't have it (though it might)
            const { college, ...rest } = data as any;
            const payload = rest as AcademicSessionCreateInput;

            const newSession = await academicSessionApi.create(payload);
            toast.success('Academic session created successfully');
            reset();
            onSuccess(newSession.id);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Create academic session error:', error);
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create academic session');
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearCreated = async (yearId: number) => {
        await refetchYears();
        setValue('academic_year', yearId);
        setShowYearModal(false);
    };

    const handleCancel = () => {
        reset();
    };

    return (
        <>
            <InlineCreateModal
                open={open}
                onOpenChange={onOpenChange}
                title="Create New Academic Session"
                description="Add a new academic session to the system"
                onSubmit={handleSubmit(onSubmit)}
                onCancel={handleCancel}
                isLoading={isLoading}
                size="md"
            >
                <div className="grid gap-4">

                    <div className="space-y-2">
                        <Label htmlFor="academic_year">
                            Academic Year <span className="text-destructive">*</span>
                        </Label>
                        <SearchableSelectWithCreate
                            options={yearOptions}
                            value={selectedYear}
                            onChange={(value) => setValue('academic_year', Number(value))}
                            placeholder="Select academic year"
                            searchPlaceholder="Search academic years..."
                            emptyText="No academic years available"
                            onCreateNew={() => setShowYearModal(true)}
                            createButtonText="Create New Academic Year"
                        />
                        {errors.academic_year && (
                            <p className="text-sm text-destructive">{errors.academic_year.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register('name', { required: 'Name is required' })}
                                placeholder="e.g., Semester 1 - 2024"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="semester">
                                Semester <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="semester"
                                type="number"
                                {...register('semester', { required: 'Semester is required', min: 1, max: 8 })}
                                min={1}
                                max={8}
                            />
                            {errors.semester && (
                                <p className="text-sm text-destructive">{errors.semester.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_current" className="text-base">
                                Current Session
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Mark this as the currently active session
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

            <InlineCreateAcademicYear
                open={showYearModal}
                onOpenChange={setShowYearModal}
                onSuccess={handleYearCreated}
                collegeId={collegeId}
            />
        </>
    );
}
