/**
 * Medical Tab Component
 * Displays and manages student medical records
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Heart, Phone, Shield, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { SideDrawer, SideDrawerContent } from '../../../components/common/SideDrawer';
import { useMedicalRecords, useCreateMedicalRecord, useUpdateMedicalRecord } from '../../../hooks/useMedicalRecords';
import type { StudentMedicalRecord } from '../../../types/students.types';

interface MedicalTabProps {
    studentId: number;
}

interface MedicalRecordDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: number;
    record?: StudentMedicalRecord | null;
    onSuccess?: () => void;
}

const MedicalRecordDrawer: React.FC<MedicalRecordDrawerProps> = ({
    open,
    onOpenChange,
    studentId,
    record,
    onSuccess,
}) => {
    const isEdit = !!record;
    const createMutation = useCreateMedicalRecord();
    const updateMutation = useUpdateMedicalRecord();

    const [formData, setFormData] = useState({
        blood_group: '',
        height: '',
        weight: '',
        allergies: '',
        medical_conditions: '',
        medications: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        health_insurance_provider: '',
        health_insurance_number: '',
        last_checkup_date: '',
        is_active: true,
    });

    React.useEffect(() => {
        if (record) {
            setFormData({
                blood_group: record.blood_group || '',
                height: record.height || '',
                weight: record.weight || '',
                allergies: record.allergies || '',
                medical_conditions: record.medical_conditions || '',
                medications: record.medications || '',
                emergency_contact_name: record.emergency_contact_name || '',
                emergency_contact_phone: record.emergency_contact_phone || '',
                emergency_contact_relation: record.emergency_contact_relation || '',
                health_insurance_provider: record.health_insurance_provider || '',
                health_insurance_number: record.health_insurance_number || '',
                last_checkup_date: record.last_checkup_date
                    ? record.last_checkup_date.split('T')[0] || record.last_checkup_date
                    : '',
                is_active: record.is_active !== undefined ? record.is_active : true,
            });
        } else if (open) {
            setFormData({
                blood_group: '',
                height: '',
                weight: '',
                allergies: '',
                medical_conditions: '',
                medications: '',
                emergency_contact_name: '',
                emergency_contact_phone: '',
                emergency_contact_relation: '',
                health_insurance_provider: '',
                health_insurance_number: '',
                last_checkup_date: '',
                is_active: true,
            });
        }
    }, [record, open]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const payload: any = {
            student: studentId,
            blood_group: formData.blood_group || null,
            height: formData.height || null,
            weight: formData.weight || null,
            allergies: formData.allergies || null,
            medical_conditions: formData.medical_conditions || null,
            medications: formData.medications || null,
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
            emergency_contact_relation: formData.emergency_contact_relation || null,
            health_insurance_provider: formData.health_insurance_provider || null,
            health_insurance_number: formData.health_insurance_number || null,
            last_checkup_date: formData.last_checkup_date || null,
            is_active: formData.is_active,
        };

        try {
            if (isEdit && record) {
                await updateMutation.mutateAsync({ id: record.id, data: payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to save medical record', err);
            toast.error('Failed to save medical record. Please try again.');
        }
    };

    return (
        <SideDrawer open={open} onOpenChange={onOpenChange}>
            <SideDrawerContent
                title={isEdit ? 'Update Medical Record' : 'Create Medical Record'}
                description="Maintain health details, allergies, and emergency contacts."
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
                            <Stethoscope className="h-4 w-4 mr-2" />
                            {isEdit ? 'Save Changes' : 'Create Record'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Blood Group</Label>
                            <Select value={formData.blood_group} onValueChange={(value) => handleChange('blood_group', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Height (cm)</Label>
                            <Input
                                type="number"
                                value={formData.height}
                                onChange={(e) => handleChange('height', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => handleChange('weight', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Allergies</Label>
                            <Textarea
                                rows={2}
                                value={formData.allergies}
                                onChange={(e) => handleChange('allergies', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Medical Conditions</Label>
                            <Textarea
                                rows={2}
                                value={formData.medical_conditions}
                                onChange={(e) => handleChange('medical_conditions', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Current Medications</Label>
                        <Textarea
                            rows={2}
                            value={formData.medications}
                            onChange={(e) => handleChange('medications', e.target.value)}
                        />
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground">Emergency Contact</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={formData.emergency_contact_name}
                                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={formData.emergency_contact_phone}
                                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Relation</Label>
                                <Input
                                    value={formData.emergency_contact_relation}
                                    onChange={(e) => handleChange('emergency_contact_relation', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground">Health Insurance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <Input
                                    value={formData.health_insurance_provider}
                                    onChange={(e) => handleChange('health_insurance_provider', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Policy Number</Label>
                                <Input
                                    value={formData.health_insurance_number}
                                    onChange={(e) => handleChange('health_insurance_number', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Last Checkup Date</Label>
                            <Input
                                type="date"
                                value={formData.last_checkup_date}
                                onChange={(e) => handleChange('last_checkup_date', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </SideDrawerContent>
        </SideDrawer>
    );
};

export const MedicalTab: React.FC<MedicalTabProps> = ({ studentId }) => {
    const { data, isLoading, error, refetch } = useMedicalRecords({ student: studentId });
    const record = data?.results?.[0] as StudentMedicalRecord | undefined;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<StudentMedicalRecord | null>(null);

    const handleOpenDrawer = (rec?: StudentMedicalRecord | null) => {
        setEditingRecord(rec ?? null);
        setDrawerOpen(true);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !record) {
        return (
            <>
                <Card>
                    <CardContent className="p-12">
                        <EmptyState
                            icon={Heart}
                            title={error ? "Error Loading Medical Record" : "No Medical Record"}
                            description={error ? "Failed to load medical information" : "Create a medical record to track health information and emergency contacts."}
                            action={{
                                label: 'Create Medical Record',
                                onClick: () => handleOpenDrawer(null),
                            }}
                        />
                    </CardContent>
                </Card>
                <MedicalRecordDrawer
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    studentId={studentId}
                    record={editingRecord}
                    onSuccess={refetch}
                />
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Health Information */}
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Heart className="h-5 w-5 text-primary" />
                                Health Information
                            </h3>
                            <Button variant="outline" size="sm" onClick={() => handleOpenDrawer(record)}>
                                Edit
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                                <p className="font-medium mt-1">{record.blood_group || 'Not Specified'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Height (cm)</label>
                                <p className="font-medium mt-1">{record.height || 'Not Recorded'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Weight (kg)</label>
                                <p className="font-medium mt-1">{record.weight || 'Not Recorded'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Conditions */}
                {(record.allergies || record.medical_conditions || record.medications) && (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            {record.allergies && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                                    <p className="mt-1">{record.allergies}</p>
                                </div>
                            )}
                            {record.medical_conditions && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Medical Conditions</label>
                                    <p className="mt-1">{record.medical_conditions}</p>
                                </div>
                            )}
                            {record.medications && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Current Medications</label>
                                    <p className="mt-1">{record.medications}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Emergency Contact */}
                {record.emergency_contact_name && (
                    <Card variant="glass">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Phone className="h-5 w-5 text-destructive" />
                                Emergency Contact
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="font-medium mt-1">{record.emergency_contact_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="font-medium mt-1">{record.emergency_contact_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Relation</label>
                                    <p className="font-medium mt-1 capitalize">{record.emergency_contact_relation || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Health Insurance */}
                {(record.health_insurance_provider || record.health_insurance_number) && (
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Health Insurance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {record.health_insurance_provider && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Provider</label>
                                        <p className="font-medium mt-1">{record.health_insurance_provider}</p>
                                    </div>
                                )}
                                {record.health_insurance_number && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
                                        <p className="font-medium mt-1">{record.health_insurance_number}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <MedicalRecordDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                studentId={studentId}
                record={editingRecord ?? record}
                onSuccess={refetch}
            />
        </>
    );
};
