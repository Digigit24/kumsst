/**
 * Accountant Module Types for KUMSS ERP
 * All types matching Django backend models and API responses
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type PaymentMethod = 'Cash' | 'Bank' | 'Online' | 'Cheque' | 'UPI' | 'Card';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'cancelled';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// UNIFIED INCOME DASHBOARD TYPES
// ============================================================================

// ============================================================================
// UNIFIED INCOME DASHBOARD TYPES
// ============================================================================

export interface IncomeDashboardTotals {
  total_revenue: number;
  total_expense: number;
  net_income: number;
  total_transactions: number;
}

export interface CollectionGoalData {
  target: number;
  collected: number;
  progress_percentage: number;
  remaining: number;
}

export interface CollectionGoals {
  monthly: CollectionGoalData;
  yearly: CollectionGoalData;
  total_outstanding: number;
}

export interface RevenueBreakdownItem {
  label: string;
  date?: string;
  month?: string;
  start_date?: string;
  end_date?: string;
  total: number;
}

export interface RevenuePeriodData {
  period: string;
  start_date: string;
  end_date: string;
  total_revenue: number;
  breakdown: RevenueBreakdownItem[];
}

export interface RevenueActivity {
  "1W": RevenuePeriodData;
  "1M": RevenuePeriodData;
  "6M": RevenuePeriodData;
  "1Y": RevenuePeriodData;
}

export interface IncomeCategoryBreakdown {
  category: string; // "Fee Collections", "Store Sales", etc.
  code?: string;
  total: number;
  count: number;
}

export interface IncomeExpenseData {
  total: number;
  count: number;
  by_category: IncomeCategoryBreakdown[];
}

export interface DailyIncome {
  date: string; // YYYY-MM-DD
  total: number;
}

export interface IncomeDashboard {
  totals: IncomeDashboardTotals;
  collection_goals: CollectionGoals;
  revenue_activity: RevenueActivity;
  expense: IncomeExpenseData;
  income: IncomeExpenseData;
  by_category: IncomeCategoryBreakdown[];
  last_7_days: DailyIncome[];
  filters: any;
}

export interface IncomeDashboardFilters {
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
}

// ============================================================================
// FEE COLLECTION TYPES
// ============================================================================

export interface StudentDetails {
  id: number;
  admission_number: string;
  student_name: string;
  first_name: string;
  last_name: string;
}

export interface FeeCollection {
  id: number;
  student_details: StudentDetails;
  student_name: string;
  collected_by_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  amount: string; // API returns as string
  payment_method: string; // lowercase: "cash", "bank", etc
  payment_date: string; // YYYY-MM-DD
  status: string; // "completed", "pending", etc
  transaction_id: string;
  remarks: string;
  created_by: string; // UUID
  updated_by: string; // UUID
  student: number;
  collected_by: string; // UUID
  fee_type?: string;
}

export interface FeeCollectionCreateInput {
  student: number;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  transaction_id: string;
  remarks?: string;
  fee_type?: string;
}

export interface FeeCollectionUpdateInput extends Partial<FeeCollectionCreateInput> { }

export interface FeeCollectionFilters {
  status?: string;
  payment_method?: string;
  student_id?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface FeeCollectionsReport {
  total_collections: number;
  total_amount: number;
  by_payment_method: {
    payment_method: PaymentMethod;
    total: number;
    count: number;
  }[];
  by_status: {
    status: PaymentStatus;
    total: number;
    count: number;
  }[];
  collections: FeeCollection[];
}

// ============================================================================
// STORE SALE TYPES
// ============================================================================

export interface StoreSaleItem {
  item: number;
  item_name?: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface StoreSale {
  id: number;
  college_name: string;
  student_name: string | null;
  teacher_name: string | null;
  sold_by_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  sale_date: string; // YYYY-MM-DD
  total_amount: string; // API returns as string
  payment_method: string; // lowercase: "cash", "bank", etc
  payment_status: string; // "completed", "pending", etc
  remarks: string;
  created_by: string; // UUID
  updated_by: string; // UUID
  college: number;
  student: number | null;
  teacher: number | null;
  sold_by: string; // UUID
  items?: StoreSaleItem[]; // Not in list response, only in detail
}

export interface StoreSaleCreateInput {
  student: number;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  items: {
    item: number;
    quantity: number;
    price: number;
  }[];
}

export interface StoreSaleFilters {
  from_date?: string;
  to_date?: string;
  student_id?: number;
  payment_method?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// FEE FINE TYPES
// ============================================================================

export interface FeeFine {
  id: number;
  student_details: StudentDetails;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  amount: string; // API returns as string
  reason: string;
  fine_date: string; // YYYY-MM-DD
  is_paid: boolean;
  paid_date: string | null; // YYYY-MM-DD
  created_by: string; // UUID
  updated_by: string; // UUID
  student: number;
  fee_structure: number;
  student_name: string;
}

export interface FeeFineCreateInput {
  student: number;
  fee_structure: number;
  amount: number;
  reason: string;
  fine_date: string;
  is_paid?: boolean;
}

export interface FeeFineUpdateInput {
  is_paid?: boolean;
  paid_date?: string;
  payment_method?: string;
  transaction_id?: string;
}

export interface FeeFineFilters {
  is_paid?: boolean;
  student_id?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// LIBRARY FINE TYPES
// ============================================================================

export interface LibraryFine {
  id: number;
  member: number;
  member_id: string;
  student_name: string;
  member_name?: string; // Keep for backward compatibility
  book_issue: number;
  book_title: string;
  amount: string; // API returns as string
  fine_amount?: number; // Keep for backward compatibility
  fine_date: string; // YYYY-MM-DD
  reason: string;
  is_paid: boolean;
  paid_date: string | null; // YYYY-MM-DD
  payment_method?: PaymentMethod;
  transaction_id?: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface LibraryFineCreateInput {
  member: number;
  book_issue: number;
  fine_amount: number;
  fine_date: string;
  reason: string;
  is_paid?: boolean;
}

export interface LibraryFineUpdateInput {
  is_paid?: boolean;
  paid_date?: string;
  payment_method?: PaymentMethod;
  transaction_id?: string;
}

export interface LibraryFineFilters {
  is_paid?: boolean;
  member_id?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// RECEIPT TYPES
// ============================================================================

export interface FeeReceipt {
  id: number;
  receipt_number: string;
  student_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  receipt_file: string | null;
  created_by: string;
  updated_by: string;
  collection: number;
}

export interface ReceiptFilters {
  student_id?: number;
  from_date?: string;
  to_date?: string;
  receipt_type?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// STUDENT SEARCH TYPES
// ============================================================================

export interface StudentBasic {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  class_name?: string;
  section_name?: string;
  program_name?: string;
}
