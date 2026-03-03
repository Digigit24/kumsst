/**
 * Medical Record Details Component
 * Displays full details of a student medical record
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMedicalRecord } from '@/hooks/useMedicalRecords';
import { AlertCircle, Heart, Phone, Shield, Trash2, Activity, User, Calendar, XCircle, Edit } from 'lucide-react';

interface MedicalRecordDetailsProps {
    recordId: number;
    onDelete: () => void;
    onEdit?: () => void;
}

export const MedicalRecordDetails = ({ recordId, onDelete, onEdit }: MedicalRecordDetailsProps) => {
    const { data: record, isLoading, error } = useMedicalRecord(recordId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-destructive/10 p-3 rounded-full mb-3">
                    <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-muted-foreground">Failed to load medical record details</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end gap-2">
                {onEdit && (
                    <Button size="sm" onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Record
                    </Button>
                )}
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Record
                </Button>
            </div>

            {/* Basic Info */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 text-primary flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Student</label>
                        <p className="font-medium">{record.student_name || `#${record.student}`}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Last Checkup</label>
                        <p className="font-medium">{record.last_checkup_date ? new Date(record.last_checkup_date).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Status</label>
                        <Badge variant={record.is_active ? 'success' : 'secondary'}>
                            {record.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Vitals */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 text-primary flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Physical Vitals
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-background rounded border">
                        <label className="text-xs text-muted-foreground block mb-1">Blood Group</label>
                        <p className="font-bold text-lg text-destructive">{record.blood_group || '-'}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded border">
                        <label className="text-xs text-muted-foreground block mb-1">Height</label>
                        <p className="font-medium">{record.height ? `${record.height} cm` : '-'}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded border">
                        <label className="text-xs text-muted-foreground block mb-1">Weight</label>
                        <p className="font-medium">{record.weight ? `${record.weight} kg` : '-'}</p>
                    </div>
                </div>
            </div>

            {/* Medical Info */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 text-primary flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Medical Information
                </h3>
                <div className="space-y-4 text-sm">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1 flex items-center gap-1">
                            Allergies
                            {record.allergies && <Badge variant="destructive" className="h-4 px-1 text-[10px]">Alert</Badge>}
                        </label>
                        <div className="bg-background p-3 rounded border text-muted-foreground min-h-[40px]">
                            {record.allergies || 'No known allergies'}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Medical Conditions</label>
                        <div className="bg-background p-3 rounded border text-muted-foreground min-h-[40px]">
                            {record.medical_conditions || 'No known medical conditions'}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Current Medications</label>
                        <div className="bg-background p-3 rounded border text-muted-foreground min-h-[40px]">
                            {record.medications || 'No current medications'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 text-primary flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Contact
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Name</label>
                        <p className="font-medium">{record.emergency_contact_name || '-'}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Relation</label>
                        <p className="font-medium">{record.emergency_contact_relation || '-'}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-muted-foreground block mb-1">Phone Number</label>
                        <p className="font-medium flex items-center gap-2">
                            {record.emergency_contact_phone || '-'}
                            {record.emergency_contact_phone && (
                                <a href={`tel:${record.emergency_contact_phone}`} className="text-primary hover:underline text-xs">
                                    (Call)
                                </a>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Insurance */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 text-primary flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Insurance Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Provider</label>
                        <p className="font-medium">{record.health_insurance_provider || '-'}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Policy Number</label>
                        <p className="font-medium font-mono">{record.health_insurance_number || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Audit Information */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>
                        <label className="block mb-1">Created At</label>
                        <p>{new Date(record.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <label className="block mb-1">Updated At</label>
                        <p>{new Date(record.updated_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
