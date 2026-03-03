/**
 * Certificate Form Component
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useState, useEffect } from 'react';
import { certificateApi } from '../../../services/students.service';
import { useStudents } from '../../../hooks/useStudents';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { Certificate, CertificateCreateInput } from '../../../types/students.types';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';

interface CertificateFormProps {
    mode: 'view' | 'create' | 'edit';
    certificateId?: number;
    collegeId?: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CERTIFICATE_TYPES = [
    { value: 'bonafide', label: 'Bonafide Certificate' },
    { value: 'tc', label: 'Transfer Certificate' },
    { value: 'marksheet', label: 'Marksheet' },
    { value: 'degree', label: 'Degree Certificate' },
    { value: 'conduct', label: 'Conduct Certificate' },
    { value: 'other', label: 'Other' },
];

export function CertificateForm({ mode, certificateId, collegeId, onSuccess, onCancel }: CertificateFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [certificate, setCertificate] = useState<Certificate | null>(null);

    const studentFilters = {
        page_size: DROPDOWN_PAGE_SIZE,
        is_active: true,
        ...(collegeId ? { college: collegeId } : {}),
    };
    const { data: studentsData, isLoading: isStudentsLoading } = useStudents(studentFilters);

    const restrictByCollege = typeof collegeId !== 'undefined';
    const filteredStudents =
        studentsData?.results?.filter((student) => {
            if (!restrictByCollege) return true;
            if (collegeId === null) return false;
            return student.college === collegeId;
        }) || [];
    const disableStudentSelect = mode === 'view' || (restrictByCollege && collegeId === null);

    const [formData, setFormData] = useState<CertificateCreateInput>({
        student: 0,
        certificate_type: 'bonafide',
        certificate_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        valid_until: null,
        purpose: '',
    });

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && certificateId) {
            fetchCertificate();
        }
    }, [mode, certificateId]);

    const fetchCertificate = async () => {
        if (!certificateId) return;
        try {
            setIsFetching(true);
            const data = await certificateApi.get(certificateId);
            setCertificate(data);
            setFormData({
                student: data.student,
                certificate_type: data.certificate_type,
                certificate_number: data.certificate_number,
                issue_date: data.issue_date,
                valid_until: data.valid_until,
                purpose: data.purpose || '',
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch certificate');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (restrictByCollege && mode !== 'edit') {
            const exists = filteredStudents.some((s) => s.id === formData.student);
            if (!exists && formData.student !== 0) {
                setFormData((prev) => ({ ...prev, student: 0 }));
            }
        }
    }, [restrictByCollege, collegeId, studentsData, formData.student, filteredStudents, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.student) {
            setError('Please select a student');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            if (mode === 'create') {
                await certificateApi.create(formData);
            } else if (mode === 'edit' && certificateId) {
                await certificateApi.update(certificateId, formData);
            }
            onSuccess();
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to save certificate');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="flex items-center justify-center py-8"><p className="text-muted-foreground">Loading...</p></div>;

    const isViewMode = mode === 'view';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm text-destructive">{error}</p></div>}

            <div className="space-y-2">
                <Label>Student <span className="text-destructive">*</span></Label>
                {mode === 'edit' ? (
                    <Input
                        value={certificate?.student_name || filteredStudents.find(s => s.id === formData.student)?.full_name || (formData.student ? `Student #${formData.student}` : '')}
                        disabled
                        readOnly
                        className="bg-muted opacity-100"
                    />
                ) : (
                    isStudentsLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Select
                            value={formData.student?.toString()}
                            onValueChange={(v) => setFormData({ ...formData, student: parseInt(v) })}
                            disabled={disableStudentSelect}
                        >
                            <SelectTrigger><SelectValue placeholder={disableStudentSelect ? "Select college to load students" : "Select student"} /></SelectTrigger>
                            <SelectContent>
                                {filteredStudents.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.full_name} ({s.admission_number})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )
                )}
            </div>

            <div className="space-y-2">
                <Label>Certificate Type <span className="text-destructive">*</span></Label>
                <Select value={formData.certificate_type} onValueChange={(v) => setFormData({ ...formData, certificate_type: v })} disabled={isViewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {CERTIFICATE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="certificate_number">Certificate Number <span className="text-destructive">*</span></Label>
                <Input id="certificate_number" value={formData.certificate_number} onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })} placeholder="e.g., CERT-2024-001" disabled={isViewMode} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="issue_date">Issue Date <span className="text-destructive">*</span></Label>
                    <Input id="issue_date" type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} disabled={isViewMode} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input id="valid_until" type="date" value={formData.valid_until || ''} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || null })} disabled={isViewMode} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea id="purpose" value={formData.purpose || ''} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="Enter purpose of certificate..." disabled={isViewMode} rows={3} />
            </div>

            {isViewMode && certificate && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={certificate.is_active ? 'default' : 'secondary'}>
                            {certificate.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Created:</span> {new Date(certificate.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Last Updated:</span> {new Date(certificate.updated_at).toLocaleString()}
                    </div>
                </div>
            )}

            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Saving...' : mode === 'create' ? 'Issue Certificate' : 'Update Certificate'}</Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                </div>
            )}
        </form>
    );
}
