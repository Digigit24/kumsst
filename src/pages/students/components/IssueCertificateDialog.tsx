/**
 * Issue Certificate Drawer
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { SideDrawer, SideDrawerContent } from '../../../components/common/SideDrawer';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Award } from 'lucide-react';
import { useCreateCertificate, useUpdateCertificate } from '../../../hooks/useCertificates';
import type { Certificate } from '../../../types/students.types';

interface IssueCertificateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: number;
    onSuccess?: () => void;
    certificate?: Certificate;
}

export const IssueCertificateDialog: React.FC<IssueCertificateDialogProps> = ({
    open,
    onOpenChange,
    studentId,
    onSuccess,
    certificate,
}) => {
    const createMutation = useCreateCertificate();
    const updateMutation = useUpdateCertificate();
    const isEdit = !!certificate;
    const [formData, setFormData] = useState({
        certificate_type: 'bonafide',
        certificate_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        valid_until: '',
        purpose: '',
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    React.useEffect(() => {
        if (certificate) {
            setFormData({
                certificate_type: certificate.certificate_type || 'bonafide',
                certificate_number: certificate.certificate_number || '',
                issue_date: certificate.issue_date
                    ? certificate.issue_date.split('T')[0] || certificate.issue_date
                    : new Date().toISOString().split('T')[0],
                valid_until: certificate.valid_until
                    ? certificate.valid_until.split('T')[0] || certificate.valid_until
                    : '',
                purpose: certificate.purpose || '',
            });
        } else if (open) {
            setFormData({
                certificate_type: 'bonafide',
                certificate_number: '',
                issue_date: new Date().toISOString().split('T')[0],
                valid_until: '',
                purpose: '',
            });
        }
    }, [certificate, open]);

    const handleSubmit = async () => {
        const payload: any = {
            student: studentId,
            certificate_type: formData.certificate_type,
            certificate_number: formData.certificate_number,
            issue_date: formData.issue_date,
            purpose: formData.purpose,
        };

        if (formData.valid_until) {
            payload.valid_until = formData.valid_until;
        }

        try {
            if (isEdit && certificate) {
                await updateMutation.mutateAsync({ id: certificate.id, data: payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onSuccess?.();
            onOpenChange(false);
            setFormData({
                certificate_type: 'bonafide',
                certificate_number: '',
                issue_date: new Date().toISOString().split('T')[0],
                valid_until: '',
                purpose: '',
            });
        } catch (error) {
            console.error('Failed to save certificate:', error);
            toast.error('Failed to save certificate. Please try again.');
        }
    };

    return (
        <SideDrawer open={open} onOpenChange={onOpenChange}>
            <SideDrawerContent
                title={isEdit ? 'Update Certificate' : 'Issue Certificate'}
                description="Generate or update certificates for this student."
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            loading={createMutation.isPending || updateMutation.isPending}
                        >
                            <Award className="h-4 w-4 mr-2" />
                            {isEdit ? 'Save Changes' : 'Issue Certificate'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Certificate Type *</Label>
                        <Select value={formData.certificate_type} onValueChange={(value) => handleChange('certificate_type', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                                <SelectItem value="character">Character Certificate</SelectItem>
                                <SelectItem value="transfer">Transfer Certificate</SelectItem>
                                <SelectItem value="marksheet">Marksheet</SelectItem>
                                <SelectItem value="completion">Course Completion</SelectItem>
                                <SelectItem value="conduct">Conduct Certificate</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Certificate Number *</Label>
                        <Input
                            value={formData.certificate_number}
                            onChange={(e) => handleChange('certificate_number', e.target.value)}
                            placeholder="e.g., CERT/2024/001"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Issue Date *</Label>
                            <Input
                                type="date"
                                value={formData.issue_date}
                                onChange={(e) => handleChange('issue_date', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Valid Until (Optional)</Label>
                            <Input
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => handleChange('valid_until', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Purpose</Label>
                        <Textarea
                            value={formData.purpose}
                            onChange={(e) => handleChange('purpose', e.target.value)}
                            placeholder="Purpose of certificate..."
                            rows={3}
                        />
                    </div>
                </div>
            </SideDrawerContent>
        </SideDrawer>
    );
};
