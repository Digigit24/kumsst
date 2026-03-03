/**
 * Assignments Service
 * API calls for assignments and submissions
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
    Assignment,
    AssignmentCreateInput,
    AssignmentListParams,
    AssignmentSubmission,
    AssignmentSubmissionCreateInput,
    AssignmentSubmissionGradeInput,
    AssignmentSubmissionListParams,
    AssignmentUpdateInput,
    PaginatedAssignments,
    PaginatedSubmissions,
} from '../types/assignments.types';

/**
 * Generic fetch wrapper
 */
const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  // Check if body is FormData - if so, don't set Content-Type
  const isFormData = options?.body instanceof FormData;
  const token = localStorage.getItem('access_token');

  const headers = new Headers();
  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    // Skip Content-Type header for FormData
    if (isFormData && key.toLowerCase() === 'content-type') {
      return;
    }
    headers.set(key, value);
  });

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
// ASSIGNMENTS API
// ===========================================

export const assignmentsApi = {
  /**
   * List assignments
   */
  list: async (params?: AssignmentListParams): Promise<PaginatedAssignments> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedAssignments>(
      buildApiUrl(`${API_ENDPOINTS.assignments.list}${queryString}`)
    );
  },

  /**
   * Get assignment by ID
   */
  get: async (id: number): Promise<Assignment> => {
    return fetchApi<Assignment>(buildApiUrl(API_ENDPOINTS.assignments.detail(id)));
  },

  /**
   * Create assignment
   */
  create: async (data: AssignmentCreateInput | FormData): Promise<Assignment> => {
    const isFormData = data instanceof FormData;
    return fetchApi<Assignment>(buildApiUrl(API_ENDPOINTS.assignments.create), {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Update assignment
   */
  update: async (id: number, data: AssignmentUpdateInput | FormData): Promise<Assignment> => {
    const isFormData = data instanceof FormData;
    return fetchApi<Assignment>(buildApiUrl(API_ENDPOINTS.assignments.update(id)), {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Partial update assignment
   */
  patch: async (id: number, data: Partial<AssignmentUpdateInput>): Promise<Assignment> => {
    return fetchApi<Assignment>(buildApiUrl(API_ENDPOINTS.assignments.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete assignment
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.assignments.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ===========================================
// STUDENT ASSIGNMENTS API
// ===========================================

export const studentAssignmentsApi = {
  /**
   * List assignments (for students)
   */
  list: async (params?: AssignmentListParams): Promise<PaginatedAssignments> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedAssignments>(
      buildApiUrl(`${API_ENDPOINTS.studentAssignments.list}${queryString}`)
    );
  },

  /**
   * Get assignment by ID (for students)
   */
  get: async (id: number): Promise<Assignment> => {
    return fetchApi<Assignment>(buildApiUrl(API_ENDPOINTS.studentAssignments.detail(id)));
  },
};

// ===========================================
// ASSIGNMENT SUBMISSIONS API
// ===========================================

export const assignmentSubmissionsApi = {
  /**
   * List submissions
   */
  list: async (params?: AssignmentSubmissionListParams): Promise<PaginatedSubmissions> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedSubmissions>(
      buildApiUrl(`${API_ENDPOINTS.assignmentSubmissions.list}${queryString}`)
    );
  },

  /**
   * Get submission by ID
   */
  get: async (id: number): Promise<AssignmentSubmission> => {
    return fetchApi<AssignmentSubmission>(
      buildApiUrl(API_ENDPOINTS.assignmentSubmissions.detail(id))
    );
  },

  /**
   * Create submission (student)
   */
  create: async (
    data: AssignmentSubmissionCreateInput | FormData
  ): Promise<AssignmentSubmission> => {
    const isFormData = data instanceof FormData;
    return fetchApi<AssignmentSubmission>(
      buildApiUrl(API_ENDPOINTS.studentSubmissions.create),
      {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
      }
    );
  },

  /**
   * Update submission
   */
  update: async (
    id: number,
    data: AssignmentSubmissionCreateInput | FormData
  ): Promise<AssignmentSubmission> => {
    const isFormData = data instanceof FormData;
    return fetchApi<AssignmentSubmission>(
      buildApiUrl(API_ENDPOINTS.assignmentSubmissions.update(id)),
      {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
      }
    );
  },

  /**
   * Delete submission
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.assignmentSubmissions.delete(id)), {
      method: 'DELETE',
    });
  },

  /**
   * Grade submission (teacher)
   */
  grade: async (
    id: number,
    data: AssignmentSubmissionGradeInput
  ): Promise<AssignmentSubmission> => {
    return fetchApi<AssignmentSubmission>(
      buildApiUrl(API_ENDPOINTS.assignmentSubmissions.grade(id)),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Get my submissions (student's submissions)
   */
  /**
   * Get my submissions (student's submissions)
   */
  mySubmissions: async (
    params?: AssignmentSubmissionListParams
  ): Promise<PaginatedSubmissions> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedSubmissions>(
      buildApiUrl(`${API_ENDPOINTS.assignmentSubmissions.mySubmissions}${queryString}`)
    );
  },

  /**
   * List student submissions (for student dashboard)
   */
  listStudentSubmissions: async (
    params?: AssignmentSubmissionListParams
  ): Promise<PaginatedSubmissions> => {
    const queryString = params ? buildQueryString(params) : '';
    return fetchApi<PaginatedSubmissions>(
      buildApiUrl(`${API_ENDPOINTS.studentSubmissions.list}${queryString}`)
    );
  },
};
