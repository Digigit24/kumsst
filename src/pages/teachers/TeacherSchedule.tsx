import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherScheduleSWR } from '@/hooks/useTeachersSWR';
import { teachersApi as hrTeachersApi } from '@/services/hr.service';
import { isSuperAdmin } from '@/utils/auth.utils';
import { Calendar, Clock, Loader2, MapPin, User } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface ClassSession {
    subject: string;
    code: string;
    teacher: string;
    room: string;
    type: 'Lecture' | 'Lab' | 'Tutorial';
    color: string;
}

interface TimeSlot {
    time: string;
    Monday?: ClassSession;
    Tuesday?: ClassSession;
    Wednesday?: ClassSession;
    Thursday?: ClassSession;
    Friday?: ClassSession;
    Saturday?: ClassSession;
    Sunday?: ClassSession;
}

export const TeacherSchedule: React.FC = () => {
    const { user } = useAuth();
    const isSuper = isSuperAdmin(user);
    const isCollegeAdmin = user?.user_type === 'college_admin';
    const isTeacher = user?.user_type === 'teacher';
    const canSelectTeacher = isSuper || isCollegeAdmin;

    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    // Fetch teachers list only for admin users
    useEffect(() => {
        if (canSelectTeacher) {
            const fetchTeachers = async () => {
                try {
                    setLoadingTeachers(true);
                    const data = await hrTeachersApi.list({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
                    setTeachers(data.results);
                } catch (err) {
                    // Failed to fetch teachers
                } finally {
                    setLoadingTeachers(false);
                }
            };
            fetchTeachers();
        }
    }, [canSelectTeacher, isTeacher]);

    const shouldFetch = isTeacher || !!selectedTeacherId;
    const { data: timetableData, isLoading: timetableLoading } = useTeacherScheduleSWR(selectedTeacherId, { enabled: shouldFetch });

    const timetableRecords = timetableData?.schedule || [];

    // Helper function to assign colors to sessions
    const getSessionStyle = (subjectName: string, type: 'Lecture' | 'Lab' | 'Tutorial'): string => {
        // Lab sessions get a distinct look
        if (type === 'Lab') {
            return 'bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-100';
        }

        const colorMap: Record<string, string> = {
            'Mathematics': 'bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
            'Physics': 'bg-indigo-100 border-indigo-300 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-100',
            'Computer Science': 'bg-green-100 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100',
            'Chemistry': 'bg-teal-100 border-teal-300 text-teal-900 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-100',
            'English': 'bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100',
            'Biology': 'bg-cyan-100 border-cyan-300 text-cyan-900 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-100',
            'History': 'bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-100',
            'Sports': 'bg-lime-100 border-lime-300 text-lime-900 dark:bg-lime-900/20 dark:border-lime-800 dark:text-lime-100',
        };

        return colorMap[subjectName] || 'bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100';
    };

    // Transform API data to timetable slots
    const timetable: TimeSlot[] = useMemo(() => {
        const timeSlots: Record<string, TimeSlot> = {};
        const daysMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        timetableRecords.forEach((record) => {
            // Determine time display and type based on available fields
            let time = 'N/A';
            let sessionType: 'Lecture' | 'Lab' | 'Tutorial' = 'Lecture';

            // Check if this is a timetable entry (has time_slot) or lab schedule (has start_time/end_time)
            if (record.time_slot) {
                // Timetable entry - extract time from time_slot
                const timeMatch = record.time_slot.match(/\((.*?)\)/);
                if (timeMatch && timeMatch[1]) {
                    time = timeMatch[1];
                } else {
                    time = record.time_slot;
                }
                sessionType = 'Lecture';
            } else if (record.start_time && record.end_time) {
                // Lab schedule entry - use start_time and end_time
                time = `${record.start_time} - ${record.end_time}`;
                sessionType = 'Lab';
            }

            const dayIndex = Number(record.day_of_week);
            const dayName = daysMap[dayIndex];

            if (!timeSlots[time]) {
                timeSlots[time] = { time };
            }

            const session: ClassSession = {
                subject: record.subject_name || 'Class',
                code: '',
                teacher: record.batch_name
                    ? `${record.section_name} - ${record.batch_name}`
                    : `${record.class_name || 'Class'} - ${record.section_name}`,
                room: record.classroom_name || (record.classroom ? 'Room' : 'N/A'),
                type: sessionType,
                color: getSessionStyle(record.subject_name || '', sessionType),
            };

            if (dayName) {
                (timeSlots[time] as any)[dayName] = session;
            }
        });

        // Sort time slots by converting to minutes for proper chronological order
        const toMinutes = (timeStr: string) => {
            // Extract first time from range (e.g., "01:08:00 PM - 03:08:00 PM" -> "01:08:00 PM")
            const firstTime = timeStr.split('-')[0].trim();

            // Handle 12-hour format with AM/PM
            if (firstTime.includes('AM') || firstTime.includes('PM')) {
                const isPM = firstTime.includes('PM');
                const cleanTime = firstTime.replace(/\s*(AM|PM)\s*/i, '').trim();
                const [h, m] = cleanTime.split(':').map(Number);
                let hours = h || 0;

                if (isPM && hours !== 12) hours += 12;
                if (!isPM && hours === 12) hours = 0;

                return hours * 60 + (m || 0);
            }

            // Handle 24-hour format
            const [h, m] = firstTime.split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        };

        return Object.values(timeSlots).sort((a, b) => {
            try {
                return toMinutes(a.time) - toMinutes(b.time);
            } catch {
                return a.time.localeCompare(b.time);
            }
        });
    }, [timetableRecords]);

    // Loading state
    if (timetableLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Fallback mock data if no timetable exists
    const mockTimetable: TimeSlot[] = [];

    // Use real data if available, otherwise use mock data
    const displayTimetable = timetable.length > 0 ? timetable : mockTimetable;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Get current day
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {isTeacher ? 'My Schedule' : 'Teacher Schedule'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Weekly class schedule - Academic Year 2024-2025
                    </p>
                </div>

                {/* Teacher Selector - Only show for admin users */}
                {canSelectTeacher && (
                    <div className="w-full md:w-[300px]">
                        <label className="text-sm font-medium mb-2 block">Select Teacher</label>
                        <SearchableSelect
                            options={teachers.map(t => ({
                                value: t.id.toString(),
                                label: t.full_name || `${t.first_name} ${t.last_name}`,
                                subtitle: t.department_name || t.faculty_name
                            }))}
                            value={selectedTeacherId}
                            onChange={(v) => setSelectedTeacherId(String(v))}
                            placeholder="Select a teacher"
                            searchPlaceholder="Search teacher..."
                            isLoading={loadingTeachers}
                            disabled={loadingTeachers}
                        />
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {!shouldFetch && (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/5 min-h-[300px]">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Select a Teacher</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                        Please select a teacher from the dropdown above to view their weekly schedule and class allocation.
                    </p>
                </div>
            )}

            {shouldFetch && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    <p className="text-2xl font-bold">6</p>
                                    <p className="text-sm text-muted-foreground">Days per Week</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    <p className="text-2xl font-bold">{timetableRecords.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timetable Grid */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>Current week timetable</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border border-border bg-muted p-3 text-left font-semibold min-w-[120px]">
                                                Time
                                            </th>
                                            {days.map((day) => (
                                                <th
                                                    key={day}
                                                    className={`border border-border p-3 text-center font-semibold min-w-[180px] ${day === currentDay ? 'bg-primary/10 text-primary' : 'bg-muted'
                                                        }`}
                                                >
                                                    {day}
                                                    {day === currentDay && (
                                                        <Badge variant="default" className="ml-2 text-xs">Today</Badge>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayTimetable.map((slot, index) => (
                                            <tr key={index}>
                                                <td className="border border-border bg-muted p-3 font-medium text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        {slot.time}
                                                    </div>
                                                </td>
                                                {days.map((day) => {
                                                    const session = slot[day as keyof TimeSlot] as ClassSession | undefined;
                                                    return (
                                                        <td key={day} className="border border-border p-2">
                                                            {session ? (
                                                                <div className={`${session.color} p-3 rounded-lg border-2 h-full min-h-[100px] flex flex-col justify-between`}>
                                                                    <div>
                                                                        <p className="font-semibold text-sm mb-1">{session.subject}</p>
                                                                        {session.code && (
                                                                            <Badge variant="outline" className="mb-2 text-xs">
                                                                                {session.code}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-1 text-xs">
                                                                        <div className="flex items-center gap-1">
                                                                            <User className="h-3 w-3" />
                                                                            <span>{session.teacher}</span>
                                                                        </div>
                                                                        {session.room && (
                                                                            <div className="flex items-center gap-1">
                                                                                <MapPin className="h-3 w-3" />
                                                                                <span>{session.room}</span>
                                                                            </div>
                                                                        )}
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {session.type}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-full min-h-[100px]"></div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};
