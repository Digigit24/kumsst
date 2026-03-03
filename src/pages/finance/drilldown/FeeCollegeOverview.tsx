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
import { useFeeCollegeOverview } from '@/hooks/useFeeDrillDown';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    IndianRupee,
    PiggyBank,
    TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const FeeCollegeOverview: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const { data, isLoading, error, refetch } = useFeeCollegeOverview(filters);

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getCollectionBadge = (percentage: number) => {
        if (percentage >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
        if (percentage >= 75) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Good</Badge>;
        return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Attention</Badge>;
    };

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-black/20 min-h-screen">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 dark:from-purple-900 dark:via-fuchsia-900 dark:to-pink-950 shadow-xl border border-white/20 dark:border-white/10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative z-10 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                                Fee Collection Overview
                            </h1>
                            <p className="text-purple-50 dark:text-purple-200 text-lg font-medium">
                                Financial performance across all academic years
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/30 shadow-sm text-white transition-all hover:bg-white/20">
                                <div className="text-xs text-purple-100 uppercase tracking-wider font-semibold mb-0.5">Academic Year</div>
                                <div className="font-semibold text-lg tracking-tight">
                                    {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px] pointer-events-none"></div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: 'Total Expected',
                        icon: IndianRupee,
                        value: data?.total_due != null ? formatCurrency(data.total_due) : '-',
                        sub: 'Total fees to be collected',
                        color: 'text-purple-600 dark:text-purple-400',
                        bg: 'bg-purple-50 dark:bg-purple-900/20',
                        border: 'border-purple-100 dark:border-purple-900/50',
                        cardBg: 'hover:shadow-purple-200/50 dark:hover:shadow-purple-900/20'
                    },
                    {
                        title: 'Total Collected',
                        icon: PiggyBank,
                        value: data?.total_collected != null ? formatCurrency(data.total_collected) : '-',
                        sub: data?.collection_rate != null ? `${data.collection_rate.toFixed(1)}% Collected` : '-',
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        border: 'border-emerald-100 dark:border-emerald-900/50',
                        cardBg: 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/20'
                    },
                    {
                        title: 'Pending Amount',
                        icon: AlertCircle,
                        value: data?.total_outstanding != null ? formatCurrency(data.total_outstanding) : '-',
                        sub: 'Outstanding dues',
                        color: 'text-rose-600 dark:text-rose-400',
                        bg: 'bg-rose-50 dark:bg-rose-900/20',
                        border: 'border-rose-100 dark:border-rose-900/50',
                        cardBg: 'hover:shadow-rose-200/50 dark:hover:shadow-rose-900/20'
                    },
                    {
                        title: 'Collection Rate',
                        icon: TrendingUp,
                        value: data?.collection_rate != null ? `${data.collection_rate.toFixed(1)}%` : '-',
                        sub: 'Overall Progress',
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                        border: 'border-blue-100 dark:border-blue-900/50',
                        cardBg: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-900/20'
                    }
                ].map((item, i) => (
                    <Card key={i} className={`border ${item.border} shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.cardBg} group overflow-hidden relative`}>
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
                                    <div className="text-2xl font-bold tracking-tight mt-2 text-foreground">
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

            {/* Academic Year Breakdown */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
                <CardHeader className="border-b px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                            Academic Year Breakdown
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
                    ) : (data && data.academic_year_breakdown && data.academic_year_breakdown.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic Year</TableHead>
                                    <TableHead className="text-right h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Expected</TableHead>
                                    <TableHead className="text-right h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collected</TableHead>
                                    <TableHead className="text-right h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending</TableHead>
                                    <TableHead className="text-right pr-6 h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.academic_year_breakdown.map((year, index) => (
                                    <TableRow
                                        key={year.academic_year}
                                        className={`cursor-pointer transition-all border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60`}
                                        onClick={() => navigate(`/finance/drilldown/${year.academic_year_id}`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center ring-1 ring-inset ring-purple-600/10 dark:ring-purple-400/20">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-semibold text-foreground">{year.academic_year}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-muted-foreground">
                                            {formatCurrency(year.total_due || 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold">
                                            {formatCurrency(year.total_collected || 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-rose-600 dark:text-rose-400 font-bold">
                                            {formatCurrency(year.total_outstanding || 0)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 font-medium group/btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/finance/drilldown/${year.academic_year_id}`);
                                                }}
                                            >
                                                Details
                                                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-3">
                                <PiggyBank className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No Data Found</h3>
                            <p className="text-muted-foreground mt-1">There is no financial data available to display at the moment.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
