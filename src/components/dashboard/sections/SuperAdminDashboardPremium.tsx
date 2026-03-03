/**
 * Premium Super Admin Dashboard Section
 * "Wow" factor UI with glassmorphism, gradients, and animated charts.
 */

import { motion } from 'framer-motion';
import {
    Briefcase,
    CalendarClock,
    CheckCircle,
    FileText,
    IndianRupee,
    MoreHorizontal,
    TrendingDown,
    TrendingUp,
    UserPlus,
    Users
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import useSWR from 'swr';
import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from '../../../config/api.config';
import { financeReportsApi, financeTotalApi } from '../../../services/finance.service';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Skeleton } from '../../ui/skeleton';
// Helper for fetching generic endpoints
const fetcher = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const headers = getDefaultHeaders();

    return fetch(fullUrl, { headers }).then(res => {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        return res.json();
    });
};

export const SuperAdminDashboardPremium = () => {
    const navigate = useNavigate();

    // 1. Fetch Global Dashboard Stats (provides student/staff counts, attendance, etc.)
    const { data: globalStats, isLoading: loadingGlobalStats } = useSWR(
        API_ENDPOINTS.stats.dashboard,
        fetcher
    );

    // 2. Fetch Finance Stats (Dashboard)
    const { data: financeStats, isLoading: loadingFinance } = useSWR(
        'finance-dashboard-stats',
        financeReportsApi.dashboard
    );

    // 3. Fetch Activity Logs
    const { data: activityLogs, isLoading: loadingLogs } = useSWR(
        API_ENDPOINTS.activityLogs.list + '?page_size=10',
        fetcher
    );

    // Prepare Stats Data
    const statsData = useMemo(() => {
        // Use globalStats as the single source for student/staff counts (avoids 2 extra API calls)
        const stats = Array.isArray(globalStats) ? globalStats[0] : globalStats;

        const studentCount = stats?.total_students || 0;
        const teacherCount = stats?.total_teachers || 0;

        // Revenue processing
        let currentIncome = 0;
        let currentNet = 0;
        if (stats) {
            currentIncome = parseFloat(stats.total_fee_collected_this_month || "0");
            currentNet = financeStats?.current_month?.net || 0;
        } else {
            currentIncome = financeStats?.current_month?.income || 0;
            currentNet = financeStats?.current_month?.net || 0;
        }

        return [
            {
                title: "Total Students",
                value: loadingGlobalStats ? "..." : studentCount.toLocaleString(),
                trend: "+5.2%",
                trendUp: true,
                icon: Users,
                color: "from-blue-500 to-cyan-400",
                shadow: "shadow-blue-500/20"
            },
            {
                title: "Total Teacher",
                value: loadingGlobalStats ? "..." : teacherCount.toLocaleString(),
                trend: "Stable",
                trendUp: null,
                icon: Briefcase,
                color: "from-purple-500 to-pink-400",
                shadow: "shadow-purple-500/20"
            },
            {
                title: "Monthly Revenue",
                value: loadingFinance ? "..." : `₹${currentIncome.toLocaleString()}`,
                trend: "+8.2%",
                trendUp: true,
                icon: IndianRupee,
                color: "from-emerald-500 to-teal-400",
                shadow: "shadow-emerald-500/20"
            },
            {
                title: "Net Income",
                value: loadingFinance ? "..." : `₹${currentNet.toLocaleString()}`,
                trend: "-0.8%",
                trendUp: false,
                icon: CheckCircle,
                color: "from-orange-500 to-amber-400",
                shadow: "shadow-orange-500/20"
            }
        ];
    }, [financeStats, globalStats, loadingGlobalStats, loadingFinance]);

    // Prepare Pie Chart Data (Income Sources)
    const incomeSourceData = useMemo(() => {
        if (loadingFinance || !financeStats?.top_income_sources) return [];

        const colors = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

        // Map from API response format
        return financeStats.top_income_sources.map((item: any, index: number) => ({
            name: item.app.charAt(0).toUpperCase() + item.app.slice(1),
            value: item.amount,
            color: colors[index % colors.length]
        }));
    }, [financeStats, loadingFinance]);

    // Prepare Activity Data
    const mappedActivities = useMemo(() => {
        if (loadingLogs || !activityLogs?.results) return [];
        return activityLogs.results.map((log: any) => ({
            id: log.id,
            user: log.user_name || "System",
            action: log.action_display || "performed action",
            time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            details: log.description || log.object_repr,
            avatar: "" // No avatar in logs usually
        }));
    }, [activityLogs, loadingLogs]);

    // 7. Fetch Finance Totals for Chart (History)
    const { data: financeHistory, isLoading: loadingHistory } = useSWR(
        'finance-totals-history',
        financeTotalApi.list
    );

    // Real Area Chart Data from History
    const chartData = useMemo(() => {
        if (loadingHistory || !financeHistory?.results) return [];

        // Sort by date ascending
        const sortedHistory = [...financeHistory.results].sort((a, b) =>
            new Date(a.month).getTime() - new Date(b.month).getTime()
        );

        // Take last 6 months (or all if less)
        const recentHistory = sortedHistory.slice(-6);

        if (recentHistory.length === 0) {
            // Fallback to current month if history is empty but we have stats
            const baseIncome = financeStats?.current_month?.income || 0;
            const baseExpense = financeStats?.current_month?.expense || 0;
            if (baseIncome || baseExpense) {
                return [{
                    name: new Date().toLocaleString('default', { month: 'short' }),
                    income: baseIncome,
                    expense: baseExpense
                }];
            }
            return [];
        }

        return recentHistory.map(item => ({
            name: new Date(item.month).toLocaleString('default', { month: 'short' }),
            income: item.total_income,
            expense: item.total_expense
        }));
    }, [financeHistory, loadingHistory, financeStats]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* 1. Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group`}>
                            {/* Gradient Background Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity`} />

                            <CardContent className="p-6 relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                                        <h3 className="text-3xl font-bold tracking-tight text-foreground">
                                            {stat.value === "..." ? <Skeleton className="h-8 w-32" /> : stat.value}
                                        </h3>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md ${stat.shadow}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    {stat.trendUp === true && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5">
                                            <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}
                                        </Badge>
                                    )}
                                    {stat.trendUp === false && (
                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5">
                                            <TrendingDown className="h-3 w-3 mr-1" /> {stat.trend}
                                        </Badge>
                                    )}
                                    {stat.trendUp === null && (
                                        <Badge variant="secondary" className="px-2 py-0.5">
                                            {stat.trend}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">vs last month</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* 2. Analytics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Main Chart */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="h-full border-none shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Financial Overview</CardTitle>
                                    <CardDescription>Income vs Expenses</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8">Monthly</Button>
                                    <Button variant="default" size="sm" className="h-8">Yearly</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {loadingFinance ? (
                                    <Skeleton className="h-full w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                                            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Secondary Chart */}
                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="h-full border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>Income Sources</CardTitle>
                            <CardDescription>Revenue by Module</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-0 pb-6">
                            <div className="h-[220px] w-full mt-4">
                                {loadingFinance ? (
                                    <Skeleton className="h-full w-full" />
                                ) : incomeSourceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={incomeSourceData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {incomeSourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                {incomeSourceData.slice(0, 4).map((entry, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{entry.name}</span>
                                            {/* <span className="text-xs text-muted-foreground">{(entry.value).toLocaleString()}</span> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* 3. Bottom Row: Activity & Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Recent Activity */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="border-none shadow-lg h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>System Activity</CardTitle>
                                <CardDescription>Real-time system events</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[300px] px-6 pb-6">
                                <div className="space-y-6">
                                    {loadingLogs ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-12 w-full" />
                                            <Skeleton className="h-12 w-full" />
                                            <Skeleton className="h-12 w-full" />
                                        </div>
                                    ) : mappedActivities.length > 0 ? (
                                        mappedActivities.map((activity: any) => (
                                            <div key={activity.id} className="flex items-center">
                                                <Avatar className="h-10 w-10 mr-4 border-2 border-background shadow-sm">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                        {activity.user.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1 flex-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {activity.user} <span className="text-muted-foreground font-normal">{activity.action}</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.details} • {activity.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            No recent activity
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="border-none shadow-lg h-full">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Frequently used modules</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 border-blue-100 dark:border-blue-800 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-300 group" onClick={() => navigate('/students/list')}>
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                        <UserPlus className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">Add Student</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 border-emerald-100 dark:border-emerald-800 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:shadow-md transition-all duration-300 group" onClick={() => navigate('/fees/collection')}>
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                        <IndianRupee className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">Collect Fees</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 border-purple-100 dark:border-purple-800 hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md transition-all duration-300 group" onClick={() => navigate('/academic/timetables')}>
                                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                        <CalendarClock className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">Timetable</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 border-amber-100 dark:border-amber-800 hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:shadow-md transition-all duration-300 group" onClick={() => navigate('/reports/generated')}>
                                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">Reports</span>
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};
