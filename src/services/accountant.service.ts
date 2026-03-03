/**
 * Accountant Module API Service
 * All API calls for Accountant entities
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type {
  IncomeDashboard,
  IncomeDashboardFilters,
  FeeCollection,
  FeeCollectionCreateInput,
  FeeCollectionUpdateInput,
  FeeCollectionFilters,
  FeeCollectionsReport,
  StoreSale,
  StoreSaleCreateInput,
  StoreSaleFilters,
  FeeFine,
  FeeFineCreateInput,
  FeeFineUpdateInput,
  FeeFineFilters,
  LibraryFine,
  LibraryFineCreateInput,
  LibraryFineUpdateInput,
  LibraryFineFilters,
  FeeReceipt,
  ReceiptFilters,
  PaginatedResponse,
  StudentBasic,
} from '../types/accountant.types';

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
// INCOME DASHBOARD API
// ============================================================================

export const incomeDashboardApi = {
  /**
   * Get unified income dashboard with all income sources aggregated
   * GET /fees/accountant/income-dashboard/
   */
  get: async (filters?: IncomeDashboardFilters): Promise<IncomeDashboard> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<IncomeDashboard>(
      buildApiUrl(`${API_ENDPOINTS.accountant.incomeDashboard}${queryString}`)
    );
  },
};

// ============================================================================
// FEE COLLECTIONS API
// ============================================================================

