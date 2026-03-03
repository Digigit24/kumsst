/**
 * Store Sales Page - Accountant Module
 * Premium design with modern UI/UX
 */

import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  IndianRupee,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { DataTable } from '../../components/common/DataTable';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useStoreSales } from '../../hooks/useAccountant';
import type { StoreSale, StoreSaleFilters } from '../../types/accountant.types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};

export default function StoreSalesPage() {
  const [filters, setFilters] = useState<StoreSaleFilters>({
    page: 1,
    page_size: 10,
  });

  const { data, isLoading, error, refetch } = useStoreSales(filters);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.results) return null;

    const totalSales = data.results.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount),
      0
    );
    const completedSales = data.results.filter(
      (sale) => sale.payment_status === 'completed'
    ).length;
    const pendingSales = data.results.filter(
      (sale) => sale.payment_status === 'pending'
    ).length;
    const avgSale = data.results.length > 0 ? totalSales / data.results.length : 0;

    return {
      total: totalSales,
      completed: completedSales,
      pending: pendingSales,
      average: avgSale,
      count: data.results.length,
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, any> = {
      cash: '💵',
      card: '💳',
      upi: '📱',
      online: '🌐',
      bank: '🏦',
    };
    return icons[method.toLowerCase()] || '💰';
  };

  const columns = [
    {
      key: 'id',
      label: 'Sale ID',
      sortable: true,
      render: (item: StoreSale) => (
        <span className="font-mono font-semibold text-primary">#{item.id}</span>
      ),
    },
    {
      key: 'student_name',
      label: 'Customer',
      sortable: true,
      render: (item: StoreSale) => {
        const name = item.student_name || item.teacher_name || 'Walk-in Customer';
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (item: StoreSale) => (
        <span className={`font-semibold text-lg ${item.payment_status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
          {formatCurrency(parseFloat(item.total_amount))}
        </span>
      ),
    },
    {
      key: 'payment_method',
      label: 'Payment',
      sortable: true,
      render: (item: StoreSale) => (
        <Badge variant="secondary" className="capitalize font-medium">
          {item.payment_method}
        </Badge>
      ),
    },
    {
      key: 'sale_date',
      label: 'Sale Date',
      sortable: true,
      render: (item: StoreSale) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {new Date(item.sale_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      sortable: true,
      render: (item: StoreSale) => (
        <Badge
          variant={item.payment_status === 'completed' ? 'success' : 'warning'}
          className="capitalize"
        >
          {item.payment_status === 'completed' && (
            <ArrowUpRight className="w-3 h-3 mr-1" />
          )}
          {item.payment_status === 'pending' && (
            <ArrowDownRight className="w-3 h-3 mr-1" />
          )}
          {item.payment_status}
        </Badge>
      ),
    },
    {
      key: 'sold_by_name',
      label: 'Sold By',
      sortable: false,
      render: (item: StoreSale) => (
        <span className="text-sm text-muted-foreground">{item.sold_by_name}</span>
      ),
    },
  ];

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-100">
                    Total Sales
                  </CardTitle>
                  <ShoppingCart className="w-5 h-5 text-blue-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.total)}</div>
                <p className="text-xs text-blue-100 mt-1">
                  {stats.count} transactions
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Completed Sales */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-100">
                    Completed
                  </CardTitle>
                  <ArrowUpRight className="w-5 h-5 text-green-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.completed}</div>
                <p className="text-xs text-green-100 mt-1">
                  {((stats.completed / stats.count) * 100).toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Sales */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-yellow-500 to-yellow-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-yellow-100">
                    Pending
                  </CardTitle>
                  <ArrowDownRight className="w-5 h-5 text-yellow-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pending}</div>
                <p className="text-xs text-yellow-100 mt-1">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Average Sale */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-100">
                    Average Sale
                  </CardTitle>
                  <IndianRupee className="w-5 h-5 text-purple-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.average)}</div>
                <p className="text-xs text-purple-100 mt-1">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Sales Trend Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Sales Trend</CardTitle>
                <CardDescription>Daily store sales performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    data?.results
                      ?.slice(0, 7)
                      .reverse()
                      .map((item) => ({
                        name: new Date(item.sale_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        }),
                        amount: parseFloat(item.total_amount),
                        date: item.sale_date,
                      })) || []
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
                            <p className="font-medium mb-1">{payload[0].payload.name}</p>
                            <p style={{ color: payload[0].color }}>
                              Amount: {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <DataTable
          title="Store Sales"
          description="Track all store sales and transactions"
          columns={columns}
          data={data}
          isLoading={isLoading}
          error={error ? (error as any).message : null}
          onRefresh={refetch}
          filters={filters}
          onFiltersChange={(newFilters) => setFilters(newFilters as StoreSaleFilters)}
          searchPlaceholder="Search by customer, sale ID..."
          searchDebounceDelay={600}
        />
      </motion.div>
    </motion.div>
  );
}
