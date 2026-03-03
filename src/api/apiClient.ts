import { API_BASE_URL, getCollegeId } from "@/config/api.config";
import { useAuthStore } from "@/store/auth";
import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Normalized error shape used across the app.
 * Matches the shape thrown by fetchApi so GlobalErrorHandler
 * can handle errors from both Axios and fetch uniformly.
 */
export interface AppError {
  message: string;
  status: number;
  errors: Record<string, any> | null;
}

/**
 * Extract a human-readable message from DRF error response data.
 * Handles: { detail: "..." }, { detail: { non_field_errors: [...] } },
 * { non_field_errors: [...] }, { field: [...] }, etc.
 */
function extractDRFMessage(data: any): string {
  if (!data || typeof data !== "object") {
    return typeof data === "string" ? data : "Request failed";
  }

  // { detail: "string" }
  if (typeof data.detail === "string") {
    return data.detail;
  }

  // { detail: { non_field_errors: [...] } }
  if (data.detail && typeof data.detail === "object") {
    if (Array.isArray(data.detail.non_field_errors) && data.detail.non_field_errors.length > 0) {
      return data.detail.non_field_errors.join(". ");
    }
    // { detail: { field: [...] } } — collect field errors
    const parts: string[] = [];
    for (const [key, val] of Object.entries(data.detail)) {
      if (Array.isArray(val)) parts.push(`${key}: ${val.join(", ")}`);
      else if (typeof val === "string") parts.push(`${key}: ${val}`);
    }
    if (parts.length > 0) return parts.join(" | ");
  }

  // { non_field_errors: [...] }
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors.join(". ");
  }

  // { message: "..." }
  if (typeof data.message === "string") {
    return data.message;
  }

  // { error: "..." }
  if (typeof data.error === "string") {
    return data.error;
  }

  // Generic field-level errors: { field1: [...], field2: [...] }
  const fieldParts: string[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) fieldParts.push(`${key}: ${val.join(", ")}`);
    else if (typeof val === "string") fieldParts.push(`${key}: ${val}`);
  }
  if (fieldParts.length > 0) return fieldParts.join(" | ");

  return "Request failed";
}

/**
 * Normalize an AxiosError into an AppError.
 */
function normalizeAxiosError(error: AxiosError): AppError {
  const status = error.response?.status || 0;
  const data = error.response?.data;
  const message = extractDRFMessage(data);

  return {
    message,
    status,
    errors: data && typeof data === "object" ? (data as Record<string, any>) : null,
  };
}

/**
 * Logout user and clear all auth data
 * Called when token expires or auth fails
 */
function handleAuthFailure(errorMessage?: string) {
  // Get the auth store and reset it
  const authStore = useAuthStore.getState();
  authStore.reset();

  // Clear all auth-related data from localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("kumss_user");
  localStorage.removeItem("kumss_user_id");
  localStorage.removeItem("kumss_college_id");
  localStorage.removeItem("kumss_auth_token"); // Legacy
  localStorage.removeItem("auth-storage"); // Zustand persisted state

  // Redirect to login page if not already there
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// Add request interceptor to include auth token and college ID in every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-College-ID'] = getCollegeId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors and normalize error shape
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle authentication errors (401 Unauthorized, 403 Forbidden)
    if (error.response?.status === 401) {
      handleAuthFailure("401 Unauthorized - Token expired or invalid");
    } else if (error.response?.status === 403) {
      // 403 might indicate an expired or revoked token in some APIs
      const data = error.response?.data as Record<string, any> | undefined;
      const errorMessage = data?.detail || data?.message;
      if (
        errorMessage?.toLowerCase().includes("token") ||
        errorMessage?.toLowerCase().includes("credential") ||
        errorMessage?.toLowerCase().includes("authentication")
      ) {
        handleAuthFailure("403 Forbidden - Authentication required");
      }
    }

    // Normalize Axios error into AppError shape { message, status, errors }
    // so GlobalErrorHandler and component catch blocks get a consistent object.
    if (error.response) {
      const appError = normalizeAxiosError(error);
      return Promise.reject(appError);
    }

    // Network errors (no response) — normalize as well
    return Promise.reject({
      message: error.message || "Network error. Please check your connection.",
      status: 0,
      errors: null,
    } as AppError);
  }
);

export default apiClient;
