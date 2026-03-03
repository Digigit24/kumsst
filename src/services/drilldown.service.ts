/**
 * Academic Drill-Down Dashboard API Service
 * All API calls for hierarchical academic performance drill-down
 */

import { buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  ClassDrillDownFilters,
  ClassDrillDownResponse,
  CollegeOverviewFilters,
  CollegeOverviewResponse,
  ProgramDrillDownFilters,
  ProgramDrillDownResponse,
  SectionDrillDownFilters,
  SectionDrillDownResponse,
  StudentDrillDownFilters,
  StudentDrillDownResponse,
  SubjectDrillDownFilters,
  SubjectDrillDownResponse,
} from '../types/drilldown.types';

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
// ACADEMIC DRILL-DOWN API
// ============================================================================

export const drillDownApi = {
  /**
   * Get college-level overview with program breakdown
   */
  getCollegeOverview: async (
    filters?: CollegeOverviewFilters
  ): Promise<CollegeOverviewResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<CollegeOverviewResponse>(
      buildApiUrl(`/api/v1/stats/academic-drilldown/college/${queryString}`)
    );
  },

  /**
   * Get program-level drill-down with class breakdown
   */
  getProgramDrillDown: async (
    programId: number,
    filters?: ProgramDrillDownFilters
  ): Promise<ProgramDrillDownResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<ProgramDrillDownResponse>(
      buildApiUrl(`/api/v1/stats/academic-drilldown/${programId}/program/${queryString}`)
    );
  },

  /**
   * Get class-level drill-down with section breakdown
   */
  getClassDrillDown: async (
    classId: number,
    filters?: ClassDrillDownFilters
  ): Promise<ClassDrillDownResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<ClassDrillDownResponse>(
      buildApiUrl(`/api/v1/stats/academic-drilldown/${classId}/class/${queryString}`)
    );
  },

  /**
   * Get section-level drill-down with subject breakdown and student list
   */
  getSectionDrillDown: async (
    sectionId: number,
    filters?: SectionDrillDownFilters
  ): Promise<SectionDrillDownResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<SectionDrillDownResponse>(
      buildApiUrl(`/api/v1/stats/academic-drilldown/${sectionId}/section/${queryString}`)
    );
  },

  /**
   * Get subject-level drill-down with detailed student marks
   */
  getSubjectDrillDown: async (
    subjectId: number,
    filters?: SubjectDrillDownFilters
  ): Promise<SubjectDrillDownResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<SubjectDrillDownResponse>(
      buildApiUrl(`/api/v1/stats/academic-drilldown/${subjectId}/subject/${queryString}`)
    );
  },

  /**
   * Get student-level drill-down with complete academic profile
   */
  getStudentDrillDown: async (
    studentId: number,
    filters?: StudentDrillDownFilters
  ): Promise<StudentDrillDownResponse> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<StudentDrillDownResponse>(
      buildApiUrl(`/api/v1/stats/academic-drilldown/${studentId}/student/${queryString}`)
    );
  },
};
