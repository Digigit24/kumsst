import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, subDays } from 'date-fns';
import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface StoreManagerSalesChartProps {
    salesData?: { results: any[] } | null;
    isLoading?: boolean;
}

export const StoreManagerSalesChart: React.FC<StoreManagerSalesChartProps> = ({ salesData, isLoading }) => {
    const chartData = useMemo(() => {
        if (!salesData?.results) return [];

        const sales = salesData.results;
        const daysToShow = 30; // Show last 30 days
        const dataMap = new Map<string, number>();
        const dateKeys: string[] = [];

        // Initialize last 30 days with 0
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const key = format(date, 'MMM dd');
            dataMap.set(key, 0);
            dateKeys.push(key);
        }

        sales.forEach((sale: any) => {
            if (!sale.sale_date && !sale.created_at) return;

            const dateStr = sale.sale_date || sale.created_at;
            const date = parseISO(dateStr);
            const key = format(date, 'MMM dd');

            if (dataMap.has(key)) {
                const amount = parseFloat(sale.total_amount || sale.grand_total || '0');
                dataMap.set(key, (dataMap.get(key) || 0) + amount);
            }
        });

        return dateKeys.map(key => ({
            name: key,
            value: dataMap.get(key) || 0
        }));
    }, [salesData]);

    if (isLoading) {
        return (
            <Card className="col-span-4 border-none shadow-sm h-full bg-white dark:bg-card">
                <CardHeader>
                    <CardTitle>Sales Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 border-none shadow-sm bg-white dark:bg-card">
            <CardHeader>
                <CardTitle>Store Sales Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748B"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={3}
                                />
                                <YAxis
                                    stroke="#64748B"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    formatter={(value: number | string | Array<number | string> | undefined) => {
                                        const numValue = typeof value === 'number' ? value : Number(value) || 0;
                                        return [`₹${numValue.toLocaleString('en-IN')}`, 'Sales'];
                                    }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <p>No sales data available for the last 30 days</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
