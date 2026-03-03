/**
 * SWR-based Hooks for HR Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  deductionsApi,
  leaveApplicationsApi,
  leaveApprovalsApi,
  leaveBalancesApi,
  leaveTypesApi,
  payrollItemsApi,
  payrollsApi,
  payslipsApi,
  salaryComponentsApi,
  salaryStructuresApi,
} from '../services/hr.service';
import type {
  Deduction,
  DeductionFilters,
  LeaveApplication,
  LeaveApplicationFilters,
  LeaveApproval,
  LeaveApprovalFilters,
  LeaveBalance,
  LeaveBalanceFilters,
  LeaveType,
  LeaveTypeFilters,
  Payroll,
  PayrollFilters,
  PayrollItem,
  PayrollItemFilters,
  Payslip,
  PayslipFilters,
  SalaryComponent,
  SalaryComponentFilters,
  SalaryStructure,
  SalaryStructureFilters,
} from '../types/hr.types';
import {
  dropdownSwrConfig,
  generateCacheKey,
  invalidateCache,
  useSWRPaginated,
  UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

const hrSwrKeys = {
  deductions: 'hr-deductions',
  leaveTypes: 'leave-types',
  leaveApplications: 'leave-applications',
  leaveApprovals: 'leave-approvals',
  leaveBalances: 'leave-balances',
  salaryStructures: 'salary-structures',
  salaryComponents: 'salary-components',
  payrolls: 'payrolls',
  payrollItems: 'payroll-items',
  payslips: 'payslips',
} as const;

// ============================================================================
// DEDUCTIONS HOOKS
// ============================================================================

export const useDeductionsSWR = (
  filters?: DeductionFilters
): UseSWRPaginatedResult<Deduction> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.deductions, filters),
    () => deductionsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateDeductions = () => invalidateCache(hrSwrKeys.deductions);

// ============================================================================
// LEAVE TYPES HOOKS
// ============================================================================

export const useLeaveTypesSWR = (
  filters?: LeaveTypeFilters
): UseSWRPaginatedResult<LeaveType> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.leaveTypes, filters),
    () => leaveTypesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateLeaveTypes = () => invalidateCache(hrSwrKeys.leaveTypes);

// ============================================================================
// LEAVE APPLICATIONS HOOKS
// ============================================================================

export const useLeaveApplicationsSWR = (
  filters?: LeaveApplicationFilters
): UseSWRPaginatedResult<LeaveApplication> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.leaveApplications, filters),
    () => leaveApplicationsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateLeaveApplications = () => invalidateCache(hrSwrKeys.leaveApplications);

// ============================================================================
// LEAVE APPROVALS HOOKS
// ============================================================================

export const useLeaveApprovalsSWR = (
  filters?: LeaveApprovalFilters
): UseSWRPaginatedResult<LeaveApproval> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.leaveApprovals, filters),
    () => leaveApprovalsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateLeaveApprovals = () => invalidateCache(hrSwrKeys.leaveApprovals);

// ============================================================================
// LEAVE BALANCES HOOKS
// ============================================================================

export const useLeaveBalancesSWR = (
  filters?: LeaveBalanceFilters
): UseSWRPaginatedResult<LeaveBalance> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.leaveBalances, filters),
    () => leaveBalancesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateLeaveBalances = () => invalidateCache(hrSwrKeys.leaveBalances);

// ============================================================================
// SALARY STRUCTURES HOOKS
// ============================================================================

export const useSalaryStructuresSWR = (
  filters?: SalaryStructureFilters
): UseSWRPaginatedResult<SalaryStructure> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.salaryStructures, filters),
    () => salaryStructuresApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateSalaryStructures = () => invalidateCache(hrSwrKeys.salaryStructures);

// ============================================================================
// SALARY COMPONENTS HOOKS
// ============================================================================

export const useSalaryComponentsSWR = (
  filters?: SalaryComponentFilters
): UseSWRPaginatedResult<SalaryComponent> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.salaryComponents, filters),
    () => salaryComponentsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateSalaryComponents = () => invalidateCache(hrSwrKeys.salaryComponents);

// ============================================================================
// PAYROLLS HOOKS
// ============================================================================

export const usePayrollsSWR = (
  filters?: PayrollFilters
): UseSWRPaginatedResult<Payroll> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.payrolls, filters),
    () => payrollsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidatePayrolls = () => invalidateCache(hrSwrKeys.payrolls);

// ============================================================================
// PAYROLL ITEMS HOOKS
// ============================================================================

export const usePayrollItemsSWR = (
  filters?: PayrollItemFilters
): UseSWRPaginatedResult<PayrollItem> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.payrollItems, filters),
    () => payrollItemsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidatePayrollItems = () => invalidateCache(hrSwrKeys.payrollItems);

// ============================================================================
// PAYSLIPS HOOKS
// ============================================================================

export const usePayslipsSWR = (
  filters?: PayslipFilters
): UseSWRPaginatedResult<Payslip> => {
  return useSWRPaginated(
    generateCacheKey(hrSwrKeys.payslips, filters),
    () => payslipsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidatePayslips = () => invalidateCache(hrSwrKeys.payslips);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL HR DATA
// ============================================================================

export const invalidateAllHR = async () => {
  await Promise.all([
    invalidateDeductions(),
    invalidateLeaveTypes(),
    invalidateLeaveApplications(),
    invalidateLeaveApprovals(),
    invalidateLeaveBalances(),
    invalidateSalaryStructures(),
    invalidateSalaryComponents(),
    invalidatePayrolls(),
    invalidatePayrollItems(),
    invalidatePayslips(),
  ]);
};
