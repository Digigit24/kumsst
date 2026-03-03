/**
 * Guardian Drawer - Add/Edit Guardian
 */

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SideDrawer, SideDrawerContent } from '../../../components/common/SideDrawer';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useCreateStudentGuardian, useUpdateStudentGuardian } from '../../../hooks/useStudentGuardians';
import type { StudentGuardian, StudentGuardianListItem } from '../../../types/students.types';
import { handleFormError, validateRequiredFields } from '../../../utils/formErrorHandler';

interface GuardianDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: number;
    guardian?: StudentGuardian | StudentGuardianListItem;
    onSuccess?: () => void;
}

export const GuardianDialog: React.FC<GuardianDialogProps> = ({
    open,
    onOpenChange,
    studentId,
    guardian,
    onSuccess,
}) => {
    const isEdit = !!guardian;
    const createMutation = useCreateStudentGuardian();
    const updateMutation = useUpdateStudentGuardian();

    const [formData, setFormData] = useState<{
        first_name: string;
        middle_name: string;
        last_name: string;
        relation: string;
        phone: string;
        email: string;
        occupation: string;
        annual_income: string;
        is_primary: boolean;
        is_emergency_contact: boolean;
    }>({
        first_name: '',
        middle_name: '',
        last_name: '',
        relation: 'father',
        phone: '',
        email: '',
        occupation: '',
        annual_income: '',
        is_primary: false,
        is_emergency_contact: false,
    });

    useEffect(() => {
        if (guardian) {
            setFormData({
                first_name: guardian.guardian_details?.first_name || '',
                middle_name: guardian.guardian_details?.middle_name || '',
                last_name: guardian.guardian_details?.last_name || '',
                relation: guardian.guardian_details?.relation || 'father',
                phone: guardian.guardian_details?.phone || '',
                email: guardian.guardian_details?.email || '',
                occupation: guardian.guardian_details?.occupation || '',
                annual_income: guardian.guardian_details?.annual_income?.toString() || '',
                is_primary: guardian.is_primary || false,
                is_emergency_contact: guardian.is_emergency_contact || false,
            });
        } else if (open) {
            setFormData({
                first_name: '',
                middle_name: '',
                last_name: '',
                relation: 'father',
                phone: '',
                email: '',
                occupation: '',
                annual_income: '',
                is_primary: false,
                is_emergency_contact: false,
            });
        }
    }, [guardian, open]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        const isValid = validateRequiredFields(formData, [
            { name: 'first_name', label: 'First Name' },
            { name: 'last_name', label: 'Last Name' },
            { name: 'phone', label: 'Phone' },
        ]);

        if (!isValid) {
            return;
        }

        // Validate email format if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Validate phone format (basic check)
        if (formData.phone && formData.phone.length < 10) {
            toast.error('Please enter a valid phone number (at least 10 digits)');
            return;
        }

        const payload: any = {
            student: studentId,
            relation: formData.relation,
            occupation: formData.occupation,
            annual_income: formData.annual_income ? parseFloat(formData.annual_income) : null,
            is_primary: formData.is_primary,
            is_emergency_contact: formData.is_emergency_contact,
            guardian: {
                first_name: formData.first_name,
                middle_name: formData.middle_name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email,
                relation: formData.relation,
                occupation: formData.occupation,
                annual_income: formData.annual_income ? parseFloat(formData.annual_income) : null,
            },
        };

        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ id: guardian.id, data: payload });
                toast.success('Guardian updated successfully');
            } else {
                await createMutation.mutateAsync(payload);
                toast.success('Guardian added successfully');
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            handleFormError(error, undefined, `Failed to ${isEdit ? 'update' : 'add'} guardian`);
        }
    };

    return (
        <SideDrawer open={open} onOpenChange={onOpenChange}>
            <SideDrawerContent
                title={isEdit ? 'Edit Guardian' : 'Add Guardian'}
                description="Maintain guardian contacts, relation, and emergency preferences."
                size="lg"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            loading={createMutation.isPending || updateMutation.isPending}
                        >
                            {isEdit ? 'Update' : 'Add'} Guardian
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Middle Name</Label>
                        <Input
                            value={formData.middle_name}
                            onChange={(e) => handleChange('middle_name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Relation *</Label>
                        <Select value={formData.relation} onValueChange={(value) => handleChange('relation', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="guardian">Guardian</SelectItem>
                                <SelectItem value="uncle">Uncle</SelectItem>
                                <SelectItem value="aunt">Aunt</SelectItem>
                                <SelectItem value="grandfather">Grandfather</SelectItem>
                                <SelectItem value="grandmother">Grandmother</SelectItem>
                                <SelectItem value="brother">Brother</SelectItem>
                                <SelectItem value="sister">Sister</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Occupation</Label>
                        <Input
                            value={formData.occupation}
                            onChange={(e) => handleChange('occupation', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Annual Income</Label>
                        <Input
                            type="number"
                            value={formData.annual_income}
                            onChange={(e) => handleChange('annual_income', e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 md:col-span-2 border rounded-lg p-3 bg-muted/40">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_primary"
                                checked={formData.is_primary}
                                onCheckedChange={(checked) => handleChange('is_primary', checked)}
                            />
                            <Label htmlFor="is_primary" className="font-normal cursor-pointer">
                                Primary Guardian
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_emergency"
                                checked={formData.is_emergency_contact}
                                onCheckedChange={(checked) => handleChange('is_emergency_contact', checked)}
                            />
                            <Label htmlFor="is_emergency" className="font-normal cursor-pointer">
                                Emergency Contact
                            </Label>
                        </div>
                    </div>
                </div>
            </SideDrawerContent>
        </SideDrawer>
    );
};
