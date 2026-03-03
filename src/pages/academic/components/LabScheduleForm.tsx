/**
 * Lab Schedule Form Component
 * Uses SWR for caching dropdown data to prevent unnecessary API calls
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useAuth } from '@/hooks/useAuth';
import {
    useAllSectionsSWR,
    useClassroomsSWR,
    useClassTimesSWR,
    useSubjectAssignmentsSWR,
} from '@/hooks/useAcademicSWR';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { labScheduleApi } from '../../../services/academic.service';
import type { LabScheduleCreateInput } from '../../../types/academic.types';

interface LabScheduleFormProps {
    mode: 'view' | 'create' | 'edit';
    labScheduleId?: number;
    onSuccess: () => void;
    onCancel: () => void;
    prefilledData?: Partial<LabScheduleCreateInput>;
    lockContextFields?: boolean;
}

export function LabScheduleForm({ mode, labScheduleId, onSuccess, onCancel, prefilledData, lockContextFields }: LabScheduleFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const collegeId = getCurrentUserCollege(user as any) || 0;

    const [formData, setFormData] = useState<LabScheduleCreateInput>({
        college: collegeId,
        subject_assignment: 0,
        section: 0,
        day_of_week: 1,
        start_time: '',
        end_time: '',
        classroom: null,
        batch_name: null,
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: null,
        is_active: true,
        ...prefilledData,
    });

    // SWR hooks for dropdown data - cached across form open/close
    const { results: subjectAssignments, isLoading: loadingAssignments } = useSubjectAssignmentsSWR(
        { is_active: true, page_size: DROPDOWN_PAGE_SIZE }
    );

    // Use shared prefetched sections cache
    const { results: sections, isLoading: loadingSections } = useAllSectionsSWR();

    const { results: classrooms, isLoading: loadingClassrooms } = useClassroomsSWR(
        { is_active: true, page_size: DROPDOWN_PAGE_SIZE }
    );

    const { results: classTimes, isLoading: loadingClassTimes } = useClassTimesSWR(
        collegeId ? { college: collegeId, is_active: true, page_size: DROPDOWN_PAGE_SIZE } : undefined
    );

    const loadingData = loadingAssignments || loadingSections || loadingClassrooms || loadingClassTimes;

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && labScheduleId) {
            fetchLabSchedule();
        }
    }, [mode, labScheduleId]);

    useEffect(() => {
        if (prefilledData && mode === 'create') {
            setFormData((prev) => ({ ...prev, ...prefilledData }));
        }
    }, [prefilledData, mode]);

    const fetchLabSchedule = async () => {
        if (!labScheduleId) return;
        try {
            setIsFetching(true);
            const data = await labScheduleApi.get(labScheduleId);
            setFormData({
                subject_assignment: data.subject_assignment,
                section: data.section,
                day_of_week: data.day_of_week,
                start_time: data.start_time,
                end_time: data.end_time,
                classroom: data.classroom,
                batch_name: data.batch_name,
                effective_from: data.effective_from,
                effective_to: data.effective_to,
                is_active: data.is_active,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch lab schedule');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.subject_assignment) {
            setError('Please select a subject assignment');
            return;
        }
        if (!formData.section) {
            setError('Please select a section');
            return;
        }
        if (!formData.start_time || !formData.end_time) {
            setError('Please enter both start and end times');
            return;
        }
        if (formData.start_time >= formData.end_time) {
            setError('End time must be after start time');
            return;
        }

        // Helper to convert 12h time to 24h format for backend
        const convertTo24Hour = (timeStr: string) => {
            if (!timeStr) return '';
            // Return as represents if checking for 24h is complicated or assume inputs from select are 12h 
            // format "hh:mm AM/PM"
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return timeStr; // Assumes already valid if no match

            let [_, hoursStr, minutes, modifier] = match;
            let hours = parseInt(hoursStr, 10);

            if (modifier.toUpperCase() === 'PM' && hours < 12) {
                hours += 12;
            }
            if (modifier.toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
            }

            return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
        };

        const payload = {
            ...formData,
            start_time: convertTo24Hour(formData.start_time),
            end_time: convertTo24Hour(formData.end_time),
        };

        try {
            setIsLoading(true);
            setError(null);
            if (mode === 'create') {
                await labScheduleApi.create(payload);
            } else if (mode === 'edit' && labScheduleId) {
                await labScheduleApi.update(labScheduleId, payload);
            }
            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to save lab schedule';
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
                    <p className="text-sm text-muted-foreground">Loading lab schedule details...</p>
                </div>
            </div>
        );
    }

    const isViewMode = mode === 'view';

    const dayOptions = [
        { value: 0, label: 'Monday' },
        { value: 1, label: 'Tuesday' },
        { value: 2, label: 'Wednesday' },
        { value: 3, label: 'Thursday' },
        { value: 4, label: 'Friday' },
        { value: 5, label: 'Saturday' },
        { value: 6, label: 'Sunday' },
    ];

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

            <div className="grid gap-6">
                {/* Primary Assignment Details */}
                <div className={`grid gap-4 ${lockContextFields ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
                    <div className="space-y-2">
                        <Label htmlFor="subject_assignment">
                            Subject Assignment <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.subject_assignment?.toString()}
                            onValueChange={(v) => setFormData({ ...formData, subject_assignment: parseInt(v) })}
                            disabled={isViewMode || loadingData}
                        >
                            <SelectTrigger id="subject_assignment" className="h-10">
                                <SelectValue placeholder={loadingData ? <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</span> : "Select subject assignment"} />
                            </SelectTrigger>
                            <SelectContent>
                                {subjectAssignments.map((sa) => (
                                    <SelectItem key={sa.id} value={sa.id.toString()}>
                                        {sa.subject_name} - {sa.class_name} ({sa.teacher_name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!lockContextFields && (
                        <div className="space-y-2">
                            <Label htmlFor="section">
                                Section <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.section?.toString()}
                                onValueChange={(v) => setFormData({ ...formData, section: parseInt(v) })}
                                disabled={isViewMode || loadingData}
                            >
                                <SelectTrigger id="section" className="h-10">
                                    <SelectValue placeholder={loadingData ? <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</span> : "Select section"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name} - {s.class_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Schedule Configuration - Only show when not locked from timetable */}
                {!lockContextFields && (
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
                            <h3 className="font-semibold leading-none tracking-tight">Schedule Configuration</h3>
                            <p className="text-sm text-muted-foreground">Set the day and time for this lab session.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="day_of_week">
                                        Day of Week <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.day_of_week.toString()}
                                        onValueChange={(v) => setFormData({ ...formData, day_of_week: parseInt(v) })}
                                        disabled={isViewMode}
                                    >
                                        <SelectTrigger id="day_of_week">
                                            <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dayOptions.map((day) => (
                                                <SelectItem key={day.value} value={day.value.toString()}>
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="class_time">
                                        Period <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.start_time && formData.end_time ?
                                            classTimes.find(ct =>
                                                ct.start_time === formData.start_time &&
                                                ct.end_time === formData.end_time
                                            )?.id.toString() : undefined
                                        }
                                        onValueChange={(v) => {
                                            const selectedTime = classTimes.find(ct => ct.id.toString() === v);
                                            if (selectedTime) {
                                                setFormData({
                                                    ...formData,
                                                    start_time: selectedTime.start_time,
                                                    end_time: selectedTime.end_time
                                                });
                                            }
                                        }}
                                        disabled={isViewMode || loadingData}
                                    >
                                        <SelectTrigger id="class_time">
                                            <SelectValue placeholder={loadingData ? <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading periods...</span> : "Select a period"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classTimes.map((classTime) => (
                                                <SelectItem key={classTime.id} value={classTime.id.toString()}>
                                                    Period {classTime.period_number} ({classTime.start_time} - {classTime.end_time})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location & Grouping */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
                        <h3 className="font-semibold leading-none tracking-tight">Location & Batch</h3>
                        <p className="text-sm text-muted-foreground">Specify where and for whom this lab is held.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="classroom">
                                    Classroom / Lab <span className="text-muted-foreground text-xs">(Optional)</span>
                                </Label>
                                <Select
                                    value={formData.classroom?.toString() || undefined}
                                    onValueChange={(v) => setFormData({ ...formData, classroom: v ? parseInt(v) : null })}
                                    disabled={isViewMode || loadingData}
                                >
                                    <SelectTrigger id="classroom">
                                        <SelectValue placeholder={loadingData ? <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</span> : "Select classroom"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name} ({c.code}) - Capacity: {c.capacity}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="batch_name">
                                    Batch Name <span className="text-muted-foreground text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="batch_name"
                                    value={formData.batch_name || ''}
                                    onChange={(e) => setFormData({ ...formData, batch_name: e.target.value || null })}
                                    placeholder="e.g., Batch A, Group 1"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validity Period */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
                        <h3 className="font-semibold leading-none tracking-tight">Validity Period</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-2">
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
                                    onChange={(e) => setFormData({ ...formData, effective_to: e.target.value || null })}
                                    disabled={isViewMode}
                                    min={formData.effective_from}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                        {formData.is_active ? 'This lab schedule is active and visible in timetables' : 'This lab schedule is inactive'}
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
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Lab Schedule' : 'Update Lab Schedule'}
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
