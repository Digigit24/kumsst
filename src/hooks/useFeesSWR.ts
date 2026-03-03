/**
 * SWR-based Hooks for Fees Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  bankPaymentsApi,
  feeCollectionsApi,
  feeDiscountsApi,
  feeFinesApi,
  feeGroupsApi,
  feeInstallmentsApi,
  feeMastersApi,
  feeReceiptsApi,
  feeRefundsApi,
  feeRemindersApi,
  feeStructuresApi,
  feeTypesApi,
  onlinePaymentsApi,
  studentFeeDiscountsApi,
} from '../services/fees.service';
import {
  dropdownSwrConfig,
  staticDataSwrConfig,
  generateCacheKey,
  invalidateCache,
  useSWRPaginated,
  UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

const feeSwrKeys = {
  feeMasters: 'fee-masters',
  feeStructures: 'fee-structures',
  feeDiscounts: 'fee-discounts',
  feeFines: 'fee-fines',
  feeCollections: 'fee-collections',
  feeTypes: 'fee-types',
  feeGroups: 'fee-groups',
  feeInstallments: 'fee-installments',
  feeReceipts: 'fee-receipts',
  studentFeeDiscounts: 'student-fee-discounts',
  feeRefunds: 'fee-refunds',
  feeReminders: 'fee-reminders',
  bankPayments: 'bank-payments',
  onlinePayments: 'online-payments',
} as const;

// ============================================================================
// FEE MASTERS HOOKS
// ============================================================================

export const useFeeMastersSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeMasters, filters),
    () => feeMastersApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeMasters = () => invalidateCache(feeSwrKeys.feeMasters);

// ============================================================================
// FEE STRUCTURES HOOKS
// ============================================================================

export const useFeeStructuresSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeStructures, filters),
    () => feeStructuresApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeStructures = () => invalidateCache(feeSwrKeys.feeStructures);

// ============================================================================
// FEE DISCOUNTS HOOKS
// ============================================================================

export const useFeeDiscountsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeDiscounts, filters),
    () => feeDiscountsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeDiscounts = () => invalidateCache(feeSwrKeys.feeDiscounts);

// ============================================================================
// FEE FINES HOOKS
// ============================================================================

export const useFeesFinesSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeFines, filters),
    () => feeFinesApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeFines = () => invalidateCache(feeSwrKeys.feeFines);

// ============================================================================
// FEE COLLECTIONS HOOKS
// ============================================================================

export const useFeeCollectionsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeCollections, filters),
    () => feeCollectionsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeCollections = () => invalidateCache(feeSwrKeys.feeCollections);

// ============================================================================
// FEE TYPES HOOKS
// ============================================================================

export const useFeeTypesSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeTypes, filters),
    () => feeTypesApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

export const invalidateFeeTypes = () => invalidateCache(feeSwrKeys.feeTypes);

// ============================================================================
// FEE GROUPS HOOKS
// ============================================================================

export const useFeeGroupsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeGroups, filters),
    () => feeGroupsApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

export const invalidateFeeGroups = () => invalidateCache(feeSwrKeys.feeGroups);

// ============================================================================
// FEE INSTALLMENTS HOOKS
// ============================================================================

export const useFeeInstallmentsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeInstallments, filters),
    () => feeInstallmentsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeInstallments = () => invalidateCache(feeSwrKeys.feeInstallments);

// ============================================================================
// FEE RECEIPTS HOOKS
// ============================================================================

export const useFeeReceiptsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeReceipts, filters),
    () => feeReceiptsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeReceipts = () => invalidateCache(feeSwrKeys.feeReceipts);

// ============================================================================
// STUDENT FEE DISCOUNTS HOOKS
// ============================================================================

export const useStudentFeeDiscountsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.studentFeeDiscounts, filters),
    () => studentFeeDiscountsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentFeeDiscounts = () => invalidateCache(feeSwrKeys.studentFeeDiscounts);

// ============================================================================
// FEE REFUNDS HOOKS
// ============================================================================

export const useFeeRefundsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeRefunds, filters),
    () => feeRefundsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeRefunds = () => invalidateCache(feeSwrKeys.feeRefunds);

// ============================================================================
// FEE REMINDERS HOOKS
// ============================================================================

export const useFeeRemindersSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.feeReminders, filters),
    () => feeRemindersApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateFeeReminders = () => invalidateCache(feeSwrKeys.feeReminders);

// ============================================================================
// BANK PAYMENTS HOOKS
// ============================================================================

export const useBankPaymentsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.bankPayments, filters),
    () => bankPaymentsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateBankPayments = () => invalidateCache(feeSwrKeys.bankPayments);

// ============================================================================
// ONLINE PAYMENTS HOOKS
// ============================================================================

export const useOnlinePaymentsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(feeSwrKeys.onlinePayments, filters),
    () => onlinePaymentsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateOnlinePayments = () => invalidateCache(feeSwrKeys.onlinePayments);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL FEES DATA
// ============================================================================

export const invalidateAllFees = async () => {
  await Promise.all([
    invalidateFeeMasters(),
    invalidateFeeStructures(),
    invalidateFeeDiscounts(),
    invalidateFeeFines(),
    invalidateFeeCollections(),
    invalidateFeeTypes(),
    invalidateFeeGroups(),
    invalidateFeeInstallments(),
    invalidateFeeReceipts(),
    invalidateStudentFeeDiscounts(),
    invalidateFeeRefunds(),
    invalidateFeeReminders(),
    invalidateBankPayments(),
    invalidateOnlinePayments(),
  ]);
};
