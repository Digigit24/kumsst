/**
 * Core Module API Service
 * All API calls for Core entities
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  AcademicSession,
  AcademicSessionCreateInput,
  AcademicSessionFilters,
  AcademicSessionUpdateInput,
  AcademicYear,
  AcademicYearCreateInput,
  AcademicYearFilters,
  AcademicYearUpdateInput,
  ActivityLog,
  ActivityLogFilters,
  BulkDeleteInput,
  BulkDeleteResponse,
  College,
  CollegeCreateInput,
  CollegeFilters,
  CollegeListItem,
  CollegeUpdateInput,
  Holiday,
  HolidayCreateInput,
  HolidayFilters,
  HolidayUpdateInput,
  NotificationSetting,
  NotificationSettingCreateInput,
  NotificationSettingFilters,
  NotificationSettingUpdateInput,
  PaginatedResponse,
  SystemSetting,
  SystemSettingCreateInput,
  SystemSettingFilters,
  SystemSettingUpdateInput,
  Weekend,
  WeekendCreateInput,
  WeekendFilters,
  WeekendUpdateInput,
} from '../types/core.types';

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
  // Get token explicitly
  const token = localStorage.getItem('access_token');
  const tenantId = localStorage.getItem('tenant_id');
  // console.log('[fetchApi] Token from localStorage:', token);

  // Build headers - CRITICAL: Must create Headers object properly
  const headers = new Headers();

  // Add default headers first
  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Add custom headers from options
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

  // CRITICAL: Ensure Authorization header is added if token exists
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('[fetchApi] Added Authorization header:', `Bearer ${token.substring(0, 20)}...`);
  }

  console.log('[fetchApi] Final headers:', Object.fromEntries(headers.entries()));

  // CRITICAL: Add Tenant Header for Multi-Tenant Routing
  if (tenantId && !headers.has('X-Tenant-ID')) {
    headers.set('X-Tenant-ID', tenantId);
    console.log('[fetchApi] Added X-Tenant-ID header:', tenantId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = 'Request failed';

    if (typeof errorData.detail === 'string') {
      message = errorData.detail;
    } else if (errorData.detail && typeof errorData.detail === 'object') {
      const detailParts: string[] = [];
      for (const [, v] of Object.entries(errorData.detail)) {
        if (typeof v === 'string') detailParts.push(v);
        else if (Array.isArray(v)) detailParts.push((v as string[]).join('. '));
      }
      if (detailParts.length > 0) message = detailParts.join(' | ');
    } else if (typeof errorData.message === 'string') {
      message = errorData.message;
    } else if (typeof errorData.error === 'string') {
      message = errorData.error;
    }

    if (message === 'Request failed' && typeof errorData === 'object' && errorData !== null) {
      const parts: string[] = [];
      for (const [k, v] of Object.entries(errorData)) {
        if (typeof v === 'string') parts.push(`${k}: ${v}`);
        else if (Array.isArray(v)) parts.push(`${k}: ${(v as string[]).join(' ')}`);
      }
      if (parts.length > 0) message = parts.join(' | ');
    }

    throw {
      message,
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
// COLLEGE API
// ============================================================================

export const collegeApi = {
  /**
   * List all colleges with pagination and filters
   */
  list: async (filters?: CollegeFilters): Promise<PaginatedResponse<CollegeListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<CollegeListItem>>(
      buildApiUrl(`${API_ENDPOINTS.colleges.list}${queryString}`)
    );
  },

  /**
   * Get college by ID
   */
  get: async (id: number): Promise<College> => {
    return fetchApi<College>(buildApiUrl(API_ENDPOINTS.colleges.detail(id)));
  },

  /**
   * Create new college
   */
  create: async (data: CollegeCreateInput): Promise<College> => {
    return fetchApi<College>(buildApiUrl(API_ENDPOINTS.colleges.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update college (full update)
   */
  update: async (id: number, data: CollegeUpdateInput): Promise<College> => {
    return fetchApi<College>(buildApiUrl(API_ENDPOINTS.colleges.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update college
   */
  patch: async (id: number, data: Partial<CollegeUpdateInput>): Promise<College> => {
    return fetchApi<College>(buildApiUrl(API_ENDPOINTS.colleges.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Soft delete college
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.colleges.delete(id)), {
      method: 'DELETE',
    });
  },

  /**
   * Get only active colleges
   */
  getActive: async (): Promise<CollegeListItem[]> => {
    return fetchApi<CollegeListItem[]>(buildApiUrl(API_ENDPOINTS.colleges.active));
  },

  /**
   * Bulk delete colleges
   */
  bulkDelete: async (data: BulkDeleteInput): Promise<BulkDeleteResponse> => {
    return fetchApi<BulkDeleteResponse>(buildApiUrl(API_ENDPOINTS.colleges.bulkDelete), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// ACADEMIC YEAR API
// ============================================================================

export const academicYearApi = {
  /**
   * List all academic years
   */
  list: async (filters?: AcademicYearFilters): Promise<PaginatedResponse<AcademicYear>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<AcademicYear>>(
      buildApiUrl(`${API_ENDPOINTS.academicYears.list}${queryString}`)
    );
  },

  /**
   * Get academic year by ID
   */
  get: async (id: number): Promise<AcademicYear> => {
    return fetchApi<AcademicYear>(buildApiUrl(API_ENDPOINTS.academicYears.detail(id)));
  },

  /**
   * Create new academic year
   */
  create: async (data: AcademicYearCreateInput): Promise<AcademicYear> => {
    return fetchApi<AcademicYear>(buildApiUrl(API_ENDPOINTS.academicYears.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update academic year
   */
  update: async (id: number, data: AcademicYearUpdateInput): Promise<AcademicYear> => {
    return fetchApi<AcademicYear>(buildApiUrl(API_ENDPOINTS.academicYears.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update academic year
   */
  patch: async (id: number, data: Partial<AcademicYearUpdateInput>): Promise<AcademicYear> => {
    return fetchApi<AcademicYear>(buildApiUrl(API_ENDPOINTS.academicYears.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete academic year
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.academicYears.delete(id)), {
      method: 'DELETE',
    });
  },

  /**
   * Get current academic year
   */
  getCurrent: async (): Promise<AcademicYear> => {
    return fetchApi<AcademicYear>(buildApiUrl(API_ENDPOINTS.academicYears.current));
  },
};

// ============================================================================
// ACADEMIC SESSION API
// ============================================================================

export const academicSessionApi = {
  /**
   * List all academic sessions
   */
  list: async (filters?: AcademicSessionFilters): Promise<PaginatedResponse<AcademicSession>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<AcademicSession>>(
      buildApiUrl(`${API_ENDPOINTS.academicSessions.list}${queryString}`)
    );
  },

  /**
   * Get academic session by ID
   */
  get: async (id: number): Promise<AcademicSession> => {
    return fetchApi<AcademicSession>(buildApiUrl(API_ENDPOINTS.academicSessions.detail(id)));
  },

  /**
   * Create new academic session
   */
  create: async (data: AcademicSessionCreateInput): Promise<AcademicSession> => {
    return fetchApi<AcademicSession>(buildApiUrl(API_ENDPOINTS.academicSessions.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update academic session
   */
  update: async (id: number, data: AcademicSessionUpdateInput): Promise<AcademicSession> => {
    return fetchApi<AcademicSession>(buildApiUrl(API_ENDPOINTS.academicSessions.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update academic session
   */
  patch: async (
    id: number,
    data: Partial<AcademicSessionUpdateInput>
  ): Promise<AcademicSession> => {
    return fetchApi<AcademicSession>(buildApiUrl(API_ENDPOINTS.academicSessions.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete academic session
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.academicSessions.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// HOLIDAY API
// ============================================================================

export const holidayApi = {
  /**
   * List all holidays
   */
  list: async (filters?: HolidayFilters): Promise<PaginatedResponse<Holiday>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Holiday>>(
      buildApiUrl(`${API_ENDPOINTS.holidays.list}${queryString}`)
    );
  },

  /**
   * Get holiday by ID
   */
  get: async (id: number): Promise<Holiday> => {
    return fetchApi<Holiday>(buildApiUrl(API_ENDPOINTS.holidays.detail(id)));
  },

  /**
   * Create new holiday
   */
  create: async (data: HolidayCreateInput): Promise<Holiday> => {
    return fetchApi<Holiday>(buildApiUrl(API_ENDPOINTS.holidays.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update holiday
   */
  update: async (id: number, data: HolidayUpdateInput): Promise<Holiday> => {
    return fetchApi<Holiday>(buildApiUrl(API_ENDPOINTS.holidays.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update holiday
   */
  patch: async (id: number, data: Partial<HolidayUpdateInput>): Promise<Holiday> => {
    return fetchApi<Holiday>(buildApiUrl(API_ENDPOINTS.holidays.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete holiday
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.holidays.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// WEEKEND API
// ============================================================================

export const weekendApi = {
  /**
   * List all weekends
   */
  list: async (filters?: WeekendFilters): Promise<PaginatedResponse<Weekend>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Weekend>>(
      buildApiUrl(`${API_ENDPOINTS.weekends.list}${queryString}`)
    );
  },

  /**
   * Get weekend by ID
   */
  get: async (id: number): Promise<Weekend> => {
    return fetchApi<Weekend>(buildApiUrl(API_ENDPOINTS.weekends.detail(id)));
  },

  /**
   * Create new weekend
   */
  create: async (data: WeekendCreateInput): Promise<Weekend> => {
    return fetchApi<Weekend>(buildApiUrl(API_ENDPOINTS.weekends.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update weekend
   */
  update: async (id: number, data: WeekendUpdateInput): Promise<Weekend> => {
    return fetchApi<Weekend>(buildApiUrl(API_ENDPOINTS.weekends.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update weekend
   */
  patch: async (id: number, data: Partial<WeekendUpdateInput>): Promise<Weekend> => {
    return fetchApi<Weekend>(buildApiUrl(API_ENDPOINTS.weekends.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete weekend
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.weekends.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SYSTEM SETTING API
// ============================================================================

export const systemSettingApi = {
  /**
   * List all system settings
   */
  list: async (filters?: SystemSettingFilters): Promise<PaginatedResponse<SystemSetting>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SystemSetting>>(
      buildApiUrl(`${API_ENDPOINTS.systemSettings.list}${queryString}`)
    );
  },

  /**
   * Get system setting by ID
   */
  get: async (id: number): Promise<SystemSetting> => {
    return fetchApi<SystemSetting>(buildApiUrl(API_ENDPOINTS.systemSettings.detail(id)));
  },

  /**
   * Create new system setting
   */
  create: async (data: SystemSettingCreateInput): Promise<SystemSetting> => {
    return fetchApi<SystemSetting>(buildApiUrl(API_ENDPOINTS.systemSettings.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update system setting
   */
  update: async (id: number, data: SystemSettingUpdateInput): Promise<SystemSetting> => {
    return fetchApi<SystemSetting>(buildApiUrl(API_ENDPOINTS.systemSettings.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update system setting
   */
  patch: async (id: number, data: Partial<SystemSettingUpdateInput>): Promise<SystemSetting> => {
    return fetchApi<SystemSetting>(buildApiUrl(API_ENDPOINTS.systemSettings.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// NOTIFICATION SETTING API
// ============================================================================

export const notificationSettingApi = {
  /**
   * List all notification settings
   */
  list: async (
    filters?: NotificationSettingFilters
  ): Promise<PaginatedResponse<NotificationSetting>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<NotificationSetting>>(
      buildApiUrl(`${API_ENDPOINTS.notificationSettings.list}${queryString}`)
    );
  },

  /**
   * Get notification setting by ID
   */
  get: async (id: number): Promise<NotificationSetting> => {
    return fetchApi<NotificationSetting>(
      buildApiUrl(API_ENDPOINTS.notificationSettings.detail(id))
    );
  },

  /**
   * Create new notification setting
   */
  create: async (data: NotificationSettingCreateInput): Promise<NotificationSetting> => {
    return fetchApi<NotificationSetting>(buildApiUrl(API_ENDPOINTS.notificationSettings.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update notification setting
   */
  update: async (id: number, data: NotificationSettingUpdateInput): Promise<NotificationSetting> => {
    return fetchApi<NotificationSetting>(
      buildApiUrl(API_ENDPOINTS.notificationSettings.update(id)),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partial update notification setting
   */
  patch: async (
    id: number,
    data: Partial<NotificationSettingUpdateInput>
  ): Promise<NotificationSetting> => {
    return fetchApi<NotificationSetting>(
      buildApiUrl(API_ENDPOINTS.notificationSettings.patch(id)),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// ACTIVITY LOG API (Read-Only)
// ============================================================================

export const activityLogApi = {
  /**
   * List all activity logs
   */
  list: async (filters?: ActivityLogFilters): Promise<PaginatedResponse<ActivityLog>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<ActivityLog>>(
      buildApiUrl(`${API_ENDPOINTS.activityLogs.list}${queryString}`)
    );
  },

  /**
   * Get activity log by ID
   */
  get: async (id: number): Promise<ActivityLog> => {
    return fetchApi<ActivityLog>(buildApiUrl(API_ENDPOINTS.activityLogs.detail(id)));
  },

  /**
   * Clear all activity logs
   */
  clearLogs: async (): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.activityLogs.clearLogs), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PERMISSIONS API
// ============================================================================

export const permissionsApi = {
  /**
   * Get permissions for a role
   */
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/core/permissions/${queryString}`)
    );
  },

  /**
   * Get permission by ID
   */
  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/core/permissions/${id}/`));
  },

  /**
   * Create or update permissions for a role
   */
  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl('/api/v1/core/permissions/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update permissions
   */
  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/core/permissions/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete permissions
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/core/permissions/${id}/`), {
      method: 'DELETE',
    });
  },
};
