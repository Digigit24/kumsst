/**
 * Fee Fine Form Component
 * Form for creating/editing fee fines
 */

import { useEffect, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { Textarea } from '../../../components/ui/textarea';
import { useStudents } from '../../../hooks/useStudents';
import type { FeeFine } from '../../../types/accountant.types';

interface FeeFineFormProps {
    feeFine: FeeFine | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export function FeeFineForm({ feeFine, onSubmit, onCancel, isSubmitting = false }: FeeFineFormProps) {
    const [formData, setFormData] = useState({
        student: 0,
        amount: 0,
        reason: '',
        fine_date: new Date().toISOString().split('T')[0],
        is_paid: false,
        paid_date: '',
    });

    // Load students for the dropdown
    const { data: studentsData, isLoading: studentsLoading } = useStudents({
        page: 1,
        page_size: DROPDOWN_PAGE_SIZE,
    });

    useEffect(() => {
        if (feeFine) {
            setFormData({
                student: feeFine.student,
                amount: Number(feeFine.amount),
                reason: feeFine.reason || '',
                fine_date: feeFine.fine_date,
                is_paid: feeFine.is_paid,
                paid_date: feeFine.paid_date || '',
            });
        }
    }, [feeFine]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Prepare student options for SearchableSelect
    const studentOptions =
        studentsData?.results?.map((student: any) => ({
            value: student.id.toString(),
            label: `${student.full_name} (${student.admission_number})`,
        })) || [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Fine Details</h3>

                <div className="space-y-2">
                    <Label htmlFor="student">Student *</Label>
                    <SearchableSelect
                        options={studentOptions}
                        value={formData.student}
                        onChange={(value) =>
                            handleChange('student', typeof value === 'string' ? parseInt(value) : value)
                        }
                        placeholder="Search student by name or admission number..."
                        emptyText="No students found. Start typing to search..."
                        searchPlaceholder="Type student name or admission number..."
                        isLoading={studentsLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                        Search for students by name or admission number
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fine_date">Fine Date *</Label>
                    <Input
                        id="fine_date"
                        type="date"
                        value={formData.fine_date}
                        onChange={(e) => handleChange('fine_date', e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                        id="reason"
                        value={formData.reason || ''}
                        onChange={(e) => handleChange('reason', e.target.value)}
                        rows={3}
                        placeholder="Enter reason for the fine"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_paid"
                        checked={formData.is_paid}
                        onChange={(e) => handleChange('is_paid', e.target.checked)}
                        className="w-4 h-4"
                    />
                    <Label htmlFor="is_paid" className="cursor-pointer">
                        Mark as Paid
                    </Label>
                </div>

                {formData.is_paid && (
                    <div className="space-y-2">
                        <Label htmlFor="paid_date">Paid Date</Label>
                        <Input
                            id="paid_date"
                            type="date"
                            value={formData.paid_date}
                            onChange={(e) => handleChange('paid_date', e.target.value)}
                        />
                    </div>
                )}
            </Card>

            <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                    {feeFine ? 'Update' : 'Create'} Fee Fine
                </Button>
            </div>
        </form>
    );
}
