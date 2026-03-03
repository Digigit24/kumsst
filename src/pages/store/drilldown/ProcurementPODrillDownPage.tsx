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
import { usePODrillDown } from '@/hooks/useProcurementDrillDown';
import {
    ChevronLeft,
    Clock,
    FileCheck,
    Package,
    Truck
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ProcurementPODrillDownPage: React.FC = () => {
    const { poId } = useParams<{ poId: string }>();
    const navigate = useNavigate();
    const { data: po, isLoading, error, refetch } = usePODrillDown(poId ? parseInt(poId) : null);

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
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link
                    to="/store/drilldown"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    <Truck className="h-3 w-3" />
                    Procurement Overview
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <span className="font-medium text-foreground bg-background px-2 py-0.5 rounded-full shadow-sm border">
                    PO {po?.po_number}
                </span>
            </div>

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 shadow-2xl">
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
                            Purchase Order
                        </h1>
                    </div>

                    {isLoading ? <Skeleton className="h-24 w-full" /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-blue-200 text-sm">PO Number</p>
                                <p className="text-2xl font-semibold">{po?.po_number}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm">Supplier</p>
                                <p className="text-xl font-medium">{po?.supplier_name}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm">Total Amount</p>
                                <p className="text-2xl font-semibold">{po?.total_amount ? formatCurrency(po.total_amount) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm">Delivery By</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 opacity-70" />
                                    <span className="text-lg">{po?.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Ordered Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-48 w-full" /> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-center">Qty Ordered</TableHead>
                                            <TableHead className="text-center">Qty Received</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {po?.items.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={item.received_quantity >= item.quantity ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}>
                                                        {item.received_quantity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* GRNs / Delivery Status */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Delivery Status (GRNs)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-32 w-full" /> : (
                                <div className="space-y-4">
                                    {po?.grns && po.grns.length > 0 ? (
                                        po.grns.map((grn: any) => (
                                            <div
                                                key={grn.id}
                                                className="p-4 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/store/drilldown/grn/${grn.id}`)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-slate-800">{grn.grn_number}</span>
                                                    <Badge variant="secondary">{grn.status}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <span>Received: {new Date(grn.received_date).toLocaleDateString()}</span>
                                                    <Package className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-slate-50 p-6 rounded-lg text-center text-muted-foreground border border-dashed">
                                            No goods received yet
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-green-50/50 border-green-100 border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <FileCheck className="h-8 w-8 text-green-600 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-green-900">Quality Checklist</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Ensure all items are inspected upon receipt. Click on a GRN to view inspection results.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
