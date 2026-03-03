/**
 * HR Module Types for KUMSS ERP
 * All types matching Django backend models
 */

import { UserBasic } from './accounts.types';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface AuditFields {
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DEDUCTION TYPES
// ============================================================================

export interface Deduction extends AuditFields {
  id: number;
  name: string;
  code: string;
  deduction_type: string;
  amount: string;
  percentage: string;
  is_active: boolean;
  college: number;
}

export interface DeductionCreateInput {
  name: string;
  code: string;
  deduction_type: string;
  amount: string;
  percentage: string;
  is_active?: boolean;
  college?: number;
  created_by?: string;
  updated_by?: string;
}

export interface DeductionUpdateInput extends Partial<DeductionCreateInput> {}

export interface DeductionFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  deduction_type?: string;
  ordering?: string;
}

// ============================================================================
// LEAVE TYPE TYPES
// ============================================================================

export interface LeaveType extends AuditFields {
  id: number;
  name: string;
  code: string;
  max_days_per_year: number;
  is_paid: boolean;
  description: string;
  is_active: boolean;
  college: number;
}

export interface LeaveTypeCreateInput {
  name: string;
  code: string;
  max_days_per_year: number;
  is_paid?: boolean;
  description?: string;
  is_active?: boolean;
  college?: number;
  created_by?: string;
  updated_by?: string;
}

export interface LeaveTypeUpdateInput extends Partial<LeaveTypeCreateInput> {}

export interface LeaveTypeFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_paid?: boolean;
  ordering?: string;
}

// ============================================================================
// LEAVE APPLICATION TYPES
// ============================================================================

export interface LeaveApplication extends AuditFields {
  id: number;
  teacher: number; // Teacher model ID
  teacher_name?: string;
  leave_type: number;
  leave_type_name?: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  attachment: string;
  status: string;
  is_active: boolean;
}

export interface LeaveApplicationCreateInput {
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  attachment?: string;
  status?: string;
  is_active?: boolean;
  teacher?: number; // Teacher model ID
  leave_type: number;
  created_by?: string;
  updated_by?: string;
}

export interface LeaveApplicationUpdateInput extends Partial<LeaveApplicationCreateInput> {}

// ============================================================================
// LEAVE APPROVAL TYPES
// ============================================================================

export interface LeaveApproval extends AuditFields {
  id: number;
  application: number;
  application_details?: LeaveApplication;
  approved_by: string;
  approver_name?: string;
  status: string;
  approval_date: string;
  remarks: string;
  is_active: boolean;
}

export interface LeaveApprovalCreateInput {
  application: number;
  status: string;
  approval_date: string;
  remarks?: string;
  is_active?: boolean;
  approved_by?: string;
  created_by?: string;
  updated_by?: string;
}

export interface LeaveApprovalUpdateInput extends Partial<LeaveApprovalCreateInput> {}

// ============================================================================
// LEAVE BALANCE TYPES
// ============================================================================

export interface LeaveBalance extends AuditFields {
  id: number;
  teacher: number; // Teacher model ID
  teacher_name?: string;
  leave_type: number;
  leave_type_name?: string;
  academic_year: number;
  academic_year_name?: string;
  total_days: number;
  used_days: number;
  balance_days: number;
  is_active: boolean;
}

