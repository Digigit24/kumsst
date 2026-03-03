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
import { useRequirementDrillDown } from '@/hooks/useProcurementDrillDown';
import {
    ChevronLeft,
    Clock,
    FileText,
    Trophy,
    CheckCircle2,
    Truck
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ProcurementRequirementDrillDownPage: React.FC = () => {
    const { reqId } = useParams<{ reqId: string }>();
    const navigate = useNavigate();
    const { data: requirement, isLoading, error, refetch } = useRequirementDrillDown(reqId ? parseInt(reqId) : null);

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
                    <FileText className="h-3 w-3" />
                    Procurement Overview
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <span className="font-medium text-foreground bg-background px-2 py-0.5 rounded-full shadow-sm border dark:bg-slate-800 dark:border-slate-700">
                    Requirement {requirement?.requirement_number}
                </span>
            </div>

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Requirement Details
                        </h1>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-48 mb-2" /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-violet-200 text-sm">Requirement Number</p>
                                <p className="text-2xl font-semibold">{requirement?.requirement_number}</p>
                            </div>
                            <div>
                                <p className="text-violet-200 text-sm">Status</p>
                                <Badge variant="secondary" className="mt-1 text-base px-3 py-1 capitalize dark:bg-violet-900/40 dark:text-violet-200">
                                    {requirement?.status.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-violet-200 text-sm">Estimated Budget</p>
                                <p className="text-2xl font-semibold">
                                    {requirement?.estimated_budget ? formatCurrency(requirement.estimated_budget) : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-violet-200 text-sm">Required By</p>
                                <p className="text-xl font-medium mt-1">
                                    {requirement?.required_by_date ? new Date(requirement.required_by_date).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Info Side Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-md bg-white dark:bg-slate-800">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</p>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{requirement?.title}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgency</p>
                                <Badge variant={requirement?.urgency === 'urgent' ? 'destructive' : 'outline'} className="mt-1 dark:text-gray-100">
                                    {requirement?.urgency}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Central Store</p>
                                <p className="text-gray-900 dark:text-gray-100">{requirement?.central_store_name}</p>
                            </div>

                            <div className="pt-2 border-t dark:border-slate-700">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Justification</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                    "{requirement?.justification}"
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {requirement?.purchase_order_id && (
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/store/drilldown/purchase-order/${requirement.purchase_order_id}`)}>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="bg-blue-100 dark:bg-blue-800/40 p-3 rounded-full text-blue-600 dark:text-blue-400">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-blue-900 dark:text-blue-200">Purchase Order Created</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Click to view details</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-md bg-white dark:bg-slate-800">
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-20 w-full" /> : (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {requirement?.description || 'No description provided.'}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-white dark:bg-slate-800 overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-500" />
                                    Supplier Quotations
                                </CardTitle>
                                {requirement?.quotation_comparison && requirement.quotation_comparison.length > 0 && (
                                    <Badge variant="outline" className="bg-white dark:bg-slate-700">
                                        {requirement.quotation_comparison.length} Received
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-6">
                                    <Skeleton className="h-48 w-full rounded-xl" />
                                </div>
                            ) : (requirement?.quotation_comparison && requirement.quotation_comparison.length > 0) ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableRow className="border-b border-slate-100 dark:border-slate-700 hover:bg-transparent">
                                                <TableHead className="pl-6 h-12">Supplier Details</TableHead>
                                                <TableHead className="text-right h-12">Quoted Amount</TableHead>
                                                <TableHead className="text-center h-12">Delivery Time</TableHead>
                                                <TableHead className="text-center h-12 pr-6">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requirement.quotation_comparison.map((quote) => {
                                                const isLowestPrice = requirement.quotation_comparison?.every(q => q.grand_total >= quote.grand_total);
                                                const isFastestDelivery = requirement.quotation_comparison?.every(q => (q.delivery_time_days || 999) >= (quote.delivery_time_days || 999));

                                                return (
                                                    <TableRow
                                                        key={quote.quotation_id}
                                                        className={`
                                                            border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors
                                                            ${quote.is_selected
                                                                ? 'bg-green-50/60 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                                                        `}
                                                    >
                                                        <TableCell className="pl-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className={`font-semibold text-base ${quote.is_selected ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                                    {quote.supplier_name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                                    <span>#{quote.quotation_number}</span>
                                                                    {quote.is_selected && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                                                                            <Trophy className="h-3 w-3" /> Selected
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right py-4">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-base">
                                                                    {formatCurrency(quote.grand_total)}
                                                                </span>
                                                                {isLowestPrice && (
                                                                    <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                                                                        Lowest Price
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center py-4">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    {quote.delivery_time_days ? `${quote.delivery_time_days} Days` : '-'}
                                                                </span>
                                                                {isFastestDelivery && quote.delivery_time_days && (
                                                                    <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                                                                        Fastest
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center pr-6 py-4">
                                                            {quote.is_selected ? (
                                                                <div className="flex justify-center">
                                                                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shadow-sm">
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-600">-</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-slate-900 dark:text-slate-200">No quotations received</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                            Quotations from suppliers will appear here for comparison once they respond.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
