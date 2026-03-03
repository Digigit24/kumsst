/**
 * Store Module API Service
 * All API calls for Store entities
 */

import {
    API_ENDPOINTS,
    buildApiUrl,
    getDefaultHeaders,
} from "../config/api.config";
import type { PaginatedResponse } from "../types/core.types";
import type {
    StockReceipt,
    StockReceiptCreateInput,
    StockReceiptFilters,
    StockReceiptUpdateInput,
    Vendor,
    VendorCreateInput,
    VendorFilters,
    VendorUpdateInput,
} from "../types/store.types";
import { approvalsApi } from "./approvals.service";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : "";
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
      Object.entries(customHeaders as Record<string, string>).forEach(
        ([key, value]) => {
          headers.set(key, value);
        }
      );
    }
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If body is FormData, remove Content-Type header to let browser set it with boundary
  if (options?.body instanceof FormData && headers.has("Content-Type")) {
    headers.delete("Content-Type");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText || response.statusText };
      }

      throw {
        message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Request failed'),
        status: response.status,
        errors: errorData,
      };
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error:", e, "Response Text:", text);
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    throw error;
  }
};

// ============================================================================
// CATEGORIES API
// ============================================================================

export const categoriesApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/store/categories/${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/categories/${id}/`));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl("/api/v1/store/categories/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/categories/${id}/`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/categories/${id}/`), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// STORE ITEMS API
// ============================================================================

export const storeItemsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/store/items/${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/items/${id}/`));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl("/api/v1/store/items/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/items/${id}/`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/items/${id}/`), {
      method: "DELETE",
    });
  },

  exportPdf: async (filters?: any): Promise<Blob> => {
    const queryString = buildQueryString(filters || {});
    const token = localStorage.getItem('access_token');

    const headers = new Headers();
    const defaultHeaders = getDefaultHeaders();
    Object.entries(defaultHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(
      buildApiUrl(`/api/v1/store/items/export-pdf/${queryString}`),
      {
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to export PDF');
    }

    return response.blob();
  },
};

// ============================================================================
// SALE ITEMS API
// ============================================================================

export const saleItemsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/store/sale-items/${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/sale-items/${id}/`));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl("/api/v1/store/sale-items/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/sale-items/${id}/`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/sale-items/${id}/`), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// SALES API
// ============================================================================

export const salesApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/store/sales/${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/sales/${id}/`));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl("/api/v1/store/sales/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Creates a sale with all items in one shot — use when items >= 2
  bulkCreate: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl("/api/v1/store/sales/bulk/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/sales/${id}/`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/sales/${id}/`), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// CREDITS API
// ============================================================================

export const creditsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/store/credits/${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/credits/${id}/`));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl("/api/v1/store/credits/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/credits/${id}/`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/credits/${id}/`), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// PRINT JOBS API
// ============================================================================

export const printJobsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/store/print-jobs/${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/print-jobs/${id}/`));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl("/api/v1/store/print-jobs/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/print-jobs/${id}/`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  partialUpdate: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(`/api/v1/store/print-jobs/${id}/`), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/print-jobs/${id}/`), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// VENDOR API
// ============================================================================

export const vendorApi = {
  /**
   * List all vendors with pagination and filters
   */
  list: async (filters?: VendorFilters): Promise<PaginatedResponse<Vendor>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Vendor>>(
      buildApiUrl(`/api/v1/store/vendors/${queryString}`)
    );
  },

  /**
   * Get vendor by ID
   */
  get: async (id: number): Promise<Vendor> => {
    return fetchApi<Vendor>(buildApiUrl(`/api/v1/store/vendors/${id}/`));
  },

  /**
   * Create new vendor
   */
  create: async (data: VendorCreateInput): Promise<Vendor> => {
    return fetchApi<Vendor>(buildApiUrl("/api/v1/store/vendors/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update vendor (full update)
   */
  update: async (id: number, data: VendorUpdateInput): Promise<Vendor> => {
    return fetchApi<Vendor>(buildApiUrl(`/api/v1/store/vendors/${id}/`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update vendor
   */
  patch: async (
    id: number,
    data: Partial<VendorUpdateInput>
  ): Promise<Vendor> => {
    return fetchApi<Vendor>(buildApiUrl(`/api/v1/store/vendors/${id}/`), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete vendor
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/vendors/${id}/`), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// STOCK RECEIPT API
// ============================================================================

export const stockReceiptApi = {
  /**
   * List all stock receipts with pagination and filters
   */
  list: async (
    filters?: StockReceiptFilters
  ): Promise<PaginatedResponse<StockReceipt>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<StockReceipt>>(
      buildApiUrl(`/api/v1/store/stock-receipts/${queryString}`)
    );
  },

  /**
   * Get stock receipt by ID
   */
  get: async (id: number): Promise<StockReceipt> => {
    return fetchApi<StockReceipt>(
      buildApiUrl(`/api/v1/store/stock-receipts/${id}/`)
    );
  },

  /**
   * Create new stock receipt
   */
  create: async (data: StockReceiptCreateInput): Promise<StockReceipt> => {
    return fetchApi<StockReceipt>(
      buildApiUrl("/api/v1/store/stock-receipts/"),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update stock receipt (full update)
   */
  update: async (
    id: number,
    data: StockReceiptUpdateInput
  ): Promise<StockReceipt> => {
    return fetchApi<StockReceipt>(
      buildApiUrl(`/api/v1/store/stock-receipts/${id}/`),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partial update stock receipt
   */
  patch: async (
    id: number,
    data: Partial<StockReceiptUpdateInput>
  ): Promise<StockReceipt> => {
    return fetchApi<StockReceipt>(
      buildApiUrl(`/api/v1/store/stock-receipts/${id}/`),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete stock receipt
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/store/stock-receipts/${id}/`), {
      method: "DELETE",
    });
  },
};
// ============================================================================
// COLLEGE STORE API
// ============================================================================

export const collegeStoresApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.collegeStores.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.collegeStores.detail(id))
    );
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.collegeStores.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.collegeStores.update(id)),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.collegeStores.patch(id)),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.collegeStores.delete(id)),
      {
        method: "DELETE",
      }
    );
  },
};

