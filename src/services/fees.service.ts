/**
 * Fees Module API Service
 * All API calls for Fees entities
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type { PaginatedResponse } from '../types/core.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
};

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

// ============================================================================
// FEE MASTERS API
// ============================================================================

export const feeMastersApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeMasters.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeMasters.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeMasters.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeMasters.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeMasters.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeMasters.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE STRUCTURES API
// ============================================================================

export const feeStructuresApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeStructures.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeStructures.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeStructures.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeStructures.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeStructures.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeStructures.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE DISCOUNTS API
// ============================================================================

export const feeDiscountsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeDiscounts.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeDiscounts.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeDiscounts.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeDiscounts.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeDiscounts.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeDiscounts.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE FINES API
// ============================================================================

export const feeFinesApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeFines.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeFines.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeFines.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeFines.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeFines.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeFines.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE COLLECTIONS API
// ============================================================================

export const feeCollectionsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeCollections.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeCollections.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeCollections.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeCollections.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeCollections.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeCollections.delete(id)), {
      method: 'DELETE',
    });
  },

  cancel: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeCollections.cancel(id)), {
      method: 'POST',
    });
  },

  studentStatus: async (studentId: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeCollections.studentStatus(studentId)));
  },
};

// ============================================================================
// FEE TYPES API
// ============================================================================

export const feeTypesApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeTypes.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeTypes.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeTypes.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeTypes.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeTypes.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeTypes.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE GROUPS API
// ============================================================================

export const feeGroupsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeGroups.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeGroups.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeGroups.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeGroups.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeGroups.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeGroups.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE INSTALLMENTS API
// ============================================================================

export const feeInstallmentsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeInstallments.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeInstallments.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeInstallments.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeInstallments.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeInstallments.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeInstallments.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE RECEIPTS API
// ============================================================================

export const feeReceiptsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeReceipts.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReceipts.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReceipts.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReceipts.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReceipts.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeReceipts.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT FEE DISCOUNTS API
// ============================================================================

export const studentFeeDiscountsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.studentFeeDiscounts.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentFeeDiscounts.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentFeeDiscounts.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentFeeDiscounts.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentFeeDiscounts.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentFeeDiscounts.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE REFUNDS API
// ============================================================================

export const feeRefundsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeRefunds.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeRefunds.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeRefunds.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeRefunds.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeRefunds.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeRefunds.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FEE REMINDERS API
// ============================================================================

export const feeRemindersApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.feeReminders.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReminders.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReminders.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReminders.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.feeReminders.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.feeReminders.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// BANK PAYMENTS API
// ============================================================================

export const bankPaymentsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.bankPayments.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.bankPayments.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.bankPayments.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.bankPayments.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.bankPayments.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.bankPayments.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// ONLINE PAYMENTS API
// ============================================================================

export const onlinePaymentsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.onlinePayments.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.onlinePayments.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.onlinePayments.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.onlinePayments.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.onlinePayments.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.onlinePayments.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT MY FEES API
// ============================================================================

export const studentFeesApi = {
  getMyFees: async (filters: any = {}): Promise<any> => {
    const queryString = buildQueryString(filters);
    return fetchApi<any>(buildApiUrl(`${API_ENDPOINTS.myFees.list}${queryString}`));
  },

  getFeeDetail: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.myFees.detail(id)));
  },

  downloadReceipt: async (id: number): Promise<Blob> => {
    const url = buildApiUrl(API_ENDPOINTS.myFees.receipt(id));
    const token = localStorage.getItem('access_token');

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    return response.blob();
  },
};
