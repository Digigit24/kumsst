/**
 * Attendance Drill-Down Dashboard API Service
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  AttendanceClassResponse,
  AttendanceCollegeResponse,
  AttendanceDrillDownFilters,
  AttendanceProgramResponse,
  AttendanceSectionResponse,
  AttendanceStudentResponse,
  AttendanceSubjectResponse,
  LowAttendanceAlert,
} from '../types/attendance-drilldown.types';

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

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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

export const attendanceDrillDownApi = {
  getCollegeOverview: async (
    filters?: AttendanceDrillDownFilters
  ): Promise<AttendanceCollegeResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<AttendanceCollegeResponse>(
      buildApiUrl(API_ENDPOINTS.stats.attendanceDrillDown.college(queryString))
    );
  },

  getProgramDetails: async (
    programId: number,
    filters?: AttendanceDrillDownFilters
  ): Promise<AttendanceProgramResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<AttendanceProgramResponse>(
      buildApiUrl(API_ENDPOINTS.stats.attendanceDrillDown.program(programId, queryString))
    );
  },

  getClassDetails: async (
    classId: number,
    filters?: AttendanceDrillDownFilters
  ): Promise<AttendanceClassResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<AttendanceClassResponse>(
      buildApiUrl(API_ENDPOINTS.stats.attendanceDrillDown.class(classId, queryString))
    );
  },

  getSectionDetails: async (
    sectionId: number,
    filters?: AttendanceDrillDownFilters
  ): Promise<AttendanceSectionResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<AttendanceSectionResponse>(
      buildApiUrl(API_ENDPOINTS.stats.attendanceDrillDown.section(sectionId, queryString))
    );
  },

  getSubjectDetails: async (
    subjectId: number,
    filters?: AttendanceDrillDownFilters
  ): Promise<AttendanceSubjectResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<AttendanceSubjectResponse>(
      buildApiUrl(API_ENDPOINTS.stats.attendanceDrillDown.subject(subjectId, queryString))
    );
  },

  getStudentDetails: async (
    studentId: number,
    filters?: AttendanceDrillDownFilters
  ): Promise<AttendanceStudentResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<AttendanceStudentResponse>(
      buildApiUrl(API_ENDPOINTS.stats.attendanceDrillDown.student(studentId, queryString))
    );
  },

  getLowAttendanceAlerts: async (
    filters?: AttendanceDrillDownFilters
  ): Promise<LowAttendanceAlert[]> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<LowAttendanceAlert[]>(
      buildApiUrl(API_ENDPOINTS.stats.attendanceDrillDown.lowAttendanceAlerts(queryString))
    );
  },
};
