/**
 * Students Module API Service
 * All API calls for Students entities
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type { PaginatedResponse } from '../types/core.types';
import type {
  Certificate,
  CertificateCreateInput,
  CertificateFilters,
  CertificateListItem,
  CertificateUpdateInput,
  Guardian,
  GuardianCreateInput,
  GuardianFilters,
  GuardianListItem,
  GuardianUpdateInput,
  ImportPreviewResponse,
  ImportProcessResponse,
  ImportStatusResponse,
  PreviousAcademicRecord,
  PreviousAcademicRecordCreateInput,
  PreviousAcademicRecordFilters,
  PreviousAcademicRecordListItem,
  PreviousAcademicRecordUpdateInput,
  Student,
  StudentAddress,
  StudentAddressCreateInput,
  StudentAddressFilters,
  StudentAddressListItem,
  StudentAddressUpdateInput,
  StudentCategory,
  StudentCategoryCreateInput,
  StudentCategoryFilters,
  StudentCategoryListItem,
  StudentCategoryUpdateInput,
  StudentCreateInput,
  StudentDocument,
  StudentDocumentCreateInput,
  StudentDocumentFilters,
  StudentDocumentListItem,
  StudentDocumentUpdateInput,
  StudentFilters,
  StudentGroup,
  StudentGroupCreateInput,
  StudentGroupFilters,
  StudentGroupListItem,
  StudentGroupUpdateInput,
  StudentGuardian,
  StudentGuardianCreateInput,
  StudentGuardianFilters,
  StudentGuardianListItem,
  StudentGuardianUpdateInput,
  StudentIDCard,
  StudentIDCardCreateInput,
  StudentIDCardFilters,
  StudentIDCardListItem,
  StudentIDCardUpdateInput,
  StudentListItem,
  StudentMedicalRecord,
  StudentMedicalRecordCreateInput,
  StudentMedicalRecordFilters,
  StudentMedicalRecordUpdateInput,
  StudentPromotion,
  StudentPromotionCreateInput,
  StudentPromotionFilters,
  StudentPromotionListItem,
  StudentPromotionUpdateInput,
  StudentUpdateInput
} from '../types/students.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Like fetchApi but returns { data, status } so callers can inspect the HTTP status code. */
const fetchApiWithStatus = async <T>(url: string, options?: RequestInit): Promise<{ data: T; status: number }> => {
  const token = localStorage.getItem('access_token');

  const headers = new Headers();
  const isFormData = options?.body instanceof FormData;

  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    if (isFormData && key.toLowerCase() === 'content-type') return;
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

    throw { message, status: response.status, errors: errorData };
  }

  if (response.status === 204) {
    return { data: {} as T, status: 204 };
  }

  const data = await response.json();
  return { data, status: response.status };
};

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

  // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
  const isFormData = options?.body instanceof FormData;

  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    // Skip Content-Type header for FormData
    if (isFormData && key.toLowerCase() === 'content-type') {
      return;
    }
    headers.set(key, value);
  });

  if (options?.headers) {
    const customHeaders = options.headers;
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        if (!(isFormData && key.toLowerCase() === 'content-type')) {
          headers.set(key, value);
        }
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        if (!(isFormData && key.toLowerCase() === 'content-type')) {
          headers.set(key, value);
        }
      });
    } else {
      Object.entries(customHeaders as Record<string, string>).forEach(([key, value]) => {
        if (!(isFormData && key.toLowerCase() === 'content-type')) {
          headers.set(key, value);
        }
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
// STUDENT CATEGORY API
// ============================================================================

export const studentCategoryApi = {
  list: async (filters?: StudentCategoryFilters): Promise<PaginatedResponse<StudentCategoryListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentCategoryListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentCategories.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentCategory> => {
    return fetchApi<StudentCategory>(buildApiUrl(API_ENDPOINTS.studentCategories.detail(id)));
  },

  create: async (data: StudentCategoryCreateInput): Promise<StudentCategory> => {
    return fetchApi<StudentCategory>(buildApiUrl(API_ENDPOINTS.studentCategories.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentCategoryUpdateInput): Promise<StudentCategory> => {
    return fetchApi<StudentCategory>(buildApiUrl(API_ENDPOINTS.studentCategories.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentCategoryUpdateInput>): Promise<StudentCategory> => {
    return fetchApi<StudentCategory>(buildApiUrl(API_ENDPOINTS.studentCategories.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentCategories.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT GROUP API
// ============================================================================

export const studentGroupApi = {
  list: async (filters?: StudentGroupFilters): Promise<PaginatedResponse<StudentGroupListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentGroupListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentGroups.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentGroup> => {
    return fetchApi<StudentGroup>(buildApiUrl(API_ENDPOINTS.studentGroups.detail(id)));
  },

  create: async (data: StudentGroupCreateInput): Promise<StudentGroup> => {
    return fetchApi<StudentGroup>(buildApiUrl(API_ENDPOINTS.studentGroups.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentGroupUpdateInput): Promise<StudentGroup> => {
    return fetchApi<StudentGroup>(buildApiUrl(API_ENDPOINTS.studentGroups.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentGroupUpdateInput>): Promise<StudentGroup> => {
    return fetchApi<StudentGroup>(buildApiUrl(API_ENDPOINTS.studentGroups.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentGroups.delete(id)), {
      method: 'DELETE',
    });
  },

  addStudents: async (id: number, studentIds: number[]): Promise<StudentGroup> => {
    return fetchApi<StudentGroup>(buildApiUrl(API_ENDPOINTS.studentGroups.addStudents(id)), {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds }),
    });
  },

  removeStudents: async (id: number, studentIds: number[]): Promise<StudentGroup> => {
    return fetchApi<StudentGroup>(buildApiUrl(API_ENDPOINTS.studentGroups.removeStudents(id)), {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds }),
    });
  },
};

// ============================================================================
// STUDENT API
// ============================================================================

export const studentApi = {
  list: async (filters?: StudentFilters): Promise<PaginatedResponse<StudentListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentListItem>>(
      buildApiUrl(`${API_ENDPOINTS.students.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Student> => {
    return fetchApi<Student>(buildApiUrl(API_ENDPOINTS.students.detail(id)));
  },

  create: async (data: StudentCreateInput | FormData): Promise<Student> => {
    const isFormData = data instanceof FormData;
    return fetchApi<Student>(buildApiUrl(API_ENDPOINTS.students.create), {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentUpdateInput | FormData): Promise<Student> => {
    const isFormData = data instanceof FormData;
    return fetchApi<Student>(buildApiUrl(API_ENDPOINTS.students.update(id)), {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentUpdateInput> | FormData): Promise<Student> => {
    const isFormData = data instanceof FormData;
    return fetchApi<Student>(buildApiUrl(API_ENDPOINTS.students.patch(id)), {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.students.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// GUARDIAN API
// ============================================================================

export const guardianApi = {
  list: async (filters?: GuardianFilters): Promise<PaginatedResponse<GuardianListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<GuardianListItem>>(
      buildApiUrl(`${API_ENDPOINTS.guardians.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Guardian> => {
    return fetchApi<Guardian>(buildApiUrl(API_ENDPOINTS.guardians.detail(id)));
  },

  create: async (data: GuardianCreateInput): Promise<Guardian> => {
    return fetchApi<Guardian>(buildApiUrl(API_ENDPOINTS.guardians.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: GuardianUpdateInput): Promise<Guardian> => {
    return fetchApi<Guardian>(buildApiUrl(API_ENDPOINTS.guardians.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<GuardianUpdateInput>): Promise<Guardian> => {
    return fetchApi<Guardian>(buildApiUrl(API_ENDPOINTS.guardians.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.guardians.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT GUARDIAN API
// ============================================================================

export const studentGuardianApi = {
  list: async (filters?: StudentGuardianFilters): Promise<PaginatedResponse<StudentGuardianListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentGuardianListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentGuardians.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentGuardian> => {
    return fetchApi<StudentGuardian>(buildApiUrl(API_ENDPOINTS.studentGuardians.detail(id)));
  },

  create: async (data: StudentGuardianCreateInput): Promise<StudentGuardian> => {
    return fetchApi<StudentGuardian>(buildApiUrl(API_ENDPOINTS.studentGuardians.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentGuardianUpdateInput): Promise<StudentGuardian> => {
    return fetchApi<StudentGuardian>(buildApiUrl(API_ENDPOINTS.studentGuardians.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentGuardianUpdateInput>): Promise<StudentGuardian> => {
    return fetchApi<StudentGuardian>(buildApiUrl(API_ENDPOINTS.studentGuardians.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentGuardians.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT ADDRESS API
// ============================================================================

export const studentAddressApi = {
  list: async (filters?: StudentAddressFilters): Promise<PaginatedResponse<StudentAddressListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentAddressListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentAddresses.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentAddress> => {
    return fetchApi<StudentAddress>(buildApiUrl(API_ENDPOINTS.studentAddresses.detail(id)));
  },

  create: async (data: StudentAddressCreateInput): Promise<StudentAddress> => {
    return fetchApi<StudentAddress>(buildApiUrl(API_ENDPOINTS.studentAddresses.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentAddressUpdateInput): Promise<StudentAddress> => {
    return fetchApi<StudentAddress>(buildApiUrl(API_ENDPOINTS.studentAddresses.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentAddressUpdateInput>): Promise<StudentAddress> => {
    return fetchApi<StudentAddress>(buildApiUrl(API_ENDPOINTS.studentAddresses.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentAddresses.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT DOCUMENT API
// ============================================================================

export const studentDocumentApi = {
  list: async (filters?: StudentDocumentFilters): Promise<PaginatedResponse<StudentDocumentListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentDocumentListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentDocuments.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentDocument> => {
    return fetchApi<StudentDocument>(buildApiUrl(API_ENDPOINTS.studentDocuments.detail(id)));
  },

  create: async (data: StudentDocumentCreateInput | FormData): Promise<StudentDocument> => {
    // If data is FormData, send it directly without JSON.stringify
    const isFormData = data instanceof FormData;

    return fetchApi<StudentDocument>(buildApiUrl(API_ENDPOINTS.studentDocuments.create), {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      // Don't set Content-Type header for FormData - browser will set it automatically with boundary
      ...(isFormData ? {} : {}),
    });
  },

  update: async (id: number, data: StudentDocumentUpdateInput): Promise<StudentDocument> => {
    return fetchApi<StudentDocument>(buildApiUrl(API_ENDPOINTS.studentDocuments.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentDocumentUpdateInput>): Promise<StudentDocument> => {
    return fetchApi<StudentDocument>(buildApiUrl(API_ENDPOINTS.studentDocuments.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentDocuments.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT MEDICAL RECORD API
// ============================================================================

export const studentMedicalRecordApi = {
  list: async (filters?: StudentMedicalRecordFilters): Promise<PaginatedResponse<StudentMedicalRecord>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentMedicalRecord>>(
      buildApiUrl(`${API_ENDPOINTS.studentMedicalRecords.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentMedicalRecord> => {
    return fetchApi<StudentMedicalRecord>(buildApiUrl(API_ENDPOINTS.studentMedicalRecords.detail(id)));
  },

  create: async (data: StudentMedicalRecordCreateInput): Promise<StudentMedicalRecord> => {
    return fetchApi<StudentMedicalRecord>(buildApiUrl(API_ENDPOINTS.studentMedicalRecords.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentMedicalRecordUpdateInput): Promise<StudentMedicalRecord> => {
    return fetchApi<StudentMedicalRecord>(buildApiUrl(API_ENDPOINTS.studentMedicalRecords.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentMedicalRecordUpdateInput>): Promise<StudentMedicalRecord> => {
    return fetchApi<StudentMedicalRecord>(buildApiUrl(API_ENDPOINTS.studentMedicalRecords.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentMedicalRecords.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PREVIOUS ACADEMIC RECORD API
// ============================================================================

export const previousAcademicRecordApi = {
  list: async (filters?: PreviousAcademicRecordFilters): Promise<PaginatedResponse<PreviousAcademicRecordListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PreviousAcademicRecordListItem>>(
      buildApiUrl(`${API_ENDPOINTS.previousAcademicRecords.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<PreviousAcademicRecord> => {
    return fetchApi<PreviousAcademicRecord>(buildApiUrl(API_ENDPOINTS.previousAcademicRecords.detail(id)));
  },

  create: async (data: PreviousAcademicRecordCreateInput): Promise<PreviousAcademicRecord> => {
    return fetchApi<PreviousAcademicRecord>(buildApiUrl(API_ENDPOINTS.previousAcademicRecords.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: PreviousAcademicRecordUpdateInput): Promise<PreviousAcademicRecord> => {
    return fetchApi<PreviousAcademicRecord>(buildApiUrl(API_ENDPOINTS.previousAcademicRecords.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<PreviousAcademicRecordUpdateInput>): Promise<PreviousAcademicRecord> => {
    return fetchApi<PreviousAcademicRecord>(buildApiUrl(API_ENDPOINTS.previousAcademicRecords.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.previousAcademicRecords.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT PROMOTION API
// ============================================================================

export const studentPromotionApi = {
  list: async (filters?: StudentPromotionFilters): Promise<PaginatedResponse<StudentPromotionListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentPromotionListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentPromotions.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentPromotion> => {
    return fetchApi<StudentPromotion>(buildApiUrl(API_ENDPOINTS.studentPromotions.detail(id)));
  },

  create: async (data: StudentPromotionCreateInput): Promise<StudentPromotion> => {
    return fetchApi<StudentPromotion>(buildApiUrl(API_ENDPOINTS.studentPromotions.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentPromotionUpdateInput): Promise<StudentPromotion> => {
    return fetchApi<StudentPromotion>(buildApiUrl(API_ENDPOINTS.studentPromotions.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentPromotionUpdateInput>): Promise<StudentPromotion> => {
    return fetchApi<StudentPromotion>(buildApiUrl(API_ENDPOINTS.studentPromotions.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentPromotions.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CERTIFICATE API
// ============================================================================

export const certificateApi = {
  list: async (filters?: CertificateFilters): Promise<PaginatedResponse<CertificateListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<CertificateListItem>>(
      buildApiUrl(`${API_ENDPOINTS.certificates.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Certificate> => {
    return fetchApi<Certificate>(buildApiUrl(API_ENDPOINTS.certificates.detail(id)));
  },

  create: async (data: CertificateCreateInput): Promise<Certificate> => {
    return fetchApi<Certificate>(buildApiUrl(API_ENDPOINTS.certificates.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: CertificateUpdateInput): Promise<Certificate> => {
    return fetchApi<Certificate>(buildApiUrl(API_ENDPOINTS.certificates.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<CertificateUpdateInput>): Promise<Certificate> => {
    return fetchApi<Certificate>(buildApiUrl(API_ENDPOINTS.certificates.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.certificates.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT ID CARD API
// ============================================================================

export const studentIDCardApi = {
  list: async (filters?: StudentIDCardFilters): Promise<PaginatedResponse<StudentIDCardListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StudentIDCardListItem>>(
      buildApiUrl(`${API_ENDPOINTS.studentIDCards.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<StudentIDCard> => {
    return fetchApi<StudentIDCard>(buildApiUrl(API_ENDPOINTS.studentIDCards.detail(id)));
  },

  create: async (data: StudentIDCardCreateInput): Promise<StudentIDCard> => {
    return fetchApi<StudentIDCard>(buildApiUrl(API_ENDPOINTS.studentIDCards.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: StudentIDCardUpdateInput): Promise<StudentIDCard> => {
    return fetchApi<StudentIDCard>(buildApiUrl(API_ENDPOINTS.studentIDCards.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<StudentIDCardUpdateInput>): Promise<StudentIDCard> => {
    return fetchApi<StudentIDCard>(buildApiUrl(API_ENDPOINTS.studentIDCards.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.studentIDCards.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDENT IMPORT API
// ============================================================================

export const studentImportApi = {
  preview: async (file: File): Promise<ImportPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<ImportPreviewResponse>(buildApiUrl(API_ENDPOINTS.students.import.preview), {
      method: 'POST',
      body: formData,
    });
  },

  process: async (
    file: File,
    columnMapping: Record<string, string>,
    skipDuplicates: boolean = true,
  ): Promise<{ data: ImportProcessResponse; isAsync: boolean }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('column_mapping', JSON.stringify(columnMapping));
    formData.append('skip_duplicates', String(skipDuplicates));

    const { data, status } = await fetchApiWithStatus<ImportProcessResponse>(
      buildApiUrl(API_ENDPOINTS.students.import.process),
      { method: 'POST', body: formData },
    );
    return { data, isAsync: status === 202 };
  },

  status: async (jobId: number): Promise<ImportStatusResponse> => {
    return fetchApi<ImportStatusResponse>(buildApiUrl(API_ENDPOINTS.students.import.status(jobId)));
  },
};