export const feeCollectionsApi = {
  /**
   * List all fee collections with filters
   * GET /fees/fee-collections/
   */
  list: async (filters?: FeeCollectionFilters): Promise<PaginatedResponse<FeeCollection>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<FeeCollection>>(
      buildApiUrl(`${API_ENDPOINTS.accountant.feeCollections.list}${queryString}`)
    );
  },

  /**
   * Get fee collection details
   * GET /fees/fee-collections/{id}/
   */
  get: async (id: number): Promise<FeeCollection> => {
    return fetchApi<FeeCollection>(
      buildApiUrl(API_ENDPOINTS.accountant.feeCollections.detail(id))
    );
  },

  /**
   * Record new fee collection
   * POST /fees/fee-collections/
   */
  create: async (data: FeeCollectionCreateInput): Promise<FeeCollection> => {
    return fetchApi<FeeCollection>(
      buildApiUrl(API_ENDPOINTS.accountant.feeCollections.create),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update fee collection
   * PUT /fees/fee-collections/{id}/
   */
  update: async (id: number, data: FeeCollectionUpdateInput): Promise<FeeCollection> => {
    return fetchApi<FeeCollection>(
      buildApiUrl(API_ENDPOINTS.accountant.feeCollections.update(id)),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete fee collection
   * DELETE /fees/fee-collections/{id}/
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.accountant.feeCollections.delete(id)),
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Get fee collections report
   * GET /fees/fee-collections/collections-report/
   */
  getReport: async (filters?: FeeCollectionFilters): Promise<FeeCollectionsReport> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<FeeCollectionsReport>(
      buildApiUrl(`${API_ENDPOINTS.accountant.feeCollections.report}${queryString}`)
    );
  },
};

// ============================================================================
// STORE SALES API
// ============================================================================

export const storeSalesApi = {
  /**
   * List all store sales with filters
   * GET /store/store-sales/
   */
  list: async (filters?: StoreSaleFilters): Promise<PaginatedResponse<StoreSale>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StoreSale>>(
      buildApiUrl(`${API_ENDPOINTS.accountant.storeSales.list}${queryString}`)
    );
  },

  /**
   * Get store sale details
   * GET /store/store-sales/{id}/
   */
  get: async (id: number): Promise<StoreSale> => {
    return fetchApi<StoreSale>(
      buildApiUrl(API_ENDPOINTS.accountant.storeSales.detail(id))
    );
  },

  /**
   * Record new store sale
   * POST /store/store-sales/
   */
  create: async (data: StoreSaleCreateInput): Promise<StoreSale> => {
    return fetchApi<StoreSale>(
      buildApiUrl(API_ENDPOINTS.accountant.storeSales.create),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// FEE FINES API
// ============================================================================

export const feeFinesApi = {
  /**
   * List fee fines with filters
   * GET /fees/fee-fines/
   */
  list: async (filters?: FeeFineFilters): Promise<PaginatedResponse<FeeFine>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<FeeFine>>(
      buildApiUrl(`${API_ENDPOINTS.accountant.feeFines.list}${queryString}`)
    );
  },

  /**
   * Get fee fine details
   * GET /fees/fee-fines/{id}/
   */
  get: async (id: number): Promise<FeeFine> => {
    return fetchApi<FeeFine>(
      buildApiUrl(API_ENDPOINTS.accountant.feeFines.detail(id))
    );
  },

  /**
   * Record new fee fine
   * POST /fees/fee-fines/
   */
  create: async (data: FeeFineCreateInput): Promise<FeeFine> => {
    return fetchApi<FeeFine>(
      buildApiUrl(API_ENDPOINTS.accountant.feeFines.create),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Mark fine as paid
   * PATCH /fees/fee-fines/{id}/
   */
  patch: async (id: number, data: FeeFineUpdateInput): Promise<FeeFine> => {
    return fetchApi<FeeFine>(
      buildApiUrl(API_ENDPOINTS.accountant.feeFines.patch(id)),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// LIBRARY FINES API
// ============================================================================

export const libraryFinesApi = {
  /**
   * List library fines with filters
   * GET /library/library-fines/
   */
  list: async (filters?: LibraryFineFilters): Promise<PaginatedResponse<LibraryFine>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LibraryFine>>(
      buildApiUrl(`${API_ENDPOINTS.accountant.libraryFines.list}${queryString}`)
    );
  },

  /**
   * Get library fine details
   * GET /library/library-fines/{id}/
   */
  get: async (id: number): Promise<LibraryFine> => {
    return fetchApi<LibraryFine>(
      buildApiUrl(API_ENDPOINTS.accountant.libraryFines.detail(id))
    );
  },

  /**
   * Record library fine
   * POST /library/library-fines/
   */
  create: async (data: LibraryFineCreateInput): Promise<LibraryFine> => {
    return fetchApi<LibraryFine>(
      buildApiUrl(API_ENDPOINTS.accountant.libraryFines.create),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Mark library fine as paid
   * PATCH /library/library-fines/{id}/
   */
  patch: async (id: number, data: LibraryFineUpdateInput): Promise<LibraryFine> => {
    return fetchApi<LibraryFine>(
      buildApiUrl(API_ENDPOINTS.accountant.libraryFines.patch(id)),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// RECEIPTS API
// ============================================================================

export const receiptsApi = {
  /**
   * List all receipts
   * GET /fees/fee-receipts/
   */
  list: async (filters?: ReceiptFilters): Promise<PaginatedResponse<FeeReceipt>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<FeeReceipt>>(
      buildApiUrl(`${API_ENDPOINTS.accountant.receipts.list}${queryString}`)
    );
  },

  /**
   * Get receipt details
   * GET /fees/fee-receipts/{id}/
   */
  get: async (id: number): Promise<FeeReceipt> => {
    return fetchApi<FeeReceipt>(
      buildApiUrl(API_ENDPOINTS.accountant.receipts.detail(id))
    );
  },

  /**
   * Download receipt
   * GET /fees/fee-receipts/{id}/download/
   */
  download: async (id: number): Promise<Blob> => {
    const token = localStorage.getItem('access_token');
    const headers = getDefaultHeaders();

    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.accountant.receipts.download(id)),
      {
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    return response.blob();
  },
};

// ============================================================================
// STUDENTS SEARCH API
// ============================================================================

export const studentsSearchApi = {
  /**
   * Search students by name or admission number
   * GET /students/students/?search=query
   */
  search: async (query: string): Promise<PaginatedResponse<StudentBasic>> => {
    const queryString = buildQueryString({ search: query });
    return fetchApi<PaginatedResponse<StudentBasic>>(
      buildApiUrl(`${API_ENDPOINTS.accountant.students}${queryString}`)
    );
  },
};
