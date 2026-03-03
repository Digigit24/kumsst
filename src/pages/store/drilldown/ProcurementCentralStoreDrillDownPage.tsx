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
import { useCentralStoreDrillDown } from '@/hooks/useProcurementDrillDown';
import {
    AlertTriangle,
    Boxes,
    ChevronLeft,
    IndianRupee
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ProcurementCentralStoreDrillDownPage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const { data, isLoading, error, refetch } = useCentralStoreDrillDown(storeId ? parseInt(storeId) : null, filters);

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

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link
                    to="/store/drilldown"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    <Boxes className="h-3 w-3" />
                    Procurement Overview
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <span className="font-medium text-foreground bg-background px-2 py-0.5 rounded-full shadow-sm border dark:bg-slate-800 dark:border-slate-700">
                    {data?.store_name || 'Central Store'}
                </span>
            </div>

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate('/store/drilldown')}
                                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    {data?.store_name || 'Loading...'}
                                </h1>
                            </div>
                            <p className="text-emerald-100 text-lg pl-14">
                                Store inventory and procurement details
                            </p>
                        </div>
                        <div>
                            <Button
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm"
                                onClick={() => navigate(`/store/drilldown/${storeId}/inventory`)}
                            >
                                <Boxes className="mr-2 h-4 w-4" />
                                View Inventory
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: 'Total Requirements',
                        icon: Boxes,
                        value: data?.total_requirements ?? '-',
                        sub: 'All requirements',
                        color: 'text-teal-600 dark:text-teal-400',
                        bg: 'bg-teal-50 dark:bg-teal-900/20'
                    },
                    {
                        title: 'Inventory Value',
                        icon: IndianRupee,
                        value: data?.total_inventory_value != null ? formatCurrency(data.total_inventory_value) : '-',
                        sub: `${data?.total_inventory_items ?? 0} Items`,
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20'
                    },
                    {
                        title: 'Orders Value',
                        icon: IndianRupee,
                        value: data?.total_po_value != null ? formatCurrency(data.total_po_value) : '-',
                        sub: 'Total PO Spend',
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-900/20'
                    },
                    {
                        title: 'Low Stock',
                        icon: AlertTriangle,
                        value: data?.low_stock_items?.length ?? 0,
                        sub: 'Items to reorder',
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

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Requirements Breakdown */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden h-full">
                    <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-6 py-5 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Recent Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="space-y-4 p-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : (data?.requirement_breakdown && data.requirement_breakdown.length > 0) ? (
                            <Table>
                                <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="pl-6">Req. No</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="text-right">Est. Cost</TableHead>
                                        <TableHead className="text-right pr-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.requirement_breakdown.slice(0, 5).map((req, index) => (
                                        <TableRow
                                            key={req.requirement_id}
                                            className="cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                                            onClick={() => navigate(`/store/drilldown/requirement/${req.requirement_id}`)}
                                        >
                                            <TableCell className="pl-6 font-medium text-emerald-700 dark:text-emerald-400">
                                                {req.requirement_number}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {req.title}
                                            </TableCell>
                                            <TableCell className="text-right font-medium dark:text-slate-200">
                                                {req.estimated_budget ? formatCurrency(req.estimated_budget) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                        ${req.status === 'fulfilled' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                                                            req.status === 'po_created' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                                                req.status === 'quotations_received' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                                                                    req.status === 'urgent' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' :
                                                                        'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}
                                                    `}
                                                >
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No recent requirements
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent GRNs */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden h-full">
                    <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-6 py-5 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Recent GRNs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="space-y-4 p-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : (data?.recent_grns && data.recent_grns.length > 0) ? (
                            <Table>
                                <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="pl-6">GRN No</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right pr-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recent_grns.slice(0, 5).map((grn, index) => (
                                        <TableRow
                                            key={grn.grn_id}
                                            className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                                            onClick={() => navigate(`/store/drilldown/grn/${grn.grn_id}`)}
                                        >
                                            <TableCell className="pl-6 font-medium text-blue-700 dark:text-blue-400">
                                                {grn.grn_number}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(grn.receipt_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right font-medium dark:text-slate-200">
                                                {formatCurrency(grn.invoice_amount)}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 uppercase text-[10px]">
                                                    {grn.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No recent GRNs
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
