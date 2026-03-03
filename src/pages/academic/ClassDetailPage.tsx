/**
 * Class Detail Page
 * Displays detailed information about a class including teachers, students, and timetable
 */

import { ArrowLeft, BookOpen, Calendar, GraduationCap, MapPin, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { classApi } from '../../services/academic.service';

export const ClassDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const classId = id ? parseInt(id) : null;

    const [classData, setClassData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchClassDetails = async () => {
            if (!classId) return;

            try {
                setIsLoading(true);
                setError(null);
                const data = await classApi.getDetails(classId);
                setClassData(data);
            } catch (err: any) {
                setError(typeof err.message === 'string' ? err.message : 'Failed to fetch class details');
                console.error('Fetch class details error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassDetails();
    }, [classId]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Memoize timetable computation to avoid recalculating on every render
    const { timeSlotMap, timeSlots } = useMemo(() => {
        const map: Record<string, Record<number, any>> = {};
        classData?.timetable?.forEach((entry: any) => {
            if (!map[entry.time_slot]) map[entry.time_slot] = {};
            map[entry.time_slot][entry.day_of_week] = entry;
        });
        return { timeSlotMap: map, timeSlots: Object.keys(map).sort() };
    }, [classData?.timetable]);

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        );
    }

    if (error || !classData) {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardContent className="p-6">
                        <div className="text-center space-y-4">
                            <div className="text-destructive text-5xl">⚠</div>
                            <h2 className="text-xl font-semibold">Class Not Found</h2>
                            <p className="text-muted-foreground">{error || 'Unable to load class details'}</p>
                            <Button onClick={() => navigate('/academic/classes')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Classes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }



    return (
        <div className="min-h-screen pb-8 animate-fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8 border-b">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/academic/classes')}
                            className="transition-all hover:scale-105"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex gap-2">
                            <Badge variant={classData.is_active ? 'success' : 'destructive'} className="animate-scale-in">
                                {classData.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>

                    {/* Class Header */}
                    <div className="flex items-start gap-6 flex-wrap">
                        <div className="p-6 bg-primary/10 rounded-full">
                            <GraduationCap className="h-12 w-12 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{classData.name}</h1>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {classData.program_name}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span>{classData.session_name}</span>
                                <Separator orientation="vertical" className="h-4" />
                                <span>Semester {classData.semester} • Year {classData.year}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-8 -mt-4">
                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card variant="elevated" className="overflow-hidden animate-slide-in">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Max Students</p>
                                    <p className="font-medium text-sm">{classData.max_students}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="elevated" className="overflow-hidden animate-slide-in" style={{ animationDelay: '50ms' }}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Program</p>
                                    <p className="font-medium text-sm">{classData.program_name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="elevated" className="overflow-hidden animate-slide-in" style={{ animationDelay: '100ms' }}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Session</p>
                                    <p className="font-medium text-sm">{classData.session_name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="elevated" className="overflow-hidden animate-slide-in" style={{ animationDelay: '150ms' }}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-500/10 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Semester/Year</p>
                                    <p className="font-medium text-sm">Sem {classData.semester} • Y{classData.year}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide pb-1">
                        <TabsList className="inline-flex w-auto min-w-full md:min-w-0">
                            <TabsTrigger value="overview">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="teachers">
                                <Users className="h-4 w-4 mr-2" />
                                Teachers
                            </TabsTrigger>
                            <TabsTrigger value="students">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Students
                            </TabsTrigger>
                            <TabsTrigger value="timetable">
                                <Calendar className="h-4 w-4 mr-2" />
                                Timetable
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Class Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">Class Name</label>
                                        <p className="font-medium">{classData.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">College</label>
                                        <p className="font-medium">{classData.college_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">Program</label>
                                        <p className="font-medium">{classData.program_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">Academic Session</label>
                                        <p className="font-medium">{classData.session_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">Semester</label>
                                        <p className="font-medium">Semester {classData.semester}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">Year</label>
                                        <p className="font-medium">Year {classData.year}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">Maximum Students</label>
                                        <p className="font-medium">{classData.max_students}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <Badge variant={classData.is_active ? 'success' : 'secondary'}>
                                            {classData.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Teachers Tab */}
                    <TabsContent value="teachers">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Class Teachers ({classData.teachers?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {classData.teachers && classData.teachers.length > 0 ? (
                                    <div className="space-y-3">
                                        {classData.teachers.map((teacher: any, index: number) => (
                                            <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-full">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{teacher.user.full_name}</h4>
                                                            <p className="text-sm text-muted-foreground">{teacher.user.email}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">@{teacher.user.username}</p>

                                                            {teacher.subjects && teacher.subjects.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {teacher.subjects.map((subject: string, idx: number) => (
                                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                                            {subject}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No teachers assigned to this class</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Students Tab */}
                    <TabsContent value="students">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    Class Students ({classData.students?.length || 0} / {classData.max_students})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {classData.students && classData.students.length > 0 ? (
                                    <div className="space-y-3">
                                        {classData.students.map((student: any) => (
                                            <div key={student.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-full">
                                                            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{student.user.full_name}</h4>
                                                            <p className="text-sm text-muted-foreground">{student.user.email}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {student.admission_number}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">@{student.user.username}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No students enrolled in this class</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Timetable Tab */}
                    <TabsContent value="timetable">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Class Timetable ({classData.timetable?.length || 0} sessions)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {classData.timetable && classData.timetable.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <div className="min-w-[800px]">
                                            {/* Header Row */}
                                            <div className="grid grid-cols-8 bg-muted/50 border-b text-sm font-semibold">
                                                <div className="px-3 py-2 border-r">Time</div>
                                                {days.map((day) => (
                                                    <div key={day} className="px-3 py-2 text-center border-r last:border-r-0">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Timetable Rows */}
                                            <div className="divide-y">
                                                {timeSlots.map((timeSlot) => (
                                                    <div key={timeSlot} className="grid grid-cols-8">
                                                        {/* Time Column */}
                                                        <div className="px-3 py-3 bg-muted/30 border-r font-medium text-sm">
                                                            <div className="text-xs">{timeSlot}</div>
                                                        </div>

                                                        {/* Day Columns */}
                                                        {days.map((day, dayIndex) => {
                                                            const entry = timeSlotMap[timeSlot]?.[dayIndex];

                                                            return (
                                                                <div
                                                                    key={dayIndex}
                                                                    className="px-2 py-3 border-r last:border-r-0 min-h-[80px]"
                                                                >
                                                                    {entry ? (
                                                                        <div className="h-full rounded border border-primary/30 bg-primary/10 px-2 py-2 text-xs hover:bg-primary/20 transition-colors">
                                                                            <div className="font-semibold text-primary mb-1">
                                                                                {entry.subject}
                                                                            </div>
                                                                            <div className="space-y-0.5 text-[10px] text-muted-foreground">
                                                                                <div className="flex items-center gap-1">
                                                                                    <User className="h-3 w-3" />
                                                                                    <span className="truncate">{entry.teacher}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Users className="h-3 w-3" />
                                                                                    <span className="truncate">{entry.section}</span>
                                                                                </div>
                                                                                {entry.classroom && (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <MapPin className="h-3 w-3" />
                                                                                        <span className="truncate">{entry.classroom}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50">
                                                                            -
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No timetable entries for this class</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
