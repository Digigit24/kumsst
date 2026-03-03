/**
 * Teachers Module API Service
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import { Assignment, AssignmentCreateInput, AssignmentFilters, AssignmentListItem, AssignmentUpdateInput, Homework, HomeworkCreateInput, HomeworkFilters, HomeworkListItem, HomeworkSubmission, HomeworkSubmissionCreateInput, HomeworkSubmissionFilters, HomeworkSubmissionUpdateInput, HomeworkUpdateInput, TeacherScheduleResponse } from '../types/academic.types';
import { PaginatedResponse } from '../types/core.types';
import { Teacher, TeacherCreateInput, TeacherFilters, TeacherListItem, TeacherUpdateInput } from '../types/teachers.types';

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

export const teachersApi = {
  // Teachers CRUD
  list: async (filters?: TeacherFilters): Promise<PaginatedResponse<TeacherListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<TeacherListItem>>(
      buildApiUrl(`${API_ENDPOINTS.teachers.list}${queryString}`)
    );
  },

  create: async (data: TeacherCreateInput): Promise<Teacher> => {
    return fetchApi<Teacher>(buildApiUrl(API_ENDPOINTS.teachers.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (id: number): Promise<Teacher> => {
    return fetchApi<Teacher>(buildApiUrl(API_ENDPOINTS.teachers.detail(id)));
  },

  update: async (id: number, data: TeacherUpdateInput): Promise<Teacher> => {
    return fetchApi<Teacher>(buildApiUrl(API_ENDPOINTS.teachers.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  partialUpdate: async (id: number, data: TeacherUpdateInput): Promise<Teacher> => {
    return fetchApi<Teacher>(buildApiUrl(API_ENDPOINTS.teachers.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.teachers.delete(id)), {
      method: 'DELETE',
    });
  },

  getSchedule: async (teacherId?: string): Promise<TeacherScheduleResponse> => {
    const url = teacherId
      ? buildApiUrl(`${API_ENDPOINTS.teachers.schedule}?teacher_id=${teacherId}`)
      : buildApiUrl(API_ENDPOINTS.teachers.schedule);
    return fetchApi<TeacherScheduleResponse>(url);
  },

  getMyStudents: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.teachers.myStudents}${queryString}`)
    );
  },

  // Assignments
  assignments: {
    list: async (filters?: AssignmentFilters): Promise<PaginatedResponse<AssignmentListItem>> => {
      const queryString = buildQueryString(filters || {});
      return fetchApi<PaginatedResponse<AssignmentListItem>>(
        buildApiUrl(`${API_ENDPOINTS.teachers.assignments.list}${queryString}`)
      );
    },
    create: async (data: AssignmentCreateInput): Promise<Assignment> => {
        return fetchApi<Assignment>(buildApiUrl(API_ENDPOINTS.teachers.assignments.create), {
          method: 'POST',
          body: JSON.stringify(data),
        });
    },
    get: async (id: number): Promise<Assignment> => {
        return fetchApi<Assignment>(
          buildApiUrl(API_ENDPOINTS.teachers.assignments.detail(id))
        );
    },
    update: async (id: number, data: AssignmentUpdateInput): Promise<Assignment> => {
        return fetchApi<Assignment>(
          buildApiUrl(API_ENDPOINTS.teachers.assignments.update(id)),
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        );
    },
    patch: async (id: number, data: AssignmentUpdateInput): Promise<Assignment> => {
        return fetchApi<Assignment>(
          buildApiUrl(API_ENDPOINTS.teachers.assignments.patch(id)),
          {
            method: 'PATCH',
            body: JSON.stringify(data),
          }
        );
    },
    delete: async (id: number): Promise<void> => {
        return fetchApi<void>(
          buildApiUrl(API_ENDPOINTS.teachers.assignments.delete(id)),
          {
            method: 'DELETE',
          }
        );
    },
  },

  getAssignments: async (filters?: AssignmentFilters): Promise<PaginatedResponse<AssignmentListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<AssignmentListItem>>(
      buildApiUrl(`${API_ENDPOINTS.teachers.assignments.list}${queryString}`)
    );
  },

  createAssignment: async (data: AssignmentCreateInput): Promise<Assignment> => {
    return fetchApi<Assignment>(buildApiUrl(API_ENDPOINTS.teachers.assignments.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAssignment: async (id: number): Promise<Assignment> => {
    return fetchApi<Assignment>(
      buildApiUrl(API_ENDPOINTS.teachers.assignments.detail(id))
    );
  },

  updateAssignment: async (id: number, data: AssignmentUpdateInput): Promise<Assignment> => {
    return fetchApi<Assignment>(
      buildApiUrl(API_ENDPOINTS.teachers.assignments.update(id)),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  partialUpdateAssignment: async (id: number, data: AssignmentUpdateInput): Promise<Assignment> => {
    return fetchApi<Assignment>(
      buildApiUrl(API_ENDPOINTS.teachers.assignments.patch(id)),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },


  deleteAssignment: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.teachers.assignments.delete(id)),
      {
        method: 'DELETE',
      }
    );
  },

  // Homework
  getHomeworkList: async (filters?: HomeworkFilters): Promise<PaginatedResponse<HomeworkListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<HomeworkListItem>>(
      buildApiUrl(`${API_ENDPOINTS.teachers.homework.list}${queryString}`)
    );
  },

  createHomework: async (data: HomeworkCreateInput): Promise<Homework> => {
    return fetchApi<Homework>(buildApiUrl(API_ENDPOINTS.teachers.homework.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHomework: async (id: number): Promise<Homework> => {
    return fetchApi<Homework>(
      buildApiUrl(API_ENDPOINTS.teachers.homework.detail(id))
    );
  },

  updateHomework: async (id: number, data: HomeworkUpdateInput): Promise<Homework> => {
    return fetchApi<Homework>(
      buildApiUrl(API_ENDPOINTS.teachers.homework.update(id)),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  partialUpdateHomework: async (id: number, data: HomeworkUpdateInput): Promise<Homework> => {
    return fetchApi<Homework>(
      buildApiUrl(API_ENDPOINTS.teachers.homework.patch(id)),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  deleteHomework: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.teachers.homework.delete(id)),
      {
        method: 'DELETE',
      }
    );
  },

  // Homework Submissions
  getHomeworkSubmissions: async (filters?: HomeworkSubmissionFilters): Promise<PaginatedResponse<HomeworkSubmission>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<HomeworkSubmission>>(
      buildApiUrl(`${API_ENDPOINTS.teachers.homeworkSubmissions.list}${queryString}`)
    );
  },

  createHomeworkSubmission: async (data: HomeworkSubmissionCreateInput): Promise<HomeworkSubmission> => {
    return fetchApi<HomeworkSubmission>(buildApiUrl(API_ENDPOINTS.teachers.homeworkSubmissions.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getHomeworkSubmission: async (id: number): Promise<HomeworkSubmission> => {
    return fetchApi<HomeworkSubmission>(
      buildApiUrl(API_ENDPOINTS.teachers.homeworkSubmissions.detail(id))
    );
  },

  updateHomeworkSubmission: async (id: number, data: HomeworkSubmissionUpdateInput): Promise<HomeworkSubmission> => {
    return fetchApi<HomeworkSubmission>(
      buildApiUrl(API_ENDPOINTS.teachers.homeworkSubmissions.update(id)),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  partialUpdateHomeworkSubmission: async (id: number, data: HomeworkSubmissionUpdateInput): Promise<HomeworkSubmission> => {
    return fetchApi<HomeworkSubmission>(
      buildApiUrl(API_ENDPOINTS.teachers.homeworkSubmissions.patch(id)),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  deleteHomeworkSubmission: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.teachers.homeworkSubmissions.delete(id)),
      {
        method: "DELETE",
      }
    );
  },
};
