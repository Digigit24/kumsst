/**
 * Finance Reports Page - Finance Module
 * Premium design with monthly reports and charts
 */

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  IndianRupee,
  PieChart as PieIcon,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
import { Input } from '../../components/ui/input';
import { financeReportsApi } from '../../services/finance.service';
import type { MonthlyReport } from '../../types/finance.types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

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

export default function FinanceReportsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await financeReportsApi.monthly(year, month);
      setReport(res);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to load monthly report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleRefresh = async () => {
    await load();
    toast.success('Report refreshed successfully');
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
          alt="Loading reports..."
          className="w-64 h-64"
        />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading Monthly Report...
        </h3>
        <p className="text-muted-foreground">Fetching financial reports</p>
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
  const appData = report ? Object.entries(report.apps).map(([app, data]) => ({
    app: app.charAt(0).toUpperCase() + app.slice(1),
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  })) : [];

  const pieData = appData.map(item => ({
    name: item.app,
    value: item.income
  }));

  const totalIncome = report?.total_income || 0;
  const totalExpense = report?.total_expense || 0;
  const netTotal = report?.net || 0;

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
            Finance Reports
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monthly income/expense breakdown per department
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="hover:bg-primary/10">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-muted/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Year</label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value) || year)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Month</label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value) || month)}
                    className="bg-background"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

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
                {report?.month || 'Current month'}
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
                {report?.month || 'Current month'}
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
        {/* Bar Chart - Income vs Expense by App */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Department Comparison</CardTitle>
                  <CardDescription>Income vs Expense breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={appData}
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
                  <CardDescription>Revenue share by department</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      dataKey="value"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius: or, percent, name }) => {
                        // Only render label if slice is >= 3%
                        if ((percent ?? 0) < 0.03) return null;
                        // Guard: Recharts types these as number | undefined in strict mode
                        if (midAngle == null || cx == null || cy == null || innerRadius == null || or == null) return null;
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (or - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={13}
                            fontWeight={600}
                          >
                            {`${((percent ?? 0) * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {pieData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any, name: any) => [formatCurrency(value), name]}
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Zero-income departments note */}
              {pieData.some(d => d.value === 0) && (
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Departments with ₹0 income are hidden from the chart
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Line Chart - Net Performance */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Net Performance</CardTitle>
                <CardDescription>Profit/Loss by department</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={appData}
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
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    name="Net"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Department Details Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Department Breakdown</CardTitle>
                <CardDescription>Detailed financial summary</CardDescription>
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
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {appData.map((item, index) => {
                    const margin = item.income > 0 ? ((item.net / item.income) * 100).toFixed(1) : '0.0';
                    return (
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
                        <td className={`py-3 px-4 text-right font-semibold ${parseFloat(margin) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {margin}%
                        </td>
                      </motion.tr>
                    );
                  })}
                  {!appData.length && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No report data available
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