// ============================================================================
// CENTRAL STORE API
// ============================================================================

export const centralStoreApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.centralStores.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.centralStores.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.centralStores.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.centralStores.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.centralStores.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.centralStores.delete(id)), {
      method: "DELETE",
    });
  },

  inventory: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.centralStores.inventory(id))
    );
  },

  stockSummary: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.centralStores.stockSummary(id))
    );
  },
};
// ============================================================================
// CENTRAL INVENTORY API
// ============================================================================

export const centralInventoryApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.centralInventory.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.centralInventory.detail(id))
    );
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.centralInventory.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.centralInventory.update(id)),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.centralInventory.patch(id)),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.centralInventory.delete(id)),
      {
        method: "DELETE",
      }
    );
  },

  adjustStock: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.centralInventory.adjustStock(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  lowStock: async (): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.centralInventory.lowStock));
  },
};
// ============================================================================
// MATERIAL ISSUES API
// ============================================================================

export const materialIssuesApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.materialIssues.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.materialIssues.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    const isFormData = data instanceof FormData;
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.materialIssues.create), {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    const isFormData = data instanceof FormData;
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.materialIssues.update(id)), {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.materialIssues.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.materialIssues.delete(id)),
      {
        method: "DELETE",
      }
    );
  },

  confirmReceipt: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.materialIssues.markReceived(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  dispatch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.materialIssues.markDispatched(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  generatePdf: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.materialIssues.generateGatePass(id)),
      {
        method: "POST",
      }
    );
  },
};

// ============================================================================
// STORE INDENTS API
// ============================================================================

