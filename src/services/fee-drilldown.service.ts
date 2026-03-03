/**
 * Fee Drill-Down Dashboard API Service
 * All API calls for hierarchical fee collection drill-down
 */

import { buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  FeeDrillDownAcademicYearResponse,
  FeeDrillDownClassResponse,
  FeeDrillDownCollegeResponse,
  FeeDrillDownTypeResponse,
  FeeDrillDownFilters,
  FeeDrillDownProgramResponse,
  FeeDrillDownStudentResponse,
  TopDefaulter,
} from '../types/fee-drilldown.types';

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
// FEE DRILL-DOWN API
// ============================================================================

export const feeDrillDownApi = {
  /**
   * Get college-level overview with academic year breakdown
   */
  getCollegeOverview: async (
    filters?: FeeDrillDownFilters
  ): Promise<FeeDrillDownCollegeResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<FeeDrillDownCollegeResponse>(
      buildApiUrl(`/api/v1/stats/fee-drilldown/college/${queryString}`)
    );
  },

  /**
   * Get academic year drill-down with program breakdown
   */
  getAcademicYearDrillDown: async (
    yearId: string,
    filters?: FeeDrillDownFilters
  ): Promise<FeeDrillDownAcademicYearResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<FeeDrillDownAcademicYearResponse>(
      buildApiUrl(`/api/v1/stats/fee-drilldown/${yearId}/academic-year/${queryString}`)
    );
  },

  /**
   * Get program-level drill-down with class breakdown
   */
  getProgramDrillDown: async (
    programId: number,
    filters?: FeeDrillDownFilters
  ): Promise<FeeDrillDownProgramResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<FeeDrillDownProgramResponse>(
      buildApiUrl(`/api/v1/stats/fee-drilldown/${programId}/program/${queryString}`)
    );
  },

  /**
   * Get class-level drill-down with fee type breakdown
   */
  getClassDrillDown: async (
    classId: number,
    filters?: FeeDrillDownFilters
  ): Promise<FeeDrillDownClassResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<FeeDrillDownClassResponse>(
      buildApiUrl(`/api/v1/stats/fee-drilldown/${classId}/class/${queryString}`)
    );
  },

  /**
   * Get fee type drill-down with student payments
   */
  getFeeTypeDrillDown: async (
    feeTypeId: number,
    filters?: FeeDrillDownFilters
  ): Promise<FeeDrillDownTypeResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<FeeDrillDownTypeResponse>(
      buildApiUrl(`/api/v1/stats/fee-drilldown/${feeTypeId}/fee-type/${queryString}`)
    );
  },

  /**
   * Get student-level drill-down with payment history
   */
  getStudentDrillDown: async (
    studentId: number,
    filters?: FeeDrillDownFilters
  ): Promise<FeeDrillDownStudentResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<FeeDrillDownStudentResponse>(
      buildApiUrl(`/api/v1/stats/fee-drilldown/${studentId}/student/${queryString}`)
    );
  },

  /**
   * Get top defaulters
   */
  getTopDefaulters: async (
    filters?: FeeDrillDownFilters
  ): Promise<TopDefaulter[]> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<TopDefaulter[]>(
      buildApiUrl(`/api/v1/stats/fee-drilldown/top-defaulters/${queryString}`)
    );
  },
};
