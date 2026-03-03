/**
 * Student ID Card Form Component
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useState, useEffect } from 'react';
import { studentIDCardApi } from '../../../services/students.service';
import { useStudents } from '../../../hooks/useStudents';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { StudentIDCard, StudentIDCardCreateInput } from '../../../types/students.types';

interface StudentIDCardFormProps {
    mode: 'view' | 'create' | 'edit';
    idCardId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function StudentIDCardForm({ mode, idCardId, onSuccess, onCancel }: StudentIDCardFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [idCard, setIdCard] = useState<StudentIDCard | null>(null);

    const { data: studentsData } = useStudents({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    const [formData, setFormData] = useState<StudentIDCardCreateInput>({
        student: 0,
        card_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        is_reissue: false,
        reissue_reason: '',
    });

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && idCardId) {
            fetchIDCard();
        }
    }, [mode, idCardId]);

    const fetchIDCard = async () => {
        if (!idCardId) return;
        try {
            setIsFetching(true);
            const data = await studentIDCardApi.get(idCardId);
            setIdCard(data);
            setFormData({
                student: data.student,
                card_number: data.card_number,
                issue_date: data.issue_date,
                valid_until: data.valid_until,
                is_reissue: data.is_reissue,
                reissue_reason: data.reissue_reason || '',
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch ID card');
        } finally {
            setIsFetching(false);
        }
    };

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
                await studentIDCardApi.create(formData);
            } else if (mode === 'edit' && idCardId) {
                await studentIDCardApi.update(idCardId, formData);
            }
            onSuccess();
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to save ID card');
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
                <Select value={formData.student?.toString()} onValueChange={(v) => setFormData({ ...formData, student: parseInt(v) })} disabled={isViewMode}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                        {studentsData?.results.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.full_name} ({s.admission_number})</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="card_number">Card Number <span className="text-destructive">*</span></Label>
                <Input id="card_number" value={formData.card_number} onChange={(e) => setFormData({ ...formData, card_number: e.target.value })} placeholder="e.g., ID-2024-001" disabled={isViewMode} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="issue_date">Issue Date <span className="text-destructive">*</span></Label>
                    <Input id="issue_date" type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} disabled={isViewMode} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="valid_until">Valid Until <span className="text-destructive">*</span></Label>
                    <Input id="valid_until" type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} disabled={isViewMode} required />
                </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label>Is Reissue</Label>
                    <p className="text-sm text-muted-foreground">Check if this is a replacement card</p>
                </div>
                <Switch checked={formData.is_reissue} onCheckedChange={(c) => setFormData({ ...formData, is_reissue: c })} disabled={isViewMode} />
            </div>

            {formData.is_reissue && (
                <div className="space-y-2">
                    <Label htmlFor="reissue_reason">Reissue Reason</Label>
                    <Textarea id="reissue_reason" value={formData.reissue_reason || ''} onChange={(e) => setFormData({ ...formData, reissue_reason: e.target.value })} placeholder="Reason for reissuing ID card..." disabled={isViewMode} rows={3} />
                </div>
            )}

            {isViewMode && idCard && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={idCard.is_active ? 'default' : 'secondary'}>
                            {idCard.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Created:</span> {new Date(idCard.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Last Updated:</span> {new Date(idCard.updated_at).toLocaleString()}
                    </div>
                </div>
            )}

            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Saving...' : mode === 'create' ? 'Issue ID Card' : 'Update ID Card'}</Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                </div>
            )}
        </form>
    );
}