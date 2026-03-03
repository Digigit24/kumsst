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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAttendanceStudentDrillDown } from '@/hooks/useAttendanceDrillDown';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    BarChart as BarChartIcon,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    ListFilter,
    PieChart as PieChartIcon,
    User,
    XCircle
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
        case 'present': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
        case 'absent': return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
        case 'late': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case 'leave': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
};

const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
        case 'present': return 'default';
        case 'absent': return 'destructive';
        case 'late': return 'secondary';
        default: return 'outline';
    }
};

// Custom Tooltip for Charts
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

export const AttendanceStudentDrillDownPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const [activeTab, setActiveTab] = useState("daily");

    // Using Student DrillDown Hook
    const { data, isLoading, error, refetch } = useAttendanceStudentDrillDown(
        studentId ? parseInt(studentId) : null,
        filters
    );

    // Derived Charts Data
    const chartsData = useMemo(() => {
        if (!data) return { pieData: [], barData: [] };

        // Pie Data: Distribution of Status
        const pieData = [
            { name: 'Present', value: data.present_days || 0, color: '#10b981' }, // Emerald-500
            { name: 'Absent', value: data.absent_days || 0, color: '#ef4444' }, // Red-500
            { name: 'Late', value: data.late_days || 0, color: '#f59e0b' },   // Amber-500
        ].filter(item => item.value > 0);

        // Bar Data: Monthly Trend
        const barData = (data.monthly_summary || []).map(month => {
            let monthLabel = month.month;
            try {
                const date = new Date(month.month);
                if (!isNaN(date.getTime())) {
                    monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }
            } catch (e) { }
            return {
                name: monthLabel,
                Present: month.present_days,
                Absent: month.absent_days,
                Late: month.late_days,
                Total: month.total_days
            };
        });

        return { pieData, barData };
    }, [data]);

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[50vh]">
                <Card className="border-red-200 bg-red-50 max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-4 mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="font-semibold text-red-900 text-lg mb-2">Error Loading Data</h3>
                        <p className="text-sm text-red-700 mb-6">{(error as any)?.message || 'Unknown error occurred while fetching student details.'}</p>
                        <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700 w-full">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/30 dark:bg-slate-950/30 min-h-screen">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-xl border border-white/10">
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
                                <Badge variant="outline" className="text-indigo-100 border-indigo-400/30 bg-indigo-500/20 backdrop-blur-md px-3 py-1 shadow-sm">
                                    Student Profile
                                </Badge>
                                {data?.is_low_attendance && (
                                    <Badge variant="destructive" className="bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/20">
                                        Low Attendance Alert
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm mb-2 leading-tight">
                                    {data?.student_name || <Skeleton className="h-12 w-64 bg-white/20" />}
                                </h1>
                                <p className="text-indigo-50 text-lg font-medium opacity-90">
                                    {data?.program_name ? (
                                        <span className="flex items-center gap-2 flex-wrap">
                                            {data.program_name} <span className="text-indigo-300">•</span> {data.class_name} <span className="text-indigo-300">•</span> {data.section_name}
                                        </span>
                                    ) : <Skeleton className="h-6 w-96 bg-white/20" />}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                                    <User className="h-4 w-4 text-indigo-200" />
                                    <span className="text-sm font-medium text-indigo-50">Roll: {data?.roll_number || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                                    <Badge className="h-4 w-4 bg-indigo-400/50 p-0 rounded-full flex items-center justify-center text-[10px] shadow-none">#</Badge>
                                    <span className="text-sm font-medium text-indigo-50">Adm: {data?.admission_number || '-'}</span>
                                </div>
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
                        title: 'Total Days',
                        icon: CalendarIcon,
                        value: data?.total_days ?? '-',
                        sub: 'School Days',
                        color: 'text-indigo-600 dark:text-indigo-400',
                        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                        border: 'border-indigo-100 dark:border-indigo-800'
                    },
                    {
                        title: 'Total Present',
                        icon: CheckCircle2,
                        value: data?.present_days ?? '-',
                        sub: 'Days Attended',
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        border: 'border-emerald-100 dark:border-emerald-800'
                    },
                    {
                        title: 'Total Absent',
                        icon: XCircle,
                        value: data?.absent_days ?? '-',
                        sub: 'Days Missed',
                        color: 'text-rose-600 dark:text-rose-400',
                        bg: 'bg-rose-50 dark:bg-rose-900/20',
                        border: 'border-rose-100 dark:border-rose-800'
                    },
                    {
                        title: 'Late Days',
                        icon: Clock,
                        value: data?.late_days ?? '-',
                        sub: 'Arrived Late',
                        color: 'text-amber-600 dark:text-amber-400',
                        bg: 'bg-amber-50 dark:bg-amber-900/20',
                        border: 'border-amber-100 dark:border-amber-800'
                    }
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

            {/* Charts Section - New! */}
            {!isLoading && data && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Attendance Distribution Chart */}
                    <Card className="col-span-1 border-none shadow-md bg-white dark:bg-slate-900/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5 text-indigo-500" />
                                Attendance Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full flex items-center justify-center">
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
                                        <p className="text-sm">No data to display chart</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Trend Chart */}
                    <Card className="col-span-1 lg:col-span-2 border-none shadow-md bg-white dark:bg-slate-900/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <BarChartIcon className="h-5 w-5 text-indigo-500" />
                                Monthly Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                {chartsData.barData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartsData.barData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                            <Legend verticalAlign="top" align="right" iconType="circle" />
                                            <Bar dataKey="Present" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
                                            <Bar dataKey="Absent" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={32} />
                                            <Bar dataKey="Late" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-muted-foreground p-4 flex flex-col items-center justify-center h-full">
                                        <BarChartIcon className="h-10 w-10 mb-2 opacity-20" />
                                        <p className="text-sm">No monthly data available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs for detailed data */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <div className="flex items-center justify-between sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 py-2 backdrop-blur-sm">
                    <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl flex w-full md:w-auto overflow-x-auto md:overflow-visible no-scrollbar space-x-1">
                        <TabsTrigger value="daily" className="rounded-lg px-4 py-2 whitespace-nowrap data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-900/20 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all font-medium flex-shrink-0">Daily Records</TabsTrigger>
                        <TabsTrigger value="monthly" className="rounded-lg px-4 py-2 whitespace-nowrap data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-900/20 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all font-medium flex-shrink-0">Monthly Summary</TabsTrigger>
                        <TabsTrigger value="subjects" className="rounded-lg px-4 py-2 whitespace-nowrap data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-900/20 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all font-medium flex-shrink-0">Subject Wise</TabsTrigger>
                    </TabsList>
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden lg:flex gap-2">
                            <ListFilter className="h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </div>

                {/* Daily Records Tab */}
                <TabsContent value="daily" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="border-b px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-500" />
                                Daily Attendance Log
                            </CardTitle>
                            <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-white dark:bg-slate-900">
                                {data?.attendance_records?.length || 0} Records
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="space-y-4 p-6">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : (data?.attendance_records && data.attendance_records.length > 0) ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="pl-6 h-12 font-semibold text-xs uppercase tracking-wider w-[200px] whitespace-nowrap">Date</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider w-[150px] whitespace-nowrap">Status</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Check In</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Check Out</TableHead>
                                                <TableHead className="text-right pr-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Remarks</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.attendance_records.map((record, index) => (
                                                <TableRow
                                                    key={index}
                                                    className={`transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60`}
                                                >
                                                    <TableCell className="font-medium pl-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
                                                                <CalendarIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-foreground">
                                                                    {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={getStatusBadgeVariant(record.status)}
                                                            className={`px-3 py-1 shadow-sm capitalize border ${getStatusColor(record.status)} select-none cursor-default hover:bg-opacity-80 transition-opacity`}
                                                        >
                                                            {record.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground font-mono text-xs">
                                                        {record.check_in_time ? (
                                                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 font-normal">
                                                                {record.check_in_time}
                                                            </Badge>
                                                        ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground font-mono text-xs">
                                                        {record.check_out_time ? (
                                                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 font-normal">
                                                                {record.check_out_time}
                                                            </Badge>
                                                        ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 max-w-[200px] truncate" title={record.remarks || ''}>
                                                        {record.remarks ? (
                                                            <span className="text-sm text-slate-600 dark:text-slate-400 italic">"{record.remarks}"</span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4 animate-pulse">
                                        <CalendarIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No Attendance Records</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">There are no daily records available for the selected period.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Monthly Summary Tab */}
                <TabsContent value="monthly" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="border-b px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50">
                            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-indigo-500" />
                                Monthly Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="space-y-4 p-6">
                                    {[1, 2].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : (data?.monthly_summary && data.monthly_summary.length > 0) ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="pl-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Month</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Total Days</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Present</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Absent</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Late</TableHead>
                                                <TableHead className="text-right pr-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Attendance %</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.monthly_summary.map((month, index) => {
                                                // Handle various date formats for month
                                                let monthLabel = month.month;
                                                try {
                                                    const date = new Date(month.month);
                                                    if (!isNaN(date.getTime())) {
                                                        monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                                    }
                                                } catch (e) {
                                                    // Keep original if parse fails
                                                }

                                                return (
                                                    <TableRow
                                                        key={index}
                                                        className={`transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60`}
                                                    >
                                                        <TableCell className="font-medium pl-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                                    <CalendarIcon className="h-4 w-4" />
                                                                </div>
                                                                {monthLabel}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                                {month.total_days}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded text-sm min-w-[2rem] inline-block">
                                                                {month.present_days}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 px-2 py-0.5 rounded text-sm min-w-[2rem] inline-block">
                                                                {month.absent_days}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded text-sm min-w-[2rem] inline-block">
                                                                {month.late_days}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${(month.attendance_rate ?? 0) >= 75 ? 'bg-emerald-500' : (month.attendance_rate ?? 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'} transition-all duration-500`}
                                                                        style={{ width: `${month.attendance_rate ?? 0}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-sm font-bold ${(month.attendance_rate ?? 0) >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                                    {month.attendance_rate.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                        <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No Monthly Data</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">No monthly summary information currently available.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Subject Wise Tab */}
                <TabsContent value="subjects" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="border-b px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50">
                            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-teal-500" />
                                Subject Wise Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="space-y-4 p-6">
                                    {[1, 2].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : (data?.subject_breakdown && data.subject_breakdown.length > 0) ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="pl-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Subject Name</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Total Classes</TableHead>
                                                <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Attended</TableHead>
                                                <TableHead className="text-right pr-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Attendance %</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.subject_breakdown.map((subject, index) => (
                                                <TableRow
                                                    key={subject.subject_id}
                                                    className={`transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60`}
                                                >
                                                    <TableCell className="font-medium pl-6 py-4">
                                                        {subject.subject_name}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground">
                                                        {subject.total_classes}
                                                    </TableCell>
                                                    <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">
                                                        {subject.attended_classes}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${(subject.attendance_percentage ?? 0) >= 75 ? 'bg-emerald-500' : (subject.attendance_percentage ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${subject.attendance_percentage ?? 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-bold dark:text-slate-300 w-12 text-right">
                                                                {subject.attendance_percentage != null ? subject.attendance_percentage.toFixed(1) : '0.0'}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No Subject Data</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">Subject-wise attendance data is not available for this student.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
