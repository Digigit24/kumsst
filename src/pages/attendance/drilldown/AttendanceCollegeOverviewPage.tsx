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
// import { useAttendanceCollegeOverview } from '@/hooks/useAttendanceDrillDown';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Users,
    XCircle
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Placeholder hook until the actual one is fully ready/integrated
// import { useAttendanceCollegeOverview } from '@/hooks/useAttendanceDrillDown';
import { useAttendanceCollegeOverview } from '@/hooks/useAttendanceDrillDown';

export const AttendanceCollegeOverviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useAttendanceCollegeOverview();

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-900">Error Loading Data</h3>
                                <p className="text-sm text-red-700">{(error as any)?.message || 'Unknown error'}</p>
                            </div>
                        </div>
                        <Button onClick={() => refetch()} className="mt-4 bg-red-600 hover:bg-red-700">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-black/20 min-h-screen">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-950 shadow-xl border border-white/20 dark:border-white/10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative z-10 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                                Attendance Analytics
                            </h1>
                            <p className="text-emerald-50 dark:text-emerald-200 text-lg font-medium">
                                Real-time attendance tracking and insights across colleges
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/30 shadow-sm text-white transition-all hover:bg-white/20">
                                <div className="text-xs text-emerald-100 uppercase tracking-wider font-semibold mb-0.5">Date</div>
                                <div className="font-semibold text-lg tracking-tight">
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: 'Total Students',
                        icon: Users,
                        value: data?.total_students ?? '-',
                        sub: 'Registered Students',
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                        border: 'border-blue-100 dark:border-blue-900/50',
                        cardBg: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-900/20'
                    },
                    {
                        title: 'Total Present',
                        icon: CheckCircle2,
                        value: data?.present_count ?? '-',
                        sub: data?.overall_attendance_rate != null ? `${data.overall_attendance_rate.toFixed(1)}% Rate` : '-',
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        border: 'border-emerald-100 dark:border-emerald-900/50',
                        cardBg: 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/20'
                    },
                    {
                        title: 'Total Absent',
                        icon: XCircle,
                        value: data?.absent_count ?? '-',
                        sub: 'Students Absent',
                        color: 'text-rose-600 dark:text-rose-400',
                        bg: 'bg-rose-50 dark:bg-rose-900/20',
                        border: 'border-rose-100 dark:border-rose-900/50',
                        cardBg: 'hover:shadow-rose-200/50 dark:hover:shadow-rose-900/20'
                    },
                    {
                        title: 'Low Attendance',
                        icon: AlertCircle,
                        value: data?.low_attendance_count ?? '-',
                        sub: 'Alerts Raised',
                        color: 'text-amber-600 dark:text-amber-400',
                        bg: 'bg-amber-50 dark:bg-amber-900/20',
                        border: 'border-amber-100 dark:border-amber-900/50',
                        cardBg: 'hover:shadow-amber-200/50 dark:hover:shadow-amber-900/20',
                        onClick: () => navigate('/attendance/drilldown/low-attendance-alerts')
                    }
                ].map((item: any, i) => (
                    <Card
                        key={i}
                        className={`border ${item.border} shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.cardBg} group overflow-hidden relative ${item.onClick ? 'cursor-pointer' : ''}`}
                        onClick={item.onClick}
                    >
                        <div className={`absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.05] transition-opacity group-hover:opacity-[0.08] dark:group-hover:opacity-[0.1]`}>
                            <item.icon className="w-40 h-40 transform rotate-12" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            {isLoading ? (
                                <Skeleton className="h-8 w-24" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold tracking-tight mt-2 text-foreground">
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

            {/* College/Program Breakdown */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
                <CardHeader className="border-b px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                            Program Wise Breakdown
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (data?.program_breakdown && data.program_breakdown.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program Name</TableHead>
                                    <TableHead className="text-center h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Students</TableHead>
                                    <TableHead className="text-center h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Present</TableHead>
                                    <TableHead className="text-center h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Absent</TableHead>
                                    <TableHead className="text-center h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance %</TableHead>
                                    <TableHead className="text-right pr-6 h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.program_breakdown.map((program, index) => (
                                    <TableRow
                                        key={program.program_id}
                                        className={`cursor-pointer transition-all border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60`}
                                        onClick={() => navigate(`/attendance/drilldown/${program.program_id}/program`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-inset ring-emerald-600/10 dark:ring-emerald-400/20">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-foreground">{program.program_name}</div>
                                                    <div className="text-xs text-muted-foreground">{program.program_code}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-none shadow-none">
                                                {program.total_students}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                                                {program.present_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded">
                                                {program.absent_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center justify-center gap-1.5 w-24 mx-auto">
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${program.attendance_rate >= 75 ? 'bg-emerald-500' :
                                                            program.attendance_rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                            }`}
                                                        style={{ width: `${program.attendance_rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground">{program.attendance_rate.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 font-medium">
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-3">
                                <Building2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No Programs Found</h3>
                            <p className="text-muted-foreground mt-1">There are no programs available to display at the moment.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};
