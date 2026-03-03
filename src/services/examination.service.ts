/**
 * Examination Module API Service
 * All API calls for Examination entities
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

  if (options?.body instanceof FormData) {
    headers.delete('Content-Type');
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
// EXAM TYPE API
// ============================================================================

export const examTypeApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.examTypes.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examTypes.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examTypes.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examTypes.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examTypes.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.examTypes.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// EXAMS API
// ============================================================================

export const examsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.exams.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.exams.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.exams.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.exams.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.exams.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.exams.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// EXAM SCHEDULES API
// ============================================================================

export const examSchedulesApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.examSchedules.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examSchedules.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examSchedules.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examSchedules.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examSchedules.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.examSchedules.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// EXAM ATTENDANCE API
// ============================================================================

export const examAttendanceApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.examAttendance.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examAttendance.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examAttendance.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examAttendance.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examAttendance.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.examAttendance.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// ADMIT CARDS API
// ============================================================================

export const admitCardsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.admitCards.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.admitCards.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.admitCards.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.admitCards.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.admitCards.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.admitCards.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT MARKS API
// ============================================================================

export const studentMarksApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.studentMarks.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentMarks.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentMarks.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentMarks.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.studentMarks.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentMarks.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// MARKS GRADES API
// ============================================================================

export const marksGradesApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.marksGrades.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksGrades.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksGrades.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksGrades.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksGrades.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.marksGrades.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// MARKS REGISTERS API
// ============================================================================

export const marksRegistersApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.marksRegisters.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksRegisters.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksRegisters.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksRegisters.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.marksRegisters.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.marksRegisters.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// MARK SHEETS API
// ============================================================================

export const markSheetsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.markSheets.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.markSheets.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.markSheets.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.markSheets.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.markSheets.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.markSheets.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PROGRESS CARDS API
// ============================================================================

export const progressCardsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.progressCards.list}${queryString}`)
    );
  },

  myProgressCards: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.progressCards.myProgressCards}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.progressCards.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.progressCards.create), {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.progressCards.update(id)), {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.progressCards.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.progressCards.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// TABULATION SHEETS API
// ============================================================================

export const tabulationSheetsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.tabulationSheets.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.tabulationSheets.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.tabulationSheets.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.tabulationSheets.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.tabulationSheets.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.tabulationSheets.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// EXAM RESULTS API
// ============================================================================

export const examResultsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.examResults.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examResults.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examResults.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examResults.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.examResults.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.examResults.delete(id)), {
      method: 'DELETE',
    });
  },
};
