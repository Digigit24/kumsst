import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLowAttendanceAlerts } from '@/hooks/useAttendanceDrillDown';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CheckCircle2,
    Phone,
    User,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AttendanceLowAttendanceAlertsPage: React.FC = () => {
    const navigate = useNavigate();
    const [threshold, setThreshold] = useState<number>(75);

    // Using Low Attendance Alerts Hook
    const { data, isLoading, error, refetch } = useLowAttendanceAlerts({ threshold });

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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(-1)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 -ml-3"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <Badge variant="outline" className="text-amber-100 border-amber-400/30 bg-amber-500/20">
                                    Alerts System
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Low Attendance Alerts
                            </h1>
                            <p className="text-amber-100 text-lg">
                                Students falling below the minimum attendance threshold
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
                            <div>
                                <label className="text-xs text-amber-100 font-semibold uppercase tracking-wider block mb-1">
                                    Threshold %
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={threshold}
                                        onChange={(e) => setThreshold(Number(e.target.value))}
                                        className="w-20 h-9 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                                    />
                                    <span className="text-lg font-bold">%</span>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/20"></div>
                            <div>
                                <div className="text-xs text-amber-100 font-semibold uppercase tracking-wider block mb-1">
                                    Students at Risk
                                </div>
                                <div className="text-2xl font-bold">
                                    {data ? data.length : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students List */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden mb-8">
                <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            At-Risk Students
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                                {data ? data.length : 0} Records
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
                    ) : (data && data.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12">Student Name</TableHead>
                                    <TableHead className="h-12">Class & Section</TableHead>
                                    <TableHead className="text-center h-12">Attendance %</TableHead>
                                    <TableHead className="h-12">Guardian Contact</TableHead>
                                    <TableHead className="text-right pr-6 h-12">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((student, index) => (
                                    <TableRow
                                        key={student.student_id}
                                        className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}`}
                                        onClick={() => navigate(`/attendance/drilldown/${student.student_id}/student`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.student_name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Building2 className="h-3.5 w-3.5" />
                                                <span>{student.class_name} • {student.section_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-red-500"
                                                        style={{ width: `${student.attendance_percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-red-600">{student.attendance_percentage.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{student.guardian_name}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                    <Phone className="h-3 w-3" />
                                                    {student.guardian_phone || 'N/A'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30">
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-50 dark:bg-green-900/20 mb-3">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No Alerts Found</h3>
                            <p className="mt-1">Great! No students found below {threshold}% attendance threshold.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};
