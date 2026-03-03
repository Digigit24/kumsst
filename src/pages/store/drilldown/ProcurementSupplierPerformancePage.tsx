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
import { useSupplierPerformance } from '@/hooks/useProcurementDrillDown';
import {
    BarChart3,
    ChevronLeft,
    Star,
    Users
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ProcurementSupplierPerformancePage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useSupplierPerformance();

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
        <div className="space-y-8 p-6 animate-fade-in bg-background min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link
                    to="/store/drilldown"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    <BarChart3 className="h-3 w-3" />
                    Procurement Overview
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded-full shadow-sm border">
                    Supplier Performance
                </span>
            </div>

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg">
                <div className="relative z-10 p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/store/drilldown')}
                            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Supplier Performance
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-primary-foreground/80 text-sm">Total Suppliers</p>
                            <p className="text-2xl font-semibold">
                                {isLoading ? <Skeleton className="h-8 w-12 bg-primary-foreground/20" /> : data?.total_active_suppliers || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <Card className="border shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 py-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Users className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-bold">Supplier Metrics</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : (data?.suppliers && data.suppliers.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6">Supplier Name & Type</TableHead>
                                    <TableHead className="text-center">Orders (Fulfilled/Total)</TableHead>
                                    <TableHead className="text-right">Total Order Value</TableHead>
                                    <TableHead className="text-center">On-Time Rate</TableHead>
                                    <TableHead className="text-center">Quotations (Selected/Total)</TableHead>
                                    <TableHead className="text-right pr-6">Rating</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.suppliers.map((supplier) => (
                                    <TableRow key={supplier.supplier_id} className="hover:bg-slate-50/50">
                                        <TableCell className="pl-6">
                                            <div className="font-medium">{supplier.supplier_name}</div>
                                            <div className="text-xs text-muted-foreground capitalize">{supplier.supplier_type}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-normal">
                                                {supplier.fulfilled_orders} / {supplier.total_orders}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(supplier.total_order_value)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${supplier.on_time_delivery_rate >= 90 ? 'bg-green-500' : supplier.on_time_delivery_rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${supplier.on_time_delivery_rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium">{supplier.on_time_delivery_rate}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-sm">
                                                {supplier.selected_quotations} / {supplier.total_quotations}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="font-bold text-lg">{supplier.rating}</span>
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No supplier performance data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
