/**
 * Finance App Summary Page - Finance Module
 * Premium design with Apex Charts and modern UI/UX
 */

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  PieChart as PieIcon,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { financeReportsApi } from '../../services/finance.service';
import type { FinanceAppSummary } from '../../types/finance.types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Vibrant colors for the charts
const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1 capitalize">{label}</p>
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

export default function FinanceAppSummaryPage() {
  const [summary, setSummary] = useState<FinanceAppSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await financeReportsApi.appSummary();
      setSummary(res);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to load department summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    await load();
    toast.success('Data refreshed successfully');
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
          alt="Loading department summary..."
          className="w-64 h-64"
        />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading Department Summary...
        </h3>
        <p className="text-muted-foreground">Fetching income and expense data</p>
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

  // Process data for charts
  const summaryData = summary ? Object.entries(summary).map(([app, data]) => ({
    app: app.charAt(0).toUpperCase() + app.slice(1),
    income: data.income,
    expense: data.expense,
    net: data.total
  })) : [];

  const totalIncome = summaryData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = summaryData.reduce((sum, item) => sum + item.expense, 0);
  const netTotal = totalIncome - totalExpense;

  const pieData = summaryData.map(item => ({
    name: item.app,
    value: item.income
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
            Department Summary
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Income, expense, and net performance per department
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="hover:bg-primary/10">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                Across all departments
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
                Total operational costs
              </p>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <ArrowDownRight className="w-32 h-32" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className={`overflow-hidden relative border-none shadow-lg ${netTotal >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} text-white`}>
            <CardHeader className="pb-2">
              <CardTitle className={`${netTotal >= 0 ? 'text-blue-100' : 'text-orange-100'} font-medium text-sm flex justify-between items-center`}>
                NET TOTAL
                <IndianRupee className="h-4 w-4 opacity-70" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(netTotal)}
              </div>
              <p className={`${netTotal >= 0 ? 'text-blue-100' : 'text-orange-100'} text-xs mt-1 opacity-80`}>
                {netTotal >= 0 ? 'Profit' : 'Loss'}
              </p>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <IndianRupee className="w-32 h-32" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Income vs Expense */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Income vs Expense</CardTitle>
                  <CardDescription>Comparison by department</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summaryData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="app"
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
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart - Income Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <PieIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Income Distribution</CardTitle>
                  <CardDescription>Revenue by department</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

      {/* Department Details Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Department Details</CardTitle>
                <CardDescription>Detailed breakdown of all departments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Department</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Income</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Expense</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Net</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((item, index) => (
                    <motion.tr
                      key={item.app}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                            {item.app.charAt(0)}
                          </div>
                          <span className="font-semibold">{item.app}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(item.income)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(item.expense)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${item.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {formatCurrency(item.net)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/finance/transactions?app=${item.app.toLowerCase()}`)}
                          className="hover:bg-primary/10"
                        >
                          View Transactions
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
