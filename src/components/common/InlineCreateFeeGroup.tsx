/**
 * InlineCreateFeeGroup Component
 * Allows creating a new Fee Group without leaving the current form
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { feeGroupsApi } from '@/services/fees.service';
import type { FeeGroupCreateInput } from '@/types/fees.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateFeeGroupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (feeGroupId: number) => void;
    collegeId?: number;
}

export function InlineCreateFeeGroup({
    open,
    onOpenChange,
    onSuccess,
    collegeId,
}: InlineCreateFeeGroupProps) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FeeGroupCreateInput>({
        defaultValues: {
            is_active: true,
            description: '',
        },
    });

    const onSubmit = async (data: FeeGroupCreateInput) => {
        try {
            setIsLoading(true);
            // Remove college from payload - backend gets it from x-college-id header
            const { college, ...payload } = data;
            const newFeeGroup = await feeGroupsApi.create(payload as FeeGroupCreateInput);
            toast.success('Fee Group created successfully');
            reset();
            onSuccess(newFeeGroup.id);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Create fee group error:', error);
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create fee group');
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
            title="Create New Fee Group"
            description="Add a new fee group to the system"
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isLoading={isLoading}
            size="md"
        >
            <div className="grid gap-4">
                {/* Name and Code */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">
                            Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="code"
                            {...register('code', { required: 'Code is required' })}
                            placeholder="e.g., TUITION"
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
                            placeholder="e.g., Tuition Fees"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Brief description of this fee group"
                        rows={3}
                    />
                </div>
            </div>
        </InlineCreateModal>
    );
}
