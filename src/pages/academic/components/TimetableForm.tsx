/**
 * Timetable Form Component
 * Enhanced with proper field mapping and better UX
 * Uses SWR for caching dropdown data to prevent unnecessary API calls
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import {
    useClassesSWR,
    useClassroomsSWR,
    useClassTimesSWR,
    useSectionsFilteredByClass,
    useSubjectAssignmentsSWR,
} from '@/hooks/useAcademicSWR';
import { useAuth } from '@/hooks/useAuth';
import { useTeachersSWR } from '@/hooks/useTeachersSWR';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { timetableApi } from '../../../services/academic.service';
import type { TimetableCreateInput } from '../../../types/academic.types';

interface TimetableFormProps {
    mode: 'view' | 'create' | 'edit';
    timetableId?: number;
    prefilledData?: Partial<TimetableCreateInput>; // re-added
    onSuccess: () => void;
    onCancel: () => void;
    lockContextFields?: boolean;
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
];

export function TimetableForm({ mode, timetableId, prefilledData, onSuccess, onCancel, lockContextFields }: TimetableFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const collegeId = getCurrentUserCollege(user as any) || 0;

    const [formData, setFormData] = useState<TimetableCreateInput>({
        college: collegeId,
        class_obj: 0,
        section: 0,
        subject_assignment: 0,
        day_of_week: 0,
        class_time: 0,
        teacher: undefined,
        classroom: undefined,
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: undefined,
        is_active: true,
        ...prefilledData, // Merge prefilled data
    });

    // SWR hooks for dropdown data - cached across form open/close
    // Pass null when dependent filter is missing to skip fetching entirely
    const { results: classes, isLoading: loadingClasses } = useClassesSWR(
        formData.college ? { college: formData.college, is_active: true, page_size: DROPDOWN_PAGE_SIZE } : null
    );

    // Prefetch all sections once, filter client-side by class — instant switching
    const { results: sections, isLoading: loadingSections } = useSectionsFilteredByClass(
        formData.class_obj || undefined
    );

    const { results: subjectAssignments, isLoading: loadingAssignments } = useSubjectAssignmentsSWR(
        formData.section ? { section: formData.section, is_active: true, page_size: DROPDOWN_PAGE_SIZE } : null
    );

    const { results: classTimes, isLoading: loadingClassTimes } = useClassTimesSWR(
        formData.college ? { college: formData.college, is_active: true, page_size: DROPDOWN_PAGE_SIZE } : null
    );

    const { results: classrooms, isLoading: loadingClassrooms } = useClassroomsSWR(
        { is_active: true, page_size: DROPDOWN_PAGE_SIZE }
    );

    const { results: teachers, isLoading: loadingTeachers } = useTeachersSWR(
        { is_active: true, page_size: DROPDOWN_PAGE_SIZE }
    );

    // Fetch timetable data for edit/view mode
    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && timetableId) {
            fetchTimetable();
        }
    }, [mode, timetableId]);

    // Reset dependent fields when class changes
    useEffect(() => {
        if (!formData.class_obj) {
            setFormData(prev => ({ ...prev, section: 0, subject_assignment: 0 }));
        }
    }, [formData.class_obj]);

    // Reset subject assignment when section changes
    useEffect(() => {
        if (!formData.section) {
            setFormData(prev => ({ ...prev, subject_assignment: 0 }));
        }
    }, [formData.section]);

    const fetchTimetable = async () => {
        if (!timetableId) return;
        try {
            setIsFetching(true);
            const data = await timetableApi.get(timetableId);
            setFormData({
                college: data.college || getCurrentUserCollege(user as any) || 0, // ✅ Use from data or fallback
                class_obj: data.class_obj,
                section: data.section,
                subject_assignment: data.subject_assignment,
                day_of_week: data.day_of_week,
                class_time: data.class_time,
                teacher: (data as any).teacher || undefined,
                classroom: data.classroom || undefined,
                effective_from: data.effective_from,
                effective_to: data.effective_to || undefined,
                is_active: data.is_active,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch timetable');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.class_obj) {
            setError('Please select a class');
            return;
        }
        if (!formData.section) {
            setError('Please select a section');
            return;
        }
        if (!formData.subject_assignment) {
            setError('Please select a subject assignment');
            return;
        }
        if (!formData.class_time) {
            setError('Please select a class time');
            return;
        }
        if (!formData.effective_from) {
            setError('Please enter an effective from date');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (mode === 'create') {
                await timetableApi.create(formData);
            } else if (mode === 'edit' && timetableId) {
                await timetableApi.update(timetableId, formData);
            }

            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to save timetable';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading timetable details...</p>
                </div>
            </div>
        );
    }

    const isViewMode = mode === 'view';
    const selectedClass = classes.find(c => c.id === formData.class_obj);

    const selectedAssignment = subjectAssignments.find(a => a.id === formData.subject_assignment);
    const selectedTime = classTimes.find(t => t.id === formData.class_time);
    const selectedDay = DAYS_OF_WEEK.find(d => d.value === formData.day_of_week);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-destructive">Error</h4>
                            <p className="text-sm text-destructive/90 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}



            {/* Class Selection - Hidden when lockContextFields is true */}
            {!lockContextFields && (
                <div className="space-y-2">
                    <Label htmlFor="class">
                        Class <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={formData.class_obj?.toString()}
                        onValueChange={(v) => setFormData({ ...formData, class_obj: parseInt(v), section: 0, subject_assignment: 0 })}
                        disabled={isViewMode}
                    >
                        <SelectTrigger id="class">
                            <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.name} - {c.program_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedClass && (
                        <p className="text-xs text-muted-foreground">
                            {selectedClass.program_name} • {selectedClass.session_name}
                        </p>
                    )}
                </div>
            )}

            {/* Section Selection - Hidden when lockContextFields is true */}
            {!lockContextFields && (
                <div className="space-y-2">
                    <Label htmlFor="section">
                        Section <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={formData.section?.toString()}
                        onValueChange={(v) => setFormData({ ...formData, section: parseInt(v), subject_assignment: 0 })}
                        disabled={isViewMode || !formData.class_obj || loadingSections}
                    >
                        <SelectTrigger id="section">
                            <SelectValue placeholder={
                                loadingSections ? "Loading sections..." :
                                    !formData.class_obj ? "Select a class first" :
                                        sections.length === 0 ? "No sections available" :
                                            "Select section"
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            {sections.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Subject Assignment Selection */}
            <div className="space-y-2">
                <Label htmlFor="subject_assignment">
                    Subject Assignment <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={formData.subject_assignment?.toString()}
                    onValueChange={(v) => setFormData({ ...formData, subject_assignment: parseInt(v) })}
                    disabled={isViewMode || !formData.section || loadingAssignments}
                >
                    <SelectTrigger id="subject_assignment">
                        <SelectValue placeholder={
                            loadingAssignments ? "Loading subjects..." :
                                !formData.section ? "Select a section first" :
                                    subjectAssignments.length === 0 ? "No subject assignments available" :
                                        "Select subject"
                        } />
                    </SelectTrigger>
                    <SelectContent>
                        {subjectAssignments.map((a) => {
                            const teacherName = (a as any).teacher_details?.full_name || a.teacher_name || 'No Teacher';
                            const subjectName = a.subject_name || 'Unknown Subject';
                            return (
                                <SelectItem key={a.id} value={a.id.toString()}>
                                    {subjectName} - {teacherName}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                {selectedAssignment && (
                    <p className="text-xs text-muted-foreground">
                        Teacher: {(selectedAssignment as any).teacher_details?.full_name || selectedAssignment.teacher_name || 'Not assigned'}
                    </p>
                )}
            </div>

            {/* Teacher Override Selection */}
            <div className="space-y-2">
                <Label htmlFor="teacher">
                    Teacher Override <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Select
                    value={formData.teacher?.toString() || 'default'}
                    onValueChange={(v) => setFormData({ ...formData, teacher: v === 'default' ? undefined : v })}
                    disabled={isViewMode || loadingTeachers}
                >
                    <SelectTrigger id="teacher">
                        <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Use subject assignment teacher"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Use subject assignment teacher</SelectItem>
                        {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                                {t.full_name || `${t.first_name} ${t.last_name}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Override the default teacher from subject assignment for this specific time slot
                </p>
            </div>

            {/* Day and Time */}
            {!lockContextFields && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="day">
                                Day of Week <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.day_of_week?.toString()}
                                onValueChange={(v) => setFormData({ ...formData, day_of_week: parseInt(v) })}
                                disabled={isViewMode}
                            >
                                <SelectTrigger id="day">
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <SelectItem key={day.value} value={day.value.toString()}>
                                            {day.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class_time">
                                Class Time <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.class_time?.toString()}
                                onValueChange={(v) => setFormData({ ...formData, class_time: parseInt(v) })}
                                disabled={isViewMode}
                            >
                                <SelectTrigger id="class_time">
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classTimes.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            Period {t.period_number}: {t.start_time} - {t.end_time}
                                            {t.is_break && ' (Break)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Schedule Summary */}
                    {selectedDay && selectedTime && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-blue-900 dark:text-blue-100">
                                <strong>{selectedDay.label}</strong> at <strong>{selectedTime.start_time} - {selectedTime.end_time}</strong>
                            </span>
                        </div>
                    )}
                </>
            )}

            {/* Classroom Selection */}
            <div className="space-y-2">
                <Label htmlFor="classroom">
                    Classroom <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Select
                    value={formData.classroom?.toString() || undefined}
                    onValueChange={(v) => setFormData({ ...formData, classroom: v ? parseInt(v) : undefined })}
                    disabled={isViewMode}
                >
                    <SelectTrigger id="classroom">
                        <SelectValue placeholder="Select classroom (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        {classrooms.map((r) => (
                            <SelectItem key={r.id} value={r.id.toString()}>
                                {r.name} ({r.code}) - Capacity: {r.capacity}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Effective Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="effective_from">
                        Effective From <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="effective_from"
                        type="date"
                        value={formData.effective_from}
                        onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                        disabled={isViewMode}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="effective_to">
                        Effective To <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input
                        id="effective_to"
                        type="date"
                        value={formData.effective_to || ''}
                        onChange={(e) => setFormData({ ...formData, effective_to: e.target.value || undefined })}
                        disabled={isViewMode}
                        min={formData.effective_from}
                    />
                </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                        {formData.is_active ? 'This timetable entry is active' : 'This timetable entry is inactive'}
                    </p>
                </div>
                <Switch
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                    disabled={isViewMode}
                />
            </div>

            {/* Action Buttons */}
            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Timetable Entry' : 'Update Timetable Entry'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </form>
    );
}