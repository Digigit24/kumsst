/**
 * Academic Module API Service
 * All API calls for Academic entities
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  Class,
  ClassCreateInput,
  ClassFilters,
  ClassListItem,
  Classroom,
  ClassroomCreateInput,
  ClassroomFilters,
  ClassroomListItem,
  ClassroomUpdateInput,
  ClassTeacher,
  ClassTeacherCreateInput,
  ClassTeacherFilters,
  ClassTeacherUpdateInput,
  ClassTime,
  ClassTimeCreateInput,
  ClassTimeFilters,
  ClassTimeUpdateInput,
  ClassUpdateInput,
  Faculty,
  FacultyCreateInput,
  FacultyFilters,
  FacultyListItem,
  FacultyUpdateInput,
  LabSchedule,
  LabScheduleCreateInput,
  LabScheduleFilters,
  LabScheduleUpdateInput,
  OptionalSubject,
  OptionalSubjectCreateInput,
  OptionalSubjectFilters,
  OptionalSubjectUpdateInput,
  Program,
  ProgramCreateInput,
  ProgramFilters,
  ProgramListItem,
  ProgramUpdateInput,
  Section,
  SectionCreateInput,
  SectionFilters,
  SectionUpdateInput,
  Subject,
  SubjectAssignment,
  SubjectAssignmentCreateInput,
  SubjectAssignmentFilters,
  SubjectAssignmentListItem,
  SubjectAssignmentUpdateInput,
  SubjectCreateInput,
  SubjectFilters,
  SubjectListItem,
  SubjectUpdateInput,
  Syllabus,
  SyllabusCreateInput,
  SyllabusFilters,
  SyllabusListItem,
  Timetable,
  TimetableCreateInput,
  TimetableFilters,
  TimetableListItem,
  TimetableUpdateInput,
} from '../types/academic.types';
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
    let message = 'Request failed';

    if (typeof errorData.detail === 'string') {
      message = errorData.detail;
    } else if (errorData.detail && typeof errorData.detail === 'object') {
      // DRF nested detail: { non_field_errors: [...], field: [...] }
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
// FACULTY API
// ============================================================================

export const facultyApi = {
  list: async (filters?: FacultyFilters): Promise<PaginatedResponse<FacultyListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<FacultyListItem>>(
      buildApiUrl(`${API_ENDPOINTS.faculties.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Faculty> => {
    return fetchApi<Faculty>(buildApiUrl(API_ENDPOINTS.faculties.detail(id)));
  },

  create: async (data: FacultyCreateInput): Promise<Faculty> => {
    return fetchApi<Faculty>(buildApiUrl(API_ENDPOINTS.faculties.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: FacultyUpdateInput): Promise<Faculty> => {
    return fetchApi<Faculty>(buildApiUrl(API_ENDPOINTS.faculties.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<FacultyUpdateInput>): Promise<Faculty> => {
    return fetchApi<Faculty>(buildApiUrl(API_ENDPOINTS.faculties.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.faculties.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PROGRAM API
// ============================================================================

export const programApi = {
  list: async (filters?: ProgramFilters): Promise<PaginatedResponse<ProgramListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<ProgramListItem>>(
      buildApiUrl(`${API_ENDPOINTS.programs.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Program> => {
    return fetchApi<Program>(buildApiUrl(API_ENDPOINTS.programs.detail(id)));
  },

  create: async (data: ProgramCreateInput): Promise<Program> => {
    return fetchApi<Program>(buildApiUrl(API_ENDPOINTS.programs.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: ProgramUpdateInput): Promise<Program> => {
    return fetchApi<Program>(buildApiUrl(API_ENDPOINTS.programs.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<ProgramUpdateInput>): Promise<Program> => {
    return fetchApi<Program>(buildApiUrl(API_ENDPOINTS.programs.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.programs.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CLASS API
// ============================================================================

export const classApi = {
  list: async (filters?: ClassFilters): Promise<PaginatedResponse<ClassListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<ClassListItem>>(
      buildApiUrl(`${API_ENDPOINTS.classes.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Class> => {
    return fetchApi<Class>(buildApiUrl(API_ENDPOINTS.classes.detail(id)));
  },

  getDetails: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/academic/classes/${id}/details/`));
  },

  create: async (data: ClassCreateInput): Promise<Class> => {
    return fetchApi<Class>(buildApiUrl(API_ENDPOINTS.classes.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: ClassUpdateInput): Promise<Class> => {
    return fetchApi<Class>(buildApiUrl(API_ENDPOINTS.classes.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<ClassUpdateInput>): Promise<Class> => {
    return fetchApi<Class>(buildApiUrl(API_ENDPOINTS.classes.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.classes.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SECTION API
// ============================================================================

export const sectionApi = {
  list: async (filters?: SectionFilters): Promise<PaginatedResponse<Section>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Section>>(
      buildApiUrl(`${API_ENDPOINTS.sections.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Section> => {
    return fetchApi<Section>(buildApiUrl(API_ENDPOINTS.sections.detail(id)));
  },

  create: async (data: SectionCreateInput): Promise<Section> => {
    return fetchApi<Section>(buildApiUrl(API_ENDPOINTS.sections.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: SectionUpdateInput): Promise<Section> => {
    return fetchApi<Section>(buildApiUrl(API_ENDPOINTS.sections.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<SectionUpdateInput>): Promise<Section> => {
    return fetchApi<Section>(buildApiUrl(API_ENDPOINTS.sections.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.sections.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SUBJECT API
// ============================================================================

export const subjectApi = {
  list: async (filters?: SubjectFilters): Promise<PaginatedResponse<SubjectListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SubjectListItem>>(
      buildApiUrl(`${API_ENDPOINTS.subjects.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Subject> => {
    return fetchApi<Subject>(buildApiUrl(API_ENDPOINTS.subjects.detail(id)));
  },

  create: async (data: SubjectCreateInput): Promise<Subject> => {
    return fetchApi<Subject>(buildApiUrl(API_ENDPOINTS.subjects.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: SubjectUpdateInput): Promise<Subject> => {
    return fetchApi<Subject>(buildApiUrl(API_ENDPOINTS.subjects.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<SubjectUpdateInput>): Promise<Subject> => {
    return fetchApi<Subject>(buildApiUrl(API_ENDPOINTS.subjects.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.subjects.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// OPTIONAL SUBJECT API
// ============================================================================

export const optionalSubjectApi = {
  list: async (filters?: OptionalSubjectFilters): Promise<PaginatedResponse<OptionalSubject>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<OptionalSubject>>(
      buildApiUrl(`${API_ENDPOINTS.optionalSubjects.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<OptionalSubject> => {
    return fetchApi<OptionalSubject>(buildApiUrl(API_ENDPOINTS.optionalSubjects.detail(id)));
  },

  create: async (data: OptionalSubjectCreateInput): Promise<OptionalSubject> => {
    return fetchApi<OptionalSubject>(buildApiUrl(API_ENDPOINTS.optionalSubjects.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: OptionalSubjectUpdateInput): Promise<OptionalSubject> => {
    return fetchApi<OptionalSubject>(buildApiUrl(API_ENDPOINTS.optionalSubjects.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<OptionalSubjectUpdateInput>): Promise<OptionalSubject> => {
    return fetchApi<OptionalSubject>(buildApiUrl(API_ENDPOINTS.optionalSubjects.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.optionalSubjects.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SUBJECT ASSIGNMENT API
// ============================================================================

export const subjectAssignmentApi = {
  list: async (filters?: SubjectAssignmentFilters): Promise<PaginatedResponse<SubjectAssignmentListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SubjectAssignmentListItem>>(
      buildApiUrl(`${API_ENDPOINTS.subjectAssignments.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<SubjectAssignment> => {
    return fetchApi<SubjectAssignment>(buildApiUrl(API_ENDPOINTS.subjectAssignments.detail(id)));
  },

  create: async (data: SubjectAssignmentCreateInput): Promise<SubjectAssignment> => {
    return fetchApi<SubjectAssignment>(buildApiUrl(API_ENDPOINTS.subjectAssignments.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: SubjectAssignmentUpdateInput): Promise<SubjectAssignment> => {
    return fetchApi<SubjectAssignment>(buildApiUrl(API_ENDPOINTS.subjectAssignments.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<SubjectAssignmentUpdateInput>): Promise<SubjectAssignment> => {
    return fetchApi<SubjectAssignment>(buildApiUrl(API_ENDPOINTS.subjectAssignments.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.subjectAssignments.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CLASSROOM API
// ============================================================================

export const classroomApi = {
  list: async (filters?: ClassroomFilters): Promise<PaginatedResponse<ClassroomListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<ClassroomListItem>>(
      buildApiUrl(`${API_ENDPOINTS.classrooms.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Classroom> => {
    return fetchApi<Classroom>(buildApiUrl(API_ENDPOINTS.classrooms.detail(id)));
  },

  create: async (data: ClassroomCreateInput): Promise<Classroom> => {
    return fetchApi<Classroom>(buildApiUrl(API_ENDPOINTS.classrooms.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: ClassroomUpdateInput): Promise<Classroom> => {
    return fetchApi<Classroom>(buildApiUrl(API_ENDPOINTS.classrooms.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<ClassroomUpdateInput>): Promise<Classroom> => {
    return fetchApi<Classroom>(buildApiUrl(API_ENDPOINTS.classrooms.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.classrooms.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CLASS TIME API
// ============================================================================

export const classTimeApi = {
  list: async (filters?: ClassTimeFilters): Promise<PaginatedResponse<ClassTime>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<ClassTime>>(
      buildApiUrl(`${API_ENDPOINTS.classTimes.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<ClassTime> => {
    return fetchApi<ClassTime>(buildApiUrl(API_ENDPOINTS.classTimes.detail(id)));
  },

  create: async (data: ClassTimeCreateInput): Promise<ClassTime> => {
    return fetchApi<ClassTime>(buildApiUrl(API_ENDPOINTS.classTimes.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: ClassTimeUpdateInput): Promise<ClassTime> => {
    return fetchApi<ClassTime>(buildApiUrl(API_ENDPOINTS.classTimes.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<ClassTimeUpdateInput>): Promise<ClassTime> => {
    return fetchApi<ClassTime>(buildApiUrl(API_ENDPOINTS.classTimes.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.classTimes.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// TIMETABLE API
// ============================================================================

export const timetableApi = {
  list: async (filters?: TimetableFilters): Promise<PaginatedResponse<TimetableListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<TimetableListItem>>(
      buildApiUrl(`${API_ENDPOINTS.timetable.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Timetable> => {
    return fetchApi<Timetable>(buildApiUrl(API_ENDPOINTS.timetable.detail(id)));
  },

  create: async (data: TimetableCreateInput): Promise<Timetable> => {
    return fetchApi<Timetable>(buildApiUrl(API_ENDPOINTS.timetable.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: TimetableUpdateInput): Promise<Timetable> => {
    return fetchApi<Timetable>(buildApiUrl(API_ENDPOINTS.timetable.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<TimetableUpdateInput>): Promise<Timetable> => {
    return fetchApi<Timetable>(buildApiUrl(API_ENDPOINTS.timetable.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.timetable.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// LAB SCHEDULE API
// ============================================================================

export const labScheduleApi = {
  list: async (filters?: LabScheduleFilters): Promise<PaginatedResponse<LabSchedule>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LabSchedule>>(
      buildApiUrl(`${API_ENDPOINTS.labSchedules.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<LabSchedule> => {
    return fetchApi<LabSchedule>(buildApiUrl(API_ENDPOINTS.labSchedules.detail(id)));
  },

  create: async (data: LabScheduleCreateInput): Promise<LabSchedule> => {
    return fetchApi<LabSchedule>(buildApiUrl(API_ENDPOINTS.labSchedules.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: LabScheduleUpdateInput): Promise<LabSchedule> => {
    return fetchApi<LabSchedule>(buildApiUrl(API_ENDPOINTS.labSchedules.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<LabScheduleUpdateInput>): Promise<LabSchedule> => {
    return fetchApi<LabSchedule>(buildApiUrl(API_ENDPOINTS.labSchedules.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.labSchedules.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CLASS TEACHER API
// ============================================================================

export const classTeacherApi = {
  list: async (filters?: ClassTeacherFilters): Promise<PaginatedResponse<ClassTeacher>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<ClassTeacher>>(
      buildApiUrl(`${API_ENDPOINTS.classTeachers.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<ClassTeacher> => {
    return fetchApi<ClassTeacher>(buildApiUrl(API_ENDPOINTS.classTeachers.detail(id)));
  },

  create: async (data: ClassTeacherCreateInput): Promise<ClassTeacher> => {
    return fetchApi<ClassTeacher>(buildApiUrl(API_ENDPOINTS.classTeachers.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: ClassTeacherUpdateInput): Promise<ClassTeacher> => {
    return fetchApi<ClassTeacher>(buildApiUrl(API_ENDPOINTS.classTeachers.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<ClassTeacherUpdateInput>): Promise<ClassTeacher> => {
    return fetchApi<ClassTeacher>(buildApiUrl(API_ENDPOINTS.classTeachers.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.classTeachers.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SYLLABUS API
// ============================================================================

export const syllabusApi = {
  list: async (filters?: SyllabusFilters): Promise<PaginatedResponse<SyllabusListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SyllabusListItem>>(
      buildApiUrl(`${API_ENDPOINTS.syllabus.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Syllabus> => {
    return fetchApi<Syllabus>(buildApiUrl(API_ENDPOINTS.syllabus.detail(id)));
  },

  mySyllabi: async (filters?: SyllabusFilters): Promise<PaginatedResponse<SyllabusListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SyllabusListItem>>(
      buildApiUrl(`${API_ENDPOINTS.syllabus.mySyllabi}${queryString}`)
    );
  },

  create: async (data: SyllabusCreateInput): Promise<Syllabus> => {
    const formData = new FormData();
    formData.append('subject', String(data.subject));
    formData.append('class_obj', String(data.class_obj));
    formData.append('academic_session', String(data.academic_session));
    if (data.section) {
      formData.append('section', String(data.section));
    }
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('file', data.file);
    if (data.is_active !== undefined) {
      formData.append('is_active', String(data.is_active));
    }

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const defaultHeaders = getDefaultHeaders();
    if (defaultHeaders['X-College-ID']) {
      headers['X-College-ID'] = defaultHeaders['X-College-ID'];
    }

    const response = await fetch(buildApiUrl(API_ENDPOINTS.syllabus.create), {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Failed to upload syllabus'),
        status: response.status,
        errors: errorData,
      };
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.syllabus.delete(id)), {
      method: 'DELETE',
    });
  },

  downloadFile: async (pdfUrl: string): Promise<Blob> => {
    if (!pdfUrl) {
      throw {
        message: 'PDF file not available',
        status: 404,
      };
    }

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const defaultHeaders = getDefaultHeaders();
    if (defaultHeaders['X-College-ID']) {
      headers['X-College-ID'] = defaultHeaders['X-College-ID'];
    }

    // Build full URL if it's a relative path
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : buildApiUrl(pdfUrl);

    // If full URL, use it directly without additional headers if it's an S3 link (to avoid CORS with custom headers)
    const isS3Link = fullUrl.includes('amazonaws.com') || fullUrl.includes('digitaloceanspaces.com');

    // For direct S3/Cloud links, we usually don't need auth headers and should use a simple fetch or window.open
    // But since this is a 'downloadFile' method expected to return a Blob, we'll try to fetch it.
    // If it's an internal API link, we use auth headers.

    const fetchOptions: RequestInit = {
      method: 'GET',
      credentials: isS3Link ? 'omit' : 'include', // S3 usually rejects credentials
    };

    if (!isS3Link) {
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (defaultHeaders['X-College-ID']) {
        headers['X-College-ID'] = defaultHeaders['X-College-ID'];
      }
      fetchOptions.headers = headers;
    }

    const response = await fetch(fullUrl, fetchOptions);

    if (!response.ok) {
      throw {
        message: 'Failed to download file',
        status: response.status,
      };
    }

    return response.blob();
  },
};