export const storeIndentsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.storeIndents.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.storeIndents.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.storeIndents.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.storeIndents.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.storeIndents.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.storeIndents.delete(id)), {
      method: "DELETE",
    });
  },

  approve: async (id: number, data: any): Promise<any> => {
    // Determine which approve endpoint to use based on context or user (here mapping to superAdminApprove as default or creating separate methods)
    // Legacy support: mapping to superAdminApprove if not specified, but better to use specific methods
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.storeIndents.superAdminApprove(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  reject: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.storeIndents.superAdminReject(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  submit: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.storeIndents.submit(id)), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // College Admin Approvals
  pendingCollegeApprovals: async (
    filters?: any
  ): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    const response = await fetchApi<any>(
      buildApiUrl(
        `${API_ENDPOINTS.storeIndents.pendingCollegeApprovals}${queryString}`
      )
    );

    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      };
    }

    return response;
  },

  collegeAdminApprove: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.storeIndents.collegeAdminApprove(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  collegeAdminReject: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.storeIndents.collegeAdminReject(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  // Super Admin Approvals
  pendingSuperAdminApprovals: async (
    filters?: any
  ): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    const response = await fetchApi<any>(
      buildApiUrl(
        `${API_ENDPOINTS.storeIndents.pendingSuperAdminApprovals}${queryString}`
      )
    );

    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      };
    }

    return response;
  },

  superAdminApprove: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.storeIndents.superAdminApprove(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  superAdminReject: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.storeIndents.superAdminReject(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  // Material Issuance
  issueMaterials: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.storeIndents.issueMaterials(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// PROCUREMENT - REQUIREMENTS API
// ============================================================================

export const procurementRequirementsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.procurementRequirements.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.detail(id))
    );
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.create),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.update(id)),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.patch(id)),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.delete(id)),
      {
        method: "DELETE",
      }
    );
  },

  getQuotations: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.quotations(id))
    );
  },

  selectQuotation: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.selectQuotation(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  submitForApproval: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.submitForApproval(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  approve: async (id: number, data: any): Promise<any> => {
    try {
      return await fetchApi<any>(
        buildApiUrl(API_ENDPOINTS.procurementRequirements.approve(id)),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    } catch (error: any) {
      // Fallback: If endpoint 404s, try using Approvals API
      if (error.status === 404) {
        try {
          const detail = await procurementRequirementsApi.get(id);
          if (detail?.approval_request) {
            return await approvalsApi.review(detail.approval_request, {
              action: "approve",
              comment: data?.comment,
            });
          }
        } catch (innerError) {
          console.error("Fallback approval failed", innerError);
        }
      }
      throw error;
    }
  },

  reject: async (id: number, data: any): Promise<any> => {
    try {
      return await fetchApi<any>(
        buildApiUrl(API_ENDPOINTS.procurementRequirements.reject(id)),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    } catch (error: any) {
      // Fallback: If endpoint 404s, try using Approvals API
      if (error.status === 404) {
        try {
          const detail = await procurementRequirementsApi.get(id);
          if (detail?.approval_request) {
            return await approvalsApi.review(detail.approval_request, {
              action: "reject",
              comment: data?.rejection_reason || data?.comment,
            });
          }
        } catch (innerError) {
          console.error("Fallback rejection failed", innerError);
        }
      }
      throw error;
    }
  },

  compareQuotations: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.procurementRequirements.compareQuotations(id))
    );
  },
};

// ============================================================================
// PROCUREMENT - QUOTATIONS API
// ============================================================================

export const procurementQuotationsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.supplierQuotations.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.supplierQuotations.detail(id))
    );
  },

  create: async (data: any): Promise<any> => {
    const isFormData = data instanceof FormData;
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.supplierQuotations.create), {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    const isFormData = data instanceof FormData;
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.supplierQuotations.update(id)),
      {
        method: "PUT",
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : { "Content-Type": "application/json" },
      }
    );
  },

  patch: async (id: number, data: any): Promise<any> => {
    const isFormData = data instanceof FormData;
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.supplierQuotations.patch(id)),
      {
        method: "PATCH",
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : { "Content-Type": "application/json" },
      }
    );
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.supplierQuotations.delete(id)),
      {
        method: "DELETE",
      }
    );
  },

  markSelected: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.supplierQuotations.markSelected(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// PROCUREMENT - PURCHASE ORDERS API
// ============================================================================

export const procurementPurchaseOrdersApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.purchaseOrders.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.purchaseOrders.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.purchaseOrders.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.purchaseOrders.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.purchaseOrders.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(
      buildApiUrl(API_ENDPOINTS.purchaseOrders.delete(id)),
      {
        method: "DELETE",
      }
    );
  },

  acknowledge: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.purchaseOrders.acknowledge(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  generatePdf: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.purchaseOrders.generatePdf(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  sendToSupplier: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.purchaseOrders.sendToSupplier(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// PROCUREMENT - GOODS RECEIPTS API
// ============================================================================

export const procurementGoodsReceiptsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.goodsReceipts.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.goodsReceipts.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.goodsReceipts.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.goodsReceipts.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.goodsReceipts.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.goodsReceipts.delete(id)), {
      method: "DELETE",
    });
  },

  postToInventory: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.goodsReceipts.postToInventory(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  submitForInspection: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(
      buildApiUrl(API_ENDPOINTS.goodsReceipts.submitForInspection(id)),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// PROCUREMENT - INSPECTIONS API
// ============================================================================

export const procurementInspectionsApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`${API_ENDPOINTS.inspections.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.inspections.detail(id)));
  },

  create: async (data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.inspections.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.inspections.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: any): Promise<any> => {
    return fetchApi<any>(buildApiUrl(API_ENDPOINTS.inspections.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.inspections.delete(id)), {
      method: "DELETE",
    });
  },
};
