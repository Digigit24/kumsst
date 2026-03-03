/**
 * Class Times Page
 */

import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useDeleteClassTime } from '../../hooks/useAcademic';
import { invalidateClassTimes, useClassTimesSWR } from '../../hooks/useAcademicSWR';
import { useAuth } from '../../hooks/useAuth';
import { getCurrentUserCollege } from '../../utils/auth.utils';
import { ClassTimeForm } from './components/ClassTimeForm';

import type { ClassTime, ClassTimeCreateInput, ClassTimeFilters } from '../../types/academic.types';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ClassTimesPage() {
    const { user } = useAuth();
    const defaultCollege = getCurrentUserCollege(user as any) || undefined;
    const [selectedCollege, setSelectedCollege] = useState<number | undefined>(defaultCollege);
    const [filters, setFilters] = useState<ClassTimeFilters>({ page: 1, page_size: 20, college: defaultCollege });
    const { data, isLoading, error, refresh } = useClassTimesSWR(filters);

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedClassTime, setSelectedClassTime] = useState<ClassTime | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [prefill, setPrefill] = useState<Partial<ClassTimeCreateInput> | null>(null);

    const deleteMutation = useDeleteClassTime();
    const classTimes = data?.results || [];

    // keep filters in sync with selected college
    useEffect(() => {
        setFilters((prev) => ({ ...prev, page: 1, college: selectedCollege }));
    }, [selectedCollege]);

    const toMinutes = (t: string) => {
        // Handle both 12-hour format (e.g., "01:22 PM") and 24-hour format (e.g., "13:22" or "13:22:00")
        if (t.includes('AM') || t.includes('PM')) {
            // 12-hour format with AM/PM
            const isPM = t.includes('PM');
            const timeStr = t.replace(/\s*(AM|PM)\s*/i, '').trim();
            const [h, m] = timeStr.split(':').map(Number);
            let hours = h || 0;

            // Convert to 24-hour format
            if (isPM && hours !== 12) {
                hours += 12;
            } else if (!isPM && hours === 12) {
                hours = 0;
            }

            return hours * 60 + (m || 0);
        } else {
            // 24-hour format (HH:MM or HH:MM:SS)
            const parts = t.split(':');
            const h = parseInt(parts[0]) || 0;
            const m = parseInt(parts[1]) || 0;
            return h * 60 + m;
        }
    };

    const formatTimeDisplay = (time24: string) => {
        const [h, m] = time24.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hours = h % 12 || 12;
        const minutes = String(m || 0).padStart(2, '0');
        return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
    };

    const timelineSlots = useMemo(() => {
        // Only generate timeline slots if we have actual class times
        if (classTimes.length === 0) {
            return [];
        }

        const times = classTimes.map(ct => toMinutes(ct.start_time));
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const startHour = Math.max(0, Math.floor(minTime / 60));
        const endHour = Math.min(24, Math.ceil(maxTime / 60) + 1);
        const slots: { start: string; end: string }[] = [];
        for (let h = startHour; h < endHour; h++) {
            const start = `${String(h).padStart(2, '0')}:00`;
            const end = `${String(h + 1).padStart(2, '0')}:00`;
            slots.push({ start, end });
        }
        return slots;
    }, [classTimes]);

    const handleAdd = () => {
        setSelectedClassTime(null);
        setSidebarMode('create');

        const usedNumbers = classTimes.map(ct => ct.period_number);
        let nextFree = 1;
        while (usedNumbers.includes(nextFree)) nextFree++;

        setPrefill({ period_number: nextFree });
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('Class time deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            await invalidateClassTimes();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete class time');
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <div className="mb-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <div>
                            <h2 className="text-xl font-semibold">Weekly Timetable (time slots)</h2>
                            <p className="text-sm text-muted-foreground">Tap a cell to add or edit a class time.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => refresh()}
                            disabled={isLoading}
                            aria-label="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button onClick={handleAdd}>Add Time Slot</Button>
                    </div>
                </div>
                {error && <p className="text-destructive text-sm mt-2">{String(error)}</p>}

                {isLoading || !data ? (
                    <div className="flex items-center justify-center py-12 rounded-lg border bg-muted/30">
                        <div className="flex flex-col items-center gap-2">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading class times...</p>
                        </div>
                    </div>
                ) : classTimes.length === 0 ? (
                    <div className="flex items-center justify-center py-12 rounded-lg border bg-muted/30">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                            <p className="text-sm font-medium">No class times configured</p>
                            <p className="text-xs text-muted-foreground">Click "Add Time Slot" to create your first time slot</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <div className="min-w-[900px]">
                            <div className="grid grid-cols-8 bg-muted/50 border-b text-sm font-semibold">
                                <div className="px-3 py-2">Time</div>
                                {DAYS_OF_WEEK.map((day) => (
                                    <div key={day} className="px-3 py-2 text-center">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="divide-y">
                                {timelineSlots.map((slot) => {
                                    const entries = classTimes.filter(ct => {
                                        const ctStart = toMinutes(ct.start_time);
                                        const slotStart = toMinutes(slot.start);
                                        const slotEnd = toMinutes(slot.end);
                                        return ctStart >= slotStart && ctStart < slotEnd;
                                    });
                                    const existing = entries[0];
                                    return (
                                        <div key={slot.start} className="grid grid-cols-8">
                                            <div className="px-3 py-3 bg-muted/30 border-r font-medium text-sm flex flex-col">
                                                <span>{formatTimeDisplay(slot.start)} - {formatTimeDisplay(slot.end)}</span>
                                            </div>
                                            {DAYS_OF_WEEK.map((day) => (
                                                <div
                                                    key={day}
                                                    className="px-2 py-3 border-r last:border-r-0 hover:bg-primary/5 transition cursor-pointer"
                                                    onClick={() => {
                                                        const target = entries[0];
                                                        if (target) {
                                                            setSelectedClassTime(target);
                                                            setSidebarMode('edit');
                                                            setPrefill(null);
                                                        } else {
                                                            setSelectedClassTime(null);
                                                            setSidebarMode('create');
                                                            const usedNumbers = classTimes.map(ct => ct.period_number);
                                                            let nextFree = 1;
                                                            while (usedNumbers.includes(nextFree)) nextFree++;

                                                            setPrefill({
                                                                start_time: slot.start,
                                                                end_time: slot.end,
                                                                period_number: nextFree,
                                                                college: selectedCollege,
                                                            });
                                                        }
                                                        setIsSidebarOpen(true);
                                                    }}
                                                >
                                                    {entries.length > 0 ? (
                                                        entries.map((ct) => (
                                                            <motion.div
                                                                key={ct.id}
                                                                whileHover={{ scale: 1.01 }}
                                                                className="flex items-center justify-between rounded border border-primary/30 bg-primary/10 px-2 py-1 text-xs mb-1 last:mb-0"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold">Period {ct.period_number}</span>
                                                                    <span className="text-[10px] text-muted-foreground">{ct.start_time} - {ct.end_time}</span>
                                                                    {ct.is_break && <span className="text-[10px] text-muted-foreground">Break{ct.break_name ? ` · ${ct.break_name}` : ''}</span>}
                                                                </div>
                                                                <Badge variant={ct.is_active ? 'success' : 'secondary'} className="text-[10px]">
                                                                    {ct.is_active ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground flex items-center justify-center h-full">
                                                            Tap to add
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && data && classTimes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">Class times are global slots; use the grid for a timetable-like view.</p>
                )}
            </div>

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={sidebarMode === 'create' ? 'Create Time Slot' : 'Edit Time Slot'}
                mode={sidebarMode}
            >
                {sidebarMode === 'edit' && selectedClassTime && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setDeleteId(selectedClassTime.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
                <ClassTimeForm
                    mode={sidebarMode}
                    classTimeId={selectedClassTime?.id}
                    prefill={prefill || undefined}
                    existingClassTimes={classTimes}
                    onSuccess={async () => { setIsSidebarOpen(false); await invalidateClassTimes(); }}
                    onCancel={() => setIsSidebarOpen(false)}
                />
            </DetailSidebar>

            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Class Time"
                description="Are you sure you want to delete this class time? This action cannot be undone."
                variant="destructive"
            />
        </div >
    );
}
