/**
 * Fees Module Mock Data
 * Complete mock data for fees module matching Django backend
 */

import { PaginatedResponse } from '../types/core.types';

// ============================================================================
// FEE TYPES
// ============================================================================

export interface FeeType {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  code: string;
  description: string | null;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockFeeTypes: FeeType[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Tuition Fee',
    code: 'TF',
    description: 'Regular tuition fee',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Library Fee',
    code: 'LF',
    description: 'Annual library membership fee',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Laboratory Fee',
    code: 'LAB',
    description: 'Laboratory usage fee',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// FEE GROUPS
// ============================================================================

export interface FeeGroup {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  code: string;
  description: string | null;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockFeeGroups: FeeGroup[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Regular Students',
    code: 'REG',
    description: 'Fee group for regular students',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Scholarship Students',
    code: 'SCH',
    description: 'Fee group for scholarship students',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// FEE MASTERS
// ============================================================================

export interface FeeMaster {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  fee_type: string;
  name: string;
  code: string;
  description: string | null;
  is_mandatory: boolean;
  is_refundable: boolean;
  display_order: number;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockFeeMasters: FeeMaster[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    fee_type: 'Tuition',
    name: 'Semester Fee',
    code: 'SEM-FEE',
    description: 'Semester tuition fee',
    is_mandatory: true,
    is_refundable: false,
    display_order: 1,
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    fee_type: 'Library',
    name: 'Library Annual Fee',
    code: 'LIB-FEE',
    description: 'Annual library membership',
    is_mandatory: true,
    is_refundable: true,
    display_order: 2,
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    fee_type: 'Lab',
    name: 'Computer Lab Fee',
    code: 'LAB-FEE',
    description: 'Computer laboratory usage fee',
    is_mandatory: false,
    is_refundable: false,
    display_order: 3,
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// FEE STRUCTURES
// ============================================================================

export interface FeeStructure {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  academic_session: number;
  program: number;
  class_obj: number | null;
  semester: number | null;
  total_amount: number;
  effective_from: string;
  effective_to: string | null;
  college: number;
  created_by: string;
  updated_by: string;
  // Display fields
  session_name: string;
  program_name: string;
  class_name: string | null;
}

export const mockFeeStructures: FeeStructure[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'B.Tech Semester 1 Fee Structure',
    academic_session: 1,
    program: 1,
    class_obj: 1,
    semester: 1,
    total_amount: 75000,
    effective_from: '2025-01-01',
    effective_to: '2025-06-30',
    college: 1,
    created_by: '1',
    updated_by: '1',
    session_name: '2024-2025',
    program_name: 'B.Tech Computer Science',
    class_name: 'First Year',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'MBA Semester 1 Fee Structure',
    academic_session: 1,
    program: 2,
    class_obj: 2,
    semester: 1,
    total_amount: 95000,
    effective_from: '2025-01-01',
    effective_to: '2025-06-30',
    college: 1,
    created_by: '1',
    updated_by: '1',
    session_name: '2024-2025',
    program_name: 'MBA',
    class_name: 'First Year',
  },
];

// ============================================================================
// FEE DISCOUNTS
// ============================================================================

export interface FeeDiscount {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  description: string | null;
  max_discount_amount: number | null;
  eligibility_criteria: string | null;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockFeeDiscounts: FeeDiscount[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Merit Scholarship',
    code: 'MERIT-25',
    discount_type: 'percentage',
    discount_value: 25,
    description: '25% discount for merit students',
    max_discount_amount: 20000,
    eligibility_criteria: 'CGPA >= 8.5',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Sibling Discount',
    code: 'SIB-15',
    discount_type: 'percentage',
    discount_value: 15,
    description: '15% discount for siblings',
    max_discount_amount: 15000,
    eligibility_criteria: 'Multiple siblings enrolled',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Early Bird Discount',
    code: 'EARLY-5000',
    discount_type: 'fixed',
    discount_value: 5000,
    description: 'Fixed 5000 discount for early payment',
    max_discount_amount: null,
    eligibility_criteria: 'Payment within 15 days',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// FEE FINES
// ============================================================================

export interface FeeFine {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  fine_type: 'late_payment' | 'damage' | 'library' | 'other';
  calculation_type: 'percentage' | 'fixed' | 'per_day';
  amount: number;
  description: string | null;
  grace_period_days: number;
  max_fine_amount: number | null;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockFeeFines: FeeFine[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Late Payment Fine',
    fine_type: 'late_payment',
    calculation_type: 'per_day',
    amount: 100,
    description: 'Rs.100 per day after due date',
    grace_period_days: 7,
    max_fine_amount: 5000,
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Library Book Damage',
    fine_type: 'library',
    calculation_type: 'fixed',
    amount: 500,
    description: 'Fixed fine for damaged books',
    grace_period_days: 0,
    max_fine_amount: null,
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// FEE INSTALLMENTS
// ============================================================================

export interface FeeInstallment {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  fee_structure: number;
  installment_number: number;
  installment_name: string;
  amount: number;
  due_date: string;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockFeeInstallments: FeeInstallment[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    fee_structure: 1,
    installment_number: 1,
    installment_name: 'First Installment',
    amount: 40000,
    due_date: '2025-02-15',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    fee_structure: 1,
    installment_number: 2,
    installment_name: 'Second Installment',
    amount: 35000,
    due_date: '2025-04-15',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// FEE COLLECTIONS
// ============================================================================

export interface FeeCollection {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  receipt_number: string;
  student: number;
  academic_session: number;
  payment_date: string;
  total_amount: number;
  discount_amount: number;
  fine_amount: number;
  net_amount: number;
  amount_paid: number;
  payment_mode: 'cash' | 'card' | 'upi' | 'net_banking' | 'cheque' | 'demand_draft';
  transaction_id: string | null;
  remarks: string | null;
  is_cancelled: boolean;
  college: number;
  created_by: string;
  updated_by: string;
  // Display fields
  student_name: string;
  student_roll_number: string;
  session_name: string;
  collected_by: string;
}

export const mockFeeCollections: FeeCollection[] = [
  {
    id: 1,
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z',
    is_active: true,
    receipt_number: 'FEE-2025-0001',
    student: 1,
    academic_session: 1,
    payment_date: '2025-01-15',
    total_amount: 75000,
    discount_amount: 5000,
    fine_amount: 0,
    net_amount: 70000,
    amount_paid: 40000,
    payment_mode: 'upi',
    transaction_id: 'UPI123456789',
    remarks: 'First installment',
    is_cancelled: false,
    college: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'John Smith',
    student_roll_number: '2024001',
    session_name: '2024-2025',
    collected_by: 'Admin User',
  },
  {
    id: 2,
    created_at: '2025-01-16T14:20:00Z',
    updated_at: '2025-01-16T14:20:00Z',
    is_active: true,
    receipt_number: 'FEE-2025-0002',
    student: 2,
    academic_session: 1,
    payment_date: '2025-01-16',
    total_amount: 75000,
    discount_amount: 0,
    fine_amount: 500,
    net_amount: 75500,
    amount_paid: 75500,
    payment_mode: 'cash',
    transaction_id: null,
    remarks: 'Full payment with late fine',
    is_cancelled: false,
    college: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'Emma Johnson',
    student_roll_number: '2024002',
    session_name: '2024-2025',
    collected_by: 'Admin User',
  },
];

// ============================================================================
// FEE RECEIPTS
// ============================================================================

export interface FeeReceipt {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  receipt_number: string;
  fee_collection: number;
  issued_date: string;
  receipt_file: string | null;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockFeeReceipts: FeeReceipt[] = [
  {
    id: 1,
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z',
    is_active: true,
    receipt_number: 'FEE-2025-0001',
    fee_collection: 1,
    issued_date: '2025-01-15',
    receipt_file: '/receipts/FEE-2025-0001.pdf',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// STUDENT FEE DISCOUNTS
// ============================================================================

export interface StudentFeeDiscount {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  student: number;
  fee_discount: number;
  academic_session: number;
  applied_date: string;
  approved_by: string | null;
  remarks: string | null;
  college: number;
  created_by: string;
  updated_by: string;
  // Display fields
  student_name: string;
  student_roll_number: string;
  discount_name: string;
  discount_value: number;
}

export const mockStudentFeeDiscounts: StudentFeeDiscount[] = [
  {
    id: 1,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    is_active: true,
    student: 1,
    fee_discount: 1,
    academic_session: 1,
    applied_date: '2025-01-10',
    approved_by: 'Principal',
    remarks: 'Approved for merit scholarship',
    college: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'John Smith',
    student_roll_number: '2024001',
    discount_name: 'Merit Scholarship',
    discount_value: 25,
  },
];

// ============================================================================
// FEE REFUNDS
// ============================================================================

export interface FeeRefund {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  refund_number: string;
  student: number;
  fee_collection: number;
  refund_date: string;
  refund_amount: number;
  refund_reason: string;
  refund_mode: 'cash' | 'bank_transfer' | 'cheque';
  transaction_id: string | null;
  approved_by: string | null;
  remarks: string | null;
  college: number;
  created_by: string;
  updated_by: string;
  // Display fields
  student_name: string;
  student_roll_number: string;
  receipt_number: string;
}

export const mockFeeRefunds: FeeRefund[] = [
  {
    id: 1,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    is_active: true,
    refund_number: 'REF-2025-0001',
    student: 3,
    fee_collection: 3,
    refund_date: '2025-02-01',
    refund_amount: 5000,
    refund_reason: 'Course withdrawal',
    refund_mode: 'bank_transfer',
    transaction_id: 'TXN987654321',
    approved_by: 'Principal',
    remarks: 'Approved for withdrawal',
    college: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'Michael Brown',
    student_roll_number: '2024003',
    receipt_number: 'FEE-2025-0003',
  },
];

// ============================================================================
// FEE REMINDERS
// ============================================================================

export interface FeeReminder {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  student: number;
  reminder_date: string;
  due_amount: number;
  due_date: string;
  reminder_type: 'sms' | 'email' | 'both';
  message: string;
  is_sent: boolean;
  sent_at: string | null;
  college: number;
  created_by: string;
  updated_by: string;
  // Display fields
  student_name: string;
  student_roll_number: string;
}

export const mockFeeReminders: FeeReminder[] = [
  {
    id: 1,
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
    is_active: true,
    student: 4,
    reminder_date: '2025-01-20',
    due_amount: 35000,
    due_date: '2025-02-15',
    reminder_type: 'both',
    message: 'Your second installment of Rs. 35000 is due on 15-Feb-2025',
    is_sent: true,
    sent_at: '2025-01-20T10:00:00Z',
    college: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'Sarah Davis',
    student_roll_number: '2024004',
  },
];

// ============================================================================
// ONLINE PAYMENTS
// ============================================================================

export interface OnlinePayment {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  transaction_id: string;
  student: number;
  amount: number;
  payment_gateway: string;
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_date: string;
  response_data: string | null;
  fee_collection: number | null;
  college: number;
  created_by: string;
  updated_by: string;
  // Display fields
  student_name: string;
  student_roll_number: string;
}

export const mockOnlinePayments: OnlinePayment[] = [
  {
    id: 1,
    created_at: '2025-01-15T10:25:00Z',
    updated_at: '2025-01-15T10:30:00Z',
    is_active: true,
    transaction_id: 'UPI123456789',
    student: 1,
    amount: 40000,
    payment_gateway: 'Razorpay',
    payment_status: 'success',
    payment_date: '2025-01-15',
    response_data: '{"status": "success", "payment_id": "pay_123456"}',
    fee_collection: 1,
    college: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'John Smith',
    student_roll_number: '2024001',
  },
];

// ============================================================================
// BANK PAYMENTS
// ============================================================================

export interface BankPayment {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  cheque_number: string;
  bank_name: string;
  branch_name: string;
  cheque_date: string;
  amount: number;
  student: number;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  cleared_date: string | null;
  fee_collection: number | null;
  remarks: string | null;
  college: number;
  created_by: string;
  updated_by: string;
  // Display fields
  student_name: string;
  student_roll_number: string;
}

export const mockBankPayments: BankPayment[] = [
  {
    id: 1,
    created_at: '2025-01-18T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
    is_active: true,
    cheque_number: 'CHQ123456',
    bank_name: 'State Bank of India',
    branch_name: 'Main Branch',
    cheque_date: '2025-01-18',
    amount: 75000,
    student: 5,
    status: 'cleared',
    cleared_date: '2025-01-20',
    fee_collection: 5,
    remarks: 'Cleared successfully',
    college: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'Alex Wilson',
    student_roll_number: '2024005',
  },
];

// ============================================================================
// PAGINATED RESPONSES
// ============================================================================

export const mockFeeTypesPaginated: PaginatedResponse<FeeType> = {
  count: mockFeeTypes.length,
  next: null,
  previous: null,
  results: mockFeeTypes,
};

export const mockFeeGroupsPaginated: PaginatedResponse<FeeGroup> = {
  count: mockFeeGroups.length,
  next: null,
  previous: null,
  results: mockFeeGroups,
};

export const mockFeeMastersPaginated: PaginatedResponse<FeeMaster> = {
  count: mockFeeMasters.length,
  next: null,
  previous: null,
  results: mockFeeMasters,
};

export const mockFeeStructuresPaginated: PaginatedResponse<FeeStructure> = {
  count: mockFeeStructures.length,
  next: null,
  previous: null,
  results: mockFeeStructures,
};

export const mockFeeDiscountsPaginated: PaginatedResponse<FeeDiscount> = {
  count: mockFeeDiscounts.length,
  next: null,
  previous: null,
  results: mockFeeDiscounts,
};

export const mockFeeFinesPaginated: PaginatedResponse<FeeFine> = {
  count: mockFeeFines.length,
  next: null,
  previous: null,
  results: mockFeeFines,
};

export const mockFeeInstallmentsPaginated: PaginatedResponse<FeeInstallment> = {
  count: mockFeeInstallments.length,
  next: null,
  previous: null,
  results: mockFeeInstallments,
};

export const mockFeeCollectionsPaginated: PaginatedResponse<FeeCollection> = {
  count: mockFeeCollections.length,
  next: null,
  previous: null,
  results: mockFeeCollections,
};

export const mockFeeReceiptsPaginated: PaginatedResponse<FeeReceipt> = {
  count: mockFeeReceipts.length,
  next: null,
  previous: null,
  results: mockFeeReceipts,
};

export const mockStudentFeeDiscountsPaginated: PaginatedResponse<StudentFeeDiscount> = {
  count: mockStudentFeeDiscounts.length,
  next: null,
  previous: null,
  results: mockStudentFeeDiscounts,
};

export const mockFeeRefundsPaginated: PaginatedResponse<FeeRefund> = {
  count: mockFeeRefunds.length,
  next: null,
  previous: null,
  results: mockFeeRefunds,
};

export const mockFeeRemindersPaginated: PaginatedResponse<FeeReminder> = {
  count: mockFeeReminders.length,
  next: null,
  previous: null,
  results: mockFeeReminders,
};

export const mockOnlinePaymentsPaginated: PaginatedResponse<OnlinePayment> = {
  count: mockOnlinePayments.length,
  next: null,
  previous: null,
  results: mockOnlinePayments,
};

export const mockBankPaymentsPaginated: PaginatedResponse<BankPayment> = {
  count: mockBankPayments.length,
  next: null,
  previous: null,
  results: mockBankPayments,
};
