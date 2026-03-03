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
import { useAttendanceSectionDrillDown } from '@/hooks/useAttendanceDrillDown';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    LayoutList,
    User,
    Users,
    XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const AttendanceSectionDrillDownPage: React.FC = () => {
    const { sectionId } = useParams<{ sectionId: string }>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});

    // Using Section DrillDown Hook
    const { data, isLoading, error, refetch } = useAttendanceSectionDrillDown(
        sectionId ? parseInt(sectionId) : null,
        filters
    );

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
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(-1)} // Go back to class
                                    className="text-white/80 hover:text-white hover:bg-white/10 -ml-3"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <Badge variant="outline" className="text-violet-100 border-violet-400/30 bg-violet-500/20">
                                    Section Level
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {data?.section_name || 'Loading...'}
                            </h1>
                            <p className="text-violet-100 text-lg">
                                {data?.program_name ? `${data.program_name} • ${data.class_name}` : 'Detailed attendance report for students'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                    {
                        title: 'Total Students',
                        icon: Users,
                        value: data?.total_students ?? '-',
                        sub: 'Section Strength',
                        color: 'text-violet-600 dark:text-violet-400',
                        bg: 'bg-violet-50 dark:bg-violet-900/20'
                    },
                    {
                        title: 'Total Present',
                        icon: CheckCircle2,
                        value: data?.present_count ?? '-',
                        sub: data?.overall_attendance_rate != null ? `${data.overall_attendance_rate.toFixed(1)}% Rate` : '-',
                        color: 'text-green-600 dark:text-green-400',
                        bg: 'bg-green-50 dark:bg-green-900/20'
                    },
                    {
                        title: 'Total Absent',
                        icon: XCircle,
                        value: data?.absent_count ?? '-',
                        sub: 'Students Absent',
                        color: 'text-red-600 dark:text-red-400',
                        bg: 'bg-red-50 dark:bg-red-900/20'
                    }
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${item.color}`}>
                            <item.icon className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                            <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                                <item.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            {isLoading ? (
                                <Skeleton className="h-8 w-24" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold tracking-tight mt-2 min-h-[32px] dark:text-slate-100">
                                        {item.value}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2 min-h-[20px]">
                                        {item.sub}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Students List */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden mb-8">
                <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Student Attendance List</CardTitle>
                        <div className="flex items-center gap-2">
                            {/* Optional filter or search buttons could go here */}
                            <Badge variant="secondary" className="font-mono text-xs">
                                {data?.student_list ? data.student_list.length : 0} Records
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (data?.student_list && data.student_list.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12">Student Name</TableHead>
                                    <TableHead className="text-center h-12">Admission No</TableHead>
                                    <TableHead className="text-center h-12">Roll Number</TableHead>
                                    <TableHead className="text-center h-12">Total Days</TableHead>
                                    <TableHead className="text-center h-12">Present</TableHead>
                                    <TableHead className="text-center h-12">Absent</TableHead>
                                    <TableHead className="text-center h-12">Attendance %</TableHead>
                                    <TableHead className="text-right pr-6 h-12">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.student_list.map((student, index) => (
                                    <TableRow
                                        key={student.student_id || student.id || index}
                                        className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}`}
                                        onClick={() => navigate(`/attendance/drilldown/${student.student_id || student.id}/student`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.student_name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground font-mono text-xs">
                                            {student.admission_number || '-'}
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground font-mono text-xs">
                                            {student.roll_number || '-'}
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">
                                            {student.total_days}
                                        </TableCell>
                                        <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">
                                            {student.present_days}
                                        </TableCell>
                                        <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">
                                            {student.absent_days}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${(student.attendance_rate ?? 0) >= 75 ? 'bg-green-500' : (student.attendance_rate ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${student.attendance_rate ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium dark:text-slate-300">{student.attendance_rate != null ? student.attendance_rate.toFixed(1) : '0.0'}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="h-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/30">
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            No student data available in this section.
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};
