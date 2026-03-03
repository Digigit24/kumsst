// Finance module types

export type FinanceAppKey = 'fees' | 'library' | 'hostel' | 'hr' | 'store' | 'other' | string;

export type PaymentMethod = 'cash' | 'bank' | 'online' | 'cheque' | 'upi';

export interface OtherExpense {
  id: number;
  title: string;
  description: string;
  amount: number;
  category: string;
  payment_method: PaymentMethod;
  date: string;
  receipt?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface OtherExpenseCreateInput {
  title: string;
  description?: string;
  amount: number;
  category: string;
  payment_method: PaymentMethod;
  date: string;
  receipt?: File | string | null;
}

export interface FinanceAppSummaryItem {
  income: number;
  expense: number;
  total: number;
}

export type FinanceAppSummary = Record<FinanceAppKey, FinanceAppSummaryItem>;

export interface FinanceTotals {
  total_income: number;
  total_expense: number;
  net_total: number;
  last_updated?: string;
}

export interface FinanceAppExpense {
  id: number;
  app_name: FinanceAppKey;
  month: string;
  amount: number;
  transaction_count: number;
}

export type FinanceAppExpenseCreateInput = Omit<FinanceAppExpense, 'id'>;

export interface FinanceAppIncome {
  id: number;
  app_name: FinanceAppKey;
  month: string;
  amount: number;
  transaction_count: number;
}

export type FinanceAppIncomeCreateInput = Omit<FinanceAppIncome, 'id'>;

export interface FinanceAppTotal {
  id: number;
  app_name: FinanceAppKey;
  month: string;
  income: number;
  expense: number;
}

export type FinanceAppTotalCreateInput = Omit<FinanceAppTotal, 'id'>;

export interface FinanceTotal {
  id: number;
  month: string;
  total_income: number;
  total_expense: number;
}

export type FinanceTotalCreateInput = Omit<FinanceTotal, 'id'>;

export interface MonthlyReportAppBreakdown {
  income: number;
  expense: number;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  apps: Record<FinanceAppKey, MonthlyReportAppBreakdown>;
  total_income: number;
  total_expense: number;
  net: number;
}

export interface DashboardStats {
  current_month: { income: number; expense: number; net: number };
  previous_month?: { income: number; expense: number; net: number };
  current_year?: { income: number; expense: number; net: number };
  top_income_sources?: { app: FinanceAppKey; amount: number }[];
  top_expense_sources?: { app: FinanceAppKey; amount: number }[];
}

export type FinanceTransactionType = 'income' | 'expense';

export interface FinanceTransaction {
  id: number;
  app: FinanceAppKey;
  type: FinanceTransactionType;
  amount: number;
  payment_method?: PaymentMethod;
  description: string;
  reference_id: number | string | null;
  reference_model?: string | null;
  date: string;
  created_at?: string;
}

export interface FinanceTransactionFilters {
  app?: FinanceAppKey;
  type?: FinanceTransactionType;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}

export interface Paginated<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

// Financial Projections
export interface ProjectionScenario {
  min: number;   // 80% of average
  avg: number;   // 100% of average
  max: number;   // 120% of average
}

export interface ProjectionPeriod {
  income: ProjectionScenario;
  expense: ProjectionScenario;
  net: ProjectionScenario;
}

export interface FinancialProjections {
  based_on_months: number;
  monthly_average: {
    income: number;
    expense: number;
    net: number;
  };
  projections: {
    '1_year': ProjectionPeriod;
    '3_year': ProjectionPeriod;
    '5_year': ProjectionPeriod;
  };
}

// Payment Method Breakdown
export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  total: number;
}

export interface PaymentMethodsReport {
  breakdown: PaymentMethodBreakdown[];
}

// Export Types
export interface ExportSummaryData {
  app: string;
  income: number;
  expense: number;
  net: number;
}

export interface ExportSummary {
  filename: string;
  data: ExportSummaryData[];
  totals: {
    income: number;
    expense: number;
    net: number;
  };
}

export interface ExportTransactionData {
  date: string;
  app: FinanceAppKey;
  type: FinanceTransactionType;
  amount: number;
  payment_method?: PaymentMethod;
  description: string;
}

export interface ExportTransactions {
  filename: string;
  count: number;
  data: ExportTransactionData[];
}
