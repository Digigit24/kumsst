/**
 * Timetables Page
 * Enhanced with Grid View and Interactive Selection
 */

import { Calendar, Clock, Edit2, LayoutGrid, Loader2, MapPin, Plus, Trash2, User } from 'lucide-react';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SkeletonDropdown } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { useDeleteLabSchedule, useDeleteTimetable } from '../../hooks/useAcademic';
import { invalidateLabSchedules, invalidateTimetables, useClassesSWR, useClassTimesSWR, useLabSchedulesSWR, useSectionsFilteredByClass, useTimetablesSWR } from '../../hooks/useAcademicSWR';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import type { ClassTime, LabSchedule, LabScheduleCreateInput, LabScheduleFilters, TimetableCreateInput, TimetableFilters } from '../../types/academic.types';
import { canSwitchCollege, getCurrentUserCollege } from '../../utils/auth.utils';
import { LabScheduleForm } from './components/LabScheduleForm';
import { TimetableForm } from './components/TimetableForm';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
];

export default function TimetablesPage() {
    const { user } = useAuth();
    const storageCollegeKey = 'kumss_super_admin_selected_college';
    const storageClassKey = 'kumss_timetable_selected_class';
    const storageSectionKey = 'kumss_timetable_selected_section';

    const readSelectedCollege = () => {
        // If user cannot switch colleges (e.g. College Admin), always use their assigned college
        if (user && !canSwitchCollege(user)) {
            return getCurrentUserCollege(user) || null;
        }

        // For users who can switch (Super Admin), check localStorage first
        try {
            const stored = localStorage.getItem(storageCollegeKey);
            if (stored !== null) {
                const parsed = JSON.parse(stored);
                return parsed === null ? null : Number(parsed);
            }
        } catch (err) {
            console.error('Failed to read stored college selection:', err);
        }
        return getCurrentUserCollege(user) || null;
    };

    const readSelectedClass = () => {
        try {
            const stored = localStorage.getItem(storageClassKey);
            return stored !== null ? Number(JSON.parse(stored)) : null;
        } catch (err) {
            console.error('Failed to read stored class selection:', err);
            return null;
        }
    };

    const readSelectedSection = () => {
        try {
            const stored = localStorage.getItem(storageSectionKey);
            return stored !== null ? Number(JSON.parse(stored)) : null;
        } catch (err) {
            console.error('Failed to read stored section selection:', err);
            return null;
        }
    };

    const [selectedCollege, setSelectedCollege] = useState<number | null>(() => readSelectedCollege());

    // -- Selection State with Persistence --
    const [selectedClass, setSelectedClass] = useState<number | null>(() => readSelectedClass());
    const [selectedSection, setSelectedSection] = useState<number | null>(() => readSelectedSection());

    // -- SWR Hooks for dropdown data - cached across page visits --
    // Pass null when dependent filter is missing to skip fetching entirely
    const { results: classes, isLoading: loadingClasses } = useClassesSWR(
        selectedCollege ? { college: selectedCollege, page_size: DROPDOWN_PAGE_SIZE, is_active: true } : null
    );

    // Prefetch all sections once, filter client-side by class — instant switching
    const { results: sections, isLoading: loadingSections } = useSectionsFilteredByClass(selectedClass);

    const { results: classTimes, isLoading: loadingClassTimes } = useClassTimesSWR(
        selectedCollege ? { college: selectedCollege, page_size: DROPDOWN_PAGE_SIZE, is_active: true, ordering: 'period_number' } : null
    );

    // -- UI State --
    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [labSidebarMode, setLabSidebarMode] = useState<'create' | 'edit'>('create');
    const [activeTab, setActiveTab] = useState<'lecture' | 'lab'>('lecture');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedTimetableId, setSelectedTimetableId] = useState<number | undefined>(undefined);
    const [prefilledData, setPrefilledData] = useState<Partial<TimetableCreateInput> | undefined>(undefined);
    const [selectedLabId, setSelectedLabId] = useState<number | undefined>(undefined);
    const [labPrefilledData, setLabPrefilledData] = useState<Partial<LabScheduleCreateInput> | undefined>(undefined);

    // Loading state for specific grid cells (format: "day-timeId")
    const [loadingCell, setLoadingCell] = useState<string | null>(null);

    // -- Delete Hooks --
    const deleteTimetable = useDeleteTimetable();
    const deleteLabSchedule = useDeleteLabSchedule();
    const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'lecture' | 'lab' } | null>(null);

    const handleDeleteTimetable = (id: number, e: MouseEvent) => {
        e.stopPropagation();
        setItemToDelete({ id, type: 'lecture' });
    };

    const handleDeleteLab = (id: number, e: MouseEvent) => {
        e.stopPropagation();
        setItemToDelete({ id, type: 'lab' });
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'lecture') {
                await deleteTimetable.mutate(itemToDelete.id);
                toast.success('Lecture deleted successfully');
                await invalidateTimetables();
            } else {
                await deleteLabSchedule.mutate(itemToDelete.id);
                toast.success('Lab session deleted successfully');
                await invalidateLabSchedules();
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete item');
        }
        // Dialog closes automatically via its internal state management which triggers onClose
    };

    // -- Fetch Timetable Data --
    const filters: TimetableFilters = useMemo(() => ({
        page: 1,
        page_size: DROPDOWN_PAGE_SIZE,
        class_obj: selectedClass || undefined,
        section: selectedSection || undefined,
        is_active: true
    }), [selectedClass, selectedSection]);

    const { data: timetableData, refresh } = useTimetablesSWR(filters);

    const labFilters: LabScheduleFilters = useMemo(() => ({
        page: 1,
        page_size: DROPDOWN_PAGE_SIZE,
        section: selectedSection || undefined,
        is_active: true
    }), [selectedSection]);

    const { data: labScheduleData, refresh: refreshLabSchedules } = useLabSchedulesSWR(labFilters);

    const timetables = timetableData?.results || [];
    const labSchedules = labScheduleData?.results || [];

    // -- Effects --

    // Keep selected college in sync with global selection (header/localStorage)
    useEffect(() => {
        setSelectedCollege(readSelectedCollege());
    }, [user]);

    useEffect(() => {
        const syncCollege = () => setSelectedCollege(readSelectedCollege());
        window.addEventListener('storage', syncCollege);
        window.addEventListener('focus', syncCollege);
        return () => {
            window.removeEventListener('storage', syncCollege);
            window.removeEventListener('focus', syncCollege);
        };
    }, [user]);

    // Persist selectedClass to localStorage
    useEffect(() => {
        try {
            if (selectedClass !== null) {
                localStorage.setItem(storageClassKey, JSON.stringify(selectedClass));
            } else {
                localStorage.removeItem(storageClassKey);
            }
        } catch (err) {
            console.error('Failed to persist class selection:', err);
        }
    }, [selectedClass]);

    // Persist selectedSection to localStorage
    useEffect(() => {
        try {
            if (selectedSection !== null) {
                localStorage.setItem(storageSectionKey, JSON.stringify(selectedSection));
            } else {
                localStorage.removeItem(storageSectionKey);
            }
        } catch (err) {
            console.error('Failed to persist section selection:', err);
        }
    }, [selectedSection]);

    // Clear section when class changes (but not on initial load)
    useEffect(() => {
        if (selectedClass !== readSelectedClass()) {
            setSelectedSection(null);
        }
    }, [selectedClass]);

    // -- Handlers --

    const handleCellClick = (day: number, timePeriod: ClassTime) => {
        if (!selectedCollege || !selectedClass || !selectedSection) return;

        const existingEntry = timetables.find(t => t.day_of_week === day && t.class_time === timePeriod.id);
        setActiveTab('lecture');
        setLabSidebarMode('create');
        setSelectedLabId(undefined);
        setLabPrefilledData({
            college: selectedCollege,
            section: selectedSection,
            day_of_week: day,
            start_time: normalizeTime(timePeriod.start_time),
            end_time: normalizeTime(timePeriod.end_time),
            effective_from: new Date().toISOString().split('T')[0],
        });

        if (existingEntry) {
            // Edit Mode - don't set loading
            setSelectedTimetableId(existingEntry.id);
            setSidebarMode('edit');
            setPrefilledData({
                college: selectedCollege,
                class_obj: selectedClass,
                section: selectedSection,
            });
        } else {
            // Create Mode
            setSelectedTimetableId(undefined);
            setSidebarMode('create');
            setPrefilledData({
                college: selectedCollege,
                class_obj: selectedClass,
                section: selectedSection,
                day_of_week: day,
                class_time: timePeriod.id,
                effective_from: new Date().toISOString().split('T')[0]
            });
        }
        setIsSidebarOpen(true);
    };

    const sortedPeriods = [...classTimes].sort((a, b) => a.period_number - b.period_number);

    // Convert time string (12-hour or 24-hour format) to minutes since midnight
    const toMinutes = (t: string | null | undefined): number => {
        if (!t) return 0;

        // Handle 12-hour format (e.g., "01:22 PM")
        if (t.includes('AM') || t.includes('PM')) {
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

    // Convert time to HH:MM format (24-hour) for form inputs
    const normalizeTime = (time?: string | null): string => {
        if (!time) return '';

        // If already in 24-hour format (HH:MM or HH:MM:SS), extract HH:MM
        if (!time.includes('AM') && !time.includes('PM')) {
            return time.slice(0, 5);
        }

        // Convert 12-hour format to 24-hour HH:MM
        const isPM = time.includes('PM');
        const timeStr = time.replace(/\s*(AM|PM)\s*/i, '').trim();
        const [h, m] = timeStr.split(':').map(Number);
        let hours = h || 0;

        // Convert to 24-hour format
        if (isPM && hours !== 12) {
            hours += 12;
        } else if (!isPM && hours === 12) {
            hours = 0;
        }

        return `${String(hours).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
    };

    const getLabsForSlot = (dayValue: number, period: ClassTime): LabSchedule[] => {
        const periodStartMin = toMinutes(period.start_time);
        const periodEndMin = toMinutes(period.end_time);

        return labSchedules.filter((lab) => {
            if (lab.day_of_week !== dayValue) return false;
            const labStartMin = toMinutes(lab.start_time);
            const labEndMin = toMinutes(lab.end_time);

            if (!labStartMin && labStartMin !== 0) return false;
            // Prefer exact match to the period start; otherwise allow overlaps within the period window
            if (labStartMin === periodStartMin) return true;
            return labStartMin >= periodStartMin && (labEndMin ? labStartMin < periodEndMin : true);
        });
    };

    const handleLabClick = (lab: LabSchedule, event?: MouseEvent) => {
        event?.stopPropagation();
        setLabSidebarMode('edit');
        setSelectedLabId(lab.id);
        setLabPrefilledData({
            college: selectedCollege || undefined,
            section: lab.section,
            day_of_week: lab.day_of_week,
            start_time: lab.start_time,
            end_time: lab.end_time,
            classroom: lab.classroom,
            batch_name: lab.batch_name || undefined,
            effective_from: lab.effective_from,
            effective_to: lab.effective_to || undefined,
            is_active: lab.is_active,
        });
        setActiveTab('lab');
        setIsSidebarOpen(true);
    };

    return (
        <div className="p-4 md:p-6 flex flex-col gap-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-screen">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Timetables</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage weekly schedules efficiently.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Class Selector */}
                    <div className="w-full sm:w-[200px]">
                        <label className="text-sm font-medium mb-2 block">Class</label>
                        {loadingClasses ? (
                            <SkeletonDropdown />
                        ) : (
                            <Select
                                value={selectedClass?.toString()}
                                onValueChange={(v) => setSelectedClass(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No classes available
                                        </div>
                                    ) : (
                                        classes.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Section Selector */}
                    <div className="w-full sm:w-[200px]">
                        <label className="text-sm font-medium mb-2 block">Section</label>
                        {loadingSections ? (
                            <SkeletonDropdown />
                        ) : (
                            <Select
                                value={selectedSection?.toString()}
                                onValueChange={(v) => setSelectedSection(Number(v))}
                                disabled={!selectedClass}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!selectedClass ? "Select class first" : "Select Section"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            {!selectedClass ? "Select a class first" : "No sections available"}
                                        </div>
                                    ) : (
                                        sections.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {!selectedSection ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed text-center animate-in fade-in-50">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <LayoutGrid className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Timetable Selected</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Please select a Class and Section from the dropdowns above to view or manage the schedule.
                    </p>
                </div>
            ) : (
                <Card className="border-0 shadow-lg ring-1 ring-slate-900/5 dark:ring-slate-50/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b bg-white dark:bg-slate-900 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Weekly Schedule
                                </CardTitle>
                                <CardDescription>
                                    Create and manage classes by clicking on the time slots. Lab sessions appear inline with a green badge.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200">
                                {classes.find(c => c.id === selectedClass)?.name} - {sections.find(s => s.id === selectedSection)?.name}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <div className="min-w-[1200px]">
                            {/* Grid Header: Days */}
                            <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b divide-x bg-slate-50 dark:bg-slate-900/50">
                                <div className="sticky left-0 z-20 p-4 font-semibold text-sm text-center text-muted-foreground flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-r shadow-sm">
                                    <Clock className="w-4 h-4 mr-2" /> Time
                                </div>
                                {DAYS_OF_WEEK.map(day => (
                                    <div key={day.value} className="p-4 font-semibold text-sm text-center text-slate-700 dark:text-slate-200">
                                        {day.label}
                                    </div>
                                ))}
                            </div>

                            {/* Grid Body: Periods Rows */}
                            {sortedPeriods.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground">
                                    No class time slots defined for this college. Please configure class times first.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {sortedPeriods.map((period) => (
                                        <div key={period.id} className="grid grid-cols-[100px_repeat(7,1fr)] divide-x hover:bg-slate-50/50 transition-colors">
                                            {/* Time Column */}
                                            <div className="sticky left-0 z-10 p-3 text-xs font-medium text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 border-r shadow-sm group">
                                                <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{period.start_time}</span>
                                                <span className="text-slate-400 text-[10px]">to</span>
                                                <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{period.end_time}</span>
                                            </div>

                                            {/* Days Columns */}
                                            {DAYS_OF_WEEK.map((day) => {
                                                const entry = timetables.find(t => t.day_of_week === day.value && t.class_time === period.id);
                                                const labsForSlot = getLabsForSlot(day.value, period);
                                                const hasContent = Boolean(entry) || labsForSlot.length > 0;

                                                if (period.is_break) {
                                                    return (
                                                        <div key={`${day.value}-${period.id}`} className="p-2 bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center">
                                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest rotate-0">
                                                                {period.break_name || "BREAK"}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                const isLoading = loadingCell === `${day.value}-${period.id}`;

                                                return (
                                                    <div
                                                        key={`${day.value}-${period.id}`}
                                                        onClick={() => !isLoading && handleCellClick(day.value, period)}
                                                        className={cn(
                                                            "p-2 min-h-[120px] cursor-pointer transition-all border-transparent border-2 hover:border-blue-300 dark:hover:border-blue-700 relative group",
                                                            hasContent ? "bg-white dark:bg-slate-800" : "hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
                                                            isLoading && "opacity-80 cursor-wait bg-muted/10 pointer-events-none"
                                                        )}
                                                    >
                                                        {isLoading && (
                                                            <div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-white/40 dark:bg-black/40 backdrop-blur-[1px]">
                                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                            </div>
                                                        )}
                                                        <div className="h-full w-full flex flex-col gap-2">
                                                            {entry && (
                                                                <div className="flex-1 flex flex-col justify-between p-1 rounded bg-blue-50/50 dark:bg-indigo-950/30 border border-blue-100 dark:border-indigo-900/50 hover:shadow-md transition-shadow">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100">P{period.period_number}</Badge>
                                                                        </div>
                                                                        <div className="font-bold text-sm text-blue-900 dark:text-blue-100 leading-tight mb-1">
                                                                            {entry.subject_name}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                            <User className="w-3 h-3" />
                                                                            <span className="truncate max-w-[120px]" title={entry.teacher_name || undefined}>{entry.teacher_name}</span>
                                                                        </div>
                                                                        {entry.classroom_name && (
                                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                                                                                <MapPin className="w-3 h-3" />
                                                                                <span>{entry.classroom_name}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 transition-opacity flex gap-1 bg-white/80 rounded-full shadow-sm p-0.5">
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 rounded-full hover:bg-blue-100 hover:text-blue-600"
                                                                            onClick={(e) => {
                                                                                // Let it bubble to parent to open edit modal (or just do nothing and let bubble do it)
                                                                            }}
                                                                        >
                                                                            <Edit2 className="w-3 h-3 text-slate-500" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600"
                                                                            onClick={(e) => handleDeleteTimetable(entry.id, e)}
                                                                        >
                                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {labsForSlot.map((lab) => (
                                                                <div
                                                                    key={`lab-${lab.id}-${period.id}`}
                                                                    className="relative group/lab p-2 rounded-lg border border-orange-200 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-900/30 text-orange-900 dark:text-orange-50 shadow-sm hover:border-orange-400 cursor-pointer mb-2 last:mb-0"
                                                                    onClick={(e) => handleLabClick(lab, e)}
                                                                >
                                                                    <div className="absolute top-1 right-1 opacity-0 group-hover/lab:opacity-100 transition-opacity z-10">
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-5 w-5 rounded-full bg-white/50 hover:bg-red-100 hover:text-red-600"
                                                                            onClick={(e) => handleDeleteLab(lab.id, e)}
                                                                        >
                                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                                        </Button>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Badge className="bg-orange-600 text-white hover:bg-orange-700">Lab</Badge>
                                                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100">P{period.period_number}</Badge>
                                                                        {lab.batch_name && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {lab.batch_name}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="font-semibold text-sm leading-tight mb-1">
                                                                        {lab.subject_name}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-xs text-orange-800/90 dark:text-orange-100 mb-1">
                                                                        <User className="w-3 h-3" />
                                                                        <span className="truncate max-w-[140px]" title={lab.teacher_name || undefined}>
                                                                            {lab.teacher_name || 'Instructor TBD'}
                                                                        </span>
                                                                    </div>
                                                                    {lab.classroom_name && (
                                                                        <div className="flex items-center gap-1.5 text-[11px] text-orange-800/80 dark:text-orange-200">
                                                                            <MapPin className="w-3 h-3" />
                                                                            <span className="truncate">{lab.classroom_name}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {!hasContent && (
                                                                <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Plus className="w-5 h-5 text-blue-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={
                    activeTab === 'lab'
                        ? (labSidebarMode === 'create' ? 'Add Lab Session' : 'Edit Lab Session')
                        : (sidebarMode === 'create' ? 'Add Schedule Entry' : 'Edit Schedule Entry')
                }
                mode={activeTab === 'lab' ? labSidebarMode : sidebarMode}
            >
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lecture' | 'lab')}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="lecture">Lecture</TabsTrigger>
                        <TabsTrigger value="lab">Lab</TabsTrigger>
                    </TabsList>

                    <TabsContent value="lecture">
                        <TimetableForm
                            mode={sidebarMode}
                            timetableId={selectedTimetableId}
                            prefilledData={prefilledData}
                            onSuccess={() => {
                                if (prefilledData?.day_of_week !== undefined && prefilledData?.class_time) {
                                    setLoadingCell(`${prefilledData.day_of_week}-${prefilledData.class_time}`);
                                }
                                setIsSidebarOpen(false);
                                Promise.all([invalidateTimetables(), invalidateLabSchedules()])
                                    .finally(() => setLoadingCell(null));
                            }}
                            onCancel={() => setIsSidebarOpen(false)}
                            lockContextFields={true}
                        />
                    </TabsContent>

                    <TabsContent value="lab">
                        <LabScheduleForm
                            mode={labSidebarMode}
                            labScheduleId={selectedLabId}
                            prefilledData={labPrefilledData}
                            onSuccess={() => {
                                if (labPrefilledData?.day_of_week !== undefined && labPrefilledData?.start_time) {
                                    const period = classTimes.find(ct => normalizeTime(ct.start_time) === normalizeTime(labPrefilledData.start_time));
                                    if (period) {
                                        setLoadingCell(`${labPrefilledData.day_of_week}-${period.id}`);
                                    }
                                }
                                setIsSidebarOpen(false);
                                invalidateLabSchedules()
                                    .finally(() => setLoadingCell(null));
                            }}
                            onCancel={() => setIsSidebarOpen(false)}
                            lockContextFields={true}
                        />
                    </TabsContent>
                </Tabs>
            </DetailSidebar>
            <ConfirmDialog
                open={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title={itemToDelete?.type === 'lecture' ? "Delete Lecture" : "Delete Lab Session"}
                description={itemToDelete?.type === 'lecture'
                    ? "Are you sure you want to delete this lecture? This action cannot be undone."
                    : "Are you sure you want to delete this lab session? This action cannot be undone."}
                variant="destructive"
            />
        </div>
    );
}
