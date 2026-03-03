/**
 * Attendance Module API Service
 * All API calls for Attendance entities
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
    AttendanceNotification,
    AttendanceNotificationCreateInput,
    AttendanceNotificationFilters,
    AttendanceNotificationListItem,
    AttendanceNotificationUpdateInput,
    AttendanceSummary,
    BulkAttendanceCreateInput,
    BulkStaffAttendanceInput,
    StaffAttendance,
    StaffAttendanceCreateInput,
    StaffAttendanceFilters,
    StaffAttendanceListItem,
    StaffAttendanceUpdateInput,
    StudentAttendance,
    StudentAttendanceCreateInput,
    StudentAttendanceFilters,
    StudentAttendanceListItem,
    StudentAttendanceUpdateInput,
    SubjectAttendance,
    SubjectAttendanceCreateInput,
    SubjectAttendanceFilters,
    SubjectAttendanceListItem,
    SubjectAttendanceUpdateInput,
} from '../types/attendance.types';
import { PaginatedResponse } from '../types/core.types';

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
// STUDENT ATTENDANCE API
// ============================================================================

export const studentAttendanceApi = {
  /**
   * List student attendance records
   */
  list: async (filters?: StudentAttendanceFilters): Promise<PaginatedResponse<StudentAttendanceListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentAttendanceListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentAttendance.list}${queryString}`)
    );
  },

  /**
   * Get student attendance by ID
   */
  get: async (id: number): Promise<StudentAttendance> => {
    return fetchApi<StudentAttendance>(buildApiUrl(API_ENDPOINTS.studentAttendance.detail(id)));
  },

  /**
   * Mark student attendance
   */
  create: async (data: StudentAttendanceCreateInput): Promise<StudentAttendance> => {
    return fetchApi<StudentAttendance>(buildApiUrl(API_ENDPOINTS.studentAttendance.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update student attendance
   */
  update: async (id: number, data: StudentAttendanceUpdateInput): Promise<StudentAttendance> => {
    return fetchApi<StudentAttendance>(buildApiUrl(API_ENDPOINTS.studentAttendance.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partially update student attendance
   */
  patch: async (id: number, data: Partial<StudentAttendanceUpdateInput>): Promise<StudentAttendance> => {
    return fetchApi<StudentAttendance>(buildApiUrl(API_ENDPOINTS.studentAttendance.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete student attendance
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentAttendance.delete(id)), {
      method: 'DELETE',
    });
  },

  /**
   * Bulk mark attendance
   */
  bulkMark: async (data: BulkAttendanceCreateInput): Promise<{ message: string; created_count: number }> => {
    return fetchApi<{ message: string; created_count: number }>(
      buildApiUrl(API_ENDPOINTS.studentAttendance.bulkMark),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Get attendance summary for a student
   */
  summary: async (studentId: number): Promise<AttendanceSummary> => {
    return fetchApi<AttendanceSummary>(buildApiUrl(API_ENDPOINTS.studentAttendance.summary(studentId)));
  },
};

// ============================================================================
// STAFF ATTENDANCE API
// ============================================================================

export const staffAttendanceApi = {
  /**
   * List staff attendance records
   */
  list: async (filters?: StaffAttendanceFilters): Promise<PaginatedResponse<StaffAttendanceListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StaffAttendanceListItem>>(
      buildApiUrl(`${API_ENDPOINTS.staffAttendance.list}${queryString}`)
    );
  },

  /**
   * Get staff attendance by ID
   */
  get: async (id: number): Promise<StaffAttendance> => {
    return fetchApi<StaffAttendance>(buildApiUrl(API_ENDPOINTS.staffAttendance.detail(id)));
  },

  /**
   * Mark staff attendance
   */
  create: async (data: StaffAttendanceCreateInput): Promise<StaffAttendance> => {
    return fetchApi<StaffAttendance>(buildApiUrl(API_ENDPOINTS.staffAttendance.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update staff attendance
   */
  update: async (id: number, data: StaffAttendanceUpdateInput): Promise<StaffAttendance> => {
    return fetchApi<StaffAttendance>(buildApiUrl(API_ENDPOINTS.staffAttendance.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partially update staff attendance
   */
  patch: async (id: number, data: Partial<StaffAttendanceUpdateInput>): Promise<StaffAttendance> => {
    return fetchApi<StaffAttendance>(buildApiUrl(API_ENDPOINTS.staffAttendance.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete staff attendance
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.staffAttendance.delete(id)), {
      method: 'DELETE',
    });
  },

  /**
   * Bulk mark staff attendance in a single API call
   */
  bulkMark: async (data: BulkStaffAttendanceInput): Promise<{ message: string; created_count: number }> => {
    return fetchApi<{ message: string; created_count: number }>(
      buildApiUrl(API_ENDPOINTS.staffAttendance.bulkMark),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// SUBJECT ATTENDANCE API
// ============================================================================

export const subjectAttendanceApi = {
  /**
   * List subject attendance records
   */
  list: async (filters?: SubjectAttendanceFilters): Promise<PaginatedResponse<SubjectAttendanceListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SubjectAttendanceListItem>>(
      buildApiUrl(`${API_ENDPOINTS.subjectAttendance.list}${queryString}`)
    );
  },

  /**
   * Get subject attendance by ID
   */
  get: async (id: number): Promise<SubjectAttendance> => {
    return fetchApi<SubjectAttendance>(buildApiUrl(API_ENDPOINTS.subjectAttendance.detail(id)));
  },

  /**
   * Create subject attendance
   */
  create: async (data: SubjectAttendanceCreateInput): Promise<SubjectAttendance> => {
    return fetchApi<SubjectAttendance>(buildApiUrl(API_ENDPOINTS.subjectAttendance.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update subject attendance
   */
  update: async (id: number, data: SubjectAttendanceUpdateInput): Promise<SubjectAttendance> => {
    return fetchApi<SubjectAttendance>(buildApiUrl(API_ENDPOINTS.subjectAttendance.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partially update subject attendance
   */
  patch: async (id: number, data: Partial<SubjectAttendanceUpdateInput>): Promise<SubjectAttendance> => {
    return fetchApi<SubjectAttendance>(buildApiUrl(API_ENDPOINTS.subjectAttendance.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete subject attendance
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.subjectAttendance.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// ATTENDANCE NOTIFICATION API
// ============================================================================

export const attendanceNotificationApi = {
  /**
   * List attendance notifications
   */
  list: async (filters?: AttendanceNotificationFilters): Promise<PaginatedResponse<AttendanceNotificationListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<AttendanceNotificationListItem>>(
      buildApiUrl(`${API_ENDPOINTS.attendanceNotifications.list}${queryString}`)
    );
  },

  /**
   * Get attendance notification by ID
   */
  get: async (id: number): Promise<AttendanceNotification> => {
    return fetchApi<AttendanceNotification>(buildApiUrl(API_ENDPOINTS.attendanceNotifications.detail(id)));
  },

  /**
   * Create attendance notification
   */
  create: async (data: AttendanceNotificationCreateInput): Promise<AttendanceNotification> => {
    return fetchApi<AttendanceNotification>(buildApiUrl(API_ENDPOINTS.attendanceNotifications.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update attendance notification
   */
  update: async (id: number, data: AttendanceNotificationUpdateInput): Promise<AttendanceNotification> => {
    return fetchApi<AttendanceNotification>(buildApiUrl(API_ENDPOINTS.attendanceNotifications.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partially update attendance notification
   */
  patch: async (id: number, data: Partial<AttendanceNotificationUpdateInput>): Promise<AttendanceNotification> => {
    return fetchApi<AttendanceNotification>(buildApiUrl(API_ENDPOINTS.attendanceNotifications.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete attendance notification
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.attendanceNotifications.delete(id)), {
      method: 'DELETE',
    });
  },

  /**
   * Send attendance notification
   */
  send: async (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(buildApiUrl(API_ENDPOINTS.attendanceNotifications.send(id)), {
      method: 'POST',
    });
  },
};
