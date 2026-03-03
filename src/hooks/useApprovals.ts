/**
 * Approvals React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { approvalsApi, approvalNotificationsApi } from '../services/approvals.service';
import type {
  ApprovalRequest,
  ApprovalReviewInput,
  ApprovalNotification,
  ApprovalNotificationUnreadCount,
  FeePaymentApprovalInput,
  ApprovalListParams,
  PaginatedApprovalRequests,
  PaginatedApprovalNotifications,
} from '../types/approvals.types';

// Query keys
export const approvalKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalKeys.all, 'list'] as const,
  list: (params?: ApprovalListParams) => [...approvalKeys.lists(), params] as const,
  pendingApprovals: (params?: ApprovalListParams) => [...approvalKeys.all, 'pending', params] as const,
  myRequests: (params?: ApprovalListParams) => [...approvalKeys.all, 'my-requests', params] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (id: number) => [...approvalKeys.details(), id] as const,
};

export const approvalNotificationKeys = {
  all: ['approval-notifications'] as const,
  lists: () => [...approvalNotificationKeys.all, 'list'] as const,
  list: (params?: { page?: number; page_size?: number }) => [...approvalNotificationKeys.lists(), params] as const,
  unreadCount: () => [...approvalNotificationKeys.all, 'unread-count'] as const,
};

// ===========================================
// APPROVAL REQUESTS HOOKS
// ===========================================

/**
 * Fetch all approval requests
 */
export const useApprovals = (
  params?: ApprovalListParams
): UseQueryResult<PaginatedApprovalRequests, Error> => {
  return useQuery({
    queryKey: approvalKeys.list(params),
    queryFn: () => approvalsApi.list(params),
  });
};

/**
 * Fetch pending approvals (approvals awaiting current user's review)
 */
export const usePendingApprovals = (
  params?: ApprovalListParams
): UseQueryResult<PaginatedApprovalRequests, Error> => {
  return useQuery({
    queryKey: approvalKeys.pendingApprovals(params),
    queryFn: () => approvalsApi.pendingApprovals(params),
  });
};

/**
 * Fetch my approval requests (approvals created by current user)
 */
export const useMyApprovalRequests = (
  params?: ApprovalListParams
): UseQueryResult<PaginatedApprovalRequests, Error> => {
  return useQuery({
    queryKey: approvalKeys.myRequests(params),
    queryFn: () => approvalsApi.myRequests(params),
  });
};

/**
 * Fetch single approval request by ID
 */
export const useApproval = (id: number): UseQueryResult<ApprovalRequest, Error> => {
  return useQuery({
    queryKey: approvalKeys.detail(id),
    queryFn: () => approvalsApi.get(id),
    enabled: !!id,
  });
};

/**
 * Review approval request mutation (approve or reject)
 */
export const useReviewApproval = (): UseMutationResult<
  ApprovalRequest,
  Error,
  { id: number; data: ApprovalReviewInput }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => approvalsApi.review(id, data),
    onSuccess: (_, variables) => {
      // Invalidate all approval-related queries
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(variables.id) });
      // Also invalidate notification count
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.lists() });
    },
  });
};

/**
 * Create fee payment approval mutation
 */
export const useCreateFeePaymentApproval = (): UseMutationResult<
  ApprovalRequest,
  Error,
  FeePaymentApprovalInput
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeePaymentApprovalInput) => approvalsApi.createFeePaymentApproval(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.myRequests() });
    },
  });
};

// ===========================================
// APPROVAL NOTIFICATIONS HOOKS
// ===========================================

/**
 * Fetch approval notifications
 */
export const useApprovalNotifications = (
  params?: { page?: number; page_size?: number }
): UseQueryResult<PaginatedApprovalNotifications, Error> => {
  return useQuery({
    queryKey: approvalNotificationKeys.list(params),
    queryFn: () => approvalNotificationsApi.list(params),
  });
};

/**
 * Fetch unread notification count
 */
export const useApprovalNotificationUnreadCount = (): UseQueryResult<
  ApprovalNotificationUnreadCount,
  Error
> => {
  return useQuery({
    queryKey: approvalNotificationKeys.unreadCount(),
    queryFn: () => approvalNotificationsApi.unreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Fetch unread notifications only
 */
export const useUnreadNotifications = (
  params?: { page?: number; page_size?: number }
): UseQueryResult<PaginatedApprovalNotifications, Error> => {
  return useQuery({
    queryKey: [...approvalNotificationKeys.all, 'unread', params],
    queryFn: () => approvalNotificationsApi.listUnread(params),
  });
};

/**
 * Mark notification as read mutation
 */
export const useMarkNotificationAsRead = (): UseMutationResult<
  ApprovalNotification,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approvalNotificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.unreadCount() });
    },
  });
};

/**
 * Mark all/multiple notifications as read
 */
export const useMarkAllNotificationsAsRead = (): UseMutationResult<
  void,
  Error,
  number[] | undefined
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: number[]) => approvalNotificationsApi.markAllRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.unreadCount() });
    },
  });
};
