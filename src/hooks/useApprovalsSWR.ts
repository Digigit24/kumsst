/**
 * SWR-based Hooks for Approvals Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  approvalNotificationsApi,
  approvalsApi,
} from '../services/approvals.service';
import type {
  ApprovalListParams,
  ApprovalNotification,
  ApprovalRequest,
} from '../types/approvals.types';
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

const approvalSwrKeys = {
  approvals: 'approvals',
  pendingApprovals: 'pending-approvals',
  myRequests: 'my-requests',
  approvalNotifications: 'approval-notifications',
} as const;

// ============================================================================
// APPROVALS HOOKS
// ============================================================================

export const useApprovalsSWR = (
  filters?: ApprovalListParams
): UseSWRPaginatedResult<ApprovalRequest> => {
  return useSWRPaginated(
    generateCacheKey(approvalSwrKeys.approvals, filters),
    () => approvalsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateApprovals = () => invalidateCache(approvalSwrKeys.approvals);

// ============================================================================
// PENDING APPROVALS HOOKS
// ============================================================================

export const usePendingApprovalsSWR = (
  filters?: ApprovalListParams
): UseSWRPaginatedResult<ApprovalRequest> => {
  return useSWRPaginated(
    generateCacheKey(approvalSwrKeys.pendingApprovals, filters),
    () => approvalsApi.pendingApprovals(filters),
    dropdownSwrConfig
  );
};

export const invalidatePendingApprovals = () => invalidateCache(approvalSwrKeys.pendingApprovals);

// ============================================================================
// MY REQUESTS HOOKS
// ============================================================================

export const useMyRequestsSWR = (
  filters?: ApprovalListParams
): UseSWRPaginatedResult<ApprovalRequest> => {
  return useSWRPaginated(
    generateCacheKey(approvalSwrKeys.myRequests, filters),
    () => approvalsApi.myRequests(filters),
    dropdownSwrConfig
  );
};

export const invalidateMyRequests = () => invalidateCache(approvalSwrKeys.myRequests);

// ============================================================================
// APPROVAL NOTIFICATIONS HOOKS
// ============================================================================

export const useApprovalNotificationsSWR = (
  filters?: { page?: number; page_size?: number }
): UseSWRPaginatedResult<ApprovalNotification> => {
  return useSWRPaginated(
    generateCacheKey(approvalSwrKeys.approvalNotifications, filters),
    () => approvalNotificationsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateApprovalNotifications = () => invalidateCache(approvalSwrKeys.approvalNotifications);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL APPROVALS DATA
// ============================================================================

export const invalidateAllApprovals = async () => {
  await Promise.all([
    invalidateApprovals(),
    invalidatePendingApprovals(),
    invalidateMyRequests(),
    invalidateApprovalNotifications(),
  ]);
};
