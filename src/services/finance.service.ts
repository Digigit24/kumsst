/**
 * Finance Module API Service
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  OtherExpense,
  OtherExpenseCreateInput,
  FinanceAppSummary,
  FinanceTotals,
  FinanceAppExpense,
  FinanceAppExpenseCreateInput,
  FinanceAppIncome,
  FinanceAppIncomeCreateInput,
  FinanceAppTotal,
  FinanceAppTotalCreateInput,
  FinanceTotal,
  FinanceTotalCreateInput,
  MonthlyReport,
  DashboardStats,
  FinanceTransaction,
  FinanceTransactionFilters,
  Paginated,
  FinancialProjections,
  PaymentMethodsReport,
  ExportSummary,
  ExportTransactions,
} from '../types/finance.types';

const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(getDefaultHeaders());

  if (options?.headers) {
    const customHeaders = options.headers;
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(customHeaders as Record<string, string>).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Request failed'),
      status: response.status,
      errors: errorData,
    };
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

// Other Expenses
export const otherExpenseApi = {
  list: async (): Promise<Paginated<OtherExpense>> => {
    return fetchApi<Paginated<OtherExpense>>(buildApiUrl(API_ENDPOINTS.finance.otherExpenses.list));
  },

  get: async (id: number): Promise<OtherExpense> => {
    return fetchApi<OtherExpense>(buildApiUrl(API_ENDPOINTS.finance.otherExpenses.detail(id)));
  },

  create: async (data: OtherExpenseCreateInput): Promise<OtherExpense> => {
    const isMultipart = data.receipt instanceof File;

    if (isMultipart) {
      const form = new FormData();
      form.append('title', data.title);
      if (data.description) form.append('description', data.description);
      form.append('amount', String(data.amount));
      form.append('category', data.category);
      form.append('date', data.date);
      form.append('receipt', data.receipt as File);

      return fetchApi<OtherExpense>(buildApiUrl(API_ENDPOINTS.finance.otherExpenses.create), {
        method: 'POST',
        body: form,
        headers: {}, // let browser set multipart boundary
      });
    }

    return fetchApi<OtherExpense>(buildApiUrl(API_ENDPOINTS.finance.otherExpenses.create), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  update: async (id: number, data: Partial<OtherExpenseCreateInput>): Promise<OtherExpense> => {
    const isMultipart = data.receipt instanceof File;

    if (isMultipart) {
      const form = new FormData();
      if (data.title !== undefined) form.append('title', data.title);
      if (data.description !== undefined) form.append('description', data.description || '');
      if (data.amount !== undefined) form.append('amount', String(data.amount));
      if (data.category !== undefined) form.append('category', data.category);
      if (data.date !== undefined) form.append('date', data.date);
      form.append('receipt', data.receipt as File);

      return fetchApi<OtherExpense>(buildApiUrl(API_ENDPOINTS.finance.otherExpenses.update(id)), {
        method: 'PUT',
        body: form,
        headers: {},
      });
    }

    return fetchApi<OtherExpense>(buildApiUrl(API_ENDPOINTS.finance.otherExpenses.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.finance.otherExpenses.delete(id)), {
      method: 'DELETE',
    });
  },
};

// App-level expenses
export const financeAppExpenseApi = {
  list: async (): Promise<Paginated<FinanceAppExpense>> => {
    return fetchApi<Paginated<FinanceAppExpense>>(buildApiUrl(API_ENDPOINTS.finance.appExpense.list));
  },
  create: async (data: FinanceAppExpenseCreateInput): Promise<FinanceAppExpense> => {
    return fetchApi<FinanceAppExpense>(buildApiUrl(API_ENDPOINTS.finance.appExpense.create), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  get: async (id: number): Promise<FinanceAppExpense> => {
    return fetchApi<FinanceAppExpense>(buildApiUrl(API_ENDPOINTS.finance.appExpense.detail(id)));
  },
  update: async (id: number, data: Partial<FinanceAppExpenseCreateInput>): Promise<FinanceAppExpense> => {
    return fetchApi<FinanceAppExpense>(buildApiUrl(API_ENDPOINTS.finance.appExpense.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  patch: async (id: number, data: Partial<FinanceAppExpenseCreateInput>): Promise<FinanceAppExpense> => {
    return fetchApi<FinanceAppExpense>(buildApiUrl(API_ENDPOINTS.finance.appExpense.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.finance.appExpense.delete(id)), { method: 'DELETE' });
  },
};

// App-level incomes
export const financeAppIncomeApi = {
  list: async (): Promise<Paginated<FinanceAppIncome>> => {
    return fetchApi<Paginated<FinanceAppIncome>>(buildApiUrl(API_ENDPOINTS.finance.appIncome.list));
  },
  create: async (data: FinanceAppIncomeCreateInput): Promise<FinanceAppIncome> => {
    return fetchApi<FinanceAppIncome>(buildApiUrl(API_ENDPOINTS.finance.appIncome.create), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  get: async (id: number): Promise<FinanceAppIncome> => {
    return fetchApi<FinanceAppIncome>(buildApiUrl(API_ENDPOINTS.finance.appIncome.detail(id)));
  },
  update: async (id: number, data: Partial<FinanceAppIncomeCreateInput>): Promise<FinanceAppIncome> => {
    return fetchApi<FinanceAppIncome>(buildApiUrl(API_ENDPOINTS.finance.appIncome.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  patch: async (id: number, data: Partial<FinanceAppIncomeCreateInput>): Promise<FinanceAppIncome> => {
    return fetchApi<FinanceAppIncome>(buildApiUrl(API_ENDPOINTS.finance.appIncome.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.finance.appIncome.delete(id)), { method: 'DELETE' });
  },
};

// App totals (income + expense per app/month)
export const financeAppTotalApi = {
  list: async (): Promise<Paginated<FinanceAppTotal>> => {
    return fetchApi<Paginated<FinanceAppTotal>>(buildApiUrl(API_ENDPOINTS.finance.appTotal.list));
  },
  create: async (data: FinanceAppTotalCreateInput): Promise<FinanceAppTotal> => {
    return fetchApi<FinanceAppTotal>(buildApiUrl(API_ENDPOINTS.finance.appTotal.create), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  get: async (id: number): Promise<FinanceAppTotal> => {
    return fetchApi<FinanceAppTotal>(buildApiUrl(API_ENDPOINTS.finance.appTotal.detail(id)));
  },
  update: async (id: number, data: Partial<FinanceAppTotalCreateInput>): Promise<FinanceAppTotal> => {
    return fetchApi<FinanceAppTotal>(buildApiUrl(API_ENDPOINTS.finance.appTotal.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  patch: async (id: number, data: Partial<FinanceAppTotalCreateInput>): Promise<FinanceAppTotal> => {
    return fetchApi<FinanceAppTotal>(buildApiUrl(API_ENDPOINTS.finance.appTotal.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.finance.appTotal.delete(id)), { method: 'DELETE' });
  },
};

// Global totals
export const financeTotalApi = {
  list: async (): Promise<Paginated<FinanceTotal>> => {
    return fetchApi<Paginated<FinanceTotal>>(buildApiUrl(API_ENDPOINTS.finance.financeTotal.list));
  },
  create: async (data: FinanceTotalCreateInput): Promise<FinanceTotal> => {
    return fetchApi<FinanceTotal>(buildApiUrl(API_ENDPOINTS.finance.financeTotal.create), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  get: async (id: number): Promise<FinanceTotal> => {
    return fetchApi<FinanceTotal>(buildApiUrl(API_ENDPOINTS.finance.financeTotal.detail(id)));
  },
  update: async (id: number, data: Partial<FinanceTotalCreateInput>): Promise<FinanceTotal> => {
    return fetchApi<FinanceTotal>(buildApiUrl(API_ENDPOINTS.finance.financeTotal.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  patch: async (id: number, data: Partial<FinanceTotalCreateInput>): Promise<FinanceTotal> => {
    return fetchApi<FinanceTotal>(buildApiUrl(API_ENDPOINTS.finance.financeTotal.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.finance.financeTotal.delete(id)), { method: 'DELETE' });
  },
};
// Reports
export const financeReportsApi = {
  appSummary: async (): Promise<FinanceAppSummary> => {
    return fetchApi<FinanceAppSummary>(buildApiUrl(API_ENDPOINTS.finance.reports.appSummary));
  },
  totals: async (): Promise<FinanceTotals> => {
    return fetchApi<FinanceTotals>(buildApiUrl(API_ENDPOINTS.finance.reports.totals));
  },
  monthly: async (year: number, month: number): Promise<MonthlyReport> => {
    const qs = buildQueryString({ year, month });
    return fetchApi<MonthlyReport>(buildApiUrl(`${API_ENDPOINTS.finance.reports.monthly}${qs}`));
  },
  dashboard: async (): Promise<DashboardStats> => {
    return fetchApi<DashboardStats>(buildApiUrl(API_ENDPOINTS.finance.reports.dashboard));
  },
  projections: async (): Promise<FinancialProjections> => {
    return fetchApi<FinancialProjections>(buildApiUrl(API_ENDPOINTS.finance.reports.projections));
  },
  paymentMethods: async (): Promise<PaymentMethodsReport> => {
    return fetchApi<PaymentMethodsReport>(buildApiUrl(API_ENDPOINTS.finance.reports.paymentMethods));
  },
  exportSummary: async (): Promise<ExportSummary> => {
    return fetchApi<ExportSummary>(buildApiUrl(API_ENDPOINTS.finance.reports.exportSummary));
  },
  exportTransactions: async (filters: FinanceTransactionFilters = {}): Promise<ExportTransactions> => {
    const qs = buildQueryString(filters);
    return fetchApi<ExportTransactions>(buildApiUrl(`${API_ENDPOINTS.finance.reports.exportTransactions}${qs}`));
  },
};

// Transactions
export const financeTransactionsApi = {
  list: async (filters: FinanceTransactionFilters = {}): Promise<Paginated<FinanceTransaction>> => {
    const qs = buildQueryString(filters);
    return fetchApi<Paginated<FinanceTransaction>>(
      buildApiUrl(`${API_ENDPOINTS.finance.transactions.list}${qs}`)
    );
  },
};
