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
import { useProcurementOverview } from '@/hooks/useProcurementDrillDown';
import {
    AlertCircle,
    ArrowRight,
    Building2,
    FileText,
    IndianRupee,
    ShoppingCart
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProcurementOverviewPage: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const { data, isLoading, error, refetch } = useProcurementOverview(filters);

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

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-black/20 min-h-screen">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-900 dark:via-blue-900 dark:to-indigo-950 shadow-xl border border-white/20 dark:border-white/10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative z-10 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                                Procurement Overview
                            </h1>
                            <p className="text-cyan-50 dark:text-cyan-200 text-lg font-medium">
                                Centralized procurement and inventory tracking
                            </p>
                        </div>
                        <div>
                            <Button
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md shadow-sm transition-all"
                                onClick={() => navigate('/store/drilldown/supplier-performance')}
                            >
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Supplier Performance
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none"></div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: 'Total Requirements',
                        icon: FileText,
                        value: data?.total_requirements ?? '-',
                        sub: data?.pending_requirements != null ? `${data.pending_requirements} Pending` : '-',
                        color: 'text-cyan-600 dark:text-cyan-400',
                        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
                        border: 'border-cyan-100 dark:border-cyan-900/50',
                        cardBg: 'hover:shadow-cyan-200/50 dark:hover:shadow-cyan-900/20'
                    },
                    {
                        title: 'Requirements Value',
                        icon: IndianRupee,
                        value: data?.total_estimated_budget != null ? formatCurrency(data.total_estimated_budget) : '-',
                        sub: 'Estimated Budget',
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                        border: 'border-blue-100 dark:border-blue-900/50',
                        cardBg: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-900/20'
                    },
                    {
                        title: 'Total Purchase Orders',
                        icon: ShoppingCart,
                        value: data?.total_purchase_orders ?? '-',
                        sub: data?.active_purchase_orders != null ? `${data.active_purchase_orders} Active` : '-',
                        color: 'text-amber-600 dark:text-amber-400',
                        bg: 'bg-amber-50 dark:bg-amber-900/20',
                        border: 'border-amber-100 dark:border-amber-900/50',
                        cardBg: 'hover:shadow-amber-200/50 dark:hover:shadow-amber-900/20'
                    },
                    {
                        title: 'Orders Value',
                        icon: IndianRupee,
                        value: data?.total_po_value != null ? formatCurrency(data.total_po_value) : '-',
                        sub: 'Total PO Value',
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        border: 'border-emerald-100 dark:border-emerald-900/50',
                        cardBg: 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/20'
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

            {/* Central Store Breakdown */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
                <CardHeader className="border-b px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Central Stores Overview
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
                    ) : (data?.central_store_breakdown && data.central_store_breakdown.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6 h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Store Name</TableHead>
                                    <TableHead className="text-right h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Req.</TableHead>
                                    <TableHead className="text-right h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active POs</TableHead>
                                    <TableHead className="text-right h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inventory Value</TableHead>
                                    <TableHead className="text-right pr-6 h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.central_store_breakdown.map((store, index) => (
                                    <TableRow
                                        key={store.store_id}
                                        className={`cursor-pointer transition-all border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60`}
                                        onClick={() => navigate(`/store/drilldown/${store.store_id}/central-store`)}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-cyan-100/50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center ring-1 ring-inset ring-cyan-600/10 dark:ring-cyan-400/20">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-foreground">{store.store_name}</div>
                                                    <div className="text-xs text-muted-foreground">{store.store_code}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800">
                                                {store.pending_requirements}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary" className="font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-100 dark:border-amber-800">
                                                {store.active_pos}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(store.inventory_value || 0)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-900/20 font-medium group/btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/store/drilldown/${store.store_id}/central-store`);
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
                                <Building2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No Stores Found</h3>
                            <p className="text-muted-foreground mt-1">There are no central stores available to display at the moment.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
