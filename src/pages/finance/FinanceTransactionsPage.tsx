/**
 * Finance Transactions Page - Finance Module
 * Premium design with filtering and modern UI/UX
 */

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  IndianRupee,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'sonner';
import dataLoadingGif from '../../assets/data-loading.gif';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { financeTransactionsApi } from '../../services/finance.service';
import type { FinanceTransaction, FinanceTransactionFilters, Paginated } from '../../types/finance.types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const COLORS = ['#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} style={{ color: p.color || p.fill }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceTransactionsPage() {
  const [data, setData] = useState<Paginated<FinanceTransaction> | null>(null);
  const [filters, setFilters] = useState<FinanceTransactionFilters>({ page: 1, page_size: 20 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await financeTransactionsApi.list(filters);
      setData(res);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const handleFilterChange = (key: keyof FinanceTransactionFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleRefresh = async () => {
    await load();
    toast.success('Transactions refreshed successfully');
  };

  const handleReset = () => {
    setFilters({ page: 1, page_size: 20 });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
        <img
          src={dataLoadingGif}
          alt="Loading transactions..."
          className="w-64 h-64"
        />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading Transactions...
        </h3>
        <p className="text-muted-foreground">Fetching transaction data</p>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate summary stats
  const totalIncome = data?.results?.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
  const totalExpense = data?.results?.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
  const netAmount = totalIncome - totalExpense;
  const transactionCount = data?.results?.length || 0;

  // Prepare chart data
  const typeData = [
    { name: 'Income', value: totalIncome, color: '#10b981' },
    { name: 'Expense', value: totalExpense, color: '#ef4444' }
  ];

  // Group transactions by date for area chart (last 7 transactions)
  const recentTransactions = data?.results?.slice(0, 7).reverse() || [];
  const areaData = recentTransactions.map(tx => ({
    name: formatDate(tx.date),
    value: parseFloat(tx.amount.toString()),
    type: tx.type
  }));

  return (
    <motion.div
      className="p-6 space-y-8 min-h-screen bg-transparent"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Finance Transactions
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Unified transaction log with advanced filters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset Filters
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="hover:bg-primary/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-100 font-medium text-sm flex justify-between items-center">
                TOTAL INCOME
                <ArrowUpRight className="h-4 w-4 opacity-70" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-green-100 text-xs mt-1 opacity-80">
                From all sources
              </p>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <ArrowUpRight className="w-32 h-32" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-100 font-medium text-sm flex justify-between items-center">
                TOTAL EXPENSE
                <ArrowDownRight className="h-4 w-4 opacity-70" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(totalExpense)}
              </div>
              <p className="text-red-100 text-xs mt-1 opacity-80">
                All expenditures
              </p>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <ArrowDownRight className="w-32 h-32" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className={`overflow-hidden relative border-none shadow-lg ${netAmount >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} text-white`}>
            <CardHeader className="pb-2">
              <CardTitle className={`${netAmount >= 0 ? 'text-blue-100' : 'text-orange-100'} font-medium text-sm flex justify-between items-center`}>
                NET AMOUNT
                <IndianRupee className="h-4 w-4 opacity-70" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(netAmount)}
              </div>
              <p className={`${netAmount >= 0 ? 'text-blue-100' : 'text-orange-100'} text-xs mt-1 opacity-80`}>
                {netAmount >= 0 ? 'Surplus' : 'Deficit'}
              </p>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <IndianRupee className="w-32 h-32" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-100 font-medium text-sm flex justify-between items-center">
                TRANSACTIONS
                <Activity className="h-4 w-4 opacity-70" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {transactionCount}
              </div>
              <p className="text-purple-100 text-xs mt-1 opacity-80">
                Total records
              </p>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <Activity className="w-32 h-32" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-muted/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">App</label>
                <Input
                  value={filters.app || ''}
                  onChange={(e) => handleFilterChange('app', e.target.value || undefined)}
                  placeholder="e.g., fees"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Type</label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(v) => handleFilterChange('type', v === 'all' ? undefined : v)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">From Date</label>
                <Input
                  type="date"
                  value={filters.from_date || ''}
                  onChange={(e) => handleFilterChange('from_date', e.target.value || undefined)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">To Date</label>
                <Input
                  type="date"
                  value={filters.to_date || ''}
                  onChange={(e) => handleFilterChange('to_date', e.target.value || undefined)}
                  className="bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Transaction Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Transaction Trend</CardTitle>
                  <CardDescription>Recent transaction activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={areaData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart - Income vs Expense */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Income vs Expense</CardTitle>
                  <CardDescription>Distribution breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Transaction History</CardTitle>
                <CardDescription>Detailed transaction records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">App</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.map((tx, index) => (
                    <motion.tr
                      key={tx.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-primary">#{tx.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {tx.app}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={tx.type === 'income' ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'}>
                          {tx.type === 'income' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          {tx.type}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(parseFloat(tx.amount.toString()))}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(tx.date).toLocaleDateString('en-IN')}
                      </td>
                    </motion.tr>
                  ))}
                  {!data?.results?.length && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
