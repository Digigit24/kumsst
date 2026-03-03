/**
 * Subject Form Component
 */

import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { subjectApi } from '../../../services/academic.service';
import type { SubjectCreateInput } from '../../../types/academic.types';

interface SubjectFormProps {
    mode: 'view' | 'create' | 'edit';
    subjectId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const SUBJECT_TYPES = [
    { value: 'theory', label: 'Theory' },
    { value: 'practical', label: 'Practical' },
    { value: 'both', label: 'Theory & Practical' },
];

export function SubjectForm({ mode, subjectId, onSuccess, onCancel }: SubjectFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const [formData, setFormData] = useState<SubjectCreateInput>({
        college: getCurrentUserCollege(user as any) || 0,
        code: '',
        name: '',
        short_name: '',
        subject_type: 'theory',
        credits: 3,
        theory_hours: 3,
        practical_hours: 0,
        max_marks: 100,
        pass_marks: 40,
        description: '',
        is_active: true,
    });

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && subjectId) {
            fetchSubject();
        }
    }, [mode, subjectId]);

    const fetchSubject = async () => {
        if (!subjectId) return;
        try {
            setIsFetching(true);
            const data = await subjectApi.get(subjectId);
            setFormData({
                college: data.college,
                code: data.code,
                name: data.name,
                short_name: data.short_name,
                subject_type: data.subject_type,
                credits: data.credits,
                theory_hours: data.theory_hours,
                practical_hours: data.practical_hours,
                max_marks: data.max_marks,
                pass_marks: data.pass_marks,
                description: data.description || '',
                is_active: data.is_active,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch subject');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);

            if (mode === 'create') {
                await subjectApi.create(formData);
            } else if (mode === 'edit' && subjectId) {
                await subjectApi.update(subjectId, formData);
            }
            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to save subject';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="flex items-center justify-center py-8"><p className="text-muted-foreground">Loading...</p></div>;

    const isViewMode = mode === 'view';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm text-destructive">{error}</p></div>}



            <div className="space-y-2">
                <Label>Subject Code <span className="text-destructive">*</span></Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., CS101" disabled={isViewMode} required />
            </div>

            <div className="space-y-2">
                <Label>Subject Name <span className="text-destructive">*</span></Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Data Structures" disabled={isViewMode} required />
            </div>

            <div className="space-y-2">
                <Label>Short Name <span className="text-destructive">*</span></Label>
                <Input value={formData.short_name} onChange={(e) => setFormData({ ...formData, short_name: e.target.value })} placeholder="e.g., DS" disabled={isViewMode} required />
            </div>

            <div className="space-y-2">
                <Label>Subject Type</Label>
                <Select value={formData.subject_type} onValueChange={(v) => setFormData({ ...formData, subject_type: v })} disabled={isViewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {SUBJECT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Credits</Label>
                    <Input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} min={0} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                    <Label>Theory Hours</Label>
                    <Input type="number" value={formData.theory_hours} onChange={(e) => setFormData({ ...formData, theory_hours: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} min={0} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                    <Label>Practical Hours</Label>
                    <Input type="number" value={formData.practical_hours} onChange={(e) => setFormData({ ...formData, practical_hours: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} min={0} disabled={isViewMode} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Max Marks</Label>
                    <Input type="number" value={formData.max_marks} onChange={(e) => setFormData({ ...formData, max_marks: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} min={1} disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                    <Label>Pass Marks</Label>
                    <Input type="number" value={formData.pass_marks} onChange={(e) => setFormData({ ...formData, pass_marks: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} min={1} disabled={isViewMode} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter subject description..." disabled={isViewMode} rows={3} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
                <Label>Active Status</Label>
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} disabled={isViewMode} />
            </div>

            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Saving...' : mode === 'create' ? 'Create Subject' : 'Update Subject'}</Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                </div>
            )}
        </form>
    );
}