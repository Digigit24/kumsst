export interface FeeMetrics {
  total_due: number;
  total_collected: number;
  total_outstanding: number;
  collection_rate: number;
  total_students?: number;
}

export interface FeeDrillDownCollegeResponse extends FeeMetrics {
  academic_year_breakdown: ({
    academic_year_id: string | number;
    academic_year: string;
  } & FeeMetrics)[];
  
  // Optional: The dashboard might return payment method distribution too, adding it just in case
  payment_method_distribution?: {
      payment_method: string;
      count: number;
      total_amount: string; // API sends string decimal
      percentage: number;
  }[];
}

export interface FeeDrillDownAcademicYearResponse extends FeeMetrics {
  academic_year: string;
  program_breakdown: ({
    program_id: number;
    program_name: string;
    program_code: string;
  } & FeeMetrics)[];
}

export interface FeeDrillDownProgramResponse extends FeeMetrics {
  program_name: string;
  class_breakdown: ({
    class_id: number;
    class_name: string;
    semester: string;
    section_count: number;
  } & FeeMetrics)[];
}

export interface FeeDrillDownClassResponse extends FeeMetrics {
  class_name: string;
  fee_type_breakdown: ({
    fee_type_id: number;
    fee_type_name: string;
  } & FeeMetrics)[];
}

export interface StudentPaymentRecord {
  student_id: number;
  student_name: string;
  admission_number: string;
  paid_amount: number;
  pending_amount: number;
  status: 'paid' | 'partial' | 'pending';
  last_payment_date?: string;
}

export interface FeeDrillDownTypeResponse extends FeeMetrics {
  fee_type_name: string;
  student_payments: {
    student_id: number;
    student_name: string;
    admission_number: string;
    paid_amount: number;
    pending_amount: number;
    status: 'paid' | 'partial' | 'pending';
  }[];
}

export interface PaymentHistoryItem {
  id: number;
  amount: number;
  payment_date: string;
  payment_mode: string;
  transaction_id?: string;
  receipt_number: string;
}

export interface FeeStructureItem {
  fee_type: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
}

export interface FeeDrillDownStudentResponse {
  student_id: number;
  student_name: string;
  admission_number: string;
  roll_number?: string;
  class_name: string;
  section_name?: string;
  program_name?: string;
  
  // Financial totals directly on the object
  total_due: number;
  total_paid: number;
  total_balance: number;
  total_fines?: number;

  metrics?: FeeMetrics; // Keeping it optional if some APIs return it
  
  payment_history: PaymentHistoryItem[];
  fee_structures: any[]; // Using any[] for now to unblock, or define specific FeeStructure interface
  fines?: any[];
  discounts?: any[];
}

export interface TopDefaulter {
  student_id: number;
  student_name: string;
  admission_number: string;
  class_name: string;
  pending_amount: number;
  days_overdue?: number;
  parent_phone?: string;
}

export interface FeeDrillDownFilters {
  from_date?: string;
  to_date?: string;
  academic_year?: string;
  class_id?: number;
  limit?: number;
}
