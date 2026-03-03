/**
 * Approvals Service
 * API calls for approval requests and notifications
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  ApprovalListParams,
  ApprovalNotification,
  ApprovalNotificationUnreadCount,
  ApprovalRequest,
  ApprovalReviewInput,
  FeePaymentApprovalInput,
  PaginatedApprovalNotifications,
  PaginatedApprovalRequests,
} from '../types/approvals.types';

/**
 * Generic fetch wrapper
 */
const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('access_token');
  const headers = new Headers();
  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

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
    throw new Error(typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Build query string from params
 */
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// ===========================================
// APPROVAL REQUESTS API
// ===========================================

export const approvalsApi = {
  /**
   * List all approval requests
   */
  list: async (params?: ApprovalListParams): Promise<PaginatedApprovalRequests> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedApprovalRequests>(
      buildApiUrl(`${API_ENDPOINTS.approvals.list}${queryString}`)
    );
  },

  /**
   * Get pending approvals for current user
   */
  pendingApprovals: async (params?: ApprovalListParams): Promise<PaginatedApprovalRequests> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedApprovalRequests>(
      buildApiUrl(`${API_ENDPOINTS.approvals.pendingApprovals}${queryString}`)
    );
  },

  /**
   * Get current user's approval requests
   */
  myRequests: async (params?: ApprovalListParams): Promise<PaginatedApprovalRequests> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedApprovalRequests>(
      buildApiUrl(`${API_ENDPOINTS.approvals.myRequests}${queryString}`)
    );
  },

  /**
   * Get approval request by ID
   */
  get: async (id: number): Promise<ApprovalRequest> => {
    return fetchApi<ApprovalRequest>(buildApiUrl(API_ENDPOINTS.approvals.detail(id)));
  },

  /**
   * Review approval request (approve or reject)
   */
  review: async (id: number, data: ApprovalReviewInput): Promise<ApprovalRequest> => {
    return fetchApi<ApprovalRequest>(buildApiUrl(API_ENDPOINTS.approvals.review(id)), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create fee payment approval request
   */
  createFeePaymentApproval: async (data: FeePaymentApprovalInput): Promise<ApprovalRequest> => {
    return fetchApi<ApprovalRequest>(buildApiUrl(API_ENDPOINTS.approvals.feePayment), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create store indent approval request
   */
  createStoreIndentApproval: async (data: {
    indent_id: number;
    indent_number: string;
    college: number;
    priority: string;
    approvers: string[];
    required_by_date: string;
    total_items: number;
    requester: string;
  }): Promise<ApprovalRequest> => {
    return fetchApi<ApprovalRequest>(buildApiUrl(API_ENDPOINTS.approvals.list), {
      method: 'POST',
      body: JSON.stringify({
        request_type: 'store_indent',
        title: `Store Indent Approval - ${data.indent_number}`,
        description: `Approval request for store indent ${data.indent_number} with ${data.total_items} items. Required by: ${new Date(data.required_by_date).toLocaleDateString()}`,
        priority: data.priority,
        college: data.college,
        requester: data.requester,
        approvers: data.approvers,
        deadline: data.required_by_date,
        metadata: JSON.stringify({
          indent_id: data.indent_id,
          indent_number: data.indent_number,
          required_by_date: data.required_by_date,
          total_items: data.total_items,
        }),
      }),
    });
  },
};

// ===========================================
// APPROVAL NOTIFICATIONS API
// ===========================================

export const approvalNotificationsApi = {
  /**
   * List approval notifications
   */
  list: async (params?: { page?: number; page_size?: number }): Promise<PaginatedApprovalNotifications> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedApprovalNotifications>(
      buildApiUrl(`${API_ENDPOINTS.approvals.notifications}${queryString}`)
    );
  },

  /**
   * Get unread notification count
   */
  unreadCount: async (): Promise<ApprovalNotificationUnreadCount> => {
    return fetchApi<ApprovalNotificationUnreadCount>(
      buildApiUrl(API_ENDPOINTS.approvals.unreadCount)
    );
  },

  /**
   * List unread notifications only
   */
  listUnread: async (params?: { page?: number; page_size?: number }): Promise<PaginatedApprovalNotifications> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedApprovalNotifications>(
      buildApiUrl(`${API_ENDPOINTS.approvals.notificationsUnread}${queryString}`)
    );
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<ApprovalNotification> => {
    return fetchApi<ApprovalNotification>(buildApiUrl(API_ENDPOINTS.approvals.markAsRead(id)), {
      method: 'POST',
    });
  },

  /**
   * Mark multiple/all notifications as read
   */
  markAllRead: async (notificationIds?: number[]): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.approvals.markAllRead), {
      method: 'POST',
      body: JSON.stringify(notificationIds ? { notification_ids: notificationIds } : {}),
    });
  },
};
