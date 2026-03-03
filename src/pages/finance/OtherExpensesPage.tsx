/**
 * Other Expenses Page - Finance Module
 * Premium design with expense tracking and analytics
 */

import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  CreditCard,
  DollarSign,
  IndianRupee,
  Loader2,
  Plus,
  RefreshCw,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { otherExpenseApi } from '../../services/finance.service';
import type { OtherExpense, OtherExpenseCreateInput, Paginated } from '../../types/finance.types';

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

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1 capitalize">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} style={{ color: p.color || p.fill }}>
            {p.name}: {typeof p.value === 'number' ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function OtherExpensesPage() {
  const [data, setData] = useState<Paginated<OtherExpense> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<OtherExpenseCreateInput>({
    title: '',
    description: '',
    amount: 0,
    category: '',
    payment_method: 'cash',
    date: '',
    receipt: null,
  });

  const categoryOptions = ['maintenance', 'utilities', 'supplies', 'marketing', 'travel', 'miscellaneous'];
  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'bank', label: 'Bank Transfer', icon: CreditCard },
    { value: 'online', label: 'Online Payment', icon: Activity },
    { value: 'cheque', label: 'Cheque', icon: CreditCard },
    { value: 'upi', label: 'UPI', icon: DollarSign },
  ];

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await otherExpenseApi.list();
      setData(res);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to load other expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (field: keyof OtherExpenseCreateInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category || !formData.payment_method || !formData.date) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      setIsSaving(true);
      await otherExpenseApi.create(formData);
      setIsFormOpen(false);
      setFormData({ title: '', description: '', amount: 0, category: '', payment_method: 'cash', date: '', receipt: null });
      load();
      toast.success('Expense added successfully');
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to save expense');
      toast.error('Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    await load();
    toast.success('Expenses refreshed successfully');
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
          alt="Loading expenses..."
          className="w-64 h-64"
        />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading Other Expenses...
        </h3>
        <p className="text-muted-foreground">Fetching expense data</p>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate summary stats
  const totalExpenses = data?.results?.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0) || 0;
  const expenseCount = data?.results?.length || 0;
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  // Group by category for pie chart
  const categoryData: Record<string, number> = {};
  data?.results?.forEach(exp => {
    categoryData[exp.category] = (categoryData[exp.category] || 0) + parseFloat(exp.amount.toString());
  });
  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Group by payment method for bar chart
  const paymentData: Record<string, number> = {};
  data?.results?.forEach(exp => {
    paymentData[exp.payment_method] = (paymentData[exp.payment_method] || 0) + parseFloat(exp.amount.toString());
  });
  const barData = Object.entries(paymentData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Recent expenses for line chart
  const recentExpenses = data?.results?.slice(0, 7).reverse() || [];
  const lineData = recentExpenses.map(exp => ({
    name: formatDate(exp.date),
    value: parseFloat(exp.amount.toString())
  }));

  return (
    <>
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
              Other Expenses
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track additional expenses not covered by other departments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="hover:bg-primary/10">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsFormOpen(true)} size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-100 font-medium text-sm flex justify-between items-center">
                  TOTAL EXPENSES
                  <IndianRupee className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(totalExpenses)}
                </div>
                <p className="text-red-100 text-xs mt-1 opacity-80">
                  All categories combined
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
                  TOTAL RECORDS
                  <Activity className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {expenseCount}
                </div>
                <p className="text-purple-100 text-xs mt-1 opacity-80">
                  Expense entries
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <Activity className="w-32 h-32" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-100 font-medium text-sm flex justify-between items-center">
                  AVERAGE EXPENSE
                  <TrendingUp className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(avgExpense)}
                </div>
                <p className="text-blue-100 text-xs mt-1 opacity-80">
                  Per transaction
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <TrendingUp className="w-32 h-32" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Category Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Category Distribution</CardTitle>
                    <CardDescription>Expenses by category</CardDescription>
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
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
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

          {/* Bar Chart - Payment Methods */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Payment Methods</CardTitle>
                    <CardDescription>Expenses by payment type</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
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
                      <Bar dataKey="value" fill="#8b5cf6" name="Amount" radius={[8, 8, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Line Chart - Expense Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Expense Trend</CardTitle>
                  <CardDescription>Recent expense activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
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
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, strokeWidth: 2 }}
                      name="Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenses Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Expense List</CardTitle>
                  <CardDescription>All recorded expenses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Title</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.results?.map((exp, index) => (
                      <motion.tr
                        key={exp.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <td className="py-3 px-4 font-semibold">{exp.title}</td>
                        <td className="py-3 px-4 text-right font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(parseFloat(exp.amount.toString()))}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {exp.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {exp.payment_method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(exp.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                          {exp.description || '-'}
                        </td>
                      </motion.tr>
                    ))}
                    {!data?.results?.length && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No expenses found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div >

      {/* Add Expense Dialog */}
      < Dialog open={isFormOpen} onOpenChange={setIsFormOpen} >
        <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label required>Title</Label>
              <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Amount</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label required>Category</Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(v) => handleChange('category', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Payment Method</Label>
                <Select
                  value={formData.payment_method || undefined}
                  onValueChange={(v) => handleChange('payment_method', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label required>Date</Label>
                <Input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Receipt (optional)</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleChange('receipt', e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog >
    </>
  );
}
