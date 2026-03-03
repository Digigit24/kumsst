/**
 * Student 360° Profile API Service
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  Student360Filters,
  Student360Profile,
  Student360Summary,
} from '../types/student-360.types';

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

  console.log(`[Student360] Fetching: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
    // credentials: 'include', // Removed to prevent session conflicts
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Student360] Fetch Error:', {
      url,
      status: response.status,
      headers: Object.fromEntries(headers.entries()),
      error: errorData
    });

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

export const student360Api = {
  getProfile: async (
    studentId: number,
    filters?: Student360Filters
  ): Promise<Student360Profile> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<Student360Profile>(
      buildApiUrl(API_ENDPOINTS.stats.student360.profile(studentId, queryString))
    );
  },

  getSummary: async (
    studentId: number,
    filters?: Student360Filters
  ): Promise<Student360Summary> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<Student360Summary>(
      buildApiUrl(API_ENDPOINTS.stats.student360.summary(studentId, queryString))
    );
  },
};
