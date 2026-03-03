/**
 * Income Dashboard Page - Accountant Module
 * Modern financial dashboard with clean UI inspired by Fineless design
 */

import { motion, Variants } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  Filter,
  IndianRupee,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { PageLoader } from '../../components/common/LoadingComponents';
import { useIncomeDashboard } from '../../hooks/useAccountant';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import type { IncomeDashboardFilters } from '../../types/accountant.types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

// Mini sparkline component
const Sparkline = ({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) => {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default function IncomeDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<IncomeDashboardFilters>({
    from_date: '',
    to_date: '',
  });
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '6M' | '1Y'>('1M');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = useDebouncedCallback((term: string) => {
    setTransactionSearch(term);
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchInput(term);
    handleSearch(term);
  };

  const { data: dashboard, isLoading, error, refetch } = useIncomeDashboard(filters);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Dashboard refreshed');
    } catch {
      toast.error('Failed to refresh');
    }
  };

  // Get user's first name for greeting
  const userName = useMemo(() => {
    if (user?.first_name) return user.first_name;
    if (user?.username) return user.username;
    try {
      const storedUser = JSON.parse(localStorage.getItem('kumss_user') || '{}');
      return storedUser.first_name || storedUser.username || 'User';
    } catch {
      return 'User';
    }
  }, [user]);

  // Generate sparkline data from last 7 days
  const sparklineData = useMemo(() => {
    if (!dashboard?.last_7_days || !Array.isArray(dashboard.last_7_days)) return [0, 0, 0, 0, 0, 0, 0];
    return dashboard.last_7_days.map(d => Number(d.total || 0));
  }, [dashboard]);

  // Calculate category data
  const categoryData = useMemo(() => {
    if (!dashboard?.by_category || !Array.isArray(dashboard.by_category)) return [];

    const categories = [
      { key: 'fee collections', name: 'Fee Collections', icon: CreditCard, color: '#10b981', route: '/accountant/fee-collections' },
      { key: 'store sales', name: 'Store Sales', icon: ShoppingCart, color: '#8b5cf6', route: '/accountant/store-sales' },
      { key: 'library fines', name: 'Library Fines', icon: BookOpen, color: '#f59e0b', route: '/library/fines' },
    ];

    return categories.map(cat => {
      const match = dashboard.by_category.find(c =>
        (c.category || '').toLowerCase() === cat.key
      );
      return {
        ...cat,
        amount: match?.total || 0,
        count: match?.count || 0,
        // Since we don't have historical comparison for categories in this payload, we'll null check or derive safely
        change: 0,
        sparkline: sparklineData.map(v => v * (0.2 + Math.random() * 0.3)), // Keep decorative sparkline or remove
      };
    });
  }, [dashboard, sparklineData]);

  // Chart data for area chart
  const areaChartData = useMemo(() => {
    if (!dashboard?.revenue_activity || !dashboard.revenue_activity[timeRange]) return [];

    const activity = dashboard.revenue_activity[timeRange];
    return activity.breakdown.map((item) => ({
      name: item.label,
      revenue: item.total,
      // You can add expense data here if available in breakdown, otherwise 0 or simulated
      expenses: 0,
    }));
  }, [dashboard, timeRange]);

  // Recent transactions from last 7 days
  const recentTransactions = useMemo(() => {
    if (!dashboard?.last_7_days) return [];

    const sorted = [...dashboard.last_7_days].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (!transactionSearch) return sorted;

    return sorted.filter(t =>
      t.date.toLowerCase().includes(transactionSearch.toLowerCase())
    );
  }, [dashboard, transactionSearch]);



  const formatDateDetails = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }), // Mon, Tue
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), // 12 Jan
      full: date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  // Calculate money in/out for cashflow
  const cashflow = useMemo(() => {
    const totalIn = dashboard?.income?.total || 0;
    const totalOut = dashboard?.expense?.total || 0;
    const total = totalIn - totalOut;

    // Calculate percentages safely
    const totalVolume = totalIn + totalOut;
    const inPercent = totalVolume > 0 ? Math.round((totalIn / totalVolume) * 100) : 0;
    const outPercent = totalVolume > 0 ? Math.round((totalOut / totalVolume) * 100) : 0;

    return {
      total,
      moneyIn: totalIn,
      moneyOut: totalOut,
      inPercent,
      outPercent,
    };
  }, [dashboard]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{(error as any)?.message || 'Failed to load dashboard'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          {getGreeting()}, {userName}
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Main Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card - Large */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                <Button variant="link" className="text-xs text-primary p-0 h-auto" onClick={() => navigate('/finance/reports')}>
                  View more
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-foreground">
                    {formatCurrency(dashboard?.totals?.net_income || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Revenue: {' '}
                    <span className="text-emerald-500 font-medium">
                      {formatCompactCurrency(dashboard?.totals?.total_revenue || 0)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Balance Chart */}
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#balanceGradient)"
                      dot={{ fill: '#10b981', r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Mini Cards */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {categoryData.map((cat) => (
                  <div
                    key={cat.key}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-lg transition-colors"
                    onClick={() => navigate(cat.route)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{cat.name}</span>
                      <Button variant="link" className="text-xs text-primary p-0 h-auto">View more</Button>
                    </div>
                    <p className="text-xl font-bold">{formatCompactCurrency(cat.amount)}</p>
                    {/* Decorative visual only since we don't have % change data */}
                    <div className="flex items-center gap-1 mt-1 opacity-50">
                      <span className="text-xs text-muted-foreground">Count: {cat.count}</span>
                    </div>
                    <div className="h-[30px] mt-2">
                      <Sparkline data={cat.sparkline} color={cat.color} height={30} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cashflow Card - Right Side */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cashflow</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-3xl font-bold">{formatCurrency(cashflow.total)}</p>

              {/* Money In/Out */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{formatCompactCurrency(cashflow.moneyIn)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-500">In</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCompactCurrency(cashflow.moneyOut)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-500">Out</span>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{cashflow.inPercent}% money in</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${cashflow.inPercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{cashflow.outPercent}% money out</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${cashflow.outPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="font-semibold">{(dashboard?.totals?.total_transactions || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Spend Activity Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Revenue Activity</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {(['1W', '1M', '6M', '1Y'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'ghost'}
                      size="sm"
                      className={`px-3 h-7 text-xs ${timeRange === range ? '' : 'text-muted-foreground'}`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 text-sm">
                            <p className="font-medium mb-2">{label}</p>
                            {payload.map((p: any, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="text-muted-foreground">{p.name}:</span>
                                <span className="font-medium">{formatCompactCurrency(p.value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions & Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">Last 7 Days Activity</CardTitle>
                  <p className="text-xs text-muted-foreground">Daily collection summaries</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search date..."
                    value={searchInput}
                    onChange={onSearchChange}
                    className="pl-9 w-[180px] h-9 text-xs transition-all focus:w-[220px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No activity found for this period
                  </div>
                ) : (
                  recentTransactions.map((tx, index) => {
                    const { day, date, full } = formatDateDetails(tx.date);
                    // const percent = maxDailyTotal > 0 ? (tx.total / maxDailyTotal) * 100 : 0;

                    return (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:hover:border-gray-700 transition-all"
                      >
                        {/* Date Section */}
                        <div className="flex items-center gap-4 min-w-[140px]">
                          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <span className="text-[10px] uppercase tracking-wider">{day}</span>
                            <span className="text-lg leading-none font-bold">{date.split(' ')[0]}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">{date.split(' ')[1]} {new Date(tx.date).getFullYear()}</span>
                            <span className="text-sm font-medium text-foreground">Daily Total</span>
                          </div>
                        </div>



                        {/* Amount & Status Section */}
                        <div className="flex items-center gap-4 text-right min-w-[120px] justify-end">
                          <div>
                            <p className="text-sm font-bold font-mono text-foreground">
                              {formatCurrency(tx.total)}
                            </p>
                            <div className="flex justify-end mt-1">
                              <Badge
                                variant="outline"
                                className={`h-5 text-[10px] px-2 border-0 ${tx.total > 0
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                  : 'bg-gray-50 text-gray-500 dark:bg-gray-800'
                                  }`}
                              >
                                {tx.total > 0 ? 'Collected' : 'No Collection'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Collection Goals */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Collection Goals</CardTitle>
                <Button variant="link" className="text-xs text-primary p-0 h-auto" onClick={() => navigate('/accountant/fee-collections')}>
                  View more
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Goal 1: Monthly Target */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Monthly Target</p>
                      <p className="text-xs text-muted-foreground">{Math.round(dashboard?.collection_goals?.monthly?.progress_percentage || 0)}% achieved</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{formatCompactCurrency(dashboard?.collection_goals?.monthly?.target || 0)}</p>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, dashboard?.collection_goals?.monthly?.progress_percentage || 0))}%` }}
                  />
                </div>
              </div>

              {/* Goal 2: Yearly Target */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Yearly Target</p>
                      <p className="text-xs text-muted-foreground">{Math.round(dashboard?.collection_goals?.yearly?.progress_percentage || 0)}% collected</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{formatCompactCurrency(dashboard?.collection_goals?.yearly?.target || 0)}</p>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, dashboard?.collection_goals?.yearly?.progress_percentage || 0))}%` }}
                  />
                </div>
              </div>

              {/* Goal 3: Outstanding Dues */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Outstanding Dues</p>
                      <p className="text-xs text-muted-foreground">Total remaining</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-500">{formatCompactCurrency(dashboard?.collection_goals?.total_outstanding || 0)}</p>
                </div>
                {/* Outstanding doesn't have a percentage bar normally, but we can show it if there's a target logic. For now, simple display. */}
                <div className="h-1 w-full bg-red-100 rounded-full mt-2"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
