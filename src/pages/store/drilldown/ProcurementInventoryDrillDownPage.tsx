import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useStoreInventoryDrillDown } from '@/hooks/useProcurementDrillDown';
import {
    AlertTriangle,
    Boxes,
    ChevronLeft,
    Search
} from 'lucide-react';
import React, { useState } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ProcurementInventoryDrillDownPage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
    const { data, isLoading, error, refetch } = useStoreInventoryDrillDown(storeId ? parseInt(storeId) : null);

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

    const filteredItems = (data?.items || []).filter(item =>
        item.item_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.item_code.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.category_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

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
                <Link
                    to={`/store/drilldown/${storeId}/central-store`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    Central Store
                </Link>
                <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
                <span className="font-medium text-foreground bg-background px-2 py-0.5 rounded-full shadow-sm border dark:bg-slate-800 dark:border-slate-700">
                    Inventory
                </span>
            </div>

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/store/drilldown/${storeId}/central-store`)}
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Store Inventory
                        </h1>
                    </div>

                    {isLoading ? <Skeleton className="h-24 w-full" /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-slate-300 text-sm">Store Name</p>
                                <p className="text-2xl font-semibold">{data?.store_name}</p>
                            </div>
                            <div>
                                <p className="text-slate-300 text-sm">Total Valuation</p>
                                <p className="text-2xl font-semibold text-emerald-400">{data?.total_inventory_value ? formatCurrency(data.total_inventory_value) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-slate-300 text-sm">Low Stock Alerts</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    <span className="text-xl font-medium text-amber-400">{data?.low_stock_count} Items</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-300 text-sm">Out of Stock</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <span className="text-xl font-medium text-red-400">{data?.out_of_stock_count} Items</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items, Item Code, or category..."
                        className="pl-9 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6">
                            <Skeleton className="h-48 w-full" />
                        </div>
                    ) : (filteredItems && filteredItems.length > 0) ? (
                        <Table>
                            <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="pl-6">Item Name & Code</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Unit Cost</TableHead>
                                    <TableHead className="text-center">Available / On Hand</TableHead>
                                    <TableHead className="text-center">Allocated</TableHead>
                                    <TableHead className="text-right">Total Value</TableHead>
                                    <TableHead className="text-right pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map((item) => (
                                    <TableRow key={item.item_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                        <TableCell className="pl-6">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{item.item_name}</div>
                                            <div className="text-xs text-muted-foreground">{item.item_code}</div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{item.category_name}</TableCell>
                                        <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(item.unit_cost)}</TableCell>
                                        <TableCell className="text-center font-medium">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.quantity_available}</span>
                                            <span className="text-slate-400 mx-1">/</span>
                                            <span className="text-slate-600 dark:text-slate-400">{item.quantity_on_hand}</span>
                                        </TableCell>
                                        <TableCell className="text-center text-amber-600 dark:text-amber-400">{item.quantity_allocated}</TableCell>
                                        <TableCell className="text-right font-medium text-slate-700 dark:text-slate-200">
                                            {formatCurrency(item.total_value)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Badge
                                                variant="outline"
                                                className={`
                                                    ${!item.is_low_stock && !item.is_out_of_stock ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                        item.is_out_of_stock ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                                                            'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'}
                                                `}
                                            >
                                                {item.is_out_of_stock ? 'Out of Stock' : item.is_low_stock ? 'Low Stock' : 'In Stock'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchQuery ? 'No items matching your search' : 'No inventory items found'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
