/**
 * InlineCreateFeeType Component
 * Allows creating a new Fee Type without leaving the current form
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelectWithCreate } from '@/components/ui/searchable-select-with-create';
import { Textarea } from '@/components/ui/textarea';
import { useFeeGroups } from '@/hooks/useFees';
import { feeTypesApi } from '@/services/fees.service';
import type { FeeTypeCreateInput } from '@/types/fees.types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateFeeGroup } from './InlineCreateFeeGroup';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateFeeTypeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (feeTypeId: number) => void;
    collegeId?: number;
}

export function InlineCreateFeeType({
    open,
    onOpenChange,
    onSuccess,
    collegeId,
}: InlineCreateFeeTypeProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showFeeGroupModal, setShowFeeGroupModal] = useState(false);

    // Fetch fee groups for dropdown
    const { data: feeGroupsData, refetch: refetchFeeGroups } = useFeeGroups({ page_size: DROPDOWN_PAGE_SIZE });

    // Create options for fee groups dropdown
    const feeGroupOptions = useMemo(() => {
        if (!feeGroupsData?.results) return [];
        return feeGroupsData.results.map((group) => ({
            value: group.id,
            label: group.name,
            subtitle: group.description || '',
        }));
    }, [feeGroupsData]);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FeeTypeCreateInput>({
        defaultValues: {
            is_active: true,
            description: '',
        },
    });

    const selectedFeeGroup = watch('fee_group');

    const onSubmit = async (data: FeeTypeCreateInput) => {
        try {
            if (!data.fee_group) {
                toast.error('Please select a fee group');
                return;
            }

            setIsLoading(true);
            // Remove college from payload - backend gets it from x-college-id header
            const { college, ...payload } = data;
            const newFeeType = await feeTypesApi.create(payload as FeeTypeCreateInput);
            toast.success('Fee Type created successfully');
            reset();
            onSuccess(newFeeType.id);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Create fee type error:', error);
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create fee type');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
    };

    const handleFeeGroupCreated = async (feeGroupId: number) => {
        await refetchFeeGroups();
        setValue('fee_group', feeGroupId);
        setShowFeeGroupModal(false);
    };

    return (
        <>
            <InlineCreateModal
                open={open}
                onOpenChange={onOpenChange}
                title="Create New Fee Type"
                description="Add a new fee type to the system"
                onSubmit={handleSubmit(onSubmit)}
                onCancel={handleCancel}
                isLoading={isLoading}
                size="md"
            >
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">
                                Code <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="code"
                                {...register('code', { required: 'Code is required' })}
                                placeholder="e.g., TUITION_SEM1"
                            />
                            {errors.code && (
                                <p className="text-sm text-destructive">{errors.code.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register('name', { required: 'Name is required' })}
                                placeholder="e.g., Semester 1 Tuition"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fee_group">
                            Fee Group <span className="text-destructive">*</span>
                        </Label>
                        <SearchableSelectWithCreate
                            options={feeGroupOptions}
                            value={selectedFeeGroup}
                            onChange={(value) => setValue('fee_group', Number(value))}
                            placeholder="Select fee group"
                            searchPlaceholder="Search fee groups..."
                            emptyText="No fee groups available"
                            onCreateNew={() => setShowFeeGroupModal(true)}
                            createButtonText="Create New Fee Group"
                        />
                        {errors.fee_group && (
                            <p className="text-sm text-destructive">{errors.fee_group.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Brief description of this fee type"
                            rows={3}
                        />
                    </div>
                </div>
            </InlineCreateModal>

            <InlineCreateFeeGroup
                open={showFeeGroupModal}
                onOpenChange={setShowFeeGroupModal}
                onSuccess={handleFeeGroupCreated}
                collegeId={collegeId}
            />
        </>
    );
}
