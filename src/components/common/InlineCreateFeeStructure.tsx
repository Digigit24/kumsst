/**
 * InlineCreateFeeStructure Component
 * Allows creating a new Fee Structure (assigning fee to student) inline
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelectWithCreate } from '@/components/ui/searchable-select-with-create';
import { useFeeMasters } from '@/hooks/useFees';
import { useStudents } from '@/hooks/useStudents';
import { feeStructuresApi } from '@/services/fees.service';
import type { FeeStructureCreateInput } from '@/types/fees.types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateFeeStructureProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (structureId: number) => void;
    collegeId?: number;
}

export function InlineCreateFeeStructure({
    open,
    onOpenChange,
    onSuccess,
    collegeId,
}: InlineCreateFeeStructureProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Fetch dropdown data
    const { data: studentsData } = useStudents({ page_size: DROPDOWN_PAGE_SIZE });
    const { data: feeMastersData } = useFeeMasters({ page_size: DROPDOWN_PAGE_SIZE });

    // Create options for dropdowns
    const studentOptions = useMemo(() => {
        if (!studentsData?.results) return [];
        return studentsData.results.map((student) => ({
            value: student.id,
            label: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Student ${student.id}`,
            subtitle: student.roll_number || student.email || '',
        }));
    }, [studentsData]);

    const feeMasterOptions = useMemo(() => {
        if (!feeMastersData?.results) return [];
        return feeMastersData.results.map((master) => ({
            value: master.id,
            label: `${master.fee_type_name || 'Fee'} - Sem ${master.semester}`,
            subtitle: `₹${master.amount} • ${master.program_name || ''}`,
        }));
    }, [feeMastersData]);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FeeStructureCreateInput>({
        defaultValues: {
            is_active: true,
            amount: '0',
            paid_amount: '0',
            balance: '0',
            due_date: new Date().toISOString().split('T')[0],
            is_paid: false,
        },
    });

    const selectedStudent = watch('student');
    const selectedFeeMaster = watch('fee_master');
    const amount = watch('amount');
    const paidAmount = watch('paid_amount');

    // Auto-calculate balance
    useEffect(() => {
        const amt = parseFloat(amount || '0');
        const paid = parseFloat(paidAmount || '0');
        setValue('balance', (amt - paid).toFixed(2));
    }, [amount, paidAmount, setValue]);

    // When Fee Master is selected, auto-fill amount
    useEffect(() => {
        if (selectedFeeMaster && feeMastersData?.results) {
            const master = feeMastersData.results.find(m => m.id === selectedFeeMaster);
            if (master) {
                setValue('amount', master.amount);
            }
        }
    }, [selectedFeeMaster, feeMastersData, setValue]);

    const onSubmit = async (data: FeeStructureCreateInput) => {
        try {
            if (!data.student) {
                toast.error('Please select a student');
                return;
            }
            if (!data.fee_master) {
                toast.error('Please select a fee master');
                return;
            }

            setIsLoading(true);
            setIsLoading(true);
            // Backend gets college from x-college-id header
            const payload = data;

            const newStructure = await feeStructuresApi.create(payload);
            toast.success('Fee Structure created successfully');
            reset();
            onSuccess(newStructure.id);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Create fee structure error:', error);
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create fee structure');
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
            title="Create Fee Structure"
            description="Assign a fee to a student"
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isLoading={isLoading}
            size="lg"
        >
            <div className="grid gap-4">

                <div className="space-y-2">
                    <Label htmlFor="student">
                        Student <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelectWithCreate
                        options={studentOptions}
                        value={selectedStudent}
                        onChange={(value) => setValue('student', Number(value))}
                        placeholder="Select student"
                        searchPlaceholder="Search students..."
                        emptyText="No students available"
                        showCreateButton={false} // Student creation is too complex for inline usually
                    />
                    {errors.student && (
                        <p className="text-sm text-destructive">{errors.student.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fee_master">
                        Fee Master <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelectWithCreate
                        options={feeMasterOptions}
                        value={selectedFeeMaster}
                        onChange={(value) => setValue('fee_master', Number(value))}
                        placeholder="Select fee master"
                        searchPlaceholder="Search fee masters..."
                        emptyText="No fee masters available"
                        showCreateButton={false} // Can enable if we duplicate FeeMaster logic, but keeping it simple for now
                    />
                    {errors.fee_master && (
                        <p className="text-sm text-destructive">{errors.fee_master.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Amount (₹) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            {...register('amount', { required: 'Amount is required' })}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date">
                            Due Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="due_date"
                            type="date"
                            {...register('due_date', { required: 'Due date is required' })}
                        />
                        {errors.due_date && (
                            <p className="text-sm text-destructive">{errors.due_date.message}</p>
                        )}
                    </div>
                </div>

            </div>
        </InlineCreateModal>
    );
}
