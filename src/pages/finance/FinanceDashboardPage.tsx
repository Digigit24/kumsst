import { Activity, BarChart3, Download, IndianRupee, Shield, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import dataLoadingGif from '../../assets/data-loading.gif';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import {
  financeAppTotalApi,
  financeReportsApi,
  financeTransactionsApi,
} from '../../services/finance.service';
import type {
  DashboardStats,
  FinanceAppSummary,
  FinanceAppTotal,
  FinanceTotals,
  FinanceTransaction,
  FinancialProjections,
  PaymentMethodsReport,
} from '../../types/finance.types';

const formatNumber = (val?: number) => {
  if (val === undefined || val === null) return '0';
  return val.toLocaleString('en-IN');
};

const formatCurrency = (val?: number) => `₹ ${formatNumber(val)}`;

const formatDate = (val?: string) => {
  if (!val) return '-';
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? val : d.toLocaleDateString();
};

export default function FinanceDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [totals, setTotals] = useState<FinanceTotals | null>(null);
  const [appSummary, setAppSummary] = useState<FinanceAppSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<FinanceTransaction[]>([]);
  const [appTotals, setAppTotals] = useState<FinanceAppTotal[]>([]);
  const [projections, setProjections] = useState<FinancialProjections | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [dash, tot, summary, transactions, appTotalsRes, proj, pmethods] = await Promise.all([
          financeReportsApi.dashboard(),
          financeReportsApi.totals(),
          financeReportsApi.appSummary(),
          financeTransactionsApi.list({ page: 1, page_size: 6 }),
          financeAppTotalApi.list(),
          financeReportsApi.projections().catch(() => null),
          financeReportsApi.paymentMethods().catch(() => null),
        ]);
        setDashboard(dash);
        setTotals(tot);
        setAppSummary(summary);
        setRecentTransactions(transactions?.results || []);
        setAppTotals((appTotalsRes as any)?.results || []);
        setProjections(proj);
        setPaymentMethods(pmethods);
      } catch (err: any) {
        setError(typeof err.message === 'string' ? err.message : 'Failed to load finance dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleExportSummary = async () => {
    try {
      const data = await financeReportsApi.exportSummary();
      // Convert to CSV and download
      const csv = [
        ['App', 'Income', 'Expense', 'Net'],
        ...data.data.map(row => [row.app, row.income, row.expense, row.net]),
        ['TOTAL', data.totals.income, data.totals.expense, data.totals.net]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.filename}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Summary exported successfully');
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to export summary');
    }
  };

  const handleExportTransactions = async () => {
    try {
      const data = await financeReportsApi.exportTransactions({});
      // Convert to CSV and download
      const csv = [
        ['Date', 'App', 'Type', 'Amount', 'Payment Method', 'Description'],
        ...data.data.map(row => [
          row.date,
          row.app,
          row.type,
          row.amount,
          row.payment_method || '-',
          row.description
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.filename}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${data.count} transactions exported successfully`);
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to export transactions');
    }
  };

  const progress = useMemo(() => {
    const income = totals?.total_income || 0;
    if (income <= 0) return 0;
    const pct = Math.round(((totals?.net_total || 0) / income) * 100);
    return Math.max(Math.min(pct, 150), -150); // clamp a bit for display
  }, [totals]);

  const appBars = useMemo(() => {
    if (!appSummary) return [];
    const entries = Object.entries(appSummary);
    const values = entries.flatMap(([, d]) => [d.income || 0, d.expense || 0]);
    const maxValue = Math.max(...values, 1);
    return entries.map(([app, d]) => {
      const incomeRatio = (d.income || 0) / maxValue;
      const expenseRatio = (d.expense || 0) / maxValue;
      // give a sensible minimum height for tiny values (but keep relative scale)
      const incomeHeight = Math.min(Math.max(incomeRatio * 100, incomeRatio > 0 ? 8 : 0), 100);
      const expenseHeight = Math.min(Math.max(expenseRatio * 100, expenseRatio > 0 ? 8 : 0), 100);
      return { app, income: d.income, expense: d.expense, incomeHeight, expenseHeight };
    });
  }, [appSummary]);

  const appBreakdown = useMemo(() => {
    if (!appSummary) return [];
    return Object.entries(appSummary)
      .map(([app, d]) => ({
        app,
        income: d.income || 0,
        expense: d.expense || 0,
        net: (d.income || 0) - (d.expense || 0),
      }))
      .sort((a, b) => b.income - a.income)
      .slice(0, 5);
  }, [appSummary]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <img
            src={dataLoadingGif}
            alt="Loading finance dashboard..."
            className="w-64 h-64 object-contain"
          />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Finance Dashboard...
          </h3>
          <p className="text-muted-foreground">
            Fetching financial data and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Left profile rail — desktop only */}
      <div className="hidden lg:flex lg:flex-col rounded-2xl bg-slate-900 text-white shadow-xl overflow-hidden self-start lg:sticky lg:top-6 lg:min-h-[680px] lg:justify-between">
        <div className="flex flex-col items-center py-6 space-y-2 bg-slate-800/80">
          <div className="h-12 w-12 rounded-full bg-card/10 flex items-center justify-center text-xl font-bold">
            ₹
          </div>
          <div className="text-lg font-semibold">Finance</div>
          <div className="text-xs text-slate-200">Central Module</div>
        </div>
        <div className="p-5 space-y-4 text-sm">
          {appBreakdown.length > 0 && (
            <div className="space-y-3">
              <div className="text-[13px] uppercase tracking-wide text-slate-200 font-semibold">Top Apps</div>
              <div className="space-y-3">
                {appBreakdown.map((item) => (
                  <div key={item.app} className="flex items-center gap-3">
                    <span className="text-sm font-semibold capitalize text-white">{item.app}</span>
                    <span className="text-xs text-emerald-200 ml-auto">
                      {formatCurrency(item.income)}
                    </span>
                    <span className="text-xs text-amber-200">
                      {formatCurrency(item.expense)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dashboard?.current_month && (
            <div className="mt-2 space-y-3 rounded-lg border border-white/10 bg-card/5 p-4">
              <div className="text-sm uppercase tracking-wide text-slate-200 font-semibold">This Month</div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white">Income</span>
                <span className="ml-auto font-semibold text-white text-sm">
                  {formatCurrency(dashboard.current_month.income)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="text-sm text-white">Expense</span>
                <span className="ml-auto font-semibold text-white text-sm">
                  {formatCurrency(dashboard.current_month.expense)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-300" />
                <span className="text-sm text-white">Net</span>
                <span className="ml-auto font-semibold text-white text-sm">
                  {formatCurrency(dashboard.current_month.net)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-3 text-base">
              <IndianRupee className="h-4 w-4 text-emerald-400" />
              <span>Income</span>
              <span className="ml-auto font-semibold">{formatCurrency(totals?.total_income)}</span>
            </div>
            <div className="flex items-center gap-3 text-base">
              <BarChart3 className="h-4 w-4 text-orange-300" />
              <span>Expense</span>
              <span className="ml-auto font-semibold">{formatCurrency(totals?.total_expense)}</span>
            </div>
            <div className="flex items-center gap-3 text-base">
              <Activity className="h-4 w-4 text-blue-300" />
              <span>Net</span>
              <span className="ml-auto font-semibold">{formatCurrency(totals?.net_total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Mobile-only finance summary strip */}
        <div className="lg:hidden rounded-2xl bg-slate-900 text-white p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-base shrink-0">₹</div>
            <div>
              <div className="text-sm font-semibold">Finance Overview</div>
              <div className="text-xs text-slate-400">Central Module</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-[10px] text-slate-400 mb-0.5">Income</div>
              <div className="text-xs font-bold text-emerald-400 truncate">{formatCurrency(totals?.total_income)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-[10px] text-slate-400 mb-0.5">Expense</div>
              <div className="text-xs font-bold text-amber-400 truncate">{formatCurrency(totals?.total_expense)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-[10px] text-slate-400 mb-0.5">Net</div>
              <div className="text-xs font-bold text-blue-400 truncate">{formatCurrency(totals?.net_total)}</div>
            </div>
          </div>
          {dashboard?.current_month && (
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/10">
              <div>
                <div className="text-[10px] text-slate-400">This Month Income</div>
                <div className="text-xs font-bold text-emerald-400">{formatCurrency(dashboard.current_month.income)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">This Month Expense</div>
                <div className="text-xs font-bold text-amber-400">{formatCurrency(dashboard.current_month.expense)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">This Month Net</div>
                <div className="text-xs font-bold text-blue-400">{formatCurrency(dashboard.current_month.net)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Top KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Earnings" value={formatCurrency(totals?.total_income)} tone="emerald" />
          <KpiCard label="Expense" value={formatCurrency(totals?.total_expense)} tone="amber" />
          <KpiCard label="Net" value={formatCurrency(totals?.net_total)} tone="indigo" />
          <KpiCard label="Current Month Net" value={formatCurrency(dashboard?.current_month?.net)} tone="blue" />
        </div>

        {/* Bars + donut row */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 via-card to-card text-card-foreground shadow-lg border border-border p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">App Breakdown</h3>
                <p className="text-xs text-muted-foreground">Income vs Expense by app</p>
              </div>
              <Button onClick={() => navigate('/finance/app-summary')} size="sm" variant="outline" className="text-xs">
                Details
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Income</span>
                {appSummary && (
                  <span className="font-semibold">{formatCurrency(appBreakdown.reduce((s, a) => s + a.income, 0))}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span>Expense</span>
                {appSummary && (
                  <span className="font-semibold">{formatCurrency(appBreakdown.reduce((s, a) => s + a.expense, 0))}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span>Net</span>
                {appSummary && (
                  <span className="font-semibold">
                    {formatCurrency(appBreakdown.reduce((s, a) => s + a.net, 0))}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-border bg-muted/40 p-4 overflow-x-auto">
              <div className="relative h-52 min-w-[320px]">
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-1">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="border-t border-border/50" />
                  ))}
                </div>
                <div className="relative h-full flex items-end gap-3">
                  {appBars.map((bar) => (
                    <div key={bar.app} className="flex-1 min-w-[40px] flex flex-col items-center gap-2">
                      <div className="w-full bg-card rounded-lg p-1 flex items-end gap-1 h-36 border border-border">
                        <div
                          className="flex-1 rounded-sm bg-emerald-500"
                          style={{ height: `${bar.incomeHeight}%` }}
                          title={`Income: ${bar.income.toLocaleString()}`}
                        />
                        <div
                          className="flex-1 rounded-sm bg-amber-400"
                          style={{ height: `${bar.expenseHeight}%` }}
                          title={`Expense: ${bar.expense.toLocaleString()}`}
                        />
                      </div>
                      <span className="text-xs font-medium capitalize text-card-foreground text-center">{bar.app}</span>
                    </div>
                  ))}
                  {!appBars.length && <div className="text-sm text-muted-foreground">No department summary data</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-500/5 via-card to-card text-card-foreground shadow-lg border border-border p-4 flex flex-col items-center justify-center gap-4">
            <h3 className="text-lg font-semibold text-card-foreground">Net Progress</h3>
            <Donut value={progress} />
            <div className="text-center space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 justify-center text-xs">
                <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" /> Income
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" /> Expense
              </div>
              <div className="flex items-center gap-2 justify-center text-xs">
                <Shield className="h-3 w-3 text-muted-foreground" />
                Net % is relative to total income
              </div>
            </div>
          </div>
        </div>

        {/* Trend cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <TrendCard
            title="Income Trend"
            primary={dashboard?.current_month?.income}
            secondary={dashboard?.previous_month?.income}
            color="indigo"
          />
          <TrendCard
            title="Expense Trend"
            primary={dashboard?.current_month?.expense}
            secondary={dashboard?.previous_month?.expense}
            color="amber"
          />
          <TrendCard
            title="Net Trend"
            primary={dashboard?.current_month?.net}
            secondary={dashboard?.previous_month?.net}
            color="emerald"
          />
        </div>

        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleExportSummary} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
          <Button onClick={handleExportTransactions} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Transactions
          </Button>
        </div>

        {/* Financial Projections */}
        {projections && (
          <div className="rounded-2xl bg-card text-card-foreground shadow-lg border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  Financial Projections
                </h3>
                <p className="text-xs text-muted-foreground">Based on {projections.based_on_months} months average</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <ProjectionCard
                period="1 Year"
                income={projections.projections['1_year'].income}
                expense={projections.projections['1_year'].expense}
                net={projections.projections['1_year'].net}
              />
              <ProjectionCard
                period="3 Years"
                income={projections.projections['3_year'].income}
                expense={projections.projections['3_year'].expense}
                net={projections.projections['3_year'].net}
              />
              <ProjectionCard
                period="5 Years"
                income={projections.projections['5_year'].income}
                expense={projections.projections['5_year'].expense}
                net={projections.projections['5_year'].net}
              />
            </div>
          </div>
        )}

        {/* Payment Methods Breakdown */}
        {paymentMethods && paymentMethods.breakdown.length > 0 && (
          <div className="rounded-2xl bg-card text-card-foreground shadow-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-500" />
                  Payment Methods Breakdown
                </h3>
                <p className="text-xs text-muted-foreground">Transaction count and total by payment method</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {paymentMethods.breakdown.map((pm) => (
                <div key={pm.method} className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
                  <div className="text-xs text-muted-foreground capitalize">{pm.method}</div>
                  <div className="text-lg font-bold text-card-foreground">{formatCurrency(pm.total)}</div>
                  <div className="text-xs text-muted-foreground">{pm.count} transactions</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* App totals */}
        <div className="rounded-2xl bg-card text-card-foreground shadow-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Department Totals</h3>
              <p className="text-xs text-muted-foreground">Income & Expense by department (latest)</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4">App</th>
                  <th className="py-2 pr-4">Month</th>
                  <th className="py-2 pr-4">Income</th>
                  <th className="py-2 pr-4">Expense</th>
                </tr>
              </thead>
              <tbody>
                {appTotals.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-2 pr-4 capitalize">{row.app_name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{formatDate(row.month)}</td>
                    <td className="py-2 pr-4 font-semibold">{formatCurrency(row.income)}</td>
                    <td className="py-2 pr-4 font-semibold">{formatCurrency(row.expense)}</td>
                  </tr>
                ))}
                {!appTotals.length && (
                  <tr>
                    <td className="py-3 text-muted-foreground">No app totals available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent transactions table */}
        <div className="rounded-2xl bg-card text-card-foreground shadow-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground">Latest income and expense activity</p>
            </div>
            <Button
              onClick={() => navigate('/finance/transactions')}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              View all
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">App</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="py-2 pr-4">{tx.id}</td>
                    <td className="py-2 pr-4 capitalize">{tx.app}</td>
                    <td className="py-2 pr-4 capitalize">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                          }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-semibold">{formatCurrency(tx.amount)}</td>
                    <td className="py-2 pr-4 text-card-foreground">{tx.description}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{formatDate(tx.date)}</td>
                  </tr>
                ))}
                {!recentTransactions.length && (
                  <tr>
                    <td className="py-3 text-muted-foreground">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone = 'emerald',
}: {
  label: string;
  value: string;
  tone?: 'emerald' | 'amber' | 'indigo' | 'blue';
}) {
  const toneStyles: Record<typeof tone, string> = {
    emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30',
    amber: 'from-amber-400/20 to-amber-500/5 border-amber-400/30',
    indigo: 'from-indigo-500/15 to-indigo-500/5 border-indigo-500/30',
    blue: 'from-sky-500/15 to-sky-500/5 border-sky-500/30',
  };

  return (
    <div
      className={`rounded-2xl bg-card text-card-foreground shadow-lg border p-4 flex flex-col gap-2 bg-gradient-to-r ${toneStyles[tone]}`}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold text-card-foreground">{value}</span>
    </div>
  );
}

function Donut({ value }: { value: number }) {
  const pct = Number.isFinite(value) ? Math.abs(value) : 0;
  const display = Number.isFinite(value) ? value : 0;
  const strokeDasharray = `${Math.min(pct, 100)} ${100 - Math.min(pct, 100)}`;
  const positive = display >= 0;

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke={positive ? '#22c55e' : '#f97316'}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xl font-bold text-card-foreground">{display}%</span>
        <span className="text-xs text-muted-foreground">Net / Income</span>
      </div>
    </div>
  );
}

function TrendCard({
  title,
  primary,
  secondary,
  color = 'indigo',
}: {
  title: string;
  primary?: number;
  secondary?: number;
  color?: 'indigo' | 'amber' | 'emerald';
}) {
  const palette: Record<string, string> = {
    indigo: 'from-indigo-200 to-indigo-500',
    amber: 'from-amber-200 to-amber-500',
    emerald: 'from-emerald-200 to-emerald-500',
  };
  const cardBg: Record<string, string> = {
    indigo: 'bg-gradient-to-br from-indigo-500/10 via-card to-card',
    amber: 'bg-gradient-to-br from-amber-500/10 via-card to-card',
    emerald: 'bg-gradient-to-br from-emerald-500/10 via-card to-card',
  };

  return (
    <div
      className={cn(
        'rounded-2xl text-card-foreground shadow-lg border border-border p-4 space-y-2',
        cardBg[color]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-card-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">vs prev</div>
      </div>
      <div className="text-2xl font-bold text-card-foreground">{formatCurrency(primary)}</div>
      <div className="text-xs text-muted-foreground">Previous: {formatCurrency(secondary)}</div>
      <div className="h-14 w-full bg-muted rounded-lg overflow-hidden">
        <div className={`h-full w-3/4 bg-gradient-to-r ${palette[color]}`} />
      </div>
    </div>
  );
}

function ProjectionCard({
  period,
  income,
  expense,
  net,
}: {
  period: string;
  income: { min: number; avg: number; max: number };
  expense: { min: number; avg: number; max: number };
  net: { min: number; avg: number; max: number };
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
      <div className="text-center">
        <div className="text-sm font-semibold text-card-foreground">{period}</div>
        <div className="text-xs text-muted-foreground">Projection</div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Income</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(income.avg)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Min: {formatCurrency(income.min)}</span>
            <span>•</span>
            <span>Max: {formatCurrency(income.max)}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Expense</span>
            <span className="font-semibold text-amber-600">{formatCurrency(expense.avg)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Min: {formatCurrency(expense.min)}</span>
            <span>•</span>
            <span>Max: {formatCurrency(expense.max)}</span>
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-card-foreground font-medium">Net</span>
            <span className={`font-bold ${net.avg >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatCurrency(net.avg)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Min: {formatCurrency(net.min)}</span>
            <span>•</span>
            <span>Max: {formatCurrency(net.max)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


