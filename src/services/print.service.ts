/**
 * Print Template Module API Service
 * All API calls for Print Templates, Documents, and Approvals
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type { PaginatedResponse } from '../types/core.types';
import type {
  ApprovalActionRequest,
  ApprovalDashboard,
  ApprovalFilters,
  ApprovalPreviewResponse,
  BulkJobProgress,
  BulkPrintJob,
  BulkPrintJobCreateInput,
  BulkPrintJobFilters,
  PendingApproval,
  PrintConfiguration,
  PrintConfigurationUpdateInput,
  PrintDocument,
  PrintDocumentCreateInput,
  PrintDocumentFilters,
  PrintTemplate,
  PrintTemplateCreateInput,
  PrintTemplateFilters,
  PrintTemplateUpdateInput,
  SignatoryCreateInput,
  SignatoryInfo,
  TargetModel,
  TemplateCategory,
  TemplateCategoryCreateInput,
  TemplateCategoryFilters,
  TemplateCategoryUpdateInput,
  TemplateDuplicateRequest,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  TemplatesByCategory,
} from '../types/print.types';

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

  const token = localStorage.getItem('access_token');
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
    throw {
      message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Request failed'),
      status: response.status,
      errors: errorData,
    };
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

const fetchApiFormData = async <T>(url: string, formData: FormData, method: string = 'POST'): Promise<T> => {
  const headers = new Headers();
  const token = localStorage.getItem('access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Get college ID header
  const defaultHeaders = getDefaultHeaders();
  if (defaultHeaders['X-College-ID']) {
    headers.set('X-College-ID', defaultHeaders['X-College-ID']);
  }
  // Don't set Content-Type for FormData - browser will set it with boundary

  const response = await fetch(url, {
    method,
    headers,
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Request failed'),
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
// PRINT CONFIGURATION API
// ============================================================================

export const printConfigApi = {
  get: async (): Promise<PrintConfiguration> => {
    const response = await fetchApi<PrintConfiguration | PaginatedResponse<PrintConfiguration>>(
      buildApiUrl(API_ENDPOINTS.print.config.list)
    );

    // Handle paginated response structure
    if ('results' in response && Array.isArray(response.results)) {
      return response.results[0] as PrintConfiguration;
    }

    return response as PrintConfiguration;
  },

  update: async (id: number, data: PrintConfigurationUpdateInput): Promise<PrintConfiguration> => {
    // Always use FormData for this endpoint (Django expects multipart/form-data)
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return fetchApiFormData<PrintConfiguration>(
      buildApiUrl(API_ENDPOINTS.print.config.patch(id)),
      formData,
      'PATCH'
    );
  },

  getSignatories: async (): Promise<SignatoryInfo[]> => {
    return fetchApi<SignatoryInfo[]>(buildApiUrl(API_ENDPOINTS.print.config.signatories));
  },

  addSignatory: async (data: SignatoryCreateInput): Promise<SignatoryInfo> => {
    if (data.signature_image instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('designation', data.designation);
      formData.append('signature_image', data.signature_image);
      return fetchApiFormData<SignatoryInfo>(
        buildApiUrl(API_ENDPOINTS.print.config.addSignatory),
        formData
      );
    }

    return fetchApi<SignatoryInfo>(buildApiUrl(API_ENDPOINTS.print.config.addSignatory), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// TEMPLATE CATEGORIES API
// ============================================================================

export const templateCategoriesApi = {
  list: async (filters?: TemplateCategoryFilters): Promise<PaginatedResponse<TemplateCategory>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<TemplateCategory>>(
      buildApiUrl(`${API_ENDPOINTS.print.categories.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<TemplateCategory> => {
    return fetchApi<TemplateCategory>(buildApiUrl(API_ENDPOINTS.print.categories.detail(id)));
  },

  create: async (data: TemplateCategoryCreateInput): Promise<TemplateCategory> => {
    return fetchApi<TemplateCategory>(buildApiUrl(API_ENDPOINTS.print.categories.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: TemplateCategoryUpdateInput): Promise<TemplateCategory> => {
    return fetchApi<TemplateCategory>(buildApiUrl(API_ENDPOINTS.print.categories.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.print.categories.delete(id)), {
      method: 'DELETE',
    });
  },

  seedDefaults: async (): Promise<{ message: string; created: TemplateCategory[] }> => {
    return fetchApi<{ message: string; created: TemplateCategory[] }>(
      buildApiUrl(API_ENDPOINTS.print.categories.seedDefaults),
      { method: 'POST' }
    );
  },
};

// ============================================================================
// PRINT TEMPLATES API
// ============================================================================

const IMAGE_FIELDS = ['header_image', 'footer_image', 'watermark_image', 'logo_image'];

const buildTemplateFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (IMAGE_FIELDS.includes(key)) {
      // Skip string image values (existing URLs / base64) - backend expects File uploads
      // Only send image fields when they contain a File object
      return;
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

export const printTemplatesApi = {
  list: async (filters?: PrintTemplateFilters): Promise<PaginatedResponse<PrintTemplate>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PrintTemplate>>(
      buildApiUrl(`${API_ENDPOINTS.print.templates.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<PrintTemplate> => {
    return fetchApi<PrintTemplate>(buildApiUrl(API_ENDPOINTS.print.templates.detail(id)));
  },

  create: async (data: PrintTemplateCreateInput): Promise<PrintTemplate> => {
    const formData = buildTemplateFormData(data);
    return fetchApiFormData<PrintTemplate>(
      buildApiUrl(API_ENDPOINTS.print.templates.create),
      formData,
      'POST'
    );
  },

  update: async (id: number, data: PrintTemplateUpdateInput): Promise<PrintTemplate> => {
    const formData = buildTemplateFormData(data);
    return fetchApiFormData<PrintTemplate>(
      buildApiUrl(API_ENDPOINTS.print.templates.update(id)),
      formData,
      'PUT'
    );
  },

  patch: async (id: number, data: Partial<PrintTemplateUpdateInput>): Promise<PrintTemplate> => {
    const formData = buildTemplateFormData(data);
    return fetchApiFormData<PrintTemplate>(
      buildApiUrl(API_ENDPOINTS.print.templates.update(id)),
      formData,
      'PATCH'
    );
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.print.templates.delete(id)), {
      method: 'DELETE',
    });
  },

  preview: async (id: number, data: TemplatePreviewRequest): Promise<TemplatePreviewResponse> => {
    return fetchApi<TemplatePreviewResponse>(buildApiUrl(API_ENDPOINTS.print.templates.preview(id)), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  duplicate: async (id: number, data: TemplateDuplicateRequest): Promise<PrintTemplate> => {
    return fetchApi<PrintTemplate>(buildApiUrl(API_ENDPOINTS.print.templates.duplicate(id)), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  newVersion: async (id: number): Promise<PrintTemplate> => {
    return fetchApi<PrintTemplate>(buildApiUrl(API_ENDPOINTS.print.templates.newVersion(id)), {
      method: 'POST',
    });
  },

  getVariables: async (id: number): Promise<{ variables: string[] }> => {
    return fetchApi<{ variables: string[] }>(buildApiUrl(API_ENDPOINTS.print.templates.variables(id)));
  },

  getByCategory: async (): Promise<TemplatesByCategory[]> => {
    return fetchApi<TemplatesByCategory[]>(buildApiUrl(API_ENDPOINTS.print.templates.byCategory));
  },
};

// ============================================================================
// PRINT DOCUMENTS API
// ============================================================================

export const printDocumentsApi = {
  list: async (filters?: PrintDocumentFilters): Promise<PaginatedResponse<PrintDocument>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PrintDocument>>(
      buildApiUrl(`${API_ENDPOINTS.print.documents.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<PrintDocument> => {
    return fetchApi<PrintDocument>(buildApiUrl(API_ENDPOINTS.print.documents.detail(id)));
  },

  create: async (data: PrintDocumentCreateInput): Promise<PrintDocument> => {
    // Sanitize data: Remove image fields if they are strings (URLs)
    const sanitizedData = { ...data };
    if (typeof sanitizedData.custom_watermark_image === 'string') {
      delete sanitizedData.custom_watermark_image;
    }
    if (typeof sanitizedData.custom_header_image === 'string') {
      delete sanitizedData.custom_header_image;
    }
    if (typeof sanitizedData.custom_footer_image === 'string') {
      delete sanitizedData.custom_footer_image;
    }
    if (typeof sanitizedData.custom_logo_image === 'string') {
      delete sanitizedData.custom_logo_image;
    }

    const hasFile = Object.values(sanitizedData).some(v => v instanceof File);

    if (hasFile) {
      const formData = new FormData();
      Object.entries(sanitizedData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
      return fetchApiFormData<PrintDocument>(
        buildApiUrl(API_ENDPOINTS.print.documents.create),
        formData,
        'POST'
      );
    }

    return fetchApi<PrintDocument>(buildApiUrl(API_ENDPOINTS.print.documents.create), {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  },

  getPdfUrl: (id: number): string => {
    return buildApiUrl(API_ENDPOINTS.print.documents.pdf(id));
  },

  getPrintHtmlUrl: (id: number): string => {
    return buildApiUrl(API_ENDPOINTS.print.documents.printHtml(id));
  },

  fetchPrintHtml: async (id: number): Promise<ApprovalPreviewResponse> => {
    const token = localStorage.getItem('access_token');
    const url = `${buildApiUrl(API_ENDPOINTS.print.documents.printHtml(id))}?token=${token}`;

    const headers = new Headers();
    const defaultHeaders = getDefaultHeaders();
    Object.entries(defaultHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { method: 'GET', headers, credentials: 'include' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Failed to fetch print HTML'),
        status: response.status,
        errors: errorData,
      };
    }

    return response.json();
  },

  fetchPreview: async (id: number): Promise<ApprovalPreviewResponse> => {
    const token = localStorage.getItem('access_token');
    const url = `${buildApiUrl(API_ENDPOINTS.print.documents.preview(id))}?token=${token}`;

    const headers = new Headers();
    const defaultHeaders = getDefaultHeaders();
    Object.entries(defaultHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { method: 'GET', headers, credentials: 'include' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Failed to fetch document preview'),
        status: response.status,
        errors: errorData,
      };
    }

    return response.json();
  },

  regeneratePdf: async (id: number): Promise<PrintDocument> => {
    return fetchApi<PrintDocument>(buildApiUrl(API_ENDPOINTS.print.documents.regeneratePdf(id)), {
      method: 'POST',
    });
  },

  markPrinted: async (id: number): Promise<PrintDocument> => {
    return fetchApi<PrintDocument>(buildApiUrl(API_ENDPOINTS.print.documents.markPrinted(id)), {
      method: 'POST',
    });
  },

  getMyDocuments: async (filters?: PrintDocumentFilters): Promise<PaginatedResponse<PrintDocument>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PrintDocument>>(
      buildApiUrl(`${API_ENDPOINTS.print.documents.myDocuments}${queryString}`)
    );
  },

  getPending: async (filters?: PrintDocumentFilters): Promise<PaginatedResponse<PrintDocument>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PrintDocument>>(
      buildApiUrl(`${API_ENDPOINTS.print.documents.pending}${queryString}`)
    );
  },
};

// ============================================================================
// APPROVALS API
// ============================================================================

export const printApprovalsApi = {
  list: async (filters?: ApprovalFilters): Promise<PaginatedResponse<PendingApproval>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PendingApproval>>(
      buildApiUrl(`${API_ENDPOINTS.print.approvals.list}${queryString}`)
    );
  },

  getPending: async (filters?: ApprovalFilters): Promise<PaginatedResponse<PendingApproval>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PendingApproval>>(
      buildApiUrl(`${API_ENDPOINTS.print.approvals.pending}${queryString}`)
    );
  },

  preview: async (id: number): Promise<ApprovalPreviewResponse> => {
    return fetchApi<ApprovalPreviewResponse>(buildApiUrl(API_ENDPOINTS.print.approvals.preview(id)));
  },

  approve: async (id: number, data: ApprovalActionRequest): Promise<PendingApproval> => {
    return fetchApi<PendingApproval>(buildApiUrl(API_ENDPOINTS.print.approvals.approve(id)), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDashboard: async (): Promise<ApprovalDashboard> => {
    return fetchApi<ApprovalDashboard>(buildApiUrl(API_ENDPOINTS.print.approvals.dashboard));
  },
};

// ============================================================================
// BULK PRINT JOBS API
// ============================================================================

export const bulkPrintJobsApi = {
  list: async (filters?: BulkPrintJobFilters): Promise<PaginatedResponse<BulkPrintJob>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<BulkPrintJob>>(
      buildApiUrl(`${API_ENDPOINTS.print.bulkJobs.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<BulkPrintJob> => {
    return fetchApi<BulkPrintJob>(buildApiUrl(API_ENDPOINTS.print.bulkJobs.detail(id)));
  },

  create: async (data: BulkPrintJobCreateInput): Promise<BulkPrintJob> => {
    return fetchApi<BulkPrintJob>(buildApiUrl(API_ENDPOINTS.print.bulkJobs.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProgress: async (id: number): Promise<BulkJobProgress> => {
    return fetchApi<BulkJobProgress>(buildApiUrl(API_ENDPOINTS.print.bulkJobs.progress(id)));
  },

  getDownloadUrl: (id: number): string => {
    return buildApiUrl(API_ENDPOINTS.print.bulkJobs.download(id));
  },

  cancel: async (id: number): Promise<BulkPrintJob> => {
    return fetchApi<BulkPrintJob>(buildApiUrl(API_ENDPOINTS.print.bulkJobs.cancel(id)), {
      method: 'POST',
    });
  },

  getTargetModels: async (): Promise<TargetModel[]> => {
    return fetchApi<TargetModel[]>(buildApiUrl(API_ENDPOINTS.print.bulkJobs.targetModels));
  },
};
