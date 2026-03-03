/**
 * Student Promotion Form Component
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useState, useEffect } from 'react';
import { studentPromotionApi } from '../../../services/students.service';
import { useStudents } from '../../../hooks/useStudents';
import { useClassesSWR } from '../../../hooks/swr';
import { useAcademicYears } from '../../../hooks/useCore';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { StudentPromotion, StudentPromotionCreateInput } from '../../../types/students.types';
import { Skeleton } from '../../../components/ui/skeleton';

interface StudentPromotionFormProps {
    mode: 'view' | 'create' | 'edit';
    promotionId?: number;
    collegeId?: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function StudentPromotionForm({ mode, promotionId, collegeId, onSuccess, onCancel }: StudentPromotionFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [promotion, setPromotion] = useState<StudentPromotion | null>(null);

    const studentFilters = {
        page_size: DROPDOWN_PAGE_SIZE,
        is_active: true,
        ...(collegeId ? { college: collegeId } : {}),
    };
    const { data: studentsData, isLoading: isLoadingStudents } = useStudents(studentFilters);
    const { data: classesData, isLoading: isLoadingClasses } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { data: yearsData, isLoading: isLoadingYears } = useAcademicYears({ page_size: DROPDOWN_PAGE_SIZE });

    const restrictByCollege = typeof collegeId !== 'undefined';
    const filteredStudents =
        studentsData?.results?.filter((student) => {
            if (!restrictByCollege) return true;
            if (collegeId === null) return false;
            return student.college === collegeId;
        }) || [];
    const disableStudentSelect = mode === 'view' || (restrictByCollege && collegeId === null);

    const [formData, setFormData] = useState<StudentPromotionCreateInput>({
        student: 0,
        from_class: 0,
        to_class: 0,
        from_section: null,
        to_section: null,
        promotion_date: new Date().toISOString().split('T')[0],
        academic_year: 0,
        remarks: '',
        is_active: true,
    });

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && promotionId) {
            fetchPromotion();
        }
    }, [mode, promotionId]);

    const fetchPromotion = async () => {
        if (!promotionId) return;
        try {
            setIsFetching(true);
            const data = await studentPromotionApi.get(promotionId);
            setPromotion(data);
            setFormData({
                student: data.student,
                from_class: data.from_class,
                to_class: data.to_class,
                from_section: data.from_section,
                to_section: data.to_section,
                promotion_date: data.promotion_date,
                academic_year: data.academic_year,
                remarks: data.remarks || '',
                is_active: data.is_active !== undefined ? data.is_active : true,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch promotion');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (restrictByCollege) {
            const exists = filteredStudents.some((s) => s.id === formData.student);
            if (!exists && formData.student !== 0) {
                setFormData((prev) => ({ ...prev, student: 0 }));
            }
        }
    }, [restrictByCollege, collegeId, studentsData, formData.student, filteredStudents]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.student || !formData.from_class || !formData.to_class || !formData.academic_year) {
            setError('Please fill all required fields');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            if (mode === 'create') {
                await studentPromotionApi.create(formData);
            } else if (mode === 'edit' && promotionId) {
                await studentPromotionApi.update(promotionId, formData);
            }
            onSuccess();
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to save promotion');
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
                {isLoadingStudents ? (
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
                )}
            </div>

            <div className="space-y-2">
                <Label>From Class <span className="text-destructive">*</span></Label>
                {isLoadingClasses ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select value={formData.from_class?.toString()} onValueChange={(v) => setFormData({ ...formData, from_class: parseInt(v) })} disabled={isViewMode}>
                        <SelectTrigger><SelectValue placeholder="Select current class" /></SelectTrigger>
                        <SelectContent>
                            {classesData?.results.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="space-y-2">
                <Label>To Class <span className="text-destructive">*</span></Label>
                {isLoadingClasses ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select value={formData.to_class?.toString()} onValueChange={(v) => setFormData({ ...formData, to_class: parseInt(v) })} disabled={isViewMode}>
                        <SelectTrigger><SelectValue placeholder="Select promotion class" /></SelectTrigger>
                        <SelectContent>
                            {classesData?.results.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="space-y-2">
                <Label>Academic Year <span className="text-destructive">*</span></Label>
                {isLoadingYears ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select value={formData.academic_year?.toString()} onValueChange={(v) => setFormData({ ...formData, academic_year: parseInt(v) })} disabled={isViewMode}>
                        <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                        <SelectContent>
                            {yearsData?.results.map((y) => (
                                <SelectItem key={y.id} value={y.id.toString()}>
                                    {y.year} {y.is_current && '(Current)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="promotion_date">Promotion Date <span className="text-destructive">*</span></Label>
                <Input id="promotion_date" type="date" value={formData.promotion_date} onChange={(e) => setFormData({ ...formData, promotion_date: e.target.value })} disabled={isViewMode} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" value={formData.remarks || ''} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Enter any remarks..." disabled={isViewMode} rows={3} />
            </div>

            {isViewMode && promotion && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                            {promotion.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Created:</span> {new Date(promotion.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Last Updated:</span> {new Date(promotion.updated_at).toLocaleString()}
                    </div>
                </div>
            )}

            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Saving...' : mode === 'create' ? 'Promote Student' : 'Update Promotion'}</Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                </div>
            )}
        </form>
    );
}
