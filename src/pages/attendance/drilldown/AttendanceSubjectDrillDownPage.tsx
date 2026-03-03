import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAttendanceSubjectDrillDown } from '@/hooks/useAttendanceDrillDown';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    School,
    BookOpen,
    CheckCircle2,
    Users,
    XCircle,
    GraduationCap,
    Clock
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

export const AttendanceSubjectDrillDownPage: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('class');
    const navigate = useNavigate();

    // Prepare filters - include classId if present in query params
    // Prepare filters - include classId if present in query params
    const filters = useMemo(() => {
        return classId ? { class: parseInt(classId) } : {};
    }, [classId]);

    // Using Subject DrillDown Hook
    const { data, isLoading, error, refetch } = useAttendanceSubjectDrillDown(
        subjectId ? parseInt(subjectId) : null,
        filters
    );

    // Derived Charts Data
    const chartsData = useMemo(() => {
        if (!data) return { pieData: [] };

        const presentCount = data.present_count || 0;
        const absentCount = data.absent_count || 0;
        const lateCount = data.late_count || 0;

        let pieData: { name: string; value: number; color: string }[] = [];

        if (presentCount > 0 || absentCount > 0 || lateCount > 0) {
            pieData = [
                { name: 'Present', value: presentCount, color: '#10b981' },
                { name: 'Absent', value: absentCount, color: '#ef4444' },
                { name: 'Late', value: lateCount, color: '#f59e0b' },
            ].filter(item => item.value > 0);
        }

        return { pieData };
    }, [data]);

    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || '';
        switch (lowerStatus) {
            case 'present': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
            case 'absent': return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
            case 'late': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case 'leave': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
        const lowerStatus = status?.toLowerCase() || '';
        switch (lowerStatus) {
            case 'present': return 'default';
            case 'absent': return 'destructive';
            case 'late': return 'secondary';
            default: return 'outline';
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-xs">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[50vh]">
                <Card className="border-red-200 bg-red-50 max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-4 mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="font-semibold text-red-900 text-lg mb-2">Error Loading Data</h3>
                        <p className="text-sm text-red-700 mb-6">{(error as any)?.message || 'Unknown error occurred while fetching subject details.'}</p>
                        <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700 w-full">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 shadow-2xl border border-white/10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(-1)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 rounded-full h-10 w-10 transition-colors"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <Badge variant="outline" className="text-teal-100 border-teal-400/30 bg-teal-500/20 backdrop-blur-md px-3 py-1 shadow-sm">
                                    Subject Analysis
                                </Badge>
                                {data?.subject_code && (
                                    <Badge variant="outline" className="text-teal-50 border-teal-200/20 bg-black/20 backdrop-blur-md px-3 py-1 shadow-sm">
                                        {data.subject_code}
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm mb-2 leading-tight">
                                    {data?.subject_name || <Skeleton className="h-12 w-64 bg-white/20" />}
                                </h1>
                                <p className="text-teal-50 text-lg font-medium opacity-90 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {data ? (
                                        <span>Attendance Analysis {classId ? `for Class ID: ${classId}` : ''}</span>
                                    ) : <Skeleton className="h-6 w-48 bg-white/20" />}
                                </p>
                            </div>
                        </div>

                        {data?.overall_attendance_rate !== undefined && (
                            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg min-w-[160px] flex flex-col items-center justify-center text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="relative h-28 w-28 flex items-center justify-center">
                                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                                        <path
                                            className="text-white/10"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <path
                                            className={`${data.overall_attendance_rate >= 75 ? 'text-emerald-400' : data.overall_attendance_rate >= 60 ? 'text-amber-400' : 'text-rose-400'} drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out`}
                                            strokeDasharray={`${data.overall_attendance_rate}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                                        <span className="text-3xl font-bold tracking-tight drop-shadow-md">{data.overall_attendance_rate.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="mt-3 bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md">Overall Rate</Badge>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: 'Total Students',
                        icon: Users,
                        value: data?.total_students ?? '-',
                        sub: 'Registered',
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                        border: 'border-blue-100 dark:border-blue-800'
                    },
                    {
                        title: 'Total Classes',
                        icon: School,
                        value: data?.total_classes_conducted ?? '-',
                        sub: 'Sessions Held',
                        color: 'text-purple-600 dark:text-purple-400',
                        bg: 'bg-purple-50 dark:bg-purple-900/20',
                        border: 'border-purple-100 dark:border-purple-800'
                    },
                    {
                        title: 'Low Attendance',
                        icon: AlertCircle,
                        value: data?.low_attendance_count ?? '-',
                        sub: 'Students at Risk',
                        color: 'text-rose-600 dark:text-rose-400',
                        bg: 'bg-rose-50 dark:bg-rose-900/20',
                        border: 'border-rose-100 dark:border-rose-800'
                    },
                    {
                        title: 'Present Average', // Fallback or if present_count available
                        icon: CheckCircle2,
                        value: data?.present_count ?? 'N/A',
                        sub: 'Avg Students',
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        border: 'border-emerald-100 dark:border-emerald-800'
                    },
                ].map((item, i) => (
                    <Card key={i} className={`border ${item.border} shadow-sm bg-white dark:bg-slate-900/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative cursor-default`}>
                        <div className={`absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.05] transition-opacity group-hover:opacity-[0.08] dark:group-hover:opacity-[0.1]`}>
                            <item.icon className="w-40 h-40 transform rotate-12" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-110`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            {isLoading ? (
                                <Skeleton className="h-8 w-24" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold tracking-tight mt-2 text-foreground group-hover:text-primary transition-colors">
                                        {item.value}
                                    </div>
                                    <div className="text-xs font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
                                        {item.sub}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Chart Section - Only configured if we have data to plot */}
                <Card className="md:col-span-1 border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-teal-500" />
                            Attendance Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            {chartsData.pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartsData.pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartsData.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <Activity className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No distribution data available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Student List Section */}
                <Card className="md:col-span-2 border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="border-b px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-teal-500" />
                            Student Performance
                        </CardTitle>
                        <Badge variant="outline" className="bg-white dark:bg-slate-900">
                            All Students
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="space-y-4 p-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : (data?.student_breakdown && data.student_breakdown.length > 0) ? (
                            <Table>
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="pl-6 h-12">Student Name</TableHead>
                                        <TableHead className="text-center h-12">Roll No</TableHead>
                                        <TableHead className="text-center h-12">Total Classes</TableHead>
                                        <TableHead className="text-center h-12">Attended</TableHead>
                                        <TableHead className="text-center h-12">Status</TableHead>
                                        <TableHead className="text-right pr-6 h-12">Attendance %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.student_breakdown.map((student, index) => (
                                        <TableRow
                                            key={student.student_id}
                                            className={`transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer`}
                                            onClick={() => navigate(`/attendance/drilldown/${student.student_id}/student`)}
                                        >
                                            <TableCell className="font-medium pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                                        {student.student_name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-foreground hover:text-teal-600 transition-colors">
                                                            {student.student_name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{student.roll_number}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {student.roll_number}
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {student.total_classes}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                                                {student.attended_classes || 0}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.status && (
                                                    <Badge
                                                        variant={getStatusBadgeVariant(student.status)}
                                                        className={`px-2 py-0.5 shadow-none capitalize border ${getStatusColor(student.status)}`}
                                                    >
                                                        {student.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${(student.attendance_percentage ?? 0) >= 75 ? 'bg-emerald-500' : (student.attendance_percentage ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${student.attendance_percentage ?? 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold w-10 text-right">
                                                        {student.attendance_percentage != null ? student.attendance_percentage.toFixed(0) : '0'}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-16 text-center">
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                    <Users className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No Student Records</h3>
                                <p className="text-muted-foreground mt-1 text-sm">No student attendance data found for this subject matching the criteria.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