export interface LeaveBalanceCreateInput {
  teacher?: number; // Teacher model ID
  leave_type: number;
  academic_year: number;
  total_days: number;
  used_days?: number;
  balance_days?: number;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface LeaveBalanceUpdateInput extends Partial<LeaveBalanceCreateInput> {}

export interface LeaveBalanceFilters {
  page?: number;
  page_size?: number;
  teacher?: number; // Teacher model ID
  leave_type?: number;
  academic_year?: number;
  search?: string;
  ordering?: string;
}

// ============================================================================
// SALARY STRUCTURE TYPES
// ============================================================================

export interface SalaryStructure extends AuditFields {
  id: number;
  teacher: number; // Teacher model ID
  teacher_name?: string;
  effective_from: string;
  effective_to: string;
  basic_salary: string;
  hra: string;
  da: string;
  other_allowances: string;
  gross_salary: string;
  is_current: boolean;
  is_active: boolean;
}

export interface SalaryStructureCreateInput {
  teacher?: number; // Teacher model ID
  effective_from: string;
  effective_to?: string;
  basic_salary: string;
  hra: string;
  da: string;
  other_allowances: string;
  gross_salary: string;
  is_current?: boolean;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface SalaryStructureUpdateInput extends Partial<SalaryStructureCreateInput> {}

// ============================================================================
// SALARY COMPONENT TYPES
// ============================================================================

export interface SalaryComponent extends AuditFields {
  id: number;
  structure: number;
  component_name: string;
  component_type: string;
  amount: string;
  is_taxable: boolean;
  is_active: boolean;
}

export interface SalaryComponentCreateInput {
  structure: number;
  component_name: string;
  component_type: string;
  amount: string;
  is_taxable?: boolean;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface SalaryComponentUpdateInput extends Partial<SalaryComponentCreateInput> {}

export interface SalaryComponentFilters {
  page?: number;
  page_size?: number;
  structure?: number;
  component_type?: string;
  search?: string;
  ordering?: string;
}

// ============================================================================
// PAYROLL TYPES
// ============================================================================

export interface Payroll extends AuditFields {
  id: number;
  teacher: number; // Teacher model ID
  teacher_name?: string;
  salary_structure: number;
  month: number;
  year: number;
  gross_salary: string;
  total_allowances: string;
  total_deductions: string;
  net_salary: string;
  payment_date: string;
  payment_method: string;
  status: string;
  remarks: string;
  is_active: boolean;
}

export interface PayrollCreateInput {
  teacher?: number; // Teacher model ID
  salary_structure: number;
  month: number;
  year: number;
  gross_salary: string;
  total_allowances: string;
  total_deductions: string;
  net_salary: string;
  payment_date: string;
  payment_method: string;
  status?: string;
  remarks?: string;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface PayrollUpdateInput extends Partial<PayrollCreateInput> {}

export interface PayrollFilters {
  page?: number;
  page_size?: number;
  teacher?: number; // Teacher model ID
  month?: number;
  year?: number;
  status?: string;
  search?: string;
  ordering?: string;
}

// ============================================================================
// PAYROLL ITEM TYPES
// ============================================================================

export interface PayrollItem extends AuditFields {
  id: number;
  payroll: number;
  component_name: string;
  component_type: string;
  amount: string;
  is_active: boolean;
}

export interface PayrollItemCreateInput {
  payroll: number;
  component_name: string;
  component_type: string;
  amount: string;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface PayrollItemUpdateInput extends Partial<PayrollItemCreateInput> {}

export interface PayrollItemFilters {
  page?: number;
  page_size?: number;
  payroll?: number;
  component_type?: string;
  search?: string;
  ordering?: string;
}

// ============================================================================
// PAYSLIP TYPES
// ============================================================================

export interface Payslip extends AuditFields {
  id: number;
  payroll: number;
  payroll_details?: Payroll;
  slip_number: string;
  slip_file: string;
  issue_date: string;
  is_active: boolean;
}

export interface PayslipCreateInput {
  payroll: number;
  slip_number: string;
  slip_file: string;
  issue_date: string;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface PayslipUpdateInput extends Partial<PayslipCreateInput> {}

export interface PayslipFilters {
  page?: number;
  page_size?: number;
  payroll?: number;
  search?: string;
  ordering?: string;
}

// ============================================================================
// ADDITIONAL FILTER TYPES
// ============================================================================

export interface LeaveApplicationFilters {
  page?: number;
  page_size?: number;
  teacher?: number; // Teacher model ID
  leave_type?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  ordering?: string;
}

export interface LeaveApprovalFilters {
  page?: number;
  page_size?: number;
  application?: number;
  approved_by?: string;
  status?: string;
  search?: string;
  ordering?: string;
}

export interface SalaryStructureFilters {
  page?: number;
  page_size?: number;
  teacher?: number; // Teacher model ID
  is_current?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}
