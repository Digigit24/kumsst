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
import { useAttendanceClassDrillDown } from '@/hooks/useAttendanceDrillDown';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Users,
    XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const AttendanceClassDrillDownPage: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});

    // Using Class DrillDown Hook
    const { data, isLoading, error, refetch } = useAttendanceClassDrillDown(
        classId ? parseInt(classId) : null,
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(-1)} // Go back
                                    className="text-white/80 hover:text-white hover:bg-white/10 -ml-3"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <Badge variant="outline" className="text-indigo-100 border-indigo-400/30 bg-indigo-500/20">
                                    Class Level
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {data?.class_name || 'Loading...'}
                            </h1>
                            <p className="text-indigo-100 text-lg">
                                Attendance breakdown by section & subjects
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
                        sub: 'Class Strength',
                        color: 'text-indigo-600 dark:text-indigo-400',
                        bg: 'bg-indigo-50 dark:bg-indigo-900/20'
                    },
                    {
                        title: 'Present Today',
                        icon: CheckCircle2,
                        value: data?.present_count ?? '-',
                        sub: data?.overall_attendance_rate != null ? `${data.overall_attendance_rate.toFixed(1)}% Rate` : '-',
                        color: 'text-green-600 dark:text-green-400',
                        bg: 'bg-green-50 dark:bg-green-900/20'
                    },
                    {
                        title: 'Absent Today',
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

            {/* Sections Breakdown */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden mb-8">
                <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-6 py-5">
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Sections Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (data?.section_breakdown && data.section_breakdown.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12">Section Name</TableHead>
                                    <TableHead className="text-center h-12">Total Students</TableHead>
                                    <TableHead className="text-center h-12">Present</TableHead>
                                    <TableHead className="text-center h-12">Absent</TableHead>
                                    <TableHead className="text-center h-12">Attendance %</TableHead>
                                    <TableHead className="text-right pr-6 h-12">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.section_breakdown.map((section, index) => (
                                    <TableRow
                                        key={section.section_id}
                                        className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}`}
                                        onClick={() => navigate(`/attendance/drilldown/${section.section_id}/section`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-base text-gray-900 dark:text-gray-100">{section.section_name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-normal dark:bg-slate-700 dark:text-slate-300">
                                                {section.total_students}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">
                                            {section.present_count}
                                        </TableCell>
                                        <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">
                                            {section.absent_count}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${(section.attendance_rate ?? 0) >= 75 ? 'bg-green-500' : (section.attendance_rate ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${section.attendance_rate ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium dark:text-slate-300">{section.attendance_rate != null ? section.attendance_rate.toFixed(1) : '0.0'}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/30">
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            No section data available.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Subjects Breakdown */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-6 py-5">
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Subject Wise Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (data?.subject_breakdown && data.subject_breakdown.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12">Subject Name</TableHead>
                                    <TableHead className="text-center h-12">Total Records</TableHead>
                                    <TableHead className="text-center h-12">Present</TableHead>
                                    <TableHead className="text-center h-12">Absent</TableHead>
                                    <TableHead className="text-center h-12">Attendance %</TableHead>
                                    <TableHead className="text-right pr-6 h-12">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.subject_breakdown.map((subject, index) => (
                                    <TableRow
                                        key={subject.subject_id}
                                        className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}`}
                                        onClick={() => navigate(`/attendance/drilldown/${subject.subject_id}/subject?class=${classId}`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-base text-gray-900 dark:text-gray-100">{subject.subject_name}</div>
                                                    <div className="text-xs text-muted-foreground">{subject.subject_code}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">
                                            {subject.total_records || 0}
                                        </TableCell>
                                        <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">
                                            {subject.present_count}
                                        </TableCell>
                                        <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">
                                            {subject.absent_count}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${(subject.attendance_rate ?? 0) >= 75 ? 'bg-green-500' : (subject.attendance_rate ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${subject.attendance_rate ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium dark:text-slate-300">{subject.attendance_rate != null ? subject.attendance_rate.toFixed(1) : '0.0'}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30">
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            No subject data available.
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};
