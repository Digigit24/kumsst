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
import { useGRNDrillDown } from '@/hooks/useProcurementDrillDown';
import {
    CheckCircle,
    ChevronLeft,
    ClipboardCheck,
    Package,
    XCircle
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ProcurementGRNDrillDownPage: React.FC = () => {
    const { grnId } = useParams<{ grnId: string }>();
    const navigate = useNavigate();
    const { data: grn, isLoading, error, refetch } = useGRNDrillDown(grnId ? parseInt(grnId) : null);

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

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link
                    to="/store/drilldown"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    <Package className="h-3 w-3" />
                    Procurement Overview
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <span className="font-medium text-foreground bg-background px-2 py-0.5 rounded-full shadow-sm border dark:bg-slate-800 dark:border-slate-700">
                    GRN {grn?.grn_number}
                </span>
            </div>

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 shadow-2xl">
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
                            Goods Receipt Note
                        </h1>
                    </div>

                    {isLoading ? <Skeleton className="h-24 w-full" /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-emerald-100 text-sm">GRN Number</p>
                                <p className="text-2xl font-semibold">{grn?.grn_number}</p>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Supplier</p>
                                <p className="text-xl font-medium">{grn?.supplier_name}</p>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Associated PO</p>
                                <p className="text-lg font-medium">{grn?.po_number}</p>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Receipt Date</p>
                                <p className="text-lg font-medium">{grn?.receipt_date ? new Date(grn.receipt_date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Invoice No</p>
                                <p className="text-lg font-medium">{grn?.invoice_number}</p>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Acceptance Rate</p>
                                <p className="text-xl font-bold">{grn?.acceptance_rate}%</p>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Status</p>
                                <Badge variant="outline" className="mt-1 bg-white/20 text-white border-none uppercase">
                                    {grn?.status?.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Received Items */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-6 py-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-lg">
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Received Items</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6">
                            <Skeleton className="h-48 w-full" />
                        </div>
                    ) : (grn?.items && grn.items.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6">Item Description</TableHead>
                                    <TableHead className="text-center">Ordered</TableHead>
                                    <TableHead className="text-center">Received</TableHead>
                                    <TableHead className="text-center">Accepted</TableHead>
                                    <TableHead className="text-center">Rejected</TableHead>
                                    <TableHead>Rejection Reason</TableHead>
                                    <TableHead className="text-right pr-6">Quality</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grn.items.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 dark:border-slate-700">
                                        <TableCell className="pl-6 font-medium dark:text-gray-200">
                                            {item.description}
                                            <span className="text-xs text-muted-foreground ml-2">({item.unit})</span>
                                        </TableCell>
                                        <TableCell className="text-center dark:text-gray-300">{item.ordered_quantity}</TableCell>
                                        <TableCell className="text-center font-medium dark:text-gray-200">{item.received_quantity}</TableCell>
                                        <TableCell className="text-center text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20">{item.accepted_quantity}</TableCell>
                                        <TableCell className="text-center text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20">{item.rejected_quantity}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.rejection_reason || '-'}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Badge
                                                variant="outline"
                                                className={`
                                                    ${item.quality_status === 'passed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                                                        item.quality_status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' :
                                                            'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'}
                                                `}
                                            >
                                                {item.quality_status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No items found in this GRN
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="text-green-500 h-5 w-5" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Accepted Items</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Accepted items are automatically added to the store inventory. The stock levels will be updated immediately.
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle className="text-red-500 h-5 w-5" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Rejected Items</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Rejected items must be returned to the supplier. A return note can be generated from the main defects menu.
                    </p>
                </div>
            </div>
        </div>
    );
};
