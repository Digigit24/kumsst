import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from "../config/api.config";
import {
    StudentHomework,
    StudentHomeworkSubmission,
    CreateSubmissionPayload,
    HomeworkFilters
} from "../types/student-homework.types";

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

export const studentHomeworkService = {
    // List Homework
    getHomeworkList: async (params?: HomeworkFilters) => {
        const queryString = params ? buildQueryString(params) : '';
        return fetchApi<{ results: StudentHomework[]; count: number }>(
            buildApiUrl(`${API_ENDPOINTS.studentHomework.list}${queryString}`)
        );
    },

    // Get Homework Detail
    getHomeworkDetail: async (id: number) => {
        return fetchApi<StudentHomework>(
            buildApiUrl(API_ENDPOINTS.studentHomework.detail(id))
        );
    },

    // List Submissions
    getSubmissions: async (params?: any) => {
        const queryString = params ? buildQueryString(params) : '';
        return fetchApi<{ results: StudentHomeworkSubmission[]; count: number }>(
            buildApiUrl(`${API_ENDPOINTS.studentHomeworkSubmissions.list}${queryString}`)
        );
    },

    // Submit Homework (Create)
    submitHomework: async (payload: CreateSubmissionPayload) => {
        const formData = new FormData();
        formData.append('homework', payload.homework.toString());
        if (payload.submission_text) {
            formData.append('submission_text', payload.submission_text);
        }
        if (payload.submission_file) {
            formData.append('submission_file', payload.submission_file);
        }
        if (payload.status) formData.append('status', payload.status);

        return fetchApi<StudentHomeworkSubmission>(
            buildApiUrl(API_ENDPOINTS.studentHomeworkSubmissions.create),
            {
                method: 'POST',
                body: formData,
            }
        );
    },

    // Get Submission Detail
    getSubmissionDetail: async (id: number) => {
        return fetchApi<StudentHomeworkSubmission>(
            buildApiUrl(API_ENDPOINTS.studentHomeworkSubmissions.detail(id))
        );
    },

    // Update Submission
    updateSubmission: async (id: number, payload: Partial<CreateSubmissionPayload>) => {
        const formData = new FormData();
        if (payload.homework) formData.append('homework', payload.homework.toString());
        if (payload.submission_text !== undefined) formData.append('submission_text', payload.submission_text);
        if (payload.submission_file) formData.append('submission_file', payload.submission_file);

        return fetchApi<StudentHomeworkSubmission>(
            buildApiUrl(API_ENDPOINTS.studentHomeworkSubmissions.update(id)),
            {
                method: 'PATCH',
                body: formData,
            }
        );
    }
};
