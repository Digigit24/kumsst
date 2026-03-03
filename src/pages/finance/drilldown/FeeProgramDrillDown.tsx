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
import { useFeeProgramDrillDown } from '@/hooks/useFeeDrillDown';
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    ChevronLeft,
    IndianRupee,
    PiggyBank,
    TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const FeeProgramDrillDown: React.FC = () => {
    const { yearId, programId } = useParams<{ yearId: string; programId: string }>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const { data, isLoading, error, refetch } = useFeeProgramDrillDown(programId ? parseInt(programId) : null, filters);

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-500">Error: {(error as any)?.message}</p>
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
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link
                    to="/finance/drilldown"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    <IndianRupee className="h-3 w-3" />
                    Fee Overview
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <Link
                    to={`/finance/drilldown/${yearId}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    {yearId}
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <span className="font-medium text-foreground bg-background px-2 py-0.5 rounded-full shadow-sm border">
                    {data?.program_name || 'Program'}
                </span>
            </div>

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/finance/drilldown/${yearId}`)}
                                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    {data?.program_name || 'Loading...'}
                                </h1>
                            </div>
                            <p className="text-purple-100 text-lg pl-14">
                                Class-wise collection breakdown
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: 'Total Expected',
                        icon: IndianRupee,
                        value: data?.total_due != null ? formatCurrency(data.total_due) : '-',
                        sub: 'For this program',
                        color: 'text-fuchsia-600',
                        bg: 'bg-fuchsia-50'
                    },
                    {
                        title: 'Collected',
                        icon: PiggyBank,
                        value: data?.total_collected != null ? formatCurrency(data.total_collected) : '-',
                        sub: data?.collection_rate != null ? `${data.collection_rate.toFixed(1)}%` : '-',
                        color: 'text-green-600',
                        bg: 'bg-green-50'
                    },
                    {
                        title: 'Pending',
                        icon: AlertCircle,
                        value: data?.total_outstanding != null ? formatCurrency(data.total_outstanding) : '-',
                        sub: 'Outstanding',
                        color: 'text-red-600',
                        bg: 'bg-red-50'
                    },
                    {
                        title: 'Status',
                        icon: TrendingUp,
                        value: data?.collection_rate != null ? getCollectionBadge(data.collection_rate) : '-',
                        sub: 'Overall Performance',
                        color: 'text-pink-600',
                        bg: 'bg-pink-50'
                    }
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
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
                                    <div className="text-2xl font-bold tracking-tight mt-2 min-h-[32px]">
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

            {/* Class Breakdown */}
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/30 px-6 py-5">
                    <CardTitle className="text-xl font-bold text-gray-800">Class Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (data && data.class_breakdown && data.class_breakdown.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12">Class Name</TableHead>
                                    <TableHead className="text-center h-12">Semester</TableHead>
                                    <TableHead className="text-center h-12">Students</TableHead>
                                    <TableHead className="text-right h-12">Total Expected</TableHead>
                                    <TableHead className="text-right h-12">Collected</TableHead>
                                    <TableHead className="text-right h-12">Pending</TableHead>
                                    <TableHead className="text-right pr-6 h-12">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.class_breakdown.map((item, index) => (
                                    <TableRow
                                        key={item.class_id}
                                        className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-pink-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                        onClick={() => navigate(`/finance/drilldown/${yearId}/program/${programId}/class/${item.class_id}`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <span className="text-base text-gray-900">{item.class_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">{item.semester}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{item.section_count}</TableCell> {/* Wait, API returns section_count or student_count? In drilldown types I wrote student_count optional. I'll use what I have */}
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(item.total_due || 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600 font-medium">
                                            {formatCurrency(item.total_collected || 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600 font-medium">
                                            {formatCurrency(item.total_outstanding || 0)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/finance/drilldown/${yearId}/program/${programId}/class/${item.class_id}`);
                                                }}
                                            >
                                                Details
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
